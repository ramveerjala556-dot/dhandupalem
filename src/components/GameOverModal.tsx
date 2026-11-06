import React, { useMemo } from 'react';
import { Character } from '../game/types';
import { RotateCcw, Home, Users, Trophy, Sparkles } from 'lucide-react';
import { soundManager } from '../game/sound';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  character: Character;
  onRetry: () => void;
  onSelectCharacter: () => void;
  onMainMenu: () => void;
}

const FUNNY_MESSAGES = [
  "Bro couldn't survive!",
  "Legendary flying skills!",
  "Gravity won this time!",
  "One more try, champion!",
  "The pipe came out of nowhere!",
  "That was totally a warm-up run!",
  "Flapped too close to the sun!",
  "Even gravity was impressed!",
  "Time for a revenge flight!",
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  character,
  onRetry,
  onSelectCharacter,
  onMainMenu,
}) => {
  // Random funny message
  const funnyMessage = useMemo(() => {
    if (isNewHighScore) {
      return `👑 UNSTOPPABLE! ${character.name} just set a brand new record!`;
    }
    const idx = Math.floor(Math.random() * FUNNY_MESSAGES.length);
    return FUNNY_MESSAGES[idx];
  }, [isNewHighScore, character.name]);

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-400 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* New High Score Star Banner */}
        {isNewHighScore && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-arcade text-xs px-4 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-4 h-4 fill-current" /> NEW BEST SCORE!
          </div>
        )}

        {/* Title */}
        <h2 className="text-3xl font-arcade text-red-500 drop-shadow-[0_2px_0_#991B1B] mt-1 mb-4">
          GAME OVER!
        </h2>

        {/* Prominent Friend Portrait */}
        <div className="relative mx-auto my-2 w-28 h-28 flex items-center justify-center">
          {/* Halos */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40"
            style={{ backgroundColor: character.themeColor }}
          />

          <div
            className="relative w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl bg-slate-100 rotate-6"
            style={{ borderColor: character.themeColor }}
          >
            <img
              src={character.imageSrc}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Little Dizzy Star */}
          <div className="absolute -top-2 -right-1 text-2xl animate-spin" style={{ animationDuration: '4s' }}>
            💫
          </div>
        </div>

        {/* Character Name & Playful Message */}
        <div className="my-3">
          <span className="text-lg font-bold font-display text-slate-800">{character.name}</span>
          <p className="text-sm font-semibold text-amber-600 mt-1 px-4 italic">
            "{funnyMessage}"
          </p>
        </div>

        {/* Score & Best Score Tiles */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCORE</span>
            <span className="text-3xl font-arcade text-slate-900 tabular-nums mt-0.5">{score}</span>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500 fill-amber-400" /> BEST
            </span>
            <span className="text-3xl font-arcade text-amber-600 tabular-nums mt-0.5">{highScore}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Retry Button */}
          <button
            data-start="true"
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-arcade text-sm tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 border-b-4 border-emerald-800 transition-all transform hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> RETRY (SPACE)
          </button>

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectCharacter();
              }}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border-2 border-slate-200 hover:border-indigo-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch Friend</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onMainMenu();
              }}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-600" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
