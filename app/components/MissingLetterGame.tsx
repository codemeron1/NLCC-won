'use client';

import React, { useState, useEffect } from 'react';

interface GameProps {
    onWin: () => void;
    onFeedback: (msg: string) => void;
}

export const MissingLetterGame: React.FC<GameProps> = ({ onWin, onFeedback }) => {
    const games = [
        { word: 'ASO', missing: 0, options: ['A', 'E', 'I', 'O'], image: '🐕' },
        { word: 'BOLA', missing: 1, options: ['O', 'A', 'U', 'I'], image: '⚽' },
        { word: 'ARAW', missing: 2, options: ['A', 'E', 'I', 'O'], image: '☀️' },
        { word: 'PUNO', missing: 3, options: ['O', 'A', 'E', 'I'], image: '🌳' },
    ];

    const [currentGameIdx, setCurrentGameIdx] = useState(0);
    const game = games[currentGameIdx];
    const wordDisplay = game.word.split('').map((char, i) => (i === game.missing ? '_' : char)).join('');

    const playSound = (type: 'correct' | 'wrong') => {
        const audio = new Audio(type === 'correct' 
            ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' 
            : 'https://assets.mixkit.co/active_storage/sfx/2040/2040-preview.mp3');
        audio.play().catch(e => console.log('Audio blocked:', e));
    };

    const handleChoice = (choice: string) => {
        if (choice === game.word[game.missing]) {
            playSound('correct');
            onFeedback("Tama! Magaling!");
            if (currentGameIdx < games.length - 1) {
                setTimeout(() => {
                    setCurrentGameIdx(currentGameIdx + 1);
                    onFeedback("Hanapin ang nawawalang letra!");
                }, 1000);
            } else {
                onWin();
            }
        } else {
            playSound('wrong');
            onFeedback("Opps! Subukan mo ulet.");
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 md:gap-8 p-6 md:p-10 bg-white/50 backdrop-blur-md rounded-2xl md:rounded-3xl border-4 border-brand-sky shadow-2xl animate-in zoom-in w-full max-w-lg mx-auto">
            <div className="text-7xl md:text-9xl mb-2 md:mb-4 drop-shadow-lg">{game.image}</div>
            <div className="text-5xl md:text-7xl font-black tracking-[0.3em] md:tracking-[0.5em] text-gray-800 mb-6 md:mb-8 ml-[0.3em] md:ml-[0.5em]">
                {wordDisplay}
            </div>
            <div className="grid grid-cols-2 gap-6 w-full">
                {game.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleChoice(opt)}
                        className="btn-kid bg-brand-lavender border-b-4 md:border-b-8 border-brand-purple hover:bg-brand-sky text-2xl md:text-4xl py-6 md:py-8"
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <p className="text-xl font-bold text-gray-600 italic mt-4">"Aling letra ang nawawala?"</p>
        </div>
    );
};
