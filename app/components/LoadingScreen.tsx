'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Text, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedShape = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.4}>
                <MeshDistortMaterial
                    color="#38bdf8"
                    speed={3}
                    distort={0.4}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                    emissive="#0c4a6e"
                    emissiveIntensity={0.5}
                />
            </Sphere>
        </Float>
    );
};

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading Experience..." }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <color attach="background" args={['#020617']} />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
                    
                    <AnimatedShape />
                    
                    <ContactShadows 
                        position={[0, -2.5, 0]} 
                        opacity={0.4} 
                        scale={10} 
                        blur={2} 
                        far={4.5} 
                    />
                    
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* UI Layer */}
            <div className="relative z-10 flex flex-col items-center gap-8 mt-[30vh]">
                <div className="flex flex-col items-center gap-2">
                    <motion.h2 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-white text-2xl font-black tracking-[0.4em] uppercase drop-shadow-glow-sky"
                    >
                        Loading
                    </motion.h2>
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-brand-sky to-transparent"
                        />
                    </div>
                </div>
                
                <p className="text-blue-400/60 text-[10px] font-black tracking-[0.2em] uppercase max-w-xs text-center">
                    {message}
                </p>
            </div>

            {/* Background Decorative Blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full" />

            <style jsx>{`
                .drop-shadow-glow-sky { filter: drop-shadow(0 0 15px rgba(56,189,248,0.6)); }
            `}</style>
        </motion.div>
    );
};
