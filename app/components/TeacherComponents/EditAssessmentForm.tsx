'use client';

import React, { useState } from 'react';

interface EditAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  assessment: any;
  isLoading?: boolean;
}

type AssessmentType = 'multiple-choice' | 'short-answer' | 'checkbox' | 'audio' | 'matching' | 'scramble-word';

export const EditAssessmentForm: React.FC<EditAssessmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  assessment,
  isLoading = false
}) => {
  const [title, setTitle] = useState(assessment?.title || '');
  const [type, setType] = useState<AssessmentType>(assessment?.type || 'multiple-choice');
  const [options, setOptions] = useState<string[]>(
    assessment?.options?.length ? assessment.options : ['Option 1', 'Option 2', 'Option 3']
  );
  const [correctAnswer, setCorrectAnswer] = useState<any>(assessment?.correct_answer || 'Option 1');
  const [points, setPoints] = useState(assessment?.points || 10);
  const [matchingPairs, setMatchingPairs] = useState<any[]>(
    assessment?.options?.length ? assessment.options : [{ left: '', right: '' }]
  );

  const assessmentTypes = [
    { id: 'multiple-choice', label: '🔘 Multiple Choice' },
    { id: 'short-answer', label: '✍️ Short Answer' },
    { id: 'checkbox', label: '☑️ Checkbox' },
    { id: 'audio', label: '🎤 Audio' },
    { id: 'matching', label: '🔗 Matching' },
    { id: 'scramble-word', label: '🔀 Scramble Word' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an assessment title');
      return;
    }

    let finalOptions = options;
    let finalCorrectAnswer = correctAnswer;

    if (type === 'matching') {
      finalOptions = matchingPairs;
      finalCorrectAnswer = matchingPairs;
    }

    onSubmit({
      id: assessment.id,
      title,
      type,
      options: finalOptions,
      correctAnswer: finalCorrectAnswer,
      points,
      isPublished: assessment.is_published
    });
  };

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer === options[index] && newOptions.length > 0) {
        setCorrectAnswer(newOptions[0]);
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    const oldValue = newOptions[index];
    newOptions[index] = value;
    setOptions(newOptions);
    if (correctAnswer === oldValue) {
      setCorrectAnswer(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-2xl text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Edit Assessment</h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">
          Update Assessment details
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assessment title"
              className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold focus:border-brand-purple outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {assessmentTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id as AssessmentType);
                    if (t.id === 'short-answer') {
                      setCorrectAnswer('');
                    } else if (t.id === 'matching') {
                      setMatchingPairs([{ left: '', right: '' }]);
                    }
                  }}
                  className={`p-3 rounded-xl transition-all text-sm font-black ${
                    type === t.id
                      ? 'bg-brand-purple/30 border border-brand-purple text-brand-purple'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {(type === 'multiple-choice' || type === 'checkbox') && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-3">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    {type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={Array.isArray(correctAnswer) && correctAnswer.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCorrectAnswer([...(Array.isArray(correctAnswer) ? correctAnswer : []), option]);
                          } else {
                            setCorrectAnswer(
                              (Array.isArray(correctAnswer) ? correctAnswer : []).filter((a: string) => a !== option)
                            );
                          }
                        }}
                        className="w-4 h-4 mt-3"
                      />
                    ) : (
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === option}
                        onChange={() => setCorrectAnswer(option)}
                        className="w-4 h-4 mt-3"
                      />
                    )}
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold focus:border-brand-purple outline-none"
                    />
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {type === 'short-answer' && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
                Correct Answer
              </label>
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter the correct answer"
                className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold focus:border-brand-purple outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          )}

          {type === 'matching' && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-3">
                Matching Pairs
              </label>
              <div className="space-y-2">
                {matchingPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...matchingPairs];
                        newPairs[index].left = e.target.value;
                        setMatchingPairs(newPairs);
                      }}
                      placeholder="Left"
                      className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold focus:border-brand-purple outline-none"
                    />
                    <span className="px-3 py-2 text-slate-500 font-bold">→</span>
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => {
                        const newPairs = [...matchingPairs];
                        newPairs[index].right = e.target.value;
                        setMatchingPairs(newPairs);
                      }}
                      placeholder="Right"
                      className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold focus:border-brand-purple outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPairs = matchingPairs.filter((_, i) => i !== index);
                        setMatchingPairs(newPairs);
                      }}
                      className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMatchingPairs([...matchingPairs, { left: '', right: '' }]);
                  }}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
                >
                  + Add Pair
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
              Points
            </label>
            <input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold focus:border-brand-purple outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
