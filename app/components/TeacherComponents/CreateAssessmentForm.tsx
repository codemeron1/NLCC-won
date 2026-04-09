'use client';

import React, { useState } from 'react';

interface CreateAssessmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    bahagiId: number;
    bahagiTitle: string;
    isLoading?: boolean;
}

const QUESTION_TYPES = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'checkbox', label: 'Checkbox (Multiple answers)' },
    { value: 'media-audio', label: 'Audio Recording' },
    { value: 'scramble', label: 'Scramble Word' },
    { value: 'matching', label: 'Matching Pairs' }
];

export const CreateAssessmentForm: React.FC<CreateAssessmentFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    bahagiId,
    bahagiTitle,
    isLoading = false
}) => {
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [questions, setQuestions] = useState<any[]>([
        { 
            type: 'multiple-choice',
            question: '', 
            questionMedia: null,
            options: [
                { text: '', media: null },
                { text: '', media: null },
                { text: '', media: null },
                { text: '', media: null }
            ], 
            correctAnswer: 0,
            xp: '10',
            coins: '5'
        }
    ]);

    const handleAddQuestion = () => {
        setQuestions([...questions, {
            type: 'multiple-choice',
            question: '',
            questionMedia: null,
            options: [
                { text: '', media: null },
                { text: '', media: null },
                { text: '', media: null },
                { text: '', media: null }
            ],
            correctAnswer: 0,
            xp: '10',
            coins: '5'
        }]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleUpdateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleUpdateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex][field] = value;
        setQuestions(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please enter an assessment title');
            return;
        }

        const data = {
            bahagiId,
            title,
            instructions,
            questions: questions.map(q => ({
                ...q,
                xp: parseInt(q.xp),
                coins: parseInt(q.coins)
            }))
        };

        onSubmit(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-auto rounded-[2.5rem] p-10 shadow-2xl relative custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-2xl text-slate-500 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create Assessment</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Add a new assessment/misyon to this lesson</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Assessment Details - Simplified */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-white">Assessment Details</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assessment Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Reading Comprehension Quiz"
                                className="bg-slate-950 border border-slate-800 text-white px-5 py-4 rounded-xl text-sm focus:border-brand-purple outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instructions</label>
                            <textarea
                                rows={3}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Explain what students need to do in this assessment..."
                                className="bg-slate-950 border border-slate-800 text-white px-5 py-4 rounded-xl text-sm focus:border-brand-purple outline-none transition-all resize-none placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Questions with Per-Question Settings */}
                    <div className="space-y-4 border-t border-slate-800 pt-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-white">Questions</h3>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="text-xs font-black text-brand-sky px-4 py-2 rounded-lg border border-brand-sky/30 hover:bg-brand-sky/10 transition-all uppercase tracking-widest"
                            >
                                + Add Question
                            </button>
                        </div>

                        {questions.map((question, qIdx) => (
                            <div key={qIdx} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-5">
                                {/* Question Header with Type and Delete */}
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Question {qIdx + 1}</label>
                                        <select
                                            value={question.type}
                                            onChange={(e) => handleUpdateQuestion(qIdx, 'type', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-lg text-sm font-bold focus:border-brand-purple outline-none cursor-pointer"
                                        >
                                            {QUESTION_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(qIdx)}
                                            className="text-rose-500 hover:text-rose-600 text-sm ml-4 mt-6"
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>

                                {/* Question Text */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Question Text</label>
                                    <input
                                        type="text"
                                        value={question.question}
                                        onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                                        placeholder="Enter your question..."
                                        className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm focus:border-brand-purple outline-none"
                                    />
                                </div>

                                {/* Question Media */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">📎 Question Media (Image/Audio)</label>
                                    <input
                                        type="file"
                                        accept="image/*,audio/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                handleUpdateQuestion(qIdx, 'questionMedia', {
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size
                                                });
                                            }
                                        }}
                                        className="w-full bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-lg text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-brand-purple/80"
                                    />
                                    {question.questionMedia && (
                                        <p className="text-xs text-slate-400">✓ {question.questionMedia.name}</p>
                                    )}
                                </div>

                                {/* Options for Multiple Choice, Checkbox */}
                                {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
                                    <div className="space-y-3 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Options</label>
                                        {question.options.map((option: any, oIdx: number) => (
                                            <div key={oIdx} className="space-y-2 bg-slate-900/50 p-3 rounded-lg">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Option {oIdx + 1}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleUpdateOption(qIdx, oIdx, 'text', e.target.value)}
                                                    placeholder={`Option ${oIdx + 1} text`}
                                                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:border-brand-purple outline-none"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*,audio/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleUpdateOption(qIdx, oIdx, 'media', {
                                                                name: file.name,
                                                                type: file.type
                                                            });
                                                        }
                                                    }}
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-400 px-3 py-2 rounded-lg text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-brand-sky/70 file:text-white"
                                                />
                                                {option.media && (
                                                    <p className="text-[8px] text-slate-500">✓ {option.media.name}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Correct Answer for Multiple Choice/Checkbox */}
                                {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
                                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">✓ Correct Answer</label>
                                        <select
                                            value={question.correctAnswer}
                                            onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', parseInt(e.target.value))}
                                            className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-lg text-xs focus:border-brand-purple outline-none cursor-pointer"
                                        >
                                            {question.options.map((_: any, oIdx: number) => (
                                                <option key={oIdx} value={oIdx}>Option {oIdx + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Short Answer Media */}
                                {question.type === 'short-answer' && (
                                    <div className="space-y-3 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">📎 Reference Media (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*,audio/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleUpdateQuestion(qIdx, 'questionMedia', {
                                                        name: file.name,
                                                        type: file.type
                                                    });
                                                }
                                            }}
                                            className="w-full bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-lg text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-purple file:text-white"
                                        />
                                        <div className="flex flex-col gap-2 pt-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">✓ Correct Answer</label>
                                            <input
                                                type="text"
                                                value={question.correctAnswer || ''}
                                                onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', e.target.value)}
                                                placeholder="Enter the model/correct answer..."
                                                className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-lg text-xs focus:border-brand-purple outline-none"
                                            />
                                        </div>
                                        <p className="text-[8px] text-slate-500 italic">Students will type their answer (can be manually graded)</p>
                                    </div>
                                )}

                                {question.type === 'media-audio' && (
                                    <div className="space-y-3 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">🎙️ Reference Answer</label>
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleUpdateQuestion(qIdx, 'correctAnswer', {
                                                        name: file.name,
                                                        type: file.type,
                                                        isAudio: true
                                                    });
                                                }
                                            }}
                                            className="w-full bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-lg text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-purple file:text-white"
                                        />
                                        {question.correctAnswer?.name && (
                                            <p className="text-[8px] text-slate-400">✓ Reference: {question.correctAnswer.name}</p>
                                        )}
                                        <p className="text-[8px] text-slate-500 italic">Upload reference audio (optional - for teachers to compare with student answers)</p>
                                    </div>
                                )}

                                {question.type === 'scramble' && (
                                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">✓ Correct Word</label>
                                        <input
                                            type="text"
                                            value={question.correctAnswer || ''}
                                            onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', e.target.value)}
                                            placeholder="Enter the correct/unscrambled word..."
                                            className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-lg text-xs focus:border-brand-purple outline-none"
                                        />
                                        <p className="text-[8px] text-slate-500 italic">This is the word students need to unscramble</p>
                                    </div>
                                )}

                                {question.type === 'matching' && (
                                    <div className="space-y-3 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">📋 Matching Pairs</label>
                                        <div className="space-y-2">
                                            {((question.options && question.options.length > 0) ? question.options : [
                                                { text: '', match: '' },
                                                { text: '', match: '' },
                                                { text: '', match: '' }
                                            ]).map((option: any, oIdx: number) => (
                                                <div key={oIdx} className="space-y-2 bg-slate-900/50 p-3 rounded-lg">
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Pair {oIdx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => handleUpdateOption(qIdx, oIdx, 'text', e.target.value)}
                                                        placeholder="Left item (what to match from)"
                                                        className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:border-brand-purple outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option.match || ''}
                                                        onChange={(e) => handleUpdateOption(qIdx, oIdx, 'match', e.target.value)}
                                                        placeholder="Right item (correct match)"
                                                        className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:border-brand-purple outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {question.type === 'checkbox' && (
                                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-700">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">✓ Correct Answers (Multiple)</label>
                                        <p className="text-[8px] text-slate-500 mb-2">Select all correct options below</p>
                                        <div className="space-y-2">
                                            {question.options?.map((option: any, oIdx: number) => (
                                                <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={Array.isArray(question.correctAnswer) ? question.correctAnswer.includes(oIdx) : false}
                                                        onChange={(e) => {
                                                            const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                                                            const updated = e.target.checked
                                                                ? [...current, oIdx]
                                                                : current.filter(idx => idx !== oIdx);
                                                            handleUpdateQuestion(qIdx, 'correctAnswer', updated);
                                                        }}
                                                        className="w-4 h-4 accent-brand-purple"
                                                    />
                                                    <span className="text-[8px] text-slate-400">{option.text || `Option ${oIdx + 1}`}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reward Section */}
                                <div className="space-y-3 pt-4 border-t border-slate-700">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">🎁 Rewards for this Question</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">⭐ XP Points</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={question.xp}
                                                onChange={(e) => handleUpdateQuestion(qIdx, 'xp', e.target.value)}
                                                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:border-brand-purple outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">🪙 Coins</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={question.coins}
                                                onChange={(e) => handleUpdateQuestion(qIdx, 'coins', e.target.value)}
                                                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:border-brand-purple outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-4 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-70"
                        >
                            {isLoading ? 'Creating...' : '✓ Create Assessment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
