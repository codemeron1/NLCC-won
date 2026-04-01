'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Float,
    MeshWobbleMaterial,
    Environment,
    Stars,
    Sparkles,
    PerspectiveCamera,
    PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsiveCamera = () => {
    const { size } = useThree();
    const isMobile = size.width < 768;
    return <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 9 : 6]} />;
};

const NeuralCore = () => {
    return (
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
            <mesh>
                <icosahedronGeometry args={[1, 15]} />
                <MeshWobbleMaterial color="#38bdf8" factor={0.6} speed={2} metalness={0.8} />
            </mesh>
            <Sparkles count={100} scale={3} size={2} speed={0.4} color="#38bdf8" />
        </Float>
    );
};

export const SplashScreen: React.FC<{ onCompleteAction?: () => void }> = ({ onCompleteAction }) => {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsReady(true);
                    return 100;
                }
                return prev + 1;
            });
        }, 30); // ~3 seconds total
        return () => clearInterval(interval);
    }, []);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            onClick={() => isReady && onCompleteAction?.()}
            className={`fixed inset-0 z-[30000] bg-slate-950 flex items-center justify-center overflow-hidden ${isReady ? 'cursor-pointer' : 'cursor-wait'}`}
        >
            <div className="absolute inset-0 w-full h-full">
                <Canvas shadows dpr={[1, 2]}>
                    <ResponsiveCamera />
                    <color attach="background" args={['#020617']} />
                    
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
                    
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    
                    <PresentationControls
                        global
                        speed={2}
                        snap
                        rotation={[0, 0, 0]}
                        polar={[-Math.PI / 3, Math.PI / 3]}
                        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                    >
                        <NeuralCore />
                    </PresentationControls>

                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* Title Overlay */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none px-4 text-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col items-center w-full"
                >
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-[0.2em] md:tracking-[0.3em] uppercase drop-shadow-glow-sky leading-none">
                        NLLC
                    </h1>
                    <h2 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-[0.1em] md:tracking-[0.2em] uppercase -mt-2">
                        PlayGround
                    </h2>
                </motion.div>
                
                <div className="mt-8 md:mt-16 flex flex-col items-center gap-4 w-full">
                    {!isReady ? (
                        <>
                            <div className="w-48 md:w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                    className="absolute inset-y-0 left-0 bg-brand-sky"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-blue-400/60 text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase animate-pulse">
                                Syncing Systems {progress}%
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="h-8 md:h-12 w-[2px] bg-gradient-to-b from-transparent via-brand-sky to-transparent" />
                            <div className="px-8 md:px-10 py-3 md:py-4 bg-brand-sky/10 backdrop-blur-xl border border-brand-sky/40 rounded-2xl group shadow-glow-sky">
                                <span className="text-lg md:text-xl font-black tracking-[0.3em] md:tracking-[0.4em] uppercase animate-bounce-slow inline-block">
                                    Click to Start
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <style jsx>{`
                .drop-shadow-glow-sky { filter: drop-shadow(0 0 30px rgba(56,189,248,0.5)); }
                .shadow-glow-sky { box-shadow: 0 0 30px rgba(56,189,248,0.3); }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
            `}</style>
        </motion.div>
    );
};
