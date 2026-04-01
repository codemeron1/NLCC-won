'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'adventure', label: 'Adaptive', icon: '👾', color: 'bg-brand-purple' },
  { id: 'lessons', label: 'Aralin', icon: '📚', color: 'bg-brand-indigo' },
  { id: 'assignments', label: 'Gawain', icon: '📋', color: 'bg-brand-sky' },
  { id: 'settings', label: 'Ayos', icon: '⚙️', color: 'bg-slate-400' },
];

interface FloatingGameNavProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export const FloatingGameNav: React.FC<FloatingGameNavProps> = ({ 
  activeTab: externalActiveTab, 
  onTabChange 
}) => {
  const [activeTab, setActiveTab ] = useState(externalActiveTab || 'adventure');

  React.useEffect(() => {
    if (externalActiveTab) setActiveTab(externalActiveTab);
  }, [externalActiveTab]);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onTabChange) onTabChange(id);
  };

  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-2 md:px-4 pointer-events-none">
      <nav className="glass rounded-3xl md:rounded-[2.5rem] p-1.5 md:p-3 flex items-center justify-between shadow-2xl border-white/20 pointer-events-auto relative overflow-hidden">
        <div className="flex-1 flex items-center justify-between relative">
          {/* Active Background Pill */}
          <AnimatePresence mode="wait">
            <motion.div
              layoutId="active-pill"
              className="absolute h-10 md:h-14 bg-brand-purple/10 rounded-2xl md:rounded-[2rem] border border-brand-purple/20 shadow-inner"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                width: `${100 / NAV_ITEMS.length}%`,
                left: `${(NAV_ITEMS.indexOf(NAV_ITEMS.find(i => i.id === activeTab)!) * (100 / NAV_ITEMS.length))}%`
              }}
            />
          </AnimatePresence>

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 group transition-all"
                aria-label={item.label}
              >
                <div className={`relative transition-transform duration-300 group-hover:scale-125 ${isActive ? 'scale-110 -translate-y-0.5 md:-translate-y-1' : 'opacity-70 group-hover:opacity-100'}`}>
                  <span className="text-xl sm:text-2xl md:text-3xl filter drop-shadow-md inline-block">{item.icon}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-dot" 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${isActive ? 'text-brand-purple scale-100 translate-y-0' : 'text-slate-400 scale-90 opacity-0 translate-y-2'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
