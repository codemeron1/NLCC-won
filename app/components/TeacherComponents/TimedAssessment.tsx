'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentDisplay } from './AssessmentDisplay';

interface TimedAssessmentProps {
  assessment: any;
  onSubmitAnswer: (answer: any) => void;
  isSubmitting?: boolean;
  studentId?: string;
  timeLimit?: number; // in seconds
  onTimeUp?: () => void;
}

export const TimedAssessment: React.FC<TimedAssessmentProps> = ({
  assessment,
  onSubmitAnswer,
  isSubmitting = false,
  studentId,
  timeLimit = 300, // 5 minutes default
  onTimeUp
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isTimeUp || isPaused || isSubmitting) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTimeUp(true);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimeUp, isPaused, isSubmitting, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (timeRemaining / timeLimit) * 100;
  const isWarning = timeRemaining < 60;
  const isCritical = timeRemaining < 30;

  if (isTimeUp) {
    return (
      <div className="bg-red-900/20 border-4 border-red-600 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-2xl font-black text-white mb-2">Time's Up!</h3>
        <p className="text-lg text-slate-300 font-bold mb-6">
          Your assessment time has ended. Your answer will be submitted automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer Bar */}
      <div className={`bg-slate-900/50 border rounded-2xl p-6 ${
        isCritical ? 'border-red-600/50' : isWarning ? 'border-yellow-600/50' : 'border-slate-800/50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">Time Remaining</p>
              <p className={`text-3xl font-black ${
                isCritical ? 'text-red-400 animate-pulse' : isWarning ? 'text-yellow-400' : 'text-brand-sky'
              }`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              disabled
              className="px-4 py-2 rounded-lg font-bold text-sm uppercase bg-slate-800 text-slate-500 cursor-not-allowed"
            >
              ⏹ End Early
            </button>
          </div>
        </div>

        {/* Time Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-brand-sky'
            }`}
            style={{ width: `${timePercentage}%` }}
          ></div>
        </div>

        {/* Warning Message */}
        {isCritical && (
          <p className="text-sm text-red-400 font-black mt-4 animate-pulse">
            ⚠️ Less than 30 seconds remaining!
          </p>
        )}
        {isWarning && !isCritical && (
          <p className="text-sm text-yellow-400 font-black mt-4">
            ⚠️ Less than 1 minute remaining
          </p>
        )}
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md">
            <div className="text-6xl mb-4">⏸️</div>
            <h3 className="text-2xl font-black text-white mb-2">Timer Paused</h3>
            <p className="text-slate-300 font-bold mb-6">
              Click the Resume button to continue your assessment.
            </p>
            <button
              onClick={() => setIsPaused(false)}
              className="w-full px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-black uppercase transition-all"
            >
              ▶ Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Assessment Component */}
      <AssessmentDisplay
        assessment={assessment}
        onSubmitAnswer={onSubmitAnswer}
        isSubmitting={isSubmitting}
        studentId={studentId}
      />
    </div>
  );
};
