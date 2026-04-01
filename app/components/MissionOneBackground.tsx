'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    OrbitControls, 
    Environment, 
    Sparkles, 
    Float, 
    MeshDistortMaterial,
    Grid,
    ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

const FloatingCubes = () => {
    const cubes = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15,
            ],
            scale: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.5 + 0.2,
            distort: Math.random() * 0.4,
            color: i % 2 === 0 ? "#38bdf8" : "#ec4899"
        }));
    }, []);

    return (
        <group>
            {cubes.map((cube, i) => (
                <Float key={i} speed={cube.speed * 10} rotationIntensity={2} floatIntensity={1}>
                    <mesh position={cube.position as [number, number, number]} scale={cube.scale}>
                        <boxGeometry args={[1, 1, 1]} />
                        <MeshDistortMaterial 
                            color={cube.color} 
                            speed={cube.speed * 2} 
                            distort={cube.distort} 
                            metalness={0.9} 
                            roughness={0.1} 
                            transparent 
                            opacity={0.4} 
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const BackgroundGrid = () => {
    const gridRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (!gridRef.current) return;
        gridRef.current.position.z = (Math.sin(state.clock.getElapsedTime() * 0.2) * 2) - 10;
    });

    return (
        <group ref={gridRef} position={[0, -4, 0]}>
            <Grid 
                args={[100, 100]} 
                sectionSize={5} 
                sectionThickness={1.5} 
                sectionColor="#38bdf8"
                fadeDistance={50}
                infiniteGrid
            />
        </group>
    );
};

export const MissionOneBackground = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
                <spotLight position={[-20, 20, 10]} angle={0.15} penumbra={1} intensity={1} color="#ec4899" />
                
                <FloatingCubes />
                <BackgroundGrid />
                
                <Sparkles 
                    count={150} 
                    scale={20} 
                    size={4} 
                    speed={0.4} 
                    color="#38bdf8" 
                    opacity={0.5}
                />
                
                <ContactShadows 
                    position={[0, -4.5, 0]} 
                    opacity={0.4} 
                    scale={40} 
                    blur={2} 
                    far={4.5} 
                />
                
                <Environment preset="night" />
            </Canvas>
            
        </div>
    );
};
