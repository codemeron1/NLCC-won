'use client';

import React from 'react';
import Image from 'next/image';

interface ProfilePageProps {
    onBack: () => void;
    onLogout: () => void;
    onSettings?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onLogout, onSettings }) => {
    return (
        <div className="fixed inset-0 bg-slate-50 bg-pattern z-[70] flex flex-col p-8 overflow-auto animate-in fade-in duration-500 selection:bg-brand-purple">
            <main className="w-full max-w-5xl mx-auto flex flex-col gap-8">
                {/* Header/Back Button */}
                <header className="flex justify-between items-center mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <span>←</span> Back to Home
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onSettings}
                            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                        >
                            ⚙️
                        </button>
                    </div>
                </header>

                {/* Profile Info Card */}
                <section className="card-premium flex flex-col md:flex-row items-center gap-8 md:p-12">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-brand-purple-light flex items-center justify-center text-6xl border-4 border-white shadow-xl">
                            👤
                        </div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                            ✓
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Juan dela Cruz</h1>
                        <p className="text-slate-500 font-bold mb-6">juan.dc@example.com</p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Rank</span>
                                <span className="text-sm font-black text-brand-purple">Legend</span>
                            </div>
                            <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Joined</span>
                                <span className="text-sm font-black text-slate-700">March 2024</span>
                            </div>
                            <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Enrollment</span>
                                 <span className="text-sm font-black text-emerald-500">Kinder 1</span>
                             </div>
                         </div>
                     </div>
                 </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                    {/* Main Content Column */}
                    <div className="md:col-span-2 flex flex-col gap-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Stars</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="text-2xl font-black text-slate-800">1,240</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Day Streak</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🔥</span>
                                    <span className="text-2xl font-black text-slate-800">7 Days</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Lessons</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📚</span>
                                    <span className="text-2xl font-black text-slate-800">12</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Experience</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💎</span>
                                    <span className="text-2xl font-black text-slate-800">850 XP</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity (Replacing Achievements) */}
                        <section className="card-premium !p-8">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Latest Progress</h3>
                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                Keep learning to see your detailed progress here!
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="flex flex-col gap-8">
                        {/* Friends Activity */}
                        <section className="bg-slate-900 rounded-[2rem] p-8 text-white">
                            <h3 className="text-xl font-black tracking-tight mb-6">Friends Activity</h3>
                            <div className="flex flex-col gap-6">
                                {[
                                    { name: 'Maria', action: 'Finished "Mga Pantig"', time: '2h ago', icon: '👧' },
                                    { name: 'Pedro', action: 'Earned 100 Stars', time: '5h ago', icon: '👦' },
                                    { name: 'Liza', action: 'New 3-Day Streak', time: '1d ago', icon: '👩' },
                                ].map((friend, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                                            {friend.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white/90 leading-tight">
                                                {friend.name} <span className="text-white/50 font-bold">{friend.action}</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">{friend.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Account Options */}
                        <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Account</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={onSettings}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-between group"
                                >
                                    <span>Edit Profile</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <button
                                    onClick={onSettings}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-between group"
                                >
                                    <span>Language Settings</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bold text-xs flex items-center justify-between group"
                                >
                                    <span>Sign Out</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">🚪</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};
