'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    Float, 
    Environment, 
    MeshDistortMaterial,
    RoundedBox,
    Html,
    PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionBoard3DProps {
    word: string;
    translation: string;
    image: string;
    level: 1 | 2 | 3;
    scenario?: string;
    blanked?: string;
    selectedSyllables?: string[];
    progress: number;
    feedback: null | 'correct' | 'wrong';
    shake: boolean;
    correctWord?: string;
}

const BoardModel = ({ word, translation, image, level, scenario, blanked, selectedSyllables = [], progress, feedback, shake, correctWord }: QuestionBoard3DProps) => {
    const boardRef = useRef<THREE.Group>(null);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const [dragPosition, setDragPosition] = React.useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
    const [isDragging, setIsDragging] = React.useState(false);
    const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

    useFrame((state) => {
        if (!boardRef.current) return;
        
        // Handle Dragging via State and Mouse
        if (isDragging) {
            const vector = new THREE.Vector3(
                (state.mouse.x * state.viewport.width) / 2,
                (state.mouse.y * state.viewport.height) / 2,
                0
            );
            // Apply offset so the board doesn't "jump" to its center
            const targetPos = vector.clone().sub(dragOffset.current);
            dragPosition.lerp(targetPos, 0.4); // Faster, snappier follow
        }

        const time = state.clock.getElapsedTime();
        boardRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
        boardRef.current.rotation.x = Math.cos(time * 0.2) * 0.03;
        
        // Lateral movements (Shake)
        if (shake) {
            boardRef.current.position.x = Math.sin(time * 60) * 0.15;
        } else {
            boardRef.current.position.x = THREE.MathUtils.lerp(boardRef.current.position.x, 0, 0.1);
        }

        // Vertical movements (Victory hop)
        if (feedback === 'correct') {
            boardRef.current.position.y = THREE.MathUtils.lerp(boardRef.current.position.y, 0.4, 0.2);
        } else {
            boardRef.current.position.y = THREE.MathUtils.lerp(boardRef.current.position.y, 0, 0.1);
        }
    });

    return (
        <group 
            position={[dragPosition.x, dragPosition.y, dragPosition.z]}
            onPointerDown={(e) => {
                e.stopPropagation();
                if (e.nativeEvent.target instanceof Element) {
                    e.nativeEvent.target.setPointerCapture(e.pointerId);
                }
                
                // Use the event's point directly from Three.js
                const clickPoint = e.point;
                if (clickPoint) {
                    dragOffset.current.copy(clickPoint).sub(dragPosition);
                }
                
                setIsDragging(true);
                document.body.style.cursor = 'grabbing';
            }}
            onPointerUp={(e) => {
                e.stopPropagation();
                if (e.nativeEvent.target instanceof Element) {
                    e.nativeEvent.target.releasePointerCapture(e.pointerId);
                }
                setIsDragging(false);
                document.body.style.cursor = 'auto';
            }}
            onPointerOver={() => { document.body.style.cursor = 'grab'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            <group ref={boardRef}>
                <Float speed={3.5} rotationIntensity={0.4} floatIntensity={0.6}>
                    <RoundedBox args={isMobile ? [5, 8, 0.25] : [7, 9, 0.25]} radius={0.6} smoothness={8}>
                        <meshStandardMaterial 
                            color={feedback === 'correct' ? "#10b981" : (feedback === 'wrong' ? "#ef4444" : "#0f172a")} 
                            metalness={0.9} 
                            roughness={0.1} 
                            transparent 
                            opacity={0.85}
                        />
                    </RoundedBox>

                    <Html 
                        center 
                        transform 
                        position={[0, 0, 0.16]} 
                        distanceFactor={isMobile ? 8 : 6.5} 
                        className={`pointer-events-none select-none`}
                    >
                    <div className={`${isMobile ? 'w-[320px] p-6' : 'w-[450px] p-10'} flex flex-col items-center justify-center text-center text-white font-sans`}>
                        {/* 3D Emoji / Image */}
                        <div className={`${isMobile ? 'w-24 h-24 text-[60px]' : 'w-36 h-36 text-[100px]'} bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-2xl relative`}>
                            <div className="absolute inset-0 bg-brand-sky opacity-10 blur-2xl rounded-full" />
                            <span className="relative z-10 drop-shadow-glow-sky">{image}</span>
                        </div>

                        {/* Level Content Logic */}
                        <div className="w-full flex flex-col items-center gap-4 md:gap-6">
                            {level === 2 ? (
                                <div className="space-y-3 md:space-y-4 w-full">
                                    <div className="text-brand-sky text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase opacity-50">Conversation Flow</div>
                                    {blanked?.split('\n\n').map((line, idx) => (
                                        <div key={idx} className={`p-4 md:p-5 rounded-2xl ${idx % 2 === 0 ? 'bg-white/5 border border-white/5' : 'bg-brand-sky/10 border border-brand-sky/20'}`}>
                                            <p className={`${isMobile ? 'text-sm' : 'text-xl'} text-white font-medium leading-relaxed italic`}>
                                                {line.split('________').map((part, i, arr) => (
                                                    <span key={i}>
                                                        {part}
                                                        {i < arr.length - 1 && (
                                                            <span className={`font-black underline px-2 ${feedback === 'correct' ? 'text-brand-sky' : 'text-white/30'}`}>
                                                                {feedback === 'correct' ? correctWord : "________"}
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : level === 3 ? (
                                <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
                                    <div className="flex flex-col items-center">
                                        <span className="text-brand-sky text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase mb-1 md:mb-2 opacity-50">Translation Target</span>
                                        <h3 className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-white font-black tracking-tight drop-shadow-glow-sky italic`}>"{translation}"</h3>
                                    </div>
                                    <div className={`flex gap-2 ${isMobile ? 'min-h-[60px] px-4 py-3' : 'min-h-[80px] px-8 py-5'} items-center bg-slate-950/80 rounded-2xl md:rounded-3xl border border-white/10 shadow-inner w-full justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-b from-brand-sky/10 to-transparent pointer-events-none" />
                                        {selectedSyllables.map((s, i) => (
                                            <motion.div key={i} initial={{ scale: 0, y: 15 }} animate={{ scale: 1, y: 0 }} className={`${isMobile ? 'px-3 py-1.5 text-lg' : 'px-5 py-2.5 text-2xl'} bg-brand-sky rounded-xl text-white font-black shadow-xl border-2 border-white/20 z-10`}>
                                                {s}
                                            </motion.div>
                                        ))}
                                        {selectedSyllables.length === 0 && (
                                            <div className="text-white/10 font-black tracking-[0.3em] text-[10px] md:text-xs uppercase animate-pulse z-10 italic">Awaiting your answer...</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 md:gap-2">
                                    <h2 className={`${isMobile ? 'text-4xl' : 'text-7xl'} font-black text-white tracking-[0.1em] uppercase drop-shadow-glow-sky leading-none mb-1 md:mb-2`}>
                                        {word}
                                    </h2>
                                    <div className={`${isMobile ? 'text-lg' : 'text-2xl'} text-blue-400 font-bold tracking-[0.4em] uppercase opacity-60`}>
                                        {translation}
                                    </div>
                                </div>
                            )}

                            {/* Internal Progress Indicator */}
                            <div className="h-1.5 md:h-2 w-full bg-white/5 rounded-full mt-4 md:mt-6 border border-white/5 relative overflow-hidden">
                                <motion.div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-sky/40 to-brand-sky shadow-glow-sky" 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${progress * 100}%` }} 
                                 />
                            </div>
                        </div>

                        {/* Status Feedback */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className={`absolute -bottom-4 md:-bottom-4 px-6 md:px-10 py-2 md:py-3 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase border-2 shadow-2xl ${feedback === 'correct' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40' : 'bg-red-500/20 text-red-400 border-red-400/40'}`}
                                >
                                    {feedback === 'correct' ? 'Victory!' : 'Incorrect!'}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Html>

                {/* Glassy Back Glow */}
                <RoundedBox args={isMobile ? [5.2, 8.2, 0.1] : [7.2, 9.2, 0.1]} radius={0.6} position={[0, 0, -0.15]}>
                    <MeshDistortMaterial color="#38bdf8" speed={3} distort={0.15} metalness={1} roughness={0} transparent opacity={0.25} />
                </RoundedBox>
            </Float>
            </group>
        </group>
    );
};

export const QuestionBoard3D = (props: QuestionBoard3DProps) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 15], fov: 38 }} shadows style={{ width: '100vw', height: '100vh' }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
                <pointLight position={[-10, 10, 10]} intensity={1} color="#ec4899" />
                <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
                
                <BoardModel {...props} />
                
                <Environment preset="city" />
            </Canvas>
            <style jsx>{`
                .drop-shadow-glow-sky { filter: drop-shadow(0 0 20px rgba(56,189,248,0.6)); }
                .shadow-glow-sky { box-shadow: 0 0 20px rgba(56,189,248,0.6); }
            `}</style>
        </div>
    );
};
