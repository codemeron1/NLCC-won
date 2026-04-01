'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Auth3DBackground } from './Auth3DBackground';

interface AuthPageProps {
    onAuthSuccess: (user: any) => void;
    onBack: () => void;
    initialMode?: 'login' | 'signup';
    isSignupEnabled?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack, initialMode = 'login', isSignupEnabled = true }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'admin' | 'teacher'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Mouse Parallax Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const tiltX = useTransform(mouseY, [-500, 500], [5, -5]);
    const tiltY = useTransform(mouseX, [-500, 500], [-5, 5]);
    
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    React.useEffect(() => {
        if (mode === 'signup' && !isSignupEnabled) {
            setMode('login');
            setError('Paumanhin! Temporarily closed for registration.');
        }
    }, [mode, isSignupEnabled]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const body: any = {
                action: mode === 'signup' ? 'signup' : 'login',
                email,
                password,
                requestedMode: mode,
            };

            if (mode === 'signup') {
                const [first, ...rest] = name.trim().split(' ');
                body.firstName = first || 'User';
                body.lastName = rest.join(' ') || 'Name';
            }

            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                onAuthSuccess(data.user || (mode === 'admin'));
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="min-h-screen relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-slate-950 selection:bg-brand-purple"
        >
            {/* 3D Three.js Cursor Background */}
            <Auth3DBackground />

            <motion.button
                onClick={onBack}
                whileHover={{ x: -10 }}
                className="fixed top-3 left-3 md:top-12 md:left-12 z-50 bg-white/10 backdrop-blur-xl px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-2xl font-black text-white hover:text-brand-purple transition-all border border-white/20 shadow-2xl text-[9px] md:text-base"
            >
                ← Return to Launchpad
            </motion.button>

            <motion.main 
                style={{ rotateX: tiltX, rotateY: tiltY, perspective: 1000 }}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-xl z-20"
            >
                <div className="bg-white/10 backdrop-blur-3xl rounded-[2rem] md:rounded-[4rem] p-5 md:p-16 shadow-[0_50px_100px_rgb(0,0,0,0.5)] border border-white/20 flex flex-col md:flex-row gap-6 md:gap-12 relative overflow-hidden group">
                    {/* Glowing Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    {/* Left Brand Side */}
                    <div className="hidden md:flex flex-col justify-between w-1/4 py-4 border-r border-white/10 pr-8" aria-hidden="true">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl backdrop-blur-md flex items-center justify-center p-3 shadow-inner border border-white/5">
                            <Image src="/logo/logo.png" alt="NLLC Logo" width={64} height={64} className="rounded-xl" />
                        </div>
                        <div className="space-y-4">
                            <motion.div animate={{ width: ['20%', '80%', '20%'] }} transition={{ duration: 5, repeat: Infinity }} className="h-0.5 bg-brand-sky/30 rounded-full" />
                            <div className="w-full h-px bg-white/5" />
                        </div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] leading-relaxed">
                            NLLC<br/>Secure<br/>Login
                        </div>
                    </div>

                    <div className="flex-1">
                        <header className="mb-5 md:mb-10 text-left">
                            <div className="text-brand-purple text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase mb-1 md:mb-2 opacity-80">Security Protocol</div>
                            <h1 className="text-2xl md:text-5xl font-black text-white tracking-widest uppercase leading-tight md:leading-none mb-2 md:mb-4">
                                {mode === 'admin' ? 'Admin Login' : mode === 'teacher' ? 'Teacher Login' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="text-xs md:text-base text-white/60 font-bold tracking-tight">
                                {mode === 'login' ? "Log in to join the adventure." : "Enter your details to start."}
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {error && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <p className="text-red-400 font-bold text-xs text-center">{error}</p>
                                </motion.div>
                            )}
                            
                            {mode === 'signup' && (
                                <div className="flex flex-col gap-2">
                                    <input
                                        id="student-name"
                                        type="text"
                                        placeholder="Full Name (e.g. Juan dela Cruz)"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 md:px-6 md:py-5 rounded-xl md:rounded-[2rem] bg-white/5 border border-white/10 focus:border-brand-purple focus:bg-white/10 outline-none font-bold text-white transition-all text-sm md:text-lg placeholder:text-white/20"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <input
                                    id="identifier"
                                    type="text"
                                    placeholder={mode === 'admin' || mode === 'teacher' ? "staff@nllc.edu" : "Email or 12-digit LRN"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 md:px-6 md:py-5 rounded-xl md:rounded-[2rem] bg-white/5 border border-white/10 focus:border-brand-purple focus:bg-white/10 outline-none font-bold text-white transition-all text-sm md:text-lg shadow-inner placeholder:text-white/20"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 md:px-6 md:py-5 rounded-xl md:rounded-[2rem] bg-white/5 border border-white/10 focus:border-brand-purple focus:bg-white/10 outline-none font-bold text-white transition-all text-sm md:text-lg shadow-inner placeholder:text-white/20"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    relative mt-2 md:mt-4 py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-[9px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all overflow-hidden
                                    ${mode === 'admin' ? 'bg-slate-500 text-white' : 'bg-brand-purple text-white shadow-glow-purple'}
                                    hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50
                                `}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                                    {isLoading ? 'Verifying...' : (mode === 'admin' ? 'Override Root' : mode === 'teacher' ? 'Instructor Portal' : mode === 'login' ? 'Authorize' : 'Initialize')}
                                </div>
                            </button>
                        </form>

                        <div className="mt-12 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-x-10 gap-y-4">
                            {mode !== 'admin' && (
                                <button type="button" onClick={() => setMode('admin')} className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-brand-purple transition-all">
                                    Admin Access
                                </button>
                            )}
                            {mode !== 'teacher' && (
                                <button type="button" onClick={() => setMode('teacher')} className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-brand-purple transition-all">
                                    Instructor Portal
                                </button>
                            )}
                            {(mode === 'admin' || mode === 'teacher' || mode === 'signup') && (
                                <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-black text-brand-purple uppercase tracking-[0.2em] hover:scale-105 transition-transform">
                                    Return to Authentication
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </motion.main>

            <style jsx>{`
                .shadow-glow-purple { box-shadow: 0 0 30px rgba(139,92,246,0.3); }
                .drop-shadow-glow-sky { filter: drop-shadow(0 0 20px rgba(56,189,248,0.5)); }
            `}</style>
        </div>
    );
};
