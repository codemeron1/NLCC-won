'use client';

import React, { useState, useEffect } from 'react';

interface GameProps {
    onWin: () => void;
    onFeedback: (msg: string) => void;
}

const games = [
    { word: 'BA-HAY', syllables: ['BA', 'HAY'], image: '🏠' },
    { word: 'BI-BE', syllables: ['BI', 'BE'], image: '🦆' },
    { word: 'BO-LA', syllables: ['BO', 'LA'], image: '⚽' },
    { word: 'KA-MAY', syllables: ['KA', 'MAY'], image: '🤚' },
];

export const SyllableGame: React.FC<GameProps> = ({ onWin, onFeedback }) => {
    const [currentGameIdx, setCurrentGameIdx] = useState(0);
    const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
    const game = games[currentGameIdx];

    // Shuffle when the game index changes
    const [shuffled, setShuffled] = useState<string[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    useEffect(() => {
        setShuffled([...game.syllables].sort(() => Math.random() - 0.5));
        setSelectedIndices([]);
    }, [currentGameIdx]);

    const playSound = (type: 'correct' | 'wrong' | 'click') => {
        const sounds: any = {
            correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
            wrong: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',
            click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        };
        const audio = new Audio(sounds[type]);
        audio.play().catch(e => console.log('Audio blocked:', e));
    };

    const handleSyllableClick = (syllable: string, index: number) => {
        if (selectedIndices.includes(index)) return;
        playSound('click');
        setSelectedSyllables([...selectedSyllables, syllable]);
        setSelectedIndices([...selectedIndices, index]);
        onFeedback("Maganda!");
    };

    useEffect(() => {
        if (selectedSyllables.length === game.syllables.length) {
            if (selectedSyllables.join('-') === game.word) {
                playSound('correct');
                onFeedback("Woah! Buo na ang salita!");
                if (currentGameIdx < games.length - 1) {
                    setTimeout(() => {
                        setCurrentGameIdx(currentGameIdx + 1);
                        setSelectedSyllables([]);
                        setSelectedIndices([]);
                    }, 1500);
                } else {
                    onWin();
                }
            } else {
                playSound('wrong');
                onFeedback("Mali ang pagkaka-ayos. Ulitin natin!");
                setSelectedSyllables([]);
                setSelectedIndices([]);
            }
        }
    }, [selectedSyllables, currentGameIdx, onWin, onFeedback]);

    return (
        <div className="flex flex-col items-center gap-6 md:gap-12 p-6 md:p-12 bg-white/60 backdrop-blur-md rounded-2xl md:rounded-3xl border-4 border-brand-orange shadow-2xl animate-in zoom-in w-full">
            <div className="text-7xl md:text-9xl mb-2 md:mb-4 drop-shadow-xl animate-bounce">{game.image}</div>

            <div className="flex gap-4 min-h-[100px] border-b-8 border-dashed border-gray-200 w-full justify-center">
                {selectedSyllables.map((s, i) => (
                    <div key={i} className="bg-brand-mint text-2xl md:text-4xl font-black px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-green-600 shadow-lg animate-in scale-in slide-in-from-bottom">
                        {s}
                    </div>
                ))}
            </div>

            <div className="flex gap-6 justify-center flex-wrap">
                {shuffled.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => handleSyllableClick(s, i)}
                        disabled={selectedIndices.includes(i)}
                        className={`btn-kid text-2xl md:text-4xl py-6 md:py-10 px-8 md:px-12 border-b-4 md:border-b-8 border-blue-600 ${selectedIndices.includes(i) ? 'bg-gray-300 opacity-50 grayscale scale-90' : 'bg-brand-sky hover:bg-blue-400'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>
            <p className="text-xl font-extrabold text-gray-700 uppercase italic opacity-80">"Pagsama-samahin ang mga pantig!"</p>
        </div>
    );
};
