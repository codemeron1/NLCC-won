'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LessonScreen } from './components/LessonScreen';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';

import { SettingsPage } from './components/SettingsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { FloatingGameNav } from './components/FloatingGameNav';
import { GamePages } from './components/GamePages';

import { AssignmentsPage } from './components/AssignmentsPage';
import { Student3DBackground } from './components/Student3DBackground';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  id?: string;
  role?: string;
  class_name?: string;
}

export default function Home() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGames, setShowGames] = useState(false);

  const [showAssignments, setShowAssignments] = useState(false);
  const [activeTab, setActiveTab] = useState('adventure');
  const [guideStep, setGuideStep] = useState<number | null>(null);

  const [lessons, setLessons] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isSignupEnabled, setIsSignupEnabled] = useState(true);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  React.useEffect(() => {
    // 1. Restore session from localStorage
    const savedUser = localStorage.getItem('nllc_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
        if (userData.role === 'ADMIN') setIsAdmin(true);
        if (userData.role === 'TEACHER') setIsTeacher(true);
        setView('app');
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('nllc_user');
      }
    }
    setIsSessionLoaded(true);

    const fetchDashboardItems = async () => {
      try {
        let savedUserData: User | null = null;
        if (savedUser) {
          try {
            savedUserData = JSON.parse(savedUser);
          } catch (e) {
            console.error('Failed to parse saved user:', e);
          }
        }
        
        const currentUserId = user?.id || savedUserData?.id;
        const currentClassName = user?.class_name || (user as any)?.className || savedUserData?.class_name || (savedUserData as any)?.className || '';

        const [lessonRes, settingsRes] = await Promise.all([
          fetch(`/api/lessons?className=${encodeURIComponent(currentClassName)}`),
          fetch('/api/admin/settings')
        ]);
        
        let lessonData: any = {};
        if (lessonRes.ok) {
          lessonData = await lessonRes.json();
        } else {
          try {
            const errorText = await lessonRes.text();
            console.error(`Failed to fetch lessons: ${lessonRes.status} ${lessonRes.statusText}`, errorText);
          } catch (e) {
            console.error(`Failed to fetch lessons: ${lessonRes.status}`, lessonRes.statusText);
          }
        }

        let settingsData: any = {};
        if (settingsRes.ok) {
          settingsData = await settingsRes.json();
        } else {
          try {
            const errorText = await settingsRes.text();
            console.error(`Failed to fetch settings: ${settingsRes.status} ${settingsRes.statusText}`, errorText);
          } catch (e) {
            console.error(`Failed to fetch settings: ${settingsRes.status}`, settingsRes.statusText);
          }
        }
        let progressData = [];
        if (currentUserId) {
          try {
            const progressRes = await fetch(`/api/user/lesson-progress?userId=${currentUserId}`);
            if (progressRes.ok) {
              const pData = await progressRes.json();
              progressData = pData.progress || [];
            }
          } catch (err) {
            console.error('Failed to fetch progress:', err);
          }
        }

        if (lessonRes.ok) {
          setLessons(lessonData.lessons || []);
          setUserProgress(progressData);
        }

        if (settingsRes.ok) {
          setIsMaintenance(settingsData.maintenance_mode);
          setIsSignupEnabled(settingsData.signup_enabled !== false);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard items:', err);
      }
    };
    fetchDashboardItems(); // Always check settings on mount

    // Check for new user guide
    const guideCompleted = localStorage.getItem('nllc_onboarding_completed');
    if (!guideCompleted && isLoggedIn && view === 'app') {
        setTimeout(() => setGuideStep(0), 1500);
    }
  }, [user?.id, isLoggedIn, view]);

  if (view === 'landing') {
    return (
      <LandingPage
        onStart={() => {
          if (isLoggedIn) setView('app');
          else {
            setAuthMode('login');
            setView('auth');
          }
        }}
        onLogin={() => {
          setAuthMode('login');
          setView('auth');
        }}
      />
    );
  }

  // Prevent flash content before session restore is checked
  if (!isSessionLoaded) return <div className="min-h-screen bg-slate-100" />;

    if (view === 'auth') {
    if (isMaintenance && !isAdmin) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center bg-pattern">
          <div className="w-32 h-32 bg-brand-purple/20 rounded-full flex items-center justify-center text-6xl animate-pulse mb-8 border-4 border-brand-purple/30">🛠️</div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Kasalukuyang Inaayos 🚧</h1>
          <p className="text-slate-400 font-bold max-w-sm leading-relaxed mb-10">Paumanhin! Ang NLLC ay kasalukuyang sumasailalim sa maintenance para sa mas magandang karanasan. Balik na lang maya-maya!</p>
          <button 
            onClick={() => setView('landing')}
            className="px-8 py-3 bg-brand-purple text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
          >
            Bumalik sa Simula
          </button>
        </div>
      );
    }
    return (
      <AuthPage
        initialMode={authMode}
        isSignupEnabled={isSignupEnabled} 
        onAuthSuccess={(userData) => {
          setIsLoggedIn(true);
          if (userData && typeof userData === 'object') {
            const userObj = userData as { firstName: string; lastName: string; email: string; role?: string; id?: string };
            setUser(userObj);
            localStorage.setItem('nllc_user', JSON.stringify(userObj));
            if (userObj.role === 'ADMIN') setIsAdmin(true);
            if (userObj.role === 'TEACHER') setIsTeacher(true);
          } else if (userData === true) {
            setIsAdmin(true);
            localStorage.setItem('nllc_user', JSON.stringify({ firstName: 'Admin', lastName: 'User', role: 'ADMIN' }));
          }
          setView('app');
        }}
        onBack={() => setView('landing')}
      />
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('nllc_user');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsTeacher(false);
    setUser(null);
    setView('landing');
    setShowDashboard(false);
  };

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} userId={user?.id} />;
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (isTeacher) {
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
  }

  if (activeLesson) {
    return <LessonScreen lessonId={activeLesson} user={user} onBack={() => setActiveLesson(null)} />;
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center selection:bg-brand-purple pb-32 overflow-x-hidden transition-colors duration-500 bg-slate-100 dark:bg-[#020617]">
      {/* 3D Neural Learning Background Layer */}
      <div className="fixed inset-0 z-0">
        <Student3DBackground />
      </div>

      {/* Main UI Layer */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence>
          {!showGames && (
            <motion.header 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[calc(100%-1.5rem)] md:w-full max-w-7xl px-4 md:px-8 py-3 md:py-5 flex justify-between items-center bg-white/5 backdrop-blur-3xl sticky top-4 md:top-6 z-50 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-purple-500/10 border border-white/10 mt-4 md:mt-6 md:mx-8 group transition-all duration-500 hover:bg-white/10"
            >
              <nav className="flex items-center gap-6">
                <div
                  className="flex items-center gap-2 md:gap-4 transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => setView('landing')}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center p-1.5 md:p-2 group-hover:rotate-6 transition-all">
                    <Image src="/logo/logo.png" alt="NLLC Logo" width={40} height={40} className="rounded-lg shadow-sm" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-brand-purple tracking-tighter leading-none">NLLC</h1>
                </div>
              </nav>

              <div className="flex gap-2 md:gap-4 items-center">
                {user?.firstName && (
                  <div className="hidden lg:flex items-center gap-2 bg-brand-purple/5 px-4 py-2 rounded-2xl border border-brand-purple/10">
                    <span className="text-[10px] font-black text-brand-purple/60 uppercase tracking-widest leading-none mr-2">Online</span>
                    <span className="text-xs font-black text-slate-800 tracking-tight">Hi, {user.firstName}! 👋</span>
                  </div>
                )}

                <button
                  onClick={() => setShowDashboard(true)}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-brand-purple text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 font-black text-[9px] md:text-[10px] uppercase tracking-widest"
                >
                  <span className="text-sm md:text-base">📊</span> 
                  <span className="hidden sm:inline">Parent Portal</span>
                  <span className="sm:hidden">Portal</span>
                </button>

                <div className="w-px h-8 bg-slate-200/50 mx-1 md:mx-2 hidden md:block"></div>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center gap-2 md:gap-3 md:pr-3 py-1 md:py-1.5 rounded-xl md:rounded-2xl transition-all hover:bg-white/40 ${showProfileMenu ? 'bg-white/40' : ''}`}
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center text-[10px] md:text-xs text-white font-black shadow-lg">
                        {user?.firstName?.[0] || 'S'}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Logged In</span>
                      <span className="text-xs font-black text-slate-800 truncate max-w-[120px]">{user ? `${user.firstName}` : 'Guest Player'}</span>
                    </div>
                    <span className={`text-[8px] md:text-[10px] transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-4 w-64 bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white p-6 z-[60]"
                        >
                          <div className="px-2 py-4 border-b border-slate-100 mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Access</p>
                            <p className="text-sm font-black text-slate-900 truncate">{user?.email || 'guest@example.com'}</p>
                          </div>
                          <button
                            onClick={() => { setShowSettings(true); setShowProfileMenu(false); }}
                            className="w-full text-left p-4 rounded-3xl text-xs font-black text-slate-600 hover:bg-brand-purple hover:text-white transition-all flex items-center gap-4 mb-2"
                          >
                            <span className="text-lg">⚙️</span> Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left p-4 rounded-3xl text-xs font-black text-red-500 hover:bg-red-50 transition-all flex items-center gap-4"
                          >
                            <span className="text-lg">🚪</span> Log Out
                          </button>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <div className="w-full relative px-8 flex flex-col items-center">
            <AnimatePresence>
                {!showGames && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[60] pb-10 flex justify-center pointer-events-none"
                  >
                    <div className="pointer-events-auto">
                        <FloatingGameNav 
                            activeTab={activeTab} 
                                onTabChange={(id) => {
                                    setActiveTab(id);
                                    setShowSettings(id === 'settings');
                                    setShowGames(id === 'adventure');
                                    setShowAssignments(id === 'assignments');
                                    
                                    if (id === 'assignments' || id === 'lessons') {
                                        setShowGames(false);
                                        setShowSettings(false);
                                        setShowDashboard(false);
                                        setActiveLesson(null);
                                        
                                        if (id === 'assignments') {
                                            // Handled by setShowAssignments above
                                        }
                                    }
                                }} 
                        />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            <main className="w-full max-w-7xl mt-24 mb-32 flex flex-col gap-16">
                {showGames ? (
                    <GamePages onBack={() => { setShowGames(false); setActiveTab('lessons'); }} />
                ) : showSettings ? (
                    <SettingsPage
                        onBack={() => { setShowSettings(false); setActiveTab('lessons'); }}
                        onLogout={handleLogout}
                        user={user}
                    />
                ) : showAssignments ? (
                    <AssignmentsPage 
                        onBack={() => { setShowAssignments(false); setActiveTab('lessons'); }}
                        user={user}
                    />
                ) : (
                    <>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-3 px-2 md:px-0"
                        >
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tightest leading-none drop-shadow-sm">
                                Kumusta, <span className="text-brand-purple">{user?.firstName || 'Kaibigan'}</span>! 👋
                            </h2>
                            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                Welcome to your learning dashboard
                            </p>
                        </motion.div>

                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 px-2 md:px-0">
                            <AnimatePresence mode="popLayout">
                                {lessons.map((lesson, idx) => {
                                    const p = userProgress.find(up => up.lesson_id === lesson.id);
                                    const percent = p ? p.score : 0;
                                    const isCompleted = p ? p.completed : false;

                                    return (
                                        <motion.button
                                            key={lesson.id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setActiveLesson(lesson.id)}
                                            className="group relative h-[300px] md:h-[380px] rounded-[2.5rem] md:rounded-[3.5rem] bg-white/30 backdrop-blur-2xl border border-white/50 p-6 md:p-10 flex flex-col items-start text-left shadow-2xl shadow-purple-900/5 hover:-translate-y-4 hover:bg-white/60 transition-all duration-500 active:scale-95 overflow-hidden"
                                        >
                                            {/* Aura Glow */}
                                            <div className="absolute -top-16 md:-top-20 -right-16 md:-right-20 w-32 md:w-40 h-32 md:h-40 bg-brand-purple/10 rounded-full blur-[60px] md:blur-[80px] group-hover:bg-brand-purple/20 transition-all" />
                                            
                                            <div className="absolute top-6 md:top-8 right-6 md:right-8">
                                                <div className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full shadow-lg ${isCompleted ? 'bg-emerald-400 shadow-emerald-400/50' : percent > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`}></div>
                                            </div>

                                            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-3xl md:text-5xl mb-6 md:mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden border border-slate-50`}>
                                                {lesson.icon && lesson.icon.startsWith('http') ? (
                                                    <img src={lesson.icon} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="drop-shadow-sm">{lesson.icon}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-h-0">
                                                <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none mb-2 md:mb-4 group-hover:text-brand-purple transition-colors truncate w-full">
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-[12px] md:text-sm font-bold text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-3">
                                                    {lesson.description || lesson.desc}
                                                </p>
                                            </div>

                                            <div className="w-full pt-4 md:pt-8 flex flex-col gap-2 md:gap-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                                    <span className="text-lg font-black text-brand-purple">{percent}%</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100/50 rounded-full overflow-hidden border border-white/40">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${percent}%` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-brand-purple rounded-full shadow-glow-purple"
                                                    />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>

                            {lessons.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-32 bg-white/20 backdrop-blur-3xl rounded-[5rem] border border-dashed border-white/40 flex flex-col items-center justify-center text-center px-8"
                                >
                                    <div className="w-28 h-28 bg-white/30 rounded-[2.5rem] flex items-center justify-center text-6xl mb-10 shadow-2xl border border-white">📚</div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight">No Lessons 😅</h3>
                                    <p className="text-xl text-slate-500 font-bold max-w-sm mt-4 leading-relaxed tracking-tight">
                                        Your teacher is currently preparing new lessons. Check back soon!
                                    </p>
                                </motion.div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
      </div>

      <style jsx>{`
        .shadow-glow-purple { box-shadow: 0 0 15px rgba(139,92,246,0.3); }
        .tracking-tightest { letter-spacing: -0.06em; }
      `}</style>
    </div>
  );
}
