'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, Environment, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const FloatingElements = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = t * 0.05;
        groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    });

    return (
        <group ref={groupRef}>
            {[...Array(20)].map((_, i) => (
                <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
                    <Sphere 
                        args={[Math.random() * 0.2, 16, 16]} 
                        position={[
                            (Math.random() - 0.5) * 30,
                            (Math.random() - 0.5) * 20,
                            (Math.random() - 0.5) * 10
                        ]}
                    >
                        <MeshDistortMaterial 
                            color={i % 2 === 0 ? "#8b5cf6" : "#38bdf8"}
                            speed={2}
                            distort={0.4}
                            roughness={0}
                            metalness={0.8}
                            transparent
                            opacity={0.3}
                        />
                    </Sphere>
                </Float>
            ))}
        </group>
    );
};

export const LessonBackground3D = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#020617]">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
                
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                
                <FloatingElements />
                
                <Environment preset="city" />
                
                {/* Subtle fog / atmosphere */}
                <fog attach="fog" args={['#020617', 10, 30]} />
            </Canvas>
            
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        </div>
    );
};
