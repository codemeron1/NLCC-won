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
    Cloud
} from '@react-three/drei';
import * as THREE from 'three';

const CursorParallaxCore = () => {
    const group = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    useFrame((state) => {
        if (!group.current || !coreRef.current) return;
        
        // Mouse parallax: subtle offset based on cursor
        const mx = state.mouse.x * 2;
        const my = state.mouse.y * 2;
        
        group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, mx, 0.05);
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, my, 0.05);
        
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -my * 0.1, 0.05);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mx * 0.1, 0.05);

        const time = state.clock.getElapsedTime();
        coreRef.current.rotation.z = time * 0.2;
    });

    return (
        <group ref={group}>
            {/* The Login Central Core */}
            <mesh ref={coreRef}>
                <icosahedronGeometry args={[2.5, 12]} />
                <MeshDistortMaterial 
                    color="#818cf8" 
                    speed={2} 
                    distort={0.3} 
                    metalness={0.9} 
                    roughness={0.1}
                    emissive="#4f46e5"
                    emissiveIntensity={0.2}
                />
            </mesh>

            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                {/* Secondary Security Spheres */}
                <mesh position={[5, 3, -2]}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#ec4899" metalness={1} roughness={0} />
                </mesh>
                <mesh position={[-4, -4, -3]}>
                    <sphereGeometry args={[0.7, 32, 32]} />
                    <meshStandardMaterial color="#38bdf8" metalness={1} roughness={0} />
                </mesh>
            </Float>

            {/* Orbiting Particles */}
            <Sparkles count={100} scale={10} size={2} speed={0.5} color="#818cf8" />
        </group>
    );
};

export const Auth3DBackground = () => {
    return (
        <div className="fixed inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <color attach="background" args={['#020617']} />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
                <spotLight position={[0, 5, 10]} angle={0.5} penumbra={1} intensity={2} color="#38bdf8" />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
                
                <CursorParallaxCore />
                
                <Environment preset="night" />
            </Canvas>
            
            {/* Vignette & Grain */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        </div>
    );
};
