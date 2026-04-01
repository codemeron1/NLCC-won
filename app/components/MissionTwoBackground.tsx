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

export const MissionTwoBackground = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                
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

                <Environment preset="night" />
            </Canvas>
            
        </div>
    );
};
