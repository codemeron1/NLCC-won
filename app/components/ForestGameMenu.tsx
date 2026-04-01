'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment, Float, MeshDistortMaterial, useGLTF, useAnimations, KeyboardControls, useKeyboardControls, OrbitControls, PerspectiveCamera, MeshReflectorMaterial, Text, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SplashScreen } from './SplashScreen';

interface ForestGameMenuProps {
  onStart: (level: number) => void;
  onExit: () => void;
  initialView?: 'main' | 'levels' | 'adventure';
}

export const ForestGameMenu: React.FC<ForestGameMenuProps> = ({ onStart, onExit, initialView = 'main' }) => {
  const [view, setView] = useState<'main' | 'levels' | 'adventure'>(initialView);
  const [showSplash, setShowSplash] = useState(true);
  const [showStudioHUD, setShowStudioHUD] = useState(false);
  const [isTeacherNear, setIsTeacherNear] = useState(false);

  useEffect(() => {
    if (view === 'adventure') {
      setShowStudioHUD(true);
      const timer = setTimeout(() => setShowStudioHUD(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    (window as any).triggerMission = (id: number) => onStart(id);
    return () => { delete (window as any).triggerMission; };
  }, [onStart]);

  const map = useMemo(() => [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['KeyA'] },
    { name: 'right', keys: ['KeyD'] },
    { name: 'lookLeft', keys: ['ArrowLeft'] },
    { name: 'lookRight', keys: ['ArrowRight'] },
    { name: 'interact', keys: ['Space', 'Enter', 'KeyE'] },
  ], []);

  const mainButtons = [
    { id: 'play', icon: <PlayIcon />, onClick: () => setView('adventure'), delay: 0.1 },
  ];

  const levelButtons = [
    { id: 'level1', label: 'Adaptive Mind', onClick: () => onStart(1), delay: 0.1, locked: false },
    { id: 'level2', label: 'Po at Opo', onClick: () => onStart(2), delay: 0.2, locked: false },
    { id: 'level3', label: 'Ang Aking Pamilya', onClick: () => onStart(3), delay: 0.3, locked: false },
    { id: 'back', label: 'Back', onClick: () => setView('adventure'), delay: 0.4, isSmall: true, locked: false },
  ];

  const deskPositions = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
        x: ((i % 5) - 2) * 8,
        z: (Math.floor(i / 5) - 1.5) * 10,
        rotation: (i * 0.13) % 0.4 - 0.2 // Fixed but slightly varied
    }));
  }, []);

  if (showSplash) return <SplashScreen onCompleteAction={() => setShowSplash(false)} />;

  return (
    <KeyboardControls map={map}>
      <div className="fixed inset-0 z-[10000] bg-white/5 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden touch-none font-sans text-white">
        {/* 3D Immersive Neural Background */}
        <div className="absolute inset-0 pointer-events-none opacity-100 z-0">
          <Canvas shadows camera={{ position: [0, 5, 12], fov: 45 }}>
               <ambientLight intensity={0.6} />
               <MovingLights />
               
               <SchoolSurface mode={view} deskPositions={deskPositions} />
               
               <React.Suspense fallback={null}>
                  <StudentCharacter mode={view} onStart={onStart} setView={setView} deskPositions={deskPositions} setIsTeacherNear={setIsTeacherNear} />
               </React.Suspense>
               
               <Environment files="/game_ui/school_hall_4k.exr" blur={0.05} />
           </Canvas>
        </div>

        {/* Mobile Controller Overlay */}
        {view === 'adventure' && (
            <div className="absolute inset-0 z-40 md:hidden pointer-events-none">
                {/* D-Pad Controller Area (Left) */}
                <div className="absolute bottom-[6%] left-[6%] grid grid-cols-3 gap-1 md:gap-2 pointer-events-none">
                    <div />
                    <button 
                        onPointerDown={() => (window as any).mMove = { f: true }}
                        onPointerUp={() => (window as any).mMove = { f: false }}
                        className="w-[14vw] h-[14vw] max-w-[64px] max-h-[64px] rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-xl md:text-2xl font-black pointer-events-auto active:bg-brand-sky/20 transition-colors"
                    >↑</button>
                    <div />
                    <button 
                        onPointerDown={() => (window as any).mMove = { l: true }}
                        onPointerUp={() => (window as any).mMove = { l: false }}
                        className="w-[14vw] h-[14vw] max-w-[64px] max-h-[64px] rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-xl md:text-2xl font-black pointer-events-auto active:bg-brand-sky/20 transition-colors"
                    >←</button>
                    <button 
                        onPointerDown={() => (window as any).mMove = { b: true }}
                        onPointerUp={() => (window as any).mMove = { b: false }}
                        className="w-[14vw] h-[14vw] max-w-[64px] max-h-[64px] rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-xl md:text-2xl font-black pointer-events-auto active:bg-brand-sky/20 transition-colors"
                    >↓</button>
                    <button 
                        onPointerDown={() => (window as any).mMove = { r: true }}
                        onPointerUp={() => (window as any).mMove = { r: false }}
                        className="w-[14vw] h-[14vw] max-w-[64px] max-h-[64px] rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-xl md:text-2xl font-black pointer-events-auto active:bg-brand-sky/20 transition-colors"
                    >→</button>
                </div>

                {/* Camera Rotation Area (Right) */}
                <div className="absolute bottom-[6%] right-[6%] flex gap-3 pointer-events-none">
                    <button 
                        onPointerDown={() => (window as any).lookActive = -1}
                        onPointerUp={() => (window as any).lookActive = 0}
                        className="w-[14vw] h-[14vw] max-w-[68px] max-h-[68px] rounded-full bg-brand-sky/20 backdrop-blur-3xl border border-brand-sky/40 flex items-center justify-center text-2xl md:text-3xl pointer-events-auto active:bg-brand-sky/40 transition-colors"
                    >←</button>
                    <button 
                        onPointerDown={() => (window as any).lookActive = 1}
                        onPointerUp={() => (window as any).lookActive = 0}
                        className="w-[14vw] h-[14vw] max-w-[68px] max-h-[68px] rounded-full bg-brand-sky/20 backdrop-blur-3xl border border-brand-sky/40 flex items-center justify-center text-2xl md:text-3xl pointer-events-auto active:bg-brand-sky/40 transition-colors"
                    >→</button>
                </div>
            </div>
        )}

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
          {/* Top Exit Button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onExit}
            className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all z-20 group"
            title="Exit Game"
          >
            <span className="text-2xl leading-none group-hover:rotate-90 transition-transform">✕</span>
          </motion.button>

          <AnimatePresence mode="wait">
            {view === 'main' ? (
              <motion.div 
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 md:gap-12 w-full px-6"
              >
                {/* Cinematic Main View Backdrop */}
                <div className="absolute inset-0 pointer-events-none z-[-1] opacity-30 transform-gpu translate-z-[-200px]">
                  <Image src="/game_ui/Adaptive_Game.png" fill className="object-cover blur-[80px]" alt="" />
                </div>

                <motion.div className="flex flex-col gap-6">
                  {mainButtons.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: item.delay }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.onClick}
                      className="relative w-full max-w-[280px] md:max-w-[340px] h-14 md:h-20 flex items-center px-6 md:px-8 gap-3 md:gap-6 group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl group-hover:bg-brand-sky/10 group-hover:border-brand-sky/30 transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10 text-white/50 group-hover:text-brand-sky transition-colors flex-shrink-0 scale-75 md:scale-100">
                        {item.icon}
                      </div>
                      
                      <span className="relative z-10 text-white text-sm md:text-lg font-black tracking-[0.1em] md:tracking-[0.2em] uppercase group-hover:text-white transition-colors">
                          Start Adventure
                      </span>

                      <div className="absolute right-0 top-0 w-32 h-full bg-brand-sky/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            ) : view === 'adventure' ? (
               <React.Fragment key="adventure">
                 {/* Persistent Back Button in Studio (Hidden until click or small) */}
                 <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setView('main')}
                    className="absolute top-8 left-8 md:bottom-8 md:left-8 md:top-auto p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] uppercase font-black tracking-widest pointer-events-auto z-50"
                 >Exit Studio</motion.button>

                 <AnimatePresence>
                   {showStudioHUD && (
                     <motion.div
                        key="adventure-hud"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5 }}
                        className="absolute bottom-12 left-0 right-0 p-8 flex flex-col items-center gap-4 pointer-events-none"
                     >
                        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/20 p-8 rounded-[3rem] flex flex-col items-center shadow-2xl">
                            <div className="text-brand-sky text-[10px] font-black tracking-[0.6em] uppercase mb-2">Adventure Mode Active</div>
                            <div className="text-white text-4xl font-black mb-6 uppercase">School Studio</div>
                            
                            <div className="flex gap-10 items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black shadow-lg">W</div>
                                    <div className="flex gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black shadow-lg">A</div>
                                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black shadow-lg">S</div>
                                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black shadow-lg">D</div>
                                    </div>
                                    <span className="text-[10px] uppercase font-black opacity-50 tracking-widest mt-2">Control Character</span>
                                </div>
                            </div>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {/* Teacher Subtitle Caption */}
                 <AnimatePresence>
                     {isTeacherNear && (
                         <motion.div
                            key="teacher-subtitle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-32 md:bottom-12 left-0 right-0 p-4 md:p-8 flex flex-col items-center gap-4 pointer-events-none z-50"
                         >
                            <div className="bg-black/80 backdrop-blur-md border border-white/20 px-6 py-4 md:px-12 md:py-6 rounded-2xl flex flex-col items-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-w-2xl text-center pointer-events-auto">
                                <div className="text-yellow-400 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-2">Teacher</div>
                                <div className="text-white text-base md:text-xl font-medium leading-relaxed mb-4">
                                    "Hello! Are you ready to begin your language missions?"
                                </div>
                                <button 
                                    onClick={() => setView('levels')}
                                    className="bg-brand-sky hover:bg-blue-500 text-white font-black px-6 py-3 rounded-xl text-xs md:text-sm uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-sky/30 w-full md:w-auto"
                                >
                                    Start (Press Space)
                                </button>
                            </div>
                         </motion.div>
                     )}
                 </AnimatePresence>
               </React.Fragment>
            ) : (
              <motion.div 
                key="levels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 relative z-10 w-full"
              >
                <div className="relative z-10 flex flex-col items-center mb-8">
                  <div className="text-blue-400 text-[10px] font-black tracking-[0.6em] uppercase mb-2">Command Center</div>
                  <h2 className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-glow-sky">Game Dashboard</h2>
                </div>
                <div className="flex flex-row flex-wrap items-center justify-center gap-6 md:gap-12 w-full max-w-7xl relative z-10 px-6 max-h-[70vh] overflow-y-auto md:overflow-visible pb-10 custom-scrollbar">
                  {levelButtons.filter(b => b.id !== 'back').map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      whileHover={!item.locked ? { scale: 1.05 } : {}}
                      whileTap={!item.locked ? { scale: 0.97 } : {}}
                      onClick={item.onClick}
                      className={`
                        relative overflow-hidden transition-all duration-300 w-[85vw] md:w-[350px] h-auto aspect-[3/4.5] md:h-[540px] rounded-[3rem] md:rounded-[5rem] border-2 border-white/20 flex flex-col items-center justify-end p-6 md:p-10 gap-4 shadow-[0_30px_70px_rgba(0,0,0,0.6)]
                        ${!item.locked ? 'hover:shadow-[0_0_80px_rgba(56,189,248,0.4)] hover:border-blue-400/60' : 'grayscale opacity-60'}
                        ${item.locked ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <Image 
                        src={
                          item.id === 'level1' ? '/game_ui/Adaptive_Game.png' : 
                          item.id === 'level2' ? '/game_ui/Po_at_Opo.png' : 
                          item.id === 'level3' ? '/game_ui/Ang_aking_Pamilya.png' : 
                          '/game_ui/wooden_planks_v2.png'
                        }
                        alt={item.label}
                        fill
                        className="object-cover transition-all duration-700 blur-[4px] group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/50 transition-all duration-500" />
                      <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center gap-3 translate-y-4 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        {item.id === 'level1' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 text-[10px] md:text-[12px] tracking-[0.5em] md:tracking-[1em] mb-1 md:mb-2 font-black drop-shadow-lg">Mission 01</span>
                            <span className="text-white text-2xl md:text-4xl font-black drop-shadow-2xl">Adaptive Mind</span>
                            <p className="mt-4 md:mt-6 text-white/80 text-center text-[10px] md:text-sm font-medium italic max-w-[240px] md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Choose the correct Tagalog word!</p>
                          </div>
                        ) : item.id === 'level2' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 text-[10px] md:text-[12px] tracking-[0.5em] md:tracking-[1em] mb-1 md:mb-2 font-black drop-shadow-lg">Mission 02</span>
                            <span className="text-white text-2xl md:text-4xl font-black drop-shadow-2xl text-center">Po at Opo</span>
                            <p className="mt-4 md:mt-6 text-white/80 text-center text-[10px] md:text-sm font-medium italic max-w-[240px] md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Fill in the blanks with respect!</p>
                          </div>
                        ) : item.id === 'level3' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 text-[10px] md:text-[12px] tracking-[0.5em] md:tracking-[1em] mb-1 md:mb-2 font-black drop-shadow-lg">Mission 03</span>
                            <span className="text-white text-2xl md:text-4xl font-black drop-shadow-2xl text-center">Ang Aking Pamilya</span>
                            <p className="mt-4 md:mt-6 text-white/80 text-center text-[10px] md:text-sm font-medium italic max-w-[240px] md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Identify your family members!</p>
                          </div>
                        ) : (
                          <span className="text-white text-xl md:text-2xl font-black">{item.label}</span>
                        )}
                        <motion.div className="bg-brand-sky/20 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-[10px] text-white font-black tracking-[0.4em] mt-4 md:mt-8 uppercase md:opacity-0 md:group-hover:opacity-100 transition-all">Launch Mission</motion.div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <motion.button onClick={() => setView('main')} className="mt-8 px-10 py-3 bg-white/5 border border-white/10 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Back to Main</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <style jsx>{`
          .shadow-glow-sky { box-shadow: 0 0 30px rgba(56,189,248,0.4); }
          .drop-shadow-glow-sky { filter: drop-shadow(0 0 20px rgba(56,189,248,0.4)); }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        `}</style>
      </div>
    </KeyboardControls>
  );
};

const StudentCharacter: React.FC<{ 
    mode: string, 
    onStart: (id: number) => void, 
    setView: (v: 'main' | 'levels' | 'adventure') => void,
    deskPositions: { x: number, z: number }[],
    setIsTeacherNear: (val: boolean) => void
}> = ({ mode, onStart, setView, deskPositions, setIsTeacherNear }) => {
    const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Soldier.glb');
    
    // Enable shadows for all meshes in the character
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    const { actions } = useAnimations(animations, scene);
    const [, getKeys] = useKeyboardControls();
    const groupRef = useRef<THREE.Group>(null);
    const triggeredRef = useRef(false);
    const [currentAction, setCurrentAction] = useState('Idle');
    const [nearTeacher, setNearTeacher] = useState(false);
    
    const cameraAngleRef = useRef(0);
    const upVector = useMemo(() => new THREE.Vector3(0, 1, 0), []);
    const mascotPos = useMemo(() => new THREE.Vector3(-4, -1, 1), []);
    const { size } = useThree();
    const isMobile = size.width < 768;

    const walkSpeed = isMobile ? 4 : 6;
    const rotationSpeed = 2.5;
    const lerpFactor = 0.15;
    const direction = useMemo(() => new THREE.Vector3(), []);
    const frontVector = useMemo(() => new THREE.Vector3(), []);
    const sideVector = useMemo(() => new THREE.Vector3(), []);

    useEffect(() => {
        if (!actions) return;
        const animation = actions[currentAction];
        if (animation) {
            Object.values(actions).forEach(a => a?.fadeOut(0.3));
            animation.reset().fadeIn(0.3).play();
        }
    }, [actions, currentAction]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (mode !== 'adventure') {
            // Dashboard Mascot Mode
            groupRef.current.position.lerp(mascotPos, 0.1);
            groupRef.current.rotation.y += delta * 0.4;
            if (currentAction !== 'Idle') setCurrentAction('Idle');
            return;
        }

        // Adventure Studio Mode
        const { forward: kForward, backward: kBackward, left: kLeft, right: kRight, lookLeft: kLookLeft, lookRight: kLookRight } = getKeys();
        
        // Combine Keyboard and Touch Input
        const mMove = (window as any).mMove || {};
        const lookActive = (window as any).lookActive || 0;

        const forward = kForward || mMove.f;
        const backward = kBackward || mMove.b;
        const left = kLeft || mMove.l;
        const right = kRight || mMove.r;

        const isMoving = forward || backward || left || right;
        const lookLeft = kLookLeft || lookActive === -1;
        const lookRight = kLookRight || lookActive === 1;

        // Snap to lunar ground
        if (groupRef.current.position.y !== -3.5) {
            groupRef.current.position.y = -3.5;
        }

        // Handle Camera Rotation
        if (lookLeft) cameraAngleRef.current += delta * rotationSpeed;
        if (lookRight) cameraAngleRef.current -= delta * rotationSpeed;

        frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
        sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
        
        // Movement direction relative to rotating camera
        direction.subVectors(frontVector, sideVector).normalize().applyAxisAngle(upVector, cameraAngleRef.current).multiplyScalar(walkSpeed * delta);

        if (isMoving) {
            // Proposed new position
            const nextPos = groupRef.current.position.clone().add(direction);
            
            // Boundary checks for the 50x50 room (Walls at ±25)
            const bound = 24.2; 
            
            // Desk collision check (Desk radius ~3.2)
            const isCollidingWithDesk = deskPositions.some(desk => {
                const dx = nextPos.x - desk.x;
                const dz = nextPos.z - desk.z;
                return Math.sqrt(dx * dx + dz * dz) < 3.2;
            });

            const isInsideWalls = nextPos.x > -bound && nextPos.x < bound && nextPos.z > -bound && nextPos.z < bound;

            if (isInsideWalls && !isCollidingWithDesk) {
                groupRef.current.position.add(direction);
            } else if (isInsideWalls) {
                // Potential sliding or stop logic
                // For simplicity, stop if it would hit a desk
            } else {
                // Sliding along walls
                if (nextPos.x > -bound && nextPos.x < bound) {
                    groupRef.current.position.x = nextPos.x;
                }
                if (nextPos.z > -bound && nextPos.z < bound) {
                    groupRef.current.position.z = nextPos.z;
                }
            }

            const moveRotation = Math.atan2(direction.x, direction.z) + Math.PI;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, moveRotation, lerpFactor * 2);
            if (currentAction !== 'Walk') setCurrentAction('Walk');
        } else {
            if (currentAction !== 'Idle') setCurrentAction('Idle');
        }

        // Camera Follow (Orbital Perspective)
        const charPos = groupRef.current.position;
        const orbitDistance = isMobile ? 18 : 14;
        const orbitHeight = isMobile ? 8 : 6;

        const targetCam = new THREE.Vector3(
            charPos.x + Math.sin(cameraAngleRef.current) * orbitDistance,
            charPos.y + orbitHeight,
            charPos.z + Math.cos(cameraAngleRef.current) * orbitDistance
        );

        state.camera.position.lerp(targetCam, 0.1);
        state.camera.lookAt(charPos.x, charPos.y + 1, charPos.z);

        // Proximity/Teacher Check
        if (mode === 'adventure') {
            // Instructor is at [0, -3.5, -21], check distance
            const teacherPos = new THREE.Vector3(0, -3.5, -21);
            const dist = charPos.distanceTo(teacherPos);
            const isNear = dist < 5;
            
            if (isNear !== nearTeacher) {
                setNearTeacher(isNear);
                setIsTeacherNear(isNear);
            }

            const { interact } = getKeys();
            const interactBtn = interact || (window as any).mInteract;
            
            if (isNear && interactBtn) {
                if (!triggeredRef.current) {
                    triggeredRef.current = true;
                    setView('levels');
                }
            } else if (!isNear || !interactBtn) {
                triggeredRef.current = false;
            }
        }
    });

    return (
        <group ref={groupRef} scale={isMobile ? 1.5 : 2.5}>
            <primitive object={scene} />
        </group>
    );
};

const SchoolSurface: React.FC<{ mode: string, deskPositions: { x: number, z: number, rotation: number }[] }> = ({ mode, deskPositions }) => {
    return (
        <group position={[0, -3.5, 0]}>
            {/* Mid-sized Matte Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
            </mesh>
            <Grid 
                position={[0, 0.01, 0]}
                args={[50, 50]} 
                cellSize={5}
                cellThickness={0.5}
                cellColor="#e2e8f0"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#cbd5e1"
                infiniteGrid={false}
                fadeDistance={50}
            />
            
            {/* Back Wall (Modern White) */}
            <group position={[0, 15, -25]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[50, 30, 1]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                </mesh>
                {/* Vertical Panels Texture */}
                {[...Array(12)].map((_, i) => (
                    <mesh key={i} position={[(i - 5.5) * 4.2, 0, 0.6]}>
                        <boxGeometry args={[0.2, 30, 0.1]} />
                        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.4} />
                    </mesh>
                ))}
            </group>

            {/* Front Wall (Modern White with Exit Door) */}
            <group position={[0, 15, 25]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[50, 30, 1]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                </mesh>
                {/* Vertical Panels Texture */}
                {[...Array(12)].map((_, i) => (
                    <mesh key={i} position={[(i - 5.5) * 4.2, 0, -0.6]}>
                        <boxGeometry args={[0.2, 30, 0.1]} />
                        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.4} />
                    </mesh>
                ))}
                
                {/* Exit Door */}
                <group position={[0, -15, -0.6]}>
                    <mesh position={[0, 4.5, 0]}>
                        <boxGeometry args={[5, 9, 0.3]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    <mesh position={[0, 4.5, 0.2]} castShadow>
                        <boxGeometry args={[4.6, 8.6, 0.1]} />
                        <meshStandardMaterial color="#0f172a" />
                    </mesh>
                    <mesh position={[1.8, 4.5, 0.3]} castShadow>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.1} />
                    </mesh>
                    <group position={[0, 10, 0.3]}>
                        <mesh>
                            <planeGeometry args={[2, 0.8]} />
                            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                        </mesh>
                        <Text position={[0, 0, 0.1]} fontSize={0.3} color="white">EXIT</Text>
                    </group>
                </group>
            </group>

            {/* Side Walls (Solid White) */}
            <mesh position={[-25, 15, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 30, 50]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.9} />
            </mesh>
            <mesh position={[25, 15, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 30, 50]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.9} />
            </mesh>

            {/* Chalkboard (Proportional to mid-sized wall) */}
            <group position={[0, 7, -24.4]}>
                <mesh>
                    <planeGeometry args={[16, 8]} />
                    <meshStandardMaterial color="#064e3b" roughness={0.9} />
                </mesh>
                {/* Board Frame */}
                <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[17.5, 9.5]} />
                    <meshStandardMaterial color="#78350f" />
                </mesh>
                {/* Chalk Content */}
                <Text position={[-6, 1.5, 0.1]} fontSize={0.5} color="white" fillOpacity={0.6}>
                    NEUROLINGUA
                </Text>
                <Text position={[-6, 0.5, 0.1]} fontSize={0.4} color="white" fillOpacity={0.4}>
                    Lesson: Tagalog 101
                </Text>
            </group>

            {/* Instructor Character */}
            <InstructorCharacter position={[0, 0, -21]} rotation={[0, 0, 0]} />

            {/* Spacious Classroom Desk Arrangement (15 Units) */}
            {deskPositions.map((desk, i) => (
                <ClassroomDesk 
                    key={i} 
                    position={[desk.x, 0, desk.z]} 
                    rotation={[0, desk.rotation, 0]}
                />
            ))}
        </group>
    );
};

const InstructorCharacter: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Head */}
            <mesh position={[0, 4.5, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color="#fca5a5" roughness={0.3} />
            </mesh>
            {/* Glasses */}
            <mesh position={[0, 4.6, 0.42]} castShadow>
                <boxGeometry args={[0.7, 0.15, 0.1]} />
                <meshStandardMaterial color="#1e293b" roughness={0.1} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 2.8, 0]} castShadow>
                <boxGeometry args={[1.4, 2.4, 0.7]} />
                <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            {/* Necktie */}
            <mesh position={[0, 3.2, 0.36]} castShadow>
                <boxGeometry args={[0.2, 1.4, 0.05]} />
                <meshStandardMaterial color="#ef4444" roughness={0.4} />
            </mesh>
            {/* Left Arm */}
            <mesh position={[-0.9, 2.8, 0]} castShadow>
                <boxGeometry args={[0.4, 2.0, 0.4]} />
                <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            {/* Right Arm (pointing up / explaining) */}
            <group position={[0.9, 3.8, 0]} rotation={[0, 0, Math.PI / 6]}>
                <mesh position={[0, -0.8, 0]} castShadow>
                    <boxGeometry args={[0.4, 2.0, 0.4]} />
                    <meshStandardMaterial color="#475569" roughness={0.8} />
                </mesh>
            </group>
            {/* Left Leg */}
            <mesh position={[-0.4, 0.8, 0]} castShadow>
                <boxGeometry args={[0.5, 1.6, 0.5]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.4, 0.8, 0]} castShadow>
                <boxGeometry args={[0.5, 1.6, 0.5]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            {/* Base Shadow Caster (Feet) */}
            <mesh position={[-0.4, 0.1, 0.1]} castShadow>
                <boxGeometry args={[0.55, 0.2, 0.7]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            <mesh position={[0.4, 0.1, 0.1]} castShadow>
                <boxGeometry args={[0.55, 0.2, 0.7]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
        </group>
    );
};

const ClassroomDesk: React.FC<{ position: [number, number, number], rotation: [number, number, number] }> = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Table Top (Smaller) */}
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
                <boxGeometry args={[4.5, 0.2, 3]} />
                <meshStandardMaterial color="#d97706" roughness={0.4} />
            </mesh>
            {/* Table Legs (Scaled) */}
            {[[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.2], [1.8, 1.2]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.9, pos[1]]} castShadow>
                    <cylinderGeometry args={[0.06, 0.06, 1.8]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} />
                </mesh>
            ))}
            {/* Chair (Smaller scale) */}
            <group position={[0, 0, 2.5]}>
                {/* Seat */}
                <mesh position={[0, 1, 0]} castShadow>
                    <boxGeometry args={[2.2, 0.15, 2.2]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Backrest */}
                <mesh position={[0, 2, 1.05]} castShadow>
                    <boxGeometry args={[2.2, 2, 0.15]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Chair Legs */}
                {[[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].map((pos, i) => (
                    <mesh key={i} position={[pos[0], 0.5, pos[1]]} castShadow>
                        <cylinderGeometry args={[0.04, 0.04, 1]} />
                        <meshStandardMaterial color="#475569" metalness={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};


const MissionPortal: React.FC<{ 
    position: [number, number, number], 
    color: string, 
    title: string, 
    subtitle: string,
    onTrigger: () => void 
}> = ({ position, color, title, subtitle, onTrigger }) => {
    const portalRef = useRef<THREE.Group>(null);
    const textRef = useRef<any>(null);
    const subtitleRef = useRef<any>(null);
    
    useFrame(({ clock }) => {
        if (portalRef.current) {
            portalRef.current.rotation.y = Math.sin(clock.getElapsedTime()) * 0.05;
        }
        if (textRef.current) {
            textRef.current.position.y = 5 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
        }
        if (subtitleRef.current) {
            subtitleRef.current.position.y = 4.2 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
        }
    });

    return (
        <group ref={portalRef} position={position}>
            {/* Outer Glowing Ring */}
            <mesh>
                <torusGeometry args={[3.5, 0.15, 16, 100]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={8} toneMapped={false} />
            </mesh>
            
            {/* Inner Shimmering Surface */}
            <mesh rotation={[0, 0, 0]}>
                <circleGeometry args={[3.4, 32]} />
                <MeshDistortMaterial
                    color={color}
                    speed={5}
                    distort={0.4}
                    opacity={0.4}
                    transparent
                    metalness={1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Glowing Dust/Particles effect inside portal */}
            <mesh scale={[3.2, 3.2, 1]}>
                <circleGeometry args={[1, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.15} />
            </mesh>

            {/* High-Visibility 3D Floating Labels */}
            <group>
                <Text
                    ref={textRef}
                    position={[0, 5, 0]}
                    fontSize={0.8}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor={color}
                >
                    {title}
                </Text>
                <Text
                    ref={subtitleRef}
                    position={[0, 4.2, 0]}
                    fontSize={0.4}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={4}
                    textAlign="center"
                >
                    {subtitle.toUpperCase()}
                </Text>
            </group>
            
            {/* Proximity Ambient Glow */}
            <pointLight position={[0, 1, 0]} distance={15} intensity={3} color={color} />
        </group>
    );
};
const MovingLights = () => {
    return (
        <group>
            {/* Classroom Lighting */}
            <pointLight position={[0, 20, 0]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-20, 15, -20]} intensity={1} color="#fef3c7" />
            <pointLight position={[20, 15, 20]} intensity={1} color="#ffffff" />
        </group>
    );
};

const PlayIcon = () => (
    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
