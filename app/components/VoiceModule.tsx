'use client';

import React, { useState, useEffect } from 'react';

interface VoiceModuleProps {
    targetWord: string;
    onSuccess: () => void;
    onFeedback: (msg: string) => void;
}

export const VoiceModule: React.FC<VoiceModuleProps> = ({ targetWord, onSuccess, onFeedback }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef<any>(null);
    const callbacksRef = React.useRef({ onSuccess, onFeedback, targetWord });

    // Update refs to ensure latest callbacks are used without triggering effects
    useEffect(() => {
        callbacksRef.current = { onSuccess, onFeedback, targetWord };
    }, [onSuccess, onFeedback, targetWord]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition && !recognitionRef.current) {
                const sr = new SpeechRecognition();
                sr.lang = 'tl-PH'; 
                sr.continuous = false;
                sr.interimResults = false;

                sr.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    const target = callbacksRef.current.targetWord.toLowerCase();
                    
                    if (transcript.includes(target)) {
                        callbacksRef.current.onFeedback("Magaling! Tama ang bigkas mo.");
                        callbacksRef.current.onSuccess();
                    } else {
                        callbacksRef.current.onFeedback(`Medyo malapit na! Subukan mo ulet ang: ${callbacksRef.current.targetWord}`);
                    }
                    setIsListening(false);
                };

                sr.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'network') {
                        callbacksRef.current.onFeedback("Naku! May problema sa internet. Pakisuyo, i-check ang iyong connection.");
                    } else if (event.error === 'not-allowed') {
                        callbacksRef.current.onFeedback("Kailangan po namin ng permiso para gamitin ang microphone.");
                    } else {
                        callbacksRef.current.onFeedback("May kaunting problema. Subukan po ulet mamaya.");
                    }
                    setIsListening(false);
                };

                sr.onend = () => setIsListening(false);

                recognitionRef.current = sr;
            }
        }
    }, []); // Only initialize once

    const startListening = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Recognition start error:', err);
                setIsListening(false);
            }
        } else {
            onFeedback("Hindi suportado ang voice recognition sa browser na ito.");
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-white/40 backdrop-blur-md rounded-3xl border-4 border-dashed border-brand-sky shadow-lg transition-all hover:border-solid">
            <h3 className="text-xl font-black text-blue-600 mb-2 tracking-wide uppercase">Subukan nating bigkasin ang:</h3>
            <div className="text-6xl font-black text-gray-800 drop-shadow-md mb-2 bg-brand-lemon px-10 py-5 rounded-2xl animate-pulse">
                {targetWord}
            </div>
            <button
                onClick={startListening}
                disabled={isListening}
                className={`btn-kid flex items-center gap-4 text-xl font-black border-b-8 border-r-8 transition-transform duration-150 ${isListening
                        ? 'bg-red-400 border-red-600 scale-95 shadow-inner'
                        : 'bg-green-400 border-green-600 hover:scale-110 active:scale-95'
                    }`}
            >
                <div className={`w-6 h-6 rounded-full ${isListening ? 'bg-white animate-ping' : 'bg-red-600'} shadow-md`}></div>
                {isListening ? 'Naka-record na...' : 'Simulang Magsalita'}
            </button>
            
            <div className="flex flex-col items-center gap-4 mt-6">
                <p className="text-gray-600 font-bold italic opacity-80 text-sm text-center">"Pindutin ang pindutan at sabihin ang salitang ito."</p>
                
                <button 
                    onClick={onSuccess}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-purple transition-colors border-b border-transparent hover:border-brand-purple"
                >
                    Ayaw gumana? I-skip ang part na ito →
                </button>
            </div>
        </div>
    );
};
