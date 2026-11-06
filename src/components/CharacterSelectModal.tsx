import React, { useState } from 'react';
import { Character } from '../game/types';
import { Play, Plus, Trash2, Edit2, Check, X, ArrowLeft, Volume2, Sparkles } from 'lucide-react';
import { soundManager } from '../game/sound';

interface CharacterSelectModalProps {
  characters: Character[];
  selectedId: string;
  onSelect: (char: Character) => void;
  onStartGame: () => void;
  onClose: () => void;
  onOpenAddModal: () => void;
  onDeleteCharacter: (id: string) => void;
  onRenameCharacter: (id: string, newName: string) => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  characters,
  selectedId,
  onSelect,
  onStartGame,
  onClose,
  onOpenAddModal,
  onDeleteCharacter,
  onRenameCharacter,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState<string>('');
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);

  const selectedChar = characters.find((c) => c.id === selectedId) || characters[0];

  const handleCharClick = (char: Character) => {
    soundManager.playClick();
    onSelect(char);
    // When a character is selected, their matching song starts playing immediately in the background!
    soundManager.playCharacterSong(char.audioSrc);
  };

  const handleStartRename = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    setEditingId(char.id);
    setEditNameText(char.name);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editNameText.trim()) {
      onRenameCharacter(id, editNameText.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-800 font-bold rounded-2xl shadow-md border border-slate-200 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-arcade text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            SELECT FRIEND
          </h2>
          <p className="text-xs text-amber-300 font-bold tracking-wide">
            Each friend has their own custom anthem!
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenAddModal();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs md:text-sm rounded-2xl shadow-lg border border-indigo-400/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Friend
        </button>
      </div>

      {/* Main Content Area: Character Grid + Live Preview Side/Top */}
      <div className="w-full max-w-4xl flex-1 flex flex-col lg:flex-row gap-6 items-stretch my-2">
        {/* Left: Characters Selection Grid */}
        <div className="flex-1 bg-white/95 rounded-3xl p-5 shadow-2xl border-2 border-slate-200 overflow-y-auto max-h-[60vh] lg:max-h-[70vh]">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Friend Roster ({characters.length})
            </span>
            <span className="text-xs text-slate-400">Click a friend to select & hear their song</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {characters.map((char) => {
              const isSelected = char.id === selectedId;
              const isEditing = editingId === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => handleCharClick(char)}
                  className={`group relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50 ring-4 ring-amber-400 shadow-lg scale-102 border-amber-300'
                      : 'bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Active Selected Crown / Star Badge */}
                  {isSelected && (
                    <div className="absolute -top-2.5 -right-2 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md z-10 animate-bounce">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}

                  {/* Circular Unaltered Face Avatar */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 shadow-md bg-slate-200 transition-transform group-hover:scale-105"
                    style={{ borderColor: char.themeColor }}
                  >
                    <img
                      src={char.imageSrc}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Name or Inline Rename */}
                  <div className="mt-2 text-center w-full px-1">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editNameText}
                          onChange={(e) => setEditNameText(e.target.value)}
                          className="w-full px-1.5 py-0.5 text-xs border rounded bg-white font-bold text-slate-900"
                          autoFocus
                          maxLength={15}
                        />
                        <button
                          onClick={(e) => handleSaveRename(e, char.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 group/name">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight text-center">
                          {char.name}
                        </span>
                        <button
                          onClick={(e) => handleStartRename(e, char)}
                          className="opacity-0 group-hover/name:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 rounded transition-opacity"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Matching Anthem Title */}
                    <div className="text-[11px] text-indigo-600 font-semibold truncate mt-0.5 flex items-center justify-center gap-1">
                      <Volume2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{char.songTitle || 'Theme Song'}</span>
                    </div>
                  </div>

                  {/* Custom Friend Delete Button */}
                  {char.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove custom friend ${char.name}?`)) {
                          onDeleteCharacter(char.id);
                        }
                      }}
                      className="absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete friend"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Selected Character Gameplay Preview Box */}
        <div className="w-full lg:w-80 bg-white/95 rounded-3xl p-6 shadow-2xl border-2 border-slate-200 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              LIVE GAMEPLAY PREVIEW
            </span>
            <h3 className="text-2xl font-bold font-display text-slate-900 mt-1">
              {selectedChar.name}
            </h3>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">
              🎵 {selectedChar.songTitle || 'Custom Theme Track'}
            </p>
          </div>

          {/* Interactive Bird Preview with flapping wings */}
          <div className="relative my-6 w-44 h-44 rounded-3xl bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA] border-2 border-sky-300 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Background clouds */}
            <div className="absolute top-4 left-3 w-16 h-6 bg-white/60 rounded-full blur-[0.5px]" />
            <div className="absolute bottom-6 right-4 w-20 h-7 bg-white/60 rounded-full blur-[0.5px]" />

            {/* Bird Body Avatar (Wings removed for 100% face clarity) */}
            <div className="relative w-28 h-28 flex items-center justify-center animate-bounce">
              {/* Friend Circular Face Avatar */}
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden border-4 shadow-xl bg-white flex items-center justify-center"
                style={{ borderColor: selectedChar.themeColor }}
              >
                <img
                  src={selectedChar.imageSrc}
                  alt={selectedChar.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Golden Beak at front */}
              <div className="absolute -right-2 top-10 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[16px] border-l-amber-500 drop-shadow-sm" />
            </div>
          </div>

          {/* Quote / Bio */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 w-full text-xs text-slate-600 italic">
            "{selectedChar.quote || `Ready to take on the skies!`}"
          </div>

          {/* Primary START GAME Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onStartGame();
            }}
            className="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-arcade text-sm tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 border-b-4 border-emerald-800 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> FLY AS {selectedChar.name.toUpperCase()}!
          </button>
        </div>
      </div>
    </div>
  );
};
