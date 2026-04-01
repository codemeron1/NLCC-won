'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
    onWin: () => void;
    onFeedback: (msg: string) => void;
}

const WORDS = [
    { word: 'BAHAY', hint: 'Dito tayo nakatira 🏡', image: '🏠' },
    { word: 'GABI', hint: 'Kabaligtaran ng araw 🌙', image: '🌃' },
    { word: 'MAHAL', hint: 'Pag-ibig ❤️', image: '💖' },
    { word: 'SAGING', hint: 'Paboritong prutas ng unggoy 🐒', image: '🍌' },
    { word: 'DAGAT', hint: 'Dito nakatira ang isda 🐠', image: '🌊' },
];

export const WordScrambleGame: React.FC<GameProps> = ({ onWin, onFeedback }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [scrambled, setScrambled] = useState<string[]>([]);
    const [guess, setGuess] = useState<string[]>([]);
    const [isShaking, setIsShaking] = useState(false);

    const playSound = (type: 'correct' | 'wrong' | 'click') => {
        const sounds: any = {
            correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
            wrong: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',
            click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        };
        const audio = new Audio(sounds[type]);
        audio.play().catch(e => console.log('Audio blocked:', e));
    };

    useEffect(() => {
        setupGame(currentIdx);
    }, [currentIdx]);

    const setupGame = (idx: number) => {
        const word = WORDS[idx].word;
        const characters = word.split('');
        // Ensure scramble is NOT the actual word
        let shuffled = [...characters];
        while (shuffled.join('') === word) {
            shuffled = characters.sort(() => Math.random() - 0.5);
        }
        setScrambled(shuffled);
        setGuess([]);
    };

    const handleCharClick = (char: string, index: number) => {
        playSound('click');
        const newScrambled = [...scrambled];
        newScrambled.splice(index, 1);
        setScrambled(newScrambled);
        setGuess([...guess, char]);

        if (guess.length + 1 === WORDS[currentIdx].word.length) {
            checkWin([...guess, char].join(''));
        }
    };

    const handleGuessClick = (char: string, index: number) => {
        playSound('click');
        const newGuess = [...guess];
        newGuess.splice(index, 1);
        setGuess(newGuess);
        setScrambled([...scrambled, char]);
    };

    const checkWin = (finalGuess: string) => {
        if (finalGuess === WORDS[currentIdx].word) {
            playSound('correct');
            onFeedback("Tama! Magaling!");
            if (currentIdx < WORDS.length - 1) {
                setTimeout(() => {
                    setCurrentIdx(currentIdx + 1);
                }, 1500);
            } else {
                setTimeout(onWin, 2000);
            }
        } else {
            playSound('wrong');
            onFeedback("Mali! Subukan ulet.");
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
                setScrambled([...guess, ...scrambled]);
                setGuess([]);
            }, 500);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4 animate-in zoom-in duration-500">
            <div className="text-9xl mb-4 drop-shadow-2xl animate-float">{WORDS[currentIdx].image}</div>
            
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border-2 border-brand-purple/20 shadow-xl w-full text-center">
                <p className="text-xl font-black text-slate-800 tracking-tight leading-relaxed">
                    {WORDS[currentIdx].hint}
                </p>
            </div>

            {/* Guess Area */}
            <motion.div 
                animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                className="flex gap-3 h-24 items-center justify-center p-4 bg-slate-100/50 rounded-3xl w-full border-4 border-dashed border-slate-200"
            >
                {guess.map((char, i) => (
                    <motion.button
                        layoutId={`char-${char}-${i}`}
                        key={`guess-${i}`}
                        onClick={() => handleGuessClick(char, i)}
                        className="w-16 h-16 rounded-2xl bg-brand-purple text-white font-black text-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        {char}
                    </motion.button>
                ))}
            </motion.div>

            {/* Character Pool */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <AnimatePresence>
                    {scrambled.map((char, i) => (
                        <motion.button
                            layoutId={`char-${char}-${i}`}
                            key={`pool-${i}`}
                            initial={{ scale:0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => handleCharClick(char, i)}
                            className="w-16 h-16 rounded-2xl bg-white text-brand-purple font-black text-2xl shadow-md border-b-4 border-slate-200 hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center"
                        >
                            {char}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-4">
                Ayusin ang mga letra!
            </p>
        </div>
    );
};
