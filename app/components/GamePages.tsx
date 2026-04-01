'use client';

import React from 'react';
import { AdaptiveMindGame } from './AdaptiveMindGame';

interface GamePagesProps {
  onBack: () => void;
}

export const GamePages: React.FC<GamePagesProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-[#020617] selection:bg-brand-purple">
      <main className="w-full h-full relative">
        <div className="w-full h-full relative overflow-hidden">
            <AdaptiveMindGame onFinish={onBack} />
        </div>
      </main>
    </div>
  );
};
