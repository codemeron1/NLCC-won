'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentDisplay } from './AssessmentDisplay';

interface RandomizedAssessmentProps {
  assessment: any;
  onSubmitAnswer: (answer: any) => void;
  isSubmitting?: boolean;
  studentId?: string;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  seed?: string; // Optional seed for reproducibility
}

// Shuffle utility with optional seed for reproducibility
const shuffleArray = (array: any[], seed?: string): any[] => {
  const arr = [...array];

  if (seed) {
    // Deterministic shuffle using seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.abs(hash % (i + 1));
      hash = Math.floor(hash / 2); // Update hash for next iteration
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } else {
    // Random shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
};

export const RandomizedAssessment: React.FC<RandomizedAssessmentProps> = ({
  assessment,
  onSubmitAnswer,
  isSubmitting = false,
  studentId,
  randomizeQuestions = true,
  randomizeOptions = true,
  seed
}) => {
  const [randomizedAssessment, setRandomizedAssessment] = useState<any>(null);
  const [optionMapping, setOptionMapping] = useState<Record<number, Record<string, string>>>({});

  useEffect(() => {
    const randomized = { ...assessment };

    // Randomize option order for multiple choice and checkbox
    if (randomizeOptions && ['multiple-choice', 'checkbox', 'matching'].includes(assessment.type)) {
      const mapping: Record<number, Record<string, string>> = {};

      if (assessment.type === 'matching') {
        // Shuffle matching pairs
        randomized.options = shuffleArray(assessment.options || [], seed);
      } else if (assessment.type === 'multiple-choice' || assessment.type === 'checkbox') {
        // Shuffle options but track original positions for answer validation
        const originalOptions = assessment.options || [];
        const shuffledOptions = shuffleArray([...originalOptions], seed);

        const positionMap: Record<string, string> = {};
        originalOptions.forEach((opt: string, idx: number) => {
          positionMap[shuffledOptions[idx]] = opt; // new position: original
        });

        mapping[0] = positionMap;
        randomized.options = shuffledOptions;
      }

      setOptionMapping(mapping);
    }

    setRandomizedAssessment(randomized);
  }, [assessment, randomizeOptions, randomizeQuestions, seed]);

  const handleSubmitAnswer = (answer: any) => {
    // Map answer back to original order if needed
    let mappedAnswer = answer;

    if (optionMapping[0] && typeof answer === 'string') {
      // Single selection - map back to original option text if changed
      mappedAnswer = optionMapping[0][answer] || answer;
    } else if (optionMapping[0] && Array.isArray(answer)) {
      // Multiple selection - map each item back
      mappedAnswer = answer.map((opt: string) => optionMapping[0][opt] || opt);
    }

    onSubmitAnswer(mappedAnswer);
  };

  if (!randomizedAssessment) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      {/* Randomization Info */}
      <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-xs font-black text-blue-400 uppercase tracking-widest">
          ℹ️ This assessment has randomized options to ensure fair testing
        </p>
      </div>

      <AssessmentDisplay
        assessment={randomizedAssessment}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        studentId={studentId}
      />
    </div>
  );
};
