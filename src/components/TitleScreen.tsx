import React from 'react';
import { Character, GameSettings } from '../game/types';
import { Play, Users, Settings as SettingsIcon, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundManager } from '../game/sound';

interface TitleScreenProps {
  selectedCharacter: Character;
  highScore: number;
  totalFriends: number;
  settings: GameSettings;
  onStartGame: () => void;
  onOpenSelect: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedCharacter,
  highScore,
  totalFriends,
  settings,
  onStartGame,
  onOpenSelect,
  onOpenSettings,
  onToggleMute,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden select-none bg-gradient-to-b from-[#40A9FF] via-[#7EC8E3] to-[#E0F4FF]">
      {/* Animated Floating Clouds Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-80">
        <div className="absolute top-12 -left-20 w-44 h-16 bg-white/70 rounded-full blur-[1px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-28 right-10 w-60 h-20 bg-white/60 rounded-full blur-[1px]" />
        <div className="absolute top-64 left-1/4 w-52 h-16 bg-white/50 rounded-full blur-[1px]" />
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10">
        {/* High Score Trophy */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-md border-2 border-amber-300">
          <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">HIGH SCORE</span>
            <span className="text-lg font-arcade text-slate-900 tabular-nums">{highScore}</span>
          </div>
        </div>

        {/* Audio Mute Quick Toggle */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className="p-3 bg-white/90 hover:bg-white text-slate-700 rounded-2xl shadow-md border border-slate-200 transition-all hover:scale-105 active:scale-95"
          title={settings.isMuted ? 'Unmute' : 'Mute'}
        >
          {settings.isMuted ? (
            <VolumeX className="w-5 h-5 text-red-500" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-600" />
          )}
        </button>
      </div>

      {/* Center Hero Lockup: Title & Character Showcase */}
      <div className="flex flex-col items-center text-center z-10 my-auto max-w-xl">
        {/* Bespoke Arcade Title Emblem */}
        <div className="relative mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-amber-950 font-bold text-xs rounded-full shadow-sm mb-2 border border-amber-300 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> ARCADE EDITION
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-arcade tracking-tight text-white drop-shadow-[0_6px_0_#1E293B]"
            style={{
              WebkitTextStroke: '3px #0F172A',
              paintOrder: 'stroke fill',
            }}
          >
            FRIENDS
            <br />
            <span className="text-yellow-300 drop-shadow-[0_6px_0_#7C2D12]">FLAPPY BIRD</span>
          </h1>
        </div>

        {/* Hero Interactive Friend Showcase */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenSelect();
          }}
          className="group relative cursor-pointer my-2 flex flex-col items-center"
          title="Click to change friend character"
        >
          {/* Pulsing Aura */}
          <div
            className="absolute -inset-4 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse"
            style={{ backgroundColor: selectedCharacter.themeColor }}
          />

          {/* Bird Container with Floating Bob Animation */}
          <div className="relative w-36 h-36 flex items-center justify-center transition-transform group-hover:scale-105">
            {/* Friend Face in Circular Avatar (100% visible) */}
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden border-4 shadow-2xl bg-white flex items-center justify-center"
              style={{ borderColor: selectedCharacter.themeColor }}
            >
              <img
                src={selectedCharacter.imageSrc}
                alt={selectedCharacter.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Golden Beak at front */}
            <div className="absolute -right-2 top-14 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[18px] border-l-amber-500 drop-shadow-sm" />
          </div>

          {/* Selected Friend Name & Theme Song Pill */}
          <div className="mt-3 flex flex-col items-center bg-white/95 px-5 py-2 rounded-2xl shadow-lg border-2 border-slate-200 group-hover:border-amber-400 transition-colors">
            <span className="text-base font-bold text-slate-900">{selectedCharacter.name}</span>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              🎵 {selectedCharacter.songTitle || 'Theme Song'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Click avatar to switch</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions Cluster */}
      <div className="w-full max-w-sm flex flex-col gap-3 z-10 mb-2">
        {/* Large Play Button */}
        <button
          data-start="true"
          onClick={() => {
            soundManager.playClick();
            onStartGame();
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-arcade text-lg tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 border-b-4 border-emerald-800 transition-all transform hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" /> PLAY NOW
        </button>

        {/* Secondary Buttons Row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSelect();
            }}
            className="py-3 px-4 bg-white/90 hover:bg-white text-slate-800 font-bold text-sm rounded-2xl shadow-md border-2 border-slate-200 transition-all hover:border-indigo-400 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Friends ({totalFriends})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="py-3 px-4 bg-white/90 hover:bg-white text-slate-800 font-bold text-sm rounded-2xl shadow-md border-2 border-slate-200 transition-all hover:border-amber-400 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4 text-amber-600" />
            <span>Settings</span>
          </button>
        </div>

        {/* Control Hints Single Line */}
        <div className="text-center text-xs font-semibold text-slate-600/90 pt-1">
          Space / Tap to Flap · Enter to Start · P to Pause
        </div>
      </div>
    </div>
  );
};
