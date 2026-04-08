'use client';

import React, { useState, useRef } from 'react';

interface AssessmentDisplayProps {
  assessment: any;
  onSubmitAnswer: (answer: any, isCorrect?: boolean) => void;
  isSubmitting?: boolean;
  studentId?: string;
}

type AssessmentType = 'multiple-choice' | 'short-answer' | 'checkbox' | 'audio' | 'matching' | 'scramble-word';

export const AssessmentDisplay: React.FC<AssessmentDisplayProps> = ({
  assessment,
  onSubmitAnswer,
  isSubmitting = false,
  studentId
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleMultipleChoice = (option: string) => {
    setSelectedAnswer(option);
  };

  const handleCheckbox = (option: string) => {
    setSelectedCheckboxes(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleMatching = (leftIndex: number, rightOption: string) => {
    setMatchingAnswers(prev => ({
      ...prev,
      [leftIndex]: rightOption
    }));
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setSelectedAnswer(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('❌ Unable to access microphone');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    let answer = null;

    switch (assessment.type) {
      case 'multiple-choice':
        answer = selectedAnswer;
        break;
      case 'short-answer':
        answer = textAnswer;
        break;
      case 'checkbox':
        answer = selectedCheckboxes;
        break;
      case 'audio':
        answer = selectedAnswer;
        break;
      case 'matching':
        answer = matchingAnswers;
        break;
      case 'scramble-word':
        answer = scrambledWords;
        break;
      default:
        return;
    }

    if (!answer || (typeof answer === 'string' && !answer.trim())) {
      alert('⚠️ Please provide an answer');
      return;
    }

    onSubmitAnswer(answer);
  };

  const resetForm = () => {
    setSelectedAnswer(null);
    setSelectedCheckboxes([]);
    setTextAnswer('');
    setMatchingAnswers({});
    setScrambledWords([]);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-4xl overflow-hidden p-8">
      {/* Assessment Title */}
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">{assessment.title}</h3>
        <div className="flex gap-4 items-center">
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded bg-slate-800 text-slate-300">
            {assessment.type === 'multiple-choice' ? '🔘 Multiple Choice' : 
             assessment.type === 'short-answer' ? '✍️ Short Answer' :
             assessment.type === 'checkbox' ? '☑️ Checkbox' :
             assessment.type === 'audio' ? '🎤 Audio' :
             assessment.type === 'matching' ? '🔗 Matching' :
             assessment.type === 'scramble-word' ? '🔀 Scramble Word' : ''}
          </span>
          <span className="text-[10px] font-black text-brand-sky uppercase tracking-wider">
            ⭐ {assessment.points} points
          </span>
        </div>
      </div>

      {/* Assessment Content Based on Type */}
      <div className="space-y-6">
        {/* Multiple Choice */}
        {assessment.type === 'multiple-choice' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 font-bold mb-4">Select one answer:</p>
            {assessment.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer === option}
                  onChange={() => handleMultipleChoice(option)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-white font-bold text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {assessment.type === 'short-answer' && (
          <div>
            <p className="text-sm text-slate-400 font-bold mb-4">Provide your answer:</p>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold focus:border-brand-purple outline-none transition-all placeholder:text-slate-700 resize-none"
            />
          </div>
        )}

        {/* Checkbox */}
        {assessment.type === 'checkbox' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 font-bold mb-4">Select all that apply:</p>
            {assessment.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={selectedCheckboxes.includes(option)}
                  onChange={() => handleCheckbox(option)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-white font-bold text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Audio Recording */}
        {assessment.type === 'audio' && (
          <div className="flex flex-col items-center gap-4 p-8 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="text-5xl">🎤</div>
            {isRecording ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-white font-bold">Recording...</p>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                >
                  ⏹️ Stop
                </button>
              </>
            ) : selectedAnswer ? (
              <>
                <p className="text-sm text-green-400 font-bold">✅ Audio recorded</p>
                <audio
                  src={selectedAnswer}
                  controls
                  className="w-full max-w-xs"
                />
                <button
                  onClick={handleStartRecording}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                >
                  🔄 Re-record
                </button>
              </>
            ) : (
              <button
                onClick={handleStartRecording}
                className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all"
              >
                🎙️ Start Recording
              </button>
            )}
          </div>
        )}

        {/* Matching */}
        {assessment.type === 'matching' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 font-bold mb-4">Match items from left to right:</p>
            {assessment.options?.map((pair: any, index: number) => (
              <div key={index} className="flex gap-4 items-center">
                <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-white font-bold text-sm">{pair.left}</p>
                </div>
                <span className="text-slate-500 font-bold">→</span>
                <select
                  value={matchingAnswers[index] || ''}
                  onChange={(e) => handleMatching(index, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold focus:border-brand-purple outline-none transition-all"
                >
                  <option value="">Select option...</option>
                  {assessment.options?.map((p: any, i: number) => (
                    <option key={i} value={p.right}>
                      {p.right}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Scramble Word */}
        {assessment.type === 'scramble-word' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 font-bold mb-4">Arrange the words in correct order:</p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex flex-wrap gap-2 mb-4 min-h-[60px] bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                {scrambledWords.length > 0 ? (
                  scrambledWords.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => setScrambledWords(scrambledWords.filter((_, i) => i !== index))}
                      className="px-4 py-2 bg-brand-purple text-white rounded-lg font-bold text-sm hover:bg-brand-purple/80 transition-all"
                    >
                      {word} ✕
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Click words below to arrange them</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {assessment.options
                  ?.filter((word: string) => !scrambledWords.includes(word))
                  .map((word: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setScrambledWords([...scrambledWords, word])}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      {word}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 mt-8 pt-8 border-t border-slate-800">
        <button
          onClick={resetForm}
          className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <span>✓</span> Submit Answer
            </>
          )}
        </button>
      </div>
    </div>
  );
};
