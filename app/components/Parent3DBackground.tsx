'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    Float, 
    Environment, 
    Text,
    PerspectiveCamera,
    Stars,
    MeshDistortMaterial,
    ScreenSpace,
    Torus,
    Sparkles
} from '@react-three/drei';
import * as THREE from 'three';

const DataNodes = () => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!group.current) return;
        const time = state.clock.getElapsedTime();
        
        group.current.children.forEach((child, i) => {
            child.position.y += Math.sin(time + i) * 0.002;
            child.rotation.x += 0.005;
            child.rotation.z += 0.003;
        });
    });

    const nodes = useMemo(() => {
        return [...Array(15)].map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                -Math.random() * 20 - 10
            ],
            scale: Math.random() * 0.5 + 0.5,
            color: i % 2 === 0 ? '#8b5cf6' : '#38bdf8',
            distort: Math.random() * 0.4 + 0.2
        }));
    }, []);

    return (
        <group ref={group}>
            {nodes.map((node, i) => (
                <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
                    <mesh position={node.position as [number, number, number]} scale={node.scale}>
                        <icosahedronGeometry args={[1, 0]} />
                        <MeshDistortMaterial 
                            color={node.color} 
                            speed={2} 
                            distort={node.distort} 
                            radius={1}
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const AnalyticalGrid = () => {
    const mesh = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();
        mesh.current.rotation.z = time * 0.05;
    });

    return (
        <mesh ref={mesh} position={[0, -5, -15]} rotation={[-Math.PI / 2.5, 0, 0]}>
            <planeGeometry args={[100, 100, 50, 50]} />
            <meshStandardMaterial 
                color="#4f46e5" 
                wireframe 
                transparent 
                opacity={0.15} 
                emissive="#6366f1"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};

export const Parent3DBackground = () => {
    return (
        <div className="fixed inset-0 z-0 bg-[#020617] pointer-events-none">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
                
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#38bdf8" />
                <spotLight position={[0, 20, 0]} intensity={2} angle={0.3} penumbra={1} color="#ffffff" />
                
                <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                
                <DataNodes />
                <AnalyticalGrid />
                
                <Sparkles count={50} scale={40} size={4} speed={0.3} color="#8b5cf6" opacity={0.4} />
                
                <Environment preset="night" />
            </Canvas>
            
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-transparent to-purple-900/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
        </div>
    );
};
