'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    Stars, 
    Environment, 
    Float, 
    MeshWobbleMaterial, 
    Sparkles, 
    PerspectiveCamera,
    PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';

const FamilyNeuralCore = () => {
    return (
        <Float speed={4} rotationIntensity={1.5} floatIntensity={1.5}>
            <mesh>
                <icosahedronGeometry args={[1, 15]} />
                <MeshWobbleMaterial color="#ec4899" factor={0.6} speed={2} metalness={0.8} />
            </mesh>
            <Sparkles count={120} scale={4} size={3} speed={0.5} color="#ec4899" />
        </Float>
    );
};

export const MissionThreeBackground = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ec4899" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
                
                <Stars radius={120} depth={60} count={6000} factor={4} saturation={1} fade speed={1.5} />
                
                <PresentationControls
                    global
                    speed={2}
                    snap
                    rotation={[0, 0, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                    <FamilyNeuralCore />
                </PresentationControls>

                <Environment preset="night" />
            </Canvas>
            
        </div>
    );
};
