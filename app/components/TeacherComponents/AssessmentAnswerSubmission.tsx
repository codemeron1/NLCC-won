'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentDisplay } from './AssessmentDisplay';

interface AssessmentAnswerSubmissionProps {
  assessment: any;
  yunitId: string;
  studentId: string;
  onComplete?: (result: any) => void;
  allowRetake?: boolean;
  maxAttempts?: number;
}

interface SubmissionResult {
  isCorrect: boolean;
  pointsEarned: number;
  feedback: string;
  attemptNumber: number;
}

export const AssessmentAnswerSubmission: React.FC<AssessmentAnswerSubmissionProps> = ({
  assessment,
  yunitId,
  studentId,
  onComplete,
  allowRetake = true,
  maxAttempts = 3
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [allAttempts, setAllAttempts] = useState<SubmissionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousResult, setPreviousResult] = useState<any>(null);

  // Load previous attempt if exists
  useEffect(() => {
    const loadPreviousAttempt = async () => {
      try {
        const res = await fetch(
          `/api/teacher/get-yunit-answer?yunitId=${yunitId}&assessmentId=${assessment.id}&studentId=${studentId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.attempts) {
            setAllAttempts(data.attempts);
            setAttemptCount(data.attempts.length + 1);
            setPreviousResult(data.attempts[data.attempts.length - 1]);
          }
        }
      } catch (err) {
        console.error('Error loading previous attempt:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviousAttempt();
  }, [yunitId, assessment.id, studentId]);

  const handleSubmitAnswer = async (answer: any) => {
    setIsSubmitting(true);

    try {
      // Call validation API
      const validationRes = await fetch('/api/teacher/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment,
          studentAnswer: answer,
          assessmentType: assessment.type
        })
      });

      if (!validationRes.ok) {
        alert('❌ Error validating answer');
        return;
      }

      const validationData = await validationRes.json();

      // Save attempt to database
      const saveRes = await fetch('/api/teacher/save-yunit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yunitId,
          assessmentId: assessment.id,
          studentId,
          studentAnswer: answer,
          isCorrect: validationData.isCorrect,
          pointsEarned: validationData.pointsEarned,
          assessmentType: assessment.type,
          attemptNumber: attemptCount
        })
      });

      if (!saveRes.ok) {
        console.error('Error saving attempt');
      }

      const submissionResult: SubmissionResult = {
        isCorrect: validationData.isCorrect,
        pointsEarned: validationData.pointsEarned,
        feedback: validationData.isCorrect
          ? `✅ Correct! You earned ${validationData.pointsEarned}/${assessment.points} points.`
          : `❌ Incorrect. The correct answer is: ${validationData.correctAnswer || 'See below'}`,
        attemptNumber: attemptCount
      };

      setResult(submissionResult);
      setAllAttempts([...allAttempts, submissionResult]);

      if (onComplete) {
        onComplete(submissionResult);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('❌ Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAttemptCount(attemptCount + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show Previous Attempts Summary */}
      {allAttempts.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
          <h4 className="text-lg font-black text-white mb-4">📊 Attempt History</h4>
          <div className="space-y-2">
            {allAttempts.map((attempt, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  attempt.isCorrect ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'
                }`}
              >
                <span className="text-sm font-bold text-slate-300">
                  Attempt {attempt.attemptNumber}
                </span>
                <span className={`text-sm font-black ${attempt.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {attempt.isCorrect ? '✅ Correct' : '❌ Incorrect'} ({attempt.pointsEarned}/{assessment.points} pts)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Result if Already Submitted */}
      {result ? (
        <div
          className={`border-4 rounded-2xl p-8 text-center ${
            result.isCorrect
              ? 'bg-green-900/20 border-green-600'
              : 'bg-red-900/20 border-red-600'
          }`}
        >
          <div className="text-6xl mb-4">
            {result.isCorrect ? '🎉' : '💭'}
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            {result.isCorrect ? 'Excellent Work!' : 'Good Try!'}
          </h3>
          <p className="text-lg font-bold text-slate-300 mb-2">{result.feedback}</p>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 mb-6 inline-block">
            <p className="text-sm text-slate-400 font-bold mb-1">POINTS EARNED</p>
            <p className="text-3xl font-black text-brand-sky">{result.pointsEarned}/{assessment.points}</p>
          </div>

          {/* Retake Option */}
          {allowRetake && attemptCount < maxAttempts && !result.isCorrect && (
            <button
              onClick={handleRetake}
              className="w-full px-6 py-4 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all mt-6"
            >
              🔄 Try Again ({maxAttempts - attemptCount} attempts remaining)
            </button>
          )}

          {attemptCount >= maxAttempts && (
            <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <p className="text-sm text-slate-400 font-bold">
                📌 You've used all {maxAttempts} attempts. Contact your teacher for review.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Assessment Instructions */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
            <p className="text-sm text-slate-400 font-bold mb-2">ATTEMPT {attemptCount} OF {maxAttempts}</p>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-purple h-full transition-all"
                style={{ width: `${(attemptCount / maxAttempts) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Assessment Display Component */}
          <AssessmentDisplay
            assessment={assessment}
            onSubmitAnswer={handleSubmitAnswer}
            isSubmitting={isSubmitting}
            studentId={studentId}
          />
        </>
      )}
    </div>
  );
};
