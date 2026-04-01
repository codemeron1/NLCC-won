'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    Float, 
    Environment, 
    MeshDistortMaterial, 
    MeshWobbleMaterial, 
    Sparkles, 
    PerspectiveCamera,
    Stars,
    RoundedBox,
    Grid
} from '@react-three/drei';
import * as THREE from 'three';

const LearningNodes = () => {
    const group = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    useFrame((state) => {
        if (!group.current) return;
        const time = state.clock.getElapsedTime();
        const scroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        
        // Parallax effect based on scroll
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, scroll * 10, 0.1);
        
        group.current.children.forEach((child, i) => {
            child.rotation.y += 0.01;
            child.position.y += Math.sin(time + i) * 0.005;
        });
    });

    return (
        <group ref={group}>
            {/* Distributed Nodes */}
            <mesh position={[-8, 4, -10]}>
                <octahedronGeometry args={[1.5]} />
                <MeshWobbleMaterial color="#38bdf8" factor={0.4} speed={2} metalness={0.9} />
            </mesh>
            
            <mesh position={[7, -2, -12]}>
                <dodecahedronGeometry args={[2]} />
                <MeshDistortMaterial color="#ec4899" speed={1.5} distort={0.2} metalness={0.9} />
            </mesh>

            <mesh position={[-5, -8, -15]}>
                <icosahedronGeometry args={[2.5]} />
                <meshStandardMaterial color="#8b5cf6" metalness={1} roughness={0} />
            </mesh>
            
            <mesh position={[10, 10, -20]}>
                <torusKnotGeometry args={[3, 0.5, 100, 16]} />
                <meshPhongMaterial color="#22c55e" emissive="#166534" shininess={100} />
            </mesh>
        </group>
    );
};

export const Student3DBackground = () => {
    return (
        <div className="fixed inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} />
                <color attach="background" args={['#020617']} />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[20, 20, 20]} intensity={1.5} color="#38bdf8" />
                <pointLight position={[-20, -20, -20]} intensity={1} color="#ec4899" />
                
                <Stars radius={200} depth={80} count={5000} factor={6} saturation={1} fade speed={1.5} />
                
                <Grid 
                    renderOrder={-1} 
                    position={[0, -10, 0]} 
                    infiniteGrid 
                    cellSize={1} 
                    sectionSize={5} 
                    sectionThickness={1.5} 
                    sectionColor="#818cf8" 
                    fadeDistance={50} 
                    fadeStrength={5}
                />
                
                <LearningNodes />
                
                <Sparkles count={100} scale={40} size={5} speed={0.4} color="#38bdf8" opacity={0.6} />
                
                <Environment preset="night" />
            </Canvas>
            
            {/* Cinematic Shadow Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] invert" />
        </div>
    );
};
