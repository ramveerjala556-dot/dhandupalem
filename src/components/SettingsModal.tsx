import React, { useState } from 'react';
import { GameSettings } from '../game/types';
import { Volume2, VolumeX, Music, Sliders, Trophy, Trash2, ArrowLeft, Check } from 'lucide-react';
import { soundManager } from '../game/sound';

interface SettingsModalProps {
  settings: GameSettings;
  highScore: number;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetHighScore: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  highScore,
  onUpdateSettings,
  onResetHighScore,
  onClose,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleMusicChange = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.musicVolume, updated.sfxVolume, updated.isMuted);
  };

  const handleSfxChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.musicVolume, updated.sfxVolume, updated.isMuted);
    soundManager.playPoint();
  };

  const handleMuteToggle = () => {
    const updated = { ...settings, isMuted: !settings.isMuted };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.musicVolume, updated.sfxVolume, updated.isMuted);
    soundManager.playClick();
  };

  const handleDifficultyChange = (diff: GameSettings['difficulty']) => {
    const updated = { ...settings, difficulty: diff };
    onUpdateSettings(updated);
    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">GAME SETTINGS</h2>
              <p className="text-xs text-slate-500">Audio, controls & difficulty</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Mute Master Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              {settings.isMuted ? (
                <VolumeX className="w-5 h-5 text-red-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              )}
              <div>
                <div className="text-sm font-bold text-slate-800">Mute All Audio</div>
                <div className="text-xs text-slate-500">Silence background music and sound effects</div>
              </div>
            </div>
            <button
              onClick={handleMuteToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.isMuted ? 'bg-red-500 justify-end' : 'bg-emerald-500 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Background Music Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-indigo-500" /> Background Music Volume
              </span>
              <span className="tabular-nums font-mono text-slate-500">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              disabled={settings.isMuted}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Sound Effects Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-500" /> Sound Effects (SFX) Volume
              </span>
              <span className="tabular-nums font-mono text-slate-500">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              disabled={settings.isMuted}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Difficulty Setting */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Gameplay Difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'normal', 'spicy'] as const).map((diff) => {
                const isActive = settings.difficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs capitalize transition-all border ${
                      isActive
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md scale-102'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diff === 'spicy' ? '🌶️ Spicy' : diff === 'easy' ? '🌱 Easy' : '⭐ Normal'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* High Score Reset */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700">High Score:</span>
              <span className="text-sm font-arcade text-slate-900 tabular-nums">{highScore}</span>
            </div>

            {showResetConfirm ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onResetHighScore();
                    setShowResetConfirm(false);
                    soundManager.playClick();
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Reset Score
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full mt-6 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-colors"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
