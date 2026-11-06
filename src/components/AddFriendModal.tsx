import React, { useState, useRef } from 'react';
import { Character, INITIAL_CHARACTERS } from '../game/types';
import { Upload, X, Music, Check, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../game/sound';

interface AddFriendModalProps {
  onAddCharacter: (newChar: Character) => void;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  { theme: '#FF4081', accent: '#F50057', label: 'Pink' },
  { theme: '#00B0FF', accent: '#0091EA', label: 'Sky' },
  { theme: '#FFD600', accent: '#FFAB00', label: 'Gold' },
  { theme: '#00E676', accent: '#00C853', label: 'Green' },
  { theme: '#D500F9', accent: '#AA00FF', label: 'Purple' },
  { theme: '#FF6D00', accent: '#FF3D00', label: 'Orange' },
  { theme: '#1DE9B6', accent: '#00BFA5', label: 'Teal' },
  { theme: '#FF1744', accent: '#D50000', label: 'Ruby' },
];

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ onAddCharacter, onClose }) => {
  const [name, setName] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[1]);
  const [selectedAudio, setSelectedAudio] = useState(INITIAL_CHARACTERS[0].audioSrc);
  const [songTitle, setSongTitle] = useState(INITIAL_CHARACTERS[0].songTitle || 'Theme Song');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setErrorMsg('');
      if (!name) {
        // Auto-fill name from filename without extension
        const rawName = file.name.split('.')[0].replace(/[-_]/g, ' ');
        setName(rawName.charAt(0).toUpperCase() + rawName.slice(1));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const audioData = event.target?.result as string;
      setSelectedAudio(audioData);
      setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
      soundManager.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please give your friend a name!');
      return;
    }
    if (!imageSrc) {
      setErrorMsg("Please upload your friend's photograph!");
      return;
    }

    const newChar: Character = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      imageSrc,
      audioSrc: selectedAudio,
      themeColor: selectedColor.theme,
      accentColor: selectedColor.accent,
      songTitle: songTitle || `${name.trim()}'s Anthem`,
      quote: `${name.trim()} is ready to soar through the pipes!`,
      isCustom: true,
    };

    onAddCharacter(newChar);
    soundManager.playPoint();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">ADD A FRIEND</h2>
              <p className="text-xs text-slate-500">Upload your friend's face to play as them!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload Area & Circular Preview */}
          <div className="flex flex-col items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer flex flex-col items-center"
            >
              {imageSrc ? (
                <div
                  className="relative w-28 h-28 rounded-full overflow-hidden border-4 shadow-xl group-hover:opacity-90 transition-opacity"
                  style={{ borderColor: selectedColor.theme }}
                >
                  <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    Change Photo
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 flex flex-col items-center justify-center p-3 text-center transition-colors">
                  <Upload className="w-7 h-7 text-indigo-500 mb-1" />
                  <span className="text-[11px] font-bold text-indigo-600">Upload Photo</span>
                  <span className="text-[9px] text-slate-400">JPG or PNG</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 font-medium">
              Original facial features are 100% preserved!
            </span>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Friend's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul, Sneha, Alex..."
              maxLength={20}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bird Color Swatches */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bird Wing & Aura Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_SWATCHES.map((swatch, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedColor(swatch)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor.theme === swatch.theme
                      ? 'scale-110 ring-2 ring-indigo-500 shadow-md'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.theme, borderColor: swatch.accent }}
                  title={swatch.label}
                />
              ))}
            </div>
          </div>

          {/* Theme Song Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-indigo-600" /> Matching Background Song
              </label>
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Upload Audio File
              </button>
            </div>

            <input
              type="file"
              ref={audioInputRef}
              onChange={handleCustomAudioChange}
              accept="audio/*"
              className="hidden"
            />

            <select
              value={selectedAudio}
              onChange={(e) => {
                const opt = e.target.options[e.target.selectedIndex];
                setSelectedAudio(e.target.value);
                setSongTitle(opt.text);
                soundManager.playClick();
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {INITIAL_CHARACTERS.map((c) => (
                <option key={c.id} value={c.audioSrc}>
                  {c.name}'s Anthem ({c.songTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg border border-indigo-400/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> ADD TO ROSTER
          </button>
        </form>
      </div>
    </div>
  );
};
