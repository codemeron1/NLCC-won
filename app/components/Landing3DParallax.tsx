'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    Float, 
    Environment, 
    MeshDistortMaterial, 
    MeshWobbleMaterial, 
    Sparkles, 
    PerspectiveCamera,
    Stars,
    ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

const ScrollManager = () => {
    const { camera, scene } = useThree() as { camera: THREE.PerspectiveCamera, scene: THREE.Scene };
    const mouse = useRef({ x: 0, y: 0 });
    const lastScroll = useRef(0);
    const scrollVelocity = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state, delta) => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scroll = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        
        // Calculate Scroll Velocity with a cap to prevent extremes
        const currentVelocity = delta > 0 ? Math.abs(scroll - lastScroll.current) / delta : 0;
        scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, currentVelocity, 0.1);
        lastScroll.current = scroll;

        // 1. Smooth Camera Movement
        const targetZ = 12 + scroll * 12;
        const targetX = Math.sin(scroll * Math.PI) * 8 + (mouse.current.x * 2);
        const targetY = (mouse.current.y * 2) - (scroll * 5);
        
        // FOV Warp based on velocity
        const targetFOV = 50 + Math.min(scrollVelocity.current * 10, 20);
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.1);
        camera.updateProjectionMatrix();

        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        
        camera.lookAt(0, 0, 0);
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, scroll * 0.5, 0.05);

        // 2. Background Color Transition
        const colorStart = new THREE.Color('#fafafa'); // Light
        const colorMid = new THREE.Color('#ede9fe');   // Soft Purple
        const colorEnd = new THREE.Color('#f1f5f9');   // Soft Blue-Grey
        
        let targetColor = new THREE.Color();
        if (scroll < 0.5) {
            targetColor.lerpColors(colorStart, colorMid, scroll * 2);
        } else {
            targetColor.lerpColors(colorMid, colorEnd, (scroll - 0.5) * 2);
        }
        
        scene.background = targetColor;
        if (scene.fog) {
            (scene.fog as THREE.Fog).color = targetColor;
        }
    });

    return null;
};

const FloatingNeuralShapes = () => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!group.current) return;
        const time = state.clock.getElapsedTime();
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scroll = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, scroll * 20, 0.05);

        group.current.children.forEach((child, i) => {
            const speed = 0.5 + i * 0.1;
            child.rotation.x += 0.005 + (scroll * 0.02);
            child.rotation.y += 0.005 + (scroll * 0.02);
            
            // Wobble effect
            const offset = i * Math.PI * 0.5;
            child.position.y += Math.sin(time * speed + offset) * 0.005;
        });
    });

    return (
        <group ref={group}>
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <mesh position={[-5, 2, -5]}>
                    <sphereGeometry args={[2, 64, 64]} />
                    <MeshDistortMaterial color="#8b5cf6" speed={3} distort={0.4} radius={1} metalness={0.6} roughness={0.2} />
                </mesh>
            </Float>
            
            <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
                <mesh position={[6, -4, -8]} rotation={[0.5, 0.5, 0]}>
                    <boxGeometry args={[3, 3, 3]} />
                    <MeshWobbleMaterial color="#38bdf8" factor={1} speed={2} metalness={0.8} />
                </mesh>
            </Float>

            <Float speed={3} rotationIntensity={0.5} floatIntensity={3}>
                <mesh position={[-8, -8, -10]}>
                    <dodecahedronGeometry args={[2, 0]} />
                    <meshStandardMaterial color="#ec4899" wireframe emissive="#ec4899" emissiveIntensity={0.5} />
                </mesh>
            </Float>

            <Float speed={4} rotationIntensity={3} floatIntensity={0.5}>
                <mesh position={[10, 10, -15]}>
                    <icosahedronGeometry args={[2.5, 0]} />
                    <meshPhysicalMaterial color="#22c55e" transmission={0.8} thickness={1} roughness={0} />
                </mesh>
            </Float>
        </group>
    );
};

const NeuralGrid = () => {
    const gridRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (!gridRef.current) return;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scroll = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        gridRef.current.position.z = -20 + (scroll * 30);
        gridRef.current.rotation.x = -Math.PI / 2.5 + (scroll * 0.5);
        gridRef.current.position.y = -15 + (scroll * 10);
    });

    return (
        <group ref={gridRef}>
            <gridHelper args={[200, 40, '#8b5cf6', '#cbd5e1']} />
            <Sparkles count={100} scale={100} size={1} speed={0.4} color="#8b5cf6" />
        </group>
    );
};

export const Landing3DParallax = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
            <Canvas dpr={[1, 2]} shadows={{ type: THREE.PCFShadowMap }}>
                <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
                <fog attach="fog" args={['#fafafa', 10, 60]} />
                
                <ambientLight intensity={0.5} />
                <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={1} />
                <pointLight position={[10, 10, 10]} color="#38bdf8" intensity={1} />
                
                <ScrollManager />
                <FloatingNeuralShapes />
                <NeuralGrid />
                
                <Stars radius={150} depth={50} count={3000} factor={6} saturation={0} fade speed={1.5} />
                
                <ContactShadows position={[0, -15, 0]} opacity={0.4} scale={100} blur={2} far={20} />
                
                <Environment preset="night" />
            </Canvas>
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-sky/5 pointer-events-none" />
        </div>
    );
};
