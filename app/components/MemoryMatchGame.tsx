'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
    id: number;
    content: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface GameProps {
    onWin: () => void;
    onFeedback: (msg: string) => void;
}

const ITEMS = [
    { icon: '🍎', name: 'Mansanas' },
    { icon: '🍌', name: 'Saging' },
    { icon: '🍇', name: 'Ubas' },
    { icon: '🍍', name: 'Pinya' },
    { icon: '🥥', name: 'Buko' },
    { icon: '🥭', name: 'Mangga' },
];

export const MemoryMatchGame: React.FC<GameProps> = ({ onWin, onFeedback }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);

    const playSound = (type: 'match' | 'mismatch' | 'flip') => {
        const sounds: any = {
            match: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
            mismatch: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',
            flip: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        };
        const audio = new Audio(sounds[type]);
        audio.play().catch(e => console.log('Audio blocked:', e));
    };

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const doubledItems = [...ITEMS, ...ITEMS]
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({
                id: index,
                content: item.icon,
                isFlipped: false,
                isMatched: false,
            }));
        setCards(doubledItems);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
    };

    const handleCardClick = (id: number) => {
        if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

        playSound('flip');
        const updatedCards = [...cards];
        updatedCards[id].isFlipped = true;
        setCards(updatedCards);

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [firstId, secondId] = newFlipped;
            
            if (cards[firstId].content === cards[secondId].content) {
                // Match!
                playSound('match');
                onFeedback("Tama! Magaling!");
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[firstId].isMatched = true;
                    matchedCards[secondId].isMatched = true;
                    setCards(matchedCards);
                    setFlippedCards([]);
                    setMatches(prev => {
                        const newCount = prev + 1;
                        if (newCount === ITEMS.length) {
                            setTimeout(onWin, 1500);
                        }
                        return newCount;
                    });
                }, 600);
            } else {
                // No match
                playSound('mismatch');
                onFeedback("Opps! Subukan mo ulet.");
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstId].isFlipped = false;
                    resetCards[secondId].isFlipped = false;
                    setCards(resetCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4">
            <div className="flex justify-between w-full mb-4">
                <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl border-2 border-brand-purple/20 shadow-sm">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Moves</span>
                    <span className="text-2xl font-black text-brand-purple">{moves}</span>
                </div>
                <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl border-2 border-brand-purple/20 shadow-sm">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Matches</span>
                    <span className="text-2xl font-black text-brand-purple">{matches}/{ITEMS.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
                {cards.map((card) => (
                    <motion.button
                        key={card.id}
                        whileHover={!card.isMatched && !card.isFlipped ? { scale: 1.05 } : {}}
                        whileTap={!card.isMatched && !card.isFlipped ? { scale: 0.95 } : {}}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square rounded-3xl text-5xl flex items-center justify-center transition-all duration-500 shadow-lg border-4 ${
                            card.isFlipped || card.isMatched 
                                ? 'bg-white border-brand-purple rotate-y-180' 
                                : 'bg-brand-purple-light border-white rotate-y-0'
                        }`}
                    >
                        <AnimatePresence mode="wait">
                            {(card.isFlipped || card.isMatched) ? (
                                <motion.span
                                    initial={{ opacity: 0, rotateY: 180 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: 180 }}
                                    key="content"
                                >
                                    {card.content}
                                </motion.span>
                            ) : (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key="back"
                                    className="text-brand-purple opacity-20"
                                >
                                    ?
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>

            <p className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full mt-4">
                Hanapin ang magkapares na prutas!
            </p>
        </div>
    );
};
