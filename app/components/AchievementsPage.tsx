'use client';

import React, { useState } from 'react';

interface AchievementsPageProps {
    onBack: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

    const stats = [
        { label: 'Achievements Earned', value: '12/48', icon: '🏆', color: 'text-amber-500' },
        { label: 'Total Stars', value: '1,240', icon: '⭐', color: 'text-brand-purple' },
        { label: 'Completion', value: '25%', icon: '📈', color: 'text-green-500' },
    ];

    const achievementCategories = [
        {
            title: 'Getting Started',
            items: [
                { id: 1, title: 'First Steps', desc: 'Complete your first lesson.', icon: '👶', earned: true, date: 'Mar 1, 2024' },
                { id: 2, title: 'Star Gazer', desc: 'Collect 1,000 stars.', icon: '⭐', earned: true, date: 'Mar 5, 2024' },
                { id: 3, title: 'Talkative', desc: 'Learn 50 words.', icon: '🗣️', earned: true, date: 'Mar 10, 2024' },
                { id: 4, title: 'Bookworm', desc: 'Complete 5 lessons.', icon: '📚', earned: true, date: 'Mar 12, 2024' },
            ],
        },
        {
            title: 'Streaks & Habits',
            items: [
                { id: 5, title: 'Fire Starter', desc: 'Maintain a 7-day learning streak.', icon: '🔥', earned: true, date: 'Mar 8, 2024' },
                { id: 6, title: 'Unstoppable', desc: 'Maintain a 30-day learning streak.', icon: '🌋', earned: false, progress: 7, total: 30 },
                { id: 7, title: 'Night Owl', desc: 'Complete a lesson after 10 PM.', icon: '🦉', earned: false, progress: 0, total: 1 },
                { id: 8, title: 'Early Bird', desc: 'Complete a lesson before 7 AM.', icon: '🌅', earned: false, progress: 0, total: 1 },
            ],
        },
        {
            title: 'Mastery',
            items: [
                { id: 9, title: 'Perfect Pitch', desc: 'Get 100% pronunciation score on 5 lessons.', icon: '🎤', earned: false, progress: 2, total: 5 },
                { id: 10, title: 'Speed Demon', desc: 'Finish a review session in under 60 seconds.', icon: '⚡', earned: false, progress: 0, total: 1 },
                { id: 11, title: 'Polyglot', desc: 'Learn words from 3 different categories.', icon: '🌐', earned: true, date: 'Mar 14, 2024' },
                { id: 12, title: 'Legendary', desc: 'Complete all lessons in the Filipino Alphabet.', icon: '👑', earned: false, progress: 3, total: 5 },
            ],
        },
    ];

    return (
        <div className="fixed inset-0 bg-slate-50 bg-pattern z-[70] flex flex-col p-8 overflow-auto animate-in fade-in duration-500 selection:bg-brand-purple">
            <main className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
                {/* Header/Back Button */}
                <header className="flex justify-between items-center mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <span>←</span> Back to Home
                    </button>
                </header>

                {/* Hero Section */}
                <section className="bg-brand-purple text-white rounded-[2.5rem] p-10 md:p-14 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 pointer-events-none"></div>

                    <div className="relative z-10 flex-1 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-sm">Trophy Room</h1>
                        <p className="text-white/80 font-bold text-sm md:text-base max-w-md">Track your milestones and show off your progress to your friends. Keep learning to unlock more!</p>
                    </div>

                    <div className="relative z-10 shrink-0">
                        <div className="w-40 h-40 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl relative">
                            <span className="text-7xl animate-pulse-subtle">🏆</span>
                            <div className="absolute -bottom-4 bg-white text-brand-purple px-4 py-1.5 rounded-full font-black text-xs shadow-lg">
                                Level 12
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Row */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-brand-purple/30 transition-colors">
                            <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Filters */}
                <div className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
                    {[
                        { id: 'all', label: 'All Achievements' },
                        { id: 'earned', label: 'Earned' },
                        { id: 'locked', label: 'Locked' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as typeof filter)}
                            className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${filter === f.id
                                    ? 'bg-brand-purple text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Achievements List */}
                <div className="flex flex-col gap-12">
                    {achievementCategories.map((category, catIdx) => {
                        const filteredItems = category.items.filter(item => {
                            if (filter === 'earned') return item.earned;
                            if (filter === 'locked') return !item.earned;
                            return true;
                        });

                        if (filteredItems.length === 0) return null;

                        return (
                            <section key={catIdx} className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIdx * 100}ms` }}>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{category.title}</h2>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                                        {category.items.filter(i => i.earned).length} / {category.items.length}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex items-start gap-5 ${item.earned
                                                    ? 'border-brand-purple/20 hover:border-brand-purple/40 shadow-sm hover:shadow-md'
                                                    : 'border-slate-100 hover:border-slate-200 opacity-80 hover:opacity-100 grayscale-[0.2]'
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${item.earned ? 'bg-brand-purple/10' : 'bg-slate-100'
                                                }`}>
                                                {item.earned ? item.icon : '🔒'}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className={`text-lg font-black leading-tight ${item.earned ? 'text-slate-800' : 'text-slate-600'}`}>
                                                        {item.title}
                                                    </h3>
                                                    {item.earned ? (
                                                        <span className="text-[9px] font-black text-brand-purple bg-brand-purple-light px-2 py-1 rounded-md uppercase tracking-widest shrink-0 border border-brand-purple/10">
                                                            {item.date}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest shrink-0 border border-slate-200">
                                                            Locked
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-[90%]">
                                                    {item.desc}
                                                </p>

                                                {/* Progress Bar for Locked Items */}
                                                {!item.earned && item.total && (
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                            <div
                                                                className="h-full bg-slate-400 rounded-full"
                                                                style={{ width: `${(item.progress! / item.total!) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 tracking-widest">
                                                            {item.progress} / {item.total}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Unlocked Sparkle */}
                                            {item.earned && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-sky text-white rounded-full flex items-center justify-center shadow-md animate-float z-10 text-sm border-2 border-white">
                                                    ✨
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};
