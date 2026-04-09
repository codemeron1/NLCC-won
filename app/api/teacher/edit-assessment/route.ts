import { query } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const assessmentId = searchParams.get('assessmentId');

        if (!assessmentId) {
            return Response.json(
                { error: 'assessmentId required', code: 'MISSING_PARAM' },
                { status: 400 }
            );
        }

        // Fetch assessment with all its questions and options
        const assessmentResult = await query(
            `SELECT * FROM assessments WHERE id = $1`,
            [assessmentId]
        );

        if (assessmentResult.rows.length === 0) {
            return Response.json(
                { error: 'Assessment not found', code: 'NOT_FOUND' },
                { status: 404 }
            );
        }

        const assessment = assessmentResult.rows[0];

        // Fetch all questions for this assessment
        const questionsResult = await query(
            `SELECT * FROM questions 
             WHERE assessment_id = $1 
             ORDER BY question_order ASC`,
            [assessmentId]
        );

        // Fetch all options for all questions
        const optionsMap: Record<string, any[]> = {};
        for (const question of questionsResult.rows) {
            const optionsResult = await query(
                `SELECT * FROM options 
                 WHERE question_id = $1 
                 ORDER BY option_order ASC`,
                [question.id]
            );
            optionsMap[question.id] = optionsResult.rows;
        }

        const questions = questionsResult.rows.map(q => ({
            ...q,
            options: optionsMap[q.id] || []
        }));

        return Response.json({
            assessment,
            questions
        });

    } catch (err: any) {
        console.error('Get Assessment Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        return Response.json(
            {
                error: 'Failed to fetch assessment',
                message: err.message,
                code: 'DB_ERROR'
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            assessmentId,
            title,
            type,
            instructions,
            reward,
            questions = []
        } = body;

        if (!assessmentId) {
            return Response.json(
                { error: 'assessmentId required', code: 'MISSING_PARAM' },
                { status: 400 }
            );
        }

        // Update assessment metadata
        await query(
            `UPDATE assessments 
             SET title = $1, type = $2, instructions = $3, reward = $4, updated_at = NOW()
             WHERE id = $5`,
            [title, type, instructions, reward, assessmentId]
        );

        // Process questions
        const existingQuestionsResult = await query(
            `SELECT id FROM questions WHERE assessment_id = $1`,
            [assessmentId]
        );
        const existingIds = new Set(existingQuestionsResult.rows.map(r => r.id));

        // Track which questions we've processed
        const processedQuestionIds = new Set();

        for (const question of questions) {
            if (question.id && existingIds.has(question.id)) {
                // Update existing question
                await query(
                    `UPDATE questions 
                     SET question_text = $1, question_type = $2, instructions = $3,
                         correct_answer = $4, image_url = $5, audio_url = $6,
                         question_order = $7, updated_at = NOW()
                     WHERE id = $8`,
                    [
                        question.question_text,
                        question.question_type,
                        question.instructions,
                        question.correct_answer,
                        question.image_url,
                        question.audio_url,
                        question.question_order,
                        question.id
                    ]
                );
                processedQuestionIds.add(question.id);

                // Update options
                if (question.options) {
                    const existingOptionsResult = await query(
                        `SELECT id FROM options WHERE question_id = $1`,
                        [question.id]
                    );
                    const existingOptionIds = new Set(existingOptionsResult.rows.map(r => r.id));
                    const processedOptionIds = new Set();

                    for (const option of question.options) {
                        if (option.id && existingOptionIds.has(option.id)) {
                            // Update existing option
                            await query(
                                `UPDATE options 
                                 SET option_text = $1, is_correct = $2, image_url = $3,
                                     audio_url = $4, option_order = $5, updated_at = NOW()
                                 WHERE id = $6`,
                                [
                                    option.option_text,
                                    option.is_correct,
                                    option.image_url,
                                    option.audio_url,
                                    option.option_order,
                                    option.id
                                ]
                            );
                            processedOptionIds.add(option.id);
                        } else {
                            // Create new option
                            await query(
                                `INSERT INTO options 
                                 (question_id, option_text, is_correct, image_url, audio_url, option_order)
                                 VALUES ($1, $2, $3, $4, $5, $6)`,
                                [
                                    question.id,
                                    option.option_text,
                                    option.is_correct,
                                    option.image_url,
                                    option.audio_url,
                                    option.option_order
                                ]
                            );
                            processedOptionIds.add(option.id);
                        }
                    }

                    // Delete options not in the update
                    for (const optionId of existingOptionIds) {
                        if (!processedOptionIds.has(optionId)) {
                            await query(`DELETE FROM options WHERE id = $1`, [optionId]);
                        }
                    }
                }
            } else {
                // Create new question
                const newQuestionResult = await query(
                    `INSERT INTO questions 
                     (assessment_id, question_text, question_type, instructions, correct_answer, 
                      image_url, audio_url, question_order)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id`,
                    [
                        assessmentId,
                        question.question_text,
                        question.question_type,
                        question.instructions,
                        question.correct_answer,
                        question.image_url,
                        question.audio_url,
                        question.question_order
                    ]
                );
                const newQuestionId = newQuestionResult.rows[0].id;
                processedQuestionIds.add(newQuestionId);

                // Add options for new question
                if (question.options) {
                    for (const option of question.options) {
                        await query(
                            `INSERT INTO options 
                             (question_id, option_text, is_correct, image_url, audio_url, option_order)
                             VALUES ($1, $2, $3, $4, $5, $6)`,
                            [
                                newQuestionId,
                                option.option_text,
                                option.is_correct,
                                option.image_url,
                                option.audio_url,
                                option.option_order
                            ]
                        );
                    }
                }
            }
        }

        // Delete questions not in the update
        for (const questionId of existingIds) {
            if (!processedQuestionIds.has(questionId)) {
                await query(`DELETE FROM questions WHERE id = $1`, [questionId]);
            }
        }

        return Response.json({
            success: true,
            message: 'Assessment updated successfully',
            assessmentId
        });

    } catch (err: any) {
        console.error('Update Assessment Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        return Response.json(
            {
                error: 'Failed to update assessment',
                message: err.message,
                code: 'DB_ERROR'
            },
            { status: 500 }
        );
    }
}
