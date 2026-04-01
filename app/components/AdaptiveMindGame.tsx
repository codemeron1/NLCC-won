'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { ForestGameMenu } from './ForestGameMenu';
import { LoadingScreen } from './LoadingScreen';
import { MissionOneBackground } from './MissionOneBackground';
import { MissionTwoBackground } from './MissionTwoBackground';
import { MissionThreeBackground } from './MissionThreeBackground';
import { QuestionBoard3D } from './QuestionBoard3D';

interface Question {
  id: number;
  word: string;
  translation: string;
  options: string[];
  correct: string;
  image: string;
  scenario?: string; // Scenario for conversation
  blanked?: string;  // Blanked version for display
  syllables?: string[]; // For syllable game (Level 3)
}

const QUESTIONS: Question[] = [
  { id: 1, word: 'AKO', translation: 'Me / I', options: ['Ikaw', 'Ako', 'Sila', 'Kami'], correct: 'Ako', image: '👤' },
  { id: 2, word: 'PANGALAN', translation: 'Name', options: ['Edad', 'Pangalan', 'Tirahan', 'Guro'], correct: 'Pangalan', image: '🆔' },
  { id: 3, word: 'EDAD', translation: 'Age', options: ['Taon', 'Edad', 'Buwan', 'Araw'], correct: 'Edad', image: '🎂' },
  { id: 4, word: 'LALAKI', translation: 'Boy / Male', options: ['Babae', 'Bata', 'Lalaki', 'Matanda'], correct: 'Lalaki', image: '👦' },
  { id: 5, word: 'BABAE', translation: 'Girl / Female', options: ['Lalaki', 'Babae', 'Sanggol', 'Ina'], correct: 'Babae', image: '👧' },
  { id: 6, word: 'TAON', translation: 'Years (Age)', options: ['Araw', 'Taon', 'Oras', 'Linggo'], correct: 'Taon', image: '📅' },
  { id: 7, word: 'TIRAHAN', translation: 'Home / Address', options: ['Paaralan', 'Tirahan', 'Bukid', 'Dagat'], correct: 'Tirahan', image: '🏠' },
  { id: 8, word: 'MAG-AARAL', translation: 'Student', options: ['Guro', 'Doktor', 'Mag-aaral', 'Pulis'], correct: 'Mag-aaral', image: '🎒' },
  { id: 9, word: 'PILIPINO', translation: 'Filipino', options: ['Amerikano', 'Hapon', 'Pilipino', 'Intsik'], correct: 'Pilipino', image: '🇵🇭' },
  { id: 10, word: 'MASAYA', translation: 'Happy', options: ['Malungkot', 'Galit', 'Masaya', 'Takot'], correct: 'Masaya', image: '😊' },
];

const QUESTIONS_BODY_PARTS: Question[] = [
  { id: 1, word: 'MATA', translation: 'Eyes', options: ['Mata', 'Ilong', 'Tainga', 'Bibig'], correct: 'Mata', image: '👁️' },
  { id: 2, word: 'ILONG', translation: 'Nose', options: ['Mata', 'Ilong', 'Kamay', 'Paa'], correct: 'Ilong', image: '👃' },
  { id: 3, word: 'TAINGA', translation: 'Ears', options: ['Ulo', 'Bibig', 'Tainga', 'Buhok'], correct: 'Tainga', image: '👂' },
  { id: 4, word: 'BIBIG', translation: 'Mouth', options: ['Bibig', 'Ngipin', 'Dila', 'Leeg'], correct: 'Bibig', image: '👄' },
  { id: 5, word: 'KAMAY', translation: 'Hands', options: ['Paa', 'Daliri', 'Kamay', 'Braso'], correct: 'Kamay', image: '✋' },
  { id: 6, word: 'PAA', translation: 'Feet', options: ['Tuhod', 'Binti', 'Kamay', 'Paa'], correct: 'Paa', image: '🦶' },
  { id: 7, word: 'BUHOK', translation: 'Hair', options: ['Ulo', 'Mukha', 'Buhok', 'Kilay'], correct: 'Buhok', image: '💇' },
  { id: 8, word: 'NGIPIN', translation: 'Teeth', options: ['Dila', 'Bibig', 'Ngipin', 'Labi'], correct: 'Ngipin', image: '🦷' },
  { id: 9, word: 'TIYAN', translation: 'Stomach', options: ['Puso', 'Tiyan', 'Likod', 'Balikat'], correct: 'Tiyan', image: '🤰' },
  { id: 10, word: 'TUHOD', translation: 'Knee', options: ['Siko', 'Tuhod', 'Gong', 'Puso'], correct: 'Tuhod', image: '🦵' },
];

const QUESTIONS_SHAPES: Question[] = [
  { id: 1, word: 'BILOG', translation: 'Circle', options: ['Parisukat', 'Bilog', 'Tatsulok', 'Parihaba'], correct: 'Bilog', image: '⭕' },
  { id: 2, word: 'PARISUKAT', translation: 'Square', options: ['Bilog', 'Tatsulok', 'Parisukat', 'Diyamante'], correct: 'Parisukat', image: '⬛' },
  { id: 3, word: 'TATSULOK', translation: 'Triangle', options: ['Parihaba', 'Tatsulok', 'Habilog', 'Bilog'], correct: 'Tatsulok', image: '🔺' },
  { id: 4, word: 'PARIHABA', translation: 'Rectangle', options: ['Parisukat', 'Bituin', 'Parihaba', 'Krus'], correct: 'Parihaba', image: '▭' },
  { id: 5, word: 'DIYAMANTE', translation: 'Diamond', options: ['Tatsulok', 'Diyamante', 'Puso', 'Bilog'], correct: 'Diyamante', image: '💎' },
  { id: 6, word: 'HABILOG', translation: 'Oval', options: ['Bilog', 'Habilog', 'Eklipse', 'Bola'], correct: 'Habilog', image: '🥚' },
  { id: 7, word: 'HUGIS-PUSO', translation: 'Heart-shaped', options: ['Puso', 'Hugis-puso', 'Bituin', 'Bilog'], correct: 'Hugis-puso', image: '❤️' },
  { id: 8, word: 'HUGIS-BITUIN', translation: 'Star-shaped', options: ['Bituin', 'Hugis-bituin', 'Araw', 'Buwan'], correct: 'Hugis-bituin', image: '⭐' },
  { id: 9, word: 'KRUS', translation: 'Cross', options: ['Krus', 'X', 'Plus', 'Kuwadrado'], correct: 'Krus', image: '➕' },
  { id: 10, word: 'PENTAGON', translation: 'Pentagon', options: ['Heksagon', 'Pentagon', 'Oktagon', 'Tatsulok'], correct: 'Pentagon', image: '⬠' },
];

const QUESTIONS_LEVEL_2: Question[] = [
  { 
    id: 1, 
    word: 'OPO', 
    translation: 'Yes (Polite)', 
    options: ['Oo', 'Opo', 'Hindi', 'Ewan'], 
    correct: 'Opo', 
    image: '🏫',
    scenario: "Guro: Naintindihan mo ba ang ating aralin ngayon?",
    blanked: "Guro: Naintindihan mo ba ang ating aralin? \n\nBatang Magalang: _________, Guro." 
  },
  { 
    id: 2, 
    word: 'HINDI PO', 
    translation: 'No (Polite)', 
    options: ['Hindi', 'Ayoko', 'Hindi po', 'Wala'], 
    correct: 'Hindi po', 
    image: '👵',
    scenario: "Lola: Gusto mo pa ba ng cake, apo?",
    blanked: "Lola: Gusto mo pa ba ng cake? \n\nBatang Magalang: _________, busog na po ako." 
  },
  { 
    id: 3, 
    word: 'MANO PO', 
    translation: 'Blessing', 
    options: ['Mano po', 'Mano', 'Hi', 'Salamat'], 
    correct: 'Mano po', 
    image: '👵',
    scenario: "Pagdating sa bahay ng lola:",
    blanked: "Bata: ________, Lola. Kumusta po kayo?" 
  },
  { 
    id: 4, 
    word: 'SALAMAT PO', 
    translation: 'Thank you (Polite)', 
    options: ['Salamat', 'Walang anuman', 'Ok po', 'Salamat po'], 
    correct: 'Salamat po', 
    image: '🎁',
    scenario: "Binigyan ka ng regalo ng tito mo:",
    blanked: "Tito: Heto ang regalo ko sa iyo. \n\nBata: ________, Tito!" 
  },
  { 
    id: 5, 
    word: 'MAGANDANG UMAGA PO', 
    translation: 'Good Morning (Polite)', 
    options: ['Magandang Umaga', 'Hello po', 'Magandang Umaga po', 'Tuloy po kayo'], 
    correct: 'Magandang Umaga po', 
    image: '☀️',
    scenario: "Nakasalubong mo ang iyong guro sa umaga:",
    blanked: "Bata: ________, Teacher! Ready na po ako." 
  },
  { 
    id: 6, 
    word: 'MAWALANG-GALANG NA PO', 
    translation: 'Excuse me (Polite)', 
    options: ['Excuse me', 'Mawalang-galang na po', 'Tabi po', 'Daan po'], 
    correct: 'Mawalang-galang na po', 
    image: '🚶',
    scenario: "Dadaan ka sa gitna ng dalawang nag-uusap:",
    blanked: "Bata: ________, dadaan lang po ako." 
  },
  { 
    id: 7, 
    word: 'TULOY PO KAYO', 
    translation: 'Please come in (Polite)', 
    options: ['Dito na kayo', 'Pasok po', 'Tuloy po kayo', 'Tara na'], 
    correct: 'Tuloy po kayo', 
    image: '🏠',
    scenario: "May bisitang dumating sa inyong bahay:",
    blanked: "Bata: Magandang hapon! ________, pasok po kayo." 
  },
  { 
    id: 8, 
    word: 'SINO PO SILA?', 
    translation: 'Who is it? (Polite)', 
    options: ['Sino kayo?', 'Sino po sila?', 'Ano po yan?', 'Sino sila?'], 
    correct: 'Sino po sila?', 
    image: '🚪',
    scenario: "May kumakatok sa pintuan:",
    blanked: "Bata: (Sa likod ng pinto) ________, Lola na ba yan?" 
  },
];

const QUESTIONS_LEVEL_3: Question[] = [
  { id: 1, word: 'TATAY', translation: 'Father', options: [], correct: 'TATAY', syllables: ['TA', 'TAY'], image: '👨' },
  { id: 2, word: 'NANAY', translation: 'Mother', options: [], correct: 'NANAY', syllables: ['NA', 'NAY'], image: '👩' },
  { id: 3, word: 'KUYA', translation: 'Big Brother', options: [], correct: 'KUYA', syllables: ['KU', 'YA'], image: '👦' },
  { id: 4, word: 'ATE', translation: 'Big Sister', options: [], correct: 'ATE', syllables: ['A', 'TE'], image: '👧' },
  { id: 5, word: 'BUNSO', translation: 'Youngest Child', options: [], correct: 'BUNSO', syllables: ['BUN', 'SO'], image: '👶' },
  { id: 6, word: 'LOLO', translation: 'Grandfather', options: [], correct: 'LOLO', syllables: ['LO', 'LO'], image: '👴' },
  { id: 7, word: 'LOLA', translation: 'Grandmother', options: [], correct: 'LOLA', syllables: ['LO', 'LA'], image: '👵' },
  { id: 8, word: 'PAMILYA', translation: 'Family', options: [], correct: 'PAMILYA', syllables: ['PA', 'MIL', 'YA'], image: '👨‍👩‍👧‍👦' },
];

interface AdaptiveMindGameProps {
  onFinish: () => void;
}

export const AdaptiveMindGame: React.FC<AdaptiveMindGameProps> = ({ onFinish }) => {
  const [gameState, setGameState] = useState<'menu' | 'missionMenu' | 'loading' | 'playing' | 'gameover' | 'finished'>('menu');
  const [currentStep, setCurrentStep] = useState(0);
  const [lives, setLives] = useState(3);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);
  const [shake, setShake] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'levels' | 'adventure'>('main');
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [selectedProgram, setSelectedProgram] = useState<'intro' | 'body' | 'shapes' | null>(null);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  
  // Audio Refs
  const [isMuted, setIsMuted] = useState(false);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  
  const currentQuestions = selectedLevel === 1 
    ? (selectedProgram === 'body' ? QUESTIONS_BODY_PARTS : (selectedProgram === 'shapes' ? QUESTIONS_SHAPES : QUESTIONS)) 
    : (selectedLevel === 2 ? QUESTIONS_LEVEL_2 : QUESTIONS_LEVEL_3);
  const currentQuestion = currentQuestions[currentStep];
  const isGameFinished = gameState === 'finished';

  useEffect(() => {
    if (gameState === 'playing' && selectedLevel === 3 && currentQuestion.syllables) {
        setShuffledSyllables([...currentQuestion.syllables].map((s, i) => ({ s, i })).sort(() => Math.random() - 0.5).map(x => x.s));
        setSelectedSyllables([]);
        setSelectedIndices([]);
    }
  }, [currentStep, gameState, selectedLevel, currentQuestion]);

  useEffect(() => {
    // Initialize background music
    if (!bgMusic.current) {
        bgMusic.current = new Audio('/audio/bg_music.mp3');
        bgMusic.current.loop = true;
        bgMusic.current.volume = 0.3;
    }

        if (gameState === 'playing' || gameState === 'loading') {
            if (!isMuted) {
                // bgMusic.current.play().catch(err => console.log("Audio play blocked:", err));
            }
        } else if (gameState === 'menu' || gameState === 'finished' || gameState === 'gameover') {
            bgMusic.current.pause();
        }

    return () => {
        if (bgMusic.current) {
            bgMusic.current.pause();
        }
    };
  }, [gameState, isMuted]);

  const toggleMute = () => {
    if (bgMusic.current) {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        if (newMuted) {
            bgMusic.current.pause();
        } else {
            // bgMusic.current.play().catch(() => {});
        }
    }
  };

  const playSound = (type: 'win' | 'correct' | 'wrong' | 'click' | 'hover' | 'whoosh') => {
    const audios = {
        win: '/audio/win.mp3',
        correct: '/audio/correct.mp3',
        wrong: '/audio/wrong.mp3',
        click: '/audio/click.mp3',
        hover: '/audio/hover.mp3',
        whoosh: '/audio/whoosh.mp3'
    };
    const audio = new Audio(audios[type]);
    audio.volume = type === 'hover' ? 0.2 : 0.5;
    // audio.play().catch(err => console.error(`Audio Playback Error for ${type}:`, err));
  };

  const handleStartGame = (level: number = 1) => {
    playSound('click');
    setSelectedLevel(level as 1 | 2 | 3);
    setGameState('missionMenu');
  };

  const startLoading = (program: 'intro' | 'body' | 'shapes' | null = null) => {
    if (program) setSelectedProgram(program);
    setGameState('loading');
    setCurrentStep(0);
    setStars(0);
    setLives(3);
    setFeedback(null);
    setSelectedSyllables([]);
    setSelectedIndices([]);

    // Simulate 3D Environment initialization
    setTimeout(() => {
        setGameState('playing');
    }, 2800);
  };

  const handleOptionClick = (option: string) => {
    if (feedback !== null || gameState !== 'playing') return;

    if (option === currentQuestion.correct) {
      setFeedback('correct');
      setStars(s => s + 20);
      playSound('correct');
      
      setTimeout(() => {
        if (currentStep < currentQuestions.length - 1) {
          setCurrentStep(s => s + 1);
          setFeedback(null);
          playSound('whoosh');
        } else {
          setGameState('finished');
          playSound('win');
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setShake(true);
      playSound('wrong');
      setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) setTimeout(() => setGameState('gameover'), 500);
          return newLives;
      });
      setTimeout(() => { setShake(false); setFeedback(null); }, 1500);
    }
  };
  
  const handleSyllableClick = (syllable: string, index: number) => {
    if (feedback !== null || gameState !== 'playing' || selectedIndices.includes(index)) return;
    playSound('click');
    const newSelected = [...selectedSyllables, syllable];
    const newIndices = [...selectedIndices, index];
    setSelectedSyllables(newSelected);
    setSelectedIndices(newIndices);
    
    if (newSelected.length === currentQuestion.syllables?.length) {
        if (newSelected.join('') === currentQuestion.word) {
            setFeedback('correct');
            setStars(s => s + 25);
            playSound('correct');
            setTimeout(() => {
                if (currentStep < currentQuestions.length - 1) {
                    setCurrentStep(s => s + 1);
                    setFeedback(null);
                    playSound('whoosh');
                } else {
                    setGameState('finished');
                    playSound('win');
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                }
            }, 1500);
        } else {
            setFeedback('wrong');
            setShake(true);
            playSound('wrong');
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) setTimeout(() => setGameState('gameover'), 500);
                return newLives;
            });
            setTimeout(() => { setShake(false); setFeedback(null); setSelectedSyllables([]); setSelectedIndices([]); }, 1500);
        }
    }
  };

  const handleContinue = () => {
    // Progress through programs within Level 1
    if (selectedLevel === 1) {
        if (selectedProgram === 'intro') {
            startLoading('body');
            return;
        } else if (selectedProgram === 'body') {
            startLoading('shapes');
            return;
        }
    }
    
    // If we've finished all programs in Level 1 or we're on Level 2/3
    if (selectedLevel < 3) {
      handleStartGame((selectedLevel + 1) as 1 | 2 | 3);
    } else {
      onFinish();
    }
  };

  if (gameState === 'menu') {
    return <ForestGameMenu onStart={(level) => handleStartGame(level as 1 | 2 | 3)} onExit={onFinish} initialView={menuView} />;
  }

  if (gameState === 'missionMenu') {
    const missionData = selectedLevel === 1 ? [
        { id: 'match', name: 'Pagpapakilala sa Sarili', desc: 'Identify introductory Tagalog phrases', icon: '👤', active: true, program: 'intro' as const },
        { id: 'body', name: 'Mga Bahagi ng Katawan', desc: 'Master anatomy vocabulary in Tagalog', icon: '🏃', active: true, program: 'body' as const },
        { id: 'shapes', name: 'Mga Hugis', desc: 'Identify geometric shapes in Tagalog', icon: '⬟', active: true, program: 'shapes' as const },
    ] : selectedLevel === 2 ? [
        { id: 'polite', name: 'Batang Magalang', desc: 'Po, Opo, and Polite Phrases', icon: '🙏', active: true, program: 'intro' as const },
        { id: 'greetings', name: 'Mga Pagbati', desc: 'Tagalog Greetings and Salutations', icon: '🌅', active: true, program: 'body' as const },
        { id: 'customs', name: 'Kaugalian', desc: 'Filipino Customs and Mano Po', icon: '🇵🇭', active: true, program: 'shapes' as const },
    ] : [
        { id: 'pamilya', name: 'Aking Pamilya', desc: 'Identify key family members in Tagalog', icon: '👨‍👩‍👧‍👦', active: true, program: 'intro' as const },
        { id: 'pantig', name: 'Pantig-Patnubay', desc: 'Practice Tagalog syllable structure', icon: '🔡', active: true, program: 'body' as const },
        { id: 'bahay', name: 'Ating Tahanan', desc: 'Vocabulary for items within the home', icon: '🏠', active: true, program: 'shapes' as const },
    ];

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent)] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full relative z-10"
            >
                <div className="flex flex-col items-center mb-3 md:mb-12">
                    <span className="text-brand-sky text-[6px] md:text-sm font-black tracking-[0.2em] md:tracking-[0.5em] uppercase mb-0.5 md:mb-4 opacity-70">Mission 0{selectedLevel} Sector</span>
                    <h2 className="text-lg md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-glow-sky text-center">Select Program</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 md:gap-8 max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-visible px-1 custom-scrollbar">
                    {missionData.map((game) => (
                        <motion.button
                            key={game.id}
                            whileHover={game.active ? { scale: 1.02, y: -5 } : {}}
                            whileTap={game.active ? { scale: 0.98 } : {}}
                            onClick={() => game.active && startLoading(game.program)}
                            className={`
                                relative p-3 md:p-8 rounded-xl md:rounded-[2.5rem] border-2 text-left transition-all duration-500 overflow-hidden group
                                ${game.active ? 'bg-white/5 border-white/10 hover:border-brand-sky/50 cursor-pointer' : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'}
                            `}
                        >
                            {game.active && <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                            
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6 relative z-10 text-center md:text-left">
                                <div className="text-xl md:text-6xl filter drop-shadow-lg">{game.icon}</div>
                                <div>
                                    <h3 className="text-[9px] md:text-2xl font-black text-white mb-0.5 md:mb-2 uppercase tracking-wide leading-tight">{game.name}</h3>
                                    <p className="text-white/40 text-[7px] md:text-sm font-medium leading-tight hidden md:block">{game.desc}</p>
                                </div>
                            </div>

                            {game.active ? (
                                <div className="mt-2 md:mt-8 flex items-center justify-center md:justify-end">
                                    <span className="text-[6px] md:text-[10px] font-black text-brand-sky tracking-widest uppercase py-1 md:py-2 px-1.5 md:px-4 bg-brand-sky/10 rounded-full border border-brand-sky/20">Init →</span>
                                </div>
                            ) : (
                                <div className="mt-2 md:mt-8 flex items-center justify-center md:justify-end">
                                    <span className="text-[6px] md:text-[10px] font-black text-white/20 tracking-widest uppercase">Locked</span>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="mt-4 md:mt-12 flex justify-center">
                    <button 
                        onClick={() => {
                            setMenuView('adventure');
                            setGameState('menu');
                        }}
                        className="px-3 md:px-8 py-1.5 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/50 hover:text-white font-black uppercase text-[6px] md:text-[10px] tracking-widest transition-all"
                    >← Return to Studio</button>
                </div>
            </motion.div>
        </div>
    );
  }

  if (gameState === 'loading') {
    return (
        <LoadingScreen 
            message={
                selectedLevel === 1 ? "Syncing Language Pack..." : 
                selectedLevel === 2 ? "Calibrating Social Protocol..." : 
                "Building Family Tree..."
            }
        />
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center p-8 text-center overscroll-none touch-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex flex-col items-center bg-white/5 backdrop-blur-3xl p-16 rounded-[4rem] border-2 border-brand-coral/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative z-10"
          >
             <div className="text-6xl md:text-9xl mb-4 md:mb-8 drop-shadow-[0_0_30px_rgba(255,107,107,0.4)] animate-bounce">💔</div>
             <h2 className="text-4xl md:text-7xl font-black text-white tracking-widest leading-none mb-8 md:mb-12 uppercase drop-shadow-glow-coral">Game Over</h2>
             
             <div className="flex flex-col gap-4 w-full max-w-sm px-4">
                 <button 
                    onClick={() => handleStartGame(selectedLevel)}
                    className="w-full py-6 bg-brand-coral rounded-3xl text-2xl font-black text-white shadow-[0_15px_40px_rgba(255,107,107,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                 >Play Again</button>
                 
                 <button 
                    onClick={() => {
                        setMenuView('levels');
                        setGameState('menu');
                    }}
                    className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-3xl text-sm font-black text-white border border-white/10 transition-all uppercase tracking-widest"
                 >Back to Menu</button>
             </div>
          </motion.div>
          <div className="absolute inset-0 bg-brand-coral opacity-5 blur-[120px] rounded-full pointer-events-none" />
      </div>
    );
  }

  return (
    <main className="fixed inset-0 z-[10000] overflow-hidden bg-slate-950 selection:bg-brand-purple perspective-2000 font-sans overscroll-none touch-none">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform-style-3d overflow-hidden">
         
         {/* Moving World Backdrop or 3D Animated Background */}
         {selectedLevel === 1 ? (
            <MissionOneBackground />
          ) : selectedLevel === 2 ? (
             <MissionTwoBackground />
          ) : selectedLevel === 3 ? (
             <MissionThreeBackground />
          ) : (
             <motion.div 
                className="absolute inset-0 bg-cover bg-center h-[110%] w-[110%]"
                style={{ 
                  backgroundImage: 'url("/world_3d.png")',
                  transform: 'translateZ(-600px)' 
                }}
                animate={{ backgroundPositionX: `${-currentStep * 4}%`, x: "-5%", y: "-5%" }}
             />
          )}

          {/* Centered Question Board (3D Three.js Animation) */}
          <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
            <AnimatePresence mode="wait">
                {!isGameFinished && (
                    <motion.div 
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.3 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none"
                    >
                        <QuestionBoard3D 
                            level={selectedLevel}
                            word={currentQuestion.word}
                            translation={currentQuestion.translation}
                            image={currentQuestion.image}
                            scenario={currentQuestion.scenario}
                            blanked={currentQuestion.blanked}
                            selectedSyllables={selectedSyllables}
                            progress={currentStep / currentQuestions.length}
                            feedback={feedback}
                            shake={shake}
                            correctWord={currentQuestion.correct}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
       </div>

      {/* GUI Layer (Compact HUD) */}
      <div className="fixed inset-0 z-[100] flex flex-col pointer-events-none p-3 md:p-8 text-center items-center">
         
         {/* HUD Top Bar */}
         <div className="flex justify-between items-start pointer-events-auto w-full max-w-7xl mx-auto">
            {/* Stats Block */}
            <div className="flex flex-col gap-2 md:gap-3">
               <div className="bg-slate-900/80 backdrop-blur-xl px-3 md:px-8 py-1.5 md:py-4 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-xl flex items-center gap-3 md:gap-6">
                  <div className="flex flex-col">
                      <span className="text-white/40 text-[7px] md:text-[10px] font-black tracking-widest uppercase leading-tight">XP</span>
                      <span className="text-amber-400 text-lg md:text-4xl font-black tracking-tighter drop-shadow-glow-amber leading-none">{stars}</span>
                  </div>
                  <div className="h-6 md:h-10 w-px bg-white/5" />
                  <div className="flex gap-1 md:gap-2">
                     {[...Array(3)].map((_, i: number) => (
                        <span key={i} className={`text-base md:text-3xl transition-all duration-500 ${i < lives ? 'scale-100' : 'scale-50 opacity-10 grayscale'}`}>❤️</span>
                     ))}
                  </div>
               </div>
               {/* Progress Bar */}
               <div className="flex gap-1 px-2 justify-center">
                  {currentQuestions.map((_: Question, i: number) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i < currentStep ? 'w-4 md:w-8 bg-brand-sky shadow-glow-sky' : i === currentStep ? 'w-6 md:w-12 bg-white animate-pulse' : 'w-2 md:w-3 bg-white/10'}`} />
                  ))}
               </div>
            </div>

            {/* Stage Bar */}
            <div className="flex items-center gap-1.5 md:gap-4">
               <div className="bg-slate-900/80 backdrop-blur-xl px-3 md:px-6 py-1.5 md:py-3 rounded-full border border-white/10 text-white font-black text-xs md:text-xl tracking-tighter whitespace-nowrap">
                  STAGE {currentStep + 1}
               </div>

               {/* Audio Control */}
               <button 
                  onClick={toggleMute}
                  className={`w-8 h-8 md:w-14 md:h-14 rounded-full flex items-center justify-center text-sm md:text-2xl transition-all border-2 border-white/20 shadow-xl pointer-events-auto ${isMuted ? 'bg-slate-800 text-slate-400' : 'bg-brand-purple text-white hover:scale-110'}`}
               >
                  {isMuted ? '🔇' : '🎵'}
               </button>

               <button 
                  onClick={() => setShowPauseMenu(true)}
                  className="w-8 h-8 md:w-14 md:h-14 bg-slate-900/80 backdrop-blur-xl rounded-full flex flex-col items-center justify-center gap-1 md:gap-1.5 border-2 border-white/20 shadow-xl hover:bg-brand-sky/20 transition-all hover:scale-110 pointer-events-auto"
               >
                   <div className="w-3 md:w-6 h-[1.5px] md:h-0.5 bg-white rounded-full" />
                   <div className="w-3 md:w-6 h-[1.5px] md:h-0.5 bg-white rounded-full" />
                   <div className="w-3 md:w-6 h-[1.5px] md:h-0.5 bg-white rounded-full" />
               </button>
            </div>
         </div>

         {/* Selection Console (Centering fix) */}
         <div className="mt-auto p-4 md:p-6 pb-6 md:pb-10 pointer-events-auto bg-transparent w-full flex flex-col items-center">
            <div className="max-w-4xl w-full flex flex-col gap-3">
               <div className="flex items-center gap-2 opacity-20 w-full mb-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-white/40 text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase">Control Matrix</span>
                  <div className="h-px flex-1 bg-white/10" />
               </div>

                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full">
                  {selectedLevel === 3 ? (
                      shuffledSyllables.map((sByLabel: string, i: number) => (
                          <motion.button
                            key={`${currentStep}-${i}`}
                            whileHover={{ scale: 1.05, y: -4 }}
                            onHoverStart={() => playSound('hover')}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSyllableClick(sByLabel, i)}
                            disabled={feedback === 'correct' || selectedIndices.includes(i)}
                            className={`
                                relative group overflow-hidden px-4 md:px-10 py-3 md:py-8 min-w-[100px] md:min-w-[180px] rounded-2xl md:rounded-[2.5rem] text-sm md:text-3xl font-black transition-all duration-300 border-b-2 md:border-b-[10px] tracking-tight
                                ${selectedIndices.includes(i) ? 'bg-slate-800 border-slate-950 text-slate-700 opacity-30 scale-95 grayscale' : 'bg-white hover:bg-brand-sky hover:text-white border-slate-100 text-slate-950 shadow-sm'}
                            `}
                          >
                              {sByLabel}
                          </motion.button>
                      ))
                  ) : (
                    currentQuestion && currentQuestion.options.map((opt: string, i: number) => (
                      <motion.button
                         key={`${currentStep}-${i}`}
                         whileHover={{ scale: 1.05, y: -4 }}
                         onHoverStart={() => playSound('hover')}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => handleOptionClick(opt)}
                         disabled={feedback === 'correct'}
                         className={`
                            relative group overflow-hidden px-4 md:px-8 py-2 md:py-6 min-w-[100px] md:min-w-[200px] rounded-xl md:rounded-[2rem] text-xs md:text-xl font-black transition-all duration-300 border-b-2 md:border-b-[10px] tracking-tight
                            ${feedback === 'correct' && opt === currentQuestion.correct ? 'bg-green-500 border-green-700 text-white shadow-[0_10px_20px_rgba(34,197,94,0.3)]' : 
                              feedback === 'wrong' && opt === currentQuestion.correct ? 'bg-white text-slate-900 border-slate-200' :
                              feedback === 'wrong' && opt !== currentQuestion.correct ? 'bg-slate-900/50 border-slate-950 text-slate-700 opacity-30 scale-95 grayscale transition-all' :
                              'bg-white hover:bg-brand-sky hover:text-white border-slate-100 hover:border-brand-sky-dark text-slate-950 shadow-sm'
                            }
                         `}
                      >
                         <span className="relative z-10">{opt}</span>
                      </motion.button>
                    ))
                  )}
                </div>
            </div>
         </div>
      </div>

      {/* Final Victory Overlay (Compact) */}
      <AnimatePresence>
        {isGameFinished && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="fixed inset-0 z-[10000] bg-slate-950/98 flex flex-col items-center justify-center text-center p-6 md:p-8 overflow-hidden touch-none"
            >
                {/* Backdrop Particles / Effects */}
                <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-blue-500/10 blur-[100px] md:blur-[200px] rounded-full -mr-48 md:-mr-96 -mt-48 md:-mt-96" />
                <div className="absolute bottom-0 left-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-brand-sky/10 blur-[100px] md:blur-[200px] rounded-full -ml-48 md:-ml-96 -mb-48 md:-mb-96" />
                
                <motion.div 
                  initial={{ y: 50, scale: 0.9, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-3xl border-2 border-white/10 p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                >
                    <div className="text-[10px] md:text-2xl font-black text-brand-sky tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4 animate-pulse">Mission Complete</div>
                    <h2 className="text-3xl md:text-7xl font-black text-white tracking-widest leading-none mb-4 md:mb-10 drop-shadow-glow-sky">VICTORY</h2>
                    
                    <div className="flex flex-col items-center mb-6 md:mb-10">
                         <div className="text-5xl md:text-8xl filter drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] animate-bounce">🏆</div>
                         <div className="mt-4 md:mt-6 flex flex-col bg-white/5 px-5 md:px-8 py-2 md:py-4 rounded-xl md:rounded-3xl border border-white/5">
                            <span className="text-white/40 text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] block mb-1">Total Stars Gained</span>
                            <span className="text-amber-400 text-xl md:text-5xl font-black leading-none drop-shadow-glow-amber">{stars} XP</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 md:gap-4 w-full">
                        <button 
                            onClick={handleContinue}
                            className="w-full py-4 md:py-6 bg-brand-sky rounded-xl md:rounded-3xl text-sm md:text-2xl font-black text-white shadow-[0_15px_40px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95 transition-all tracking-widest uppercase"
                        >
                            {selectedLevel === 1 && selectedProgram === 'intro' ? 'Next Program: Body Parts 🏃' :
                             selectedLevel === 1 && selectedProgram === 'body' ? 'Next Program: Shapes ⬟' :
                             selectedLevel < 3 ? `Next Mission: 0${selectedLevel + 1} 🚀` : 'Finish Adventure ✨'}
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <button 
                                onClick={() => handleStartGame(selectedLevel)}
                                className="py-3 md:py-5 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-3xl text-[10px] md:text-sm font-black text-white border border-white/10 transition-all uppercase tracking-widest"
                            >Play Again</button>
                            
                            <button 
                                onClick={() => {
                                    setMenuView('levels');
                                    setGameState('menu');
                                }}
                                className="py-3 md:py-5 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-3xl text-[10px] md:text-sm font-black text-white border border-white/10 transition-all uppercase tracking-widest"
                            >Dashboard Home</button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Menu Overlay */}
      <AnimatePresence>
        {showPauseMenu && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[20000] bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 overflow-hidden touch-none"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.1),transparent)] pointer-events-none" />
                
                <motion.div 
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 50, opacity: 0, scale: 0.9 }}
                  className="relative z-10 w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl"
                >
                    <div className="text-brand-sky text-[10px] md:text-sm font-black tracking-[0.5em] uppercase mb-1 md:mb-2 opacity-70">Mission Paused</div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-8 md:mb-12">System Menu</h2>
                    
                    <div className="flex flex-col gap-3 md:gap-4 w-full">
                        <button 
                            onClick={() => setShowPauseMenu(false)}
                            className="w-full py-4 md:py-5 bg-brand-sky rounded-2xl md:rounded-3xl text-sm md:text-xl font-black text-white shadow-glow-sky hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                        >Resume Exploration</button>
                        
                        <button 
                            onClick={() => {
                                setShowPauseMenu(false);
                                handleStartGame(selectedLevel);
                            }}
                            className="w-full py-4 md:py-5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl md:rounded-3xl text-sm md:text-xl font-black text-white transition-all uppercase tracking-widest"
                        >Restart Sequence</button>
                        
                        <div className="h-px bg-white/5 my-2 mx-4" />
                        
                        <button 
                            onClick={() => {
                                setShowPauseMenu(false);
                                setGameState('missionMenu');
                            }}
                            className="w-full py-4 md:py-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl md:rounded-3xl text-xs md:text-sm font-black text-red-400 transition-all uppercase tracking-widest"
                        >Quit to Sector</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .perspective-2000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .drop-shadow-glow-amber { filter: drop-shadow(0 0 20px rgba(251,191,36,0.6)); }
        .drop-shadow-glow-sky { filter: drop-shadow(0 0 40px rgba(56,189,248,0.6)); }
        .drop-shadow-glow-coral { filter: drop-shadow(0 0 40px rgba(255,107,107,0.6)); }
        .shadow-glow-sky { box-shadow: 0 0 20px rgba(56,189,248,0.4); }
        .shadow-correct { box-shadow: 0 20px 80px rgba(56,189,248,0.5); }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-10px, 0, 0); }
          20%, 80% { transform: translate3d(20px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-30px, 0, 0); }
          40%, 60% { transform: translate3d(30px, 0, 0); }
        }
      `}</style>
    </main>
  );
};
