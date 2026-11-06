/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Character, GameSettings } from './game/types';
import {
  getStoredCharacters,
  getStoredHighScore,
  getStoredSelectedCharacterId,
  getStoredSettings,
  resetHighScore,
  saveCharacters,
  saveHighScore,
  saveSelectedCharacterId,
  saveSettings,
} from './game/storage';
import { soundManager } from './game/sound';
import { GameCanvas } from './components/GameCanvas';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { AddFriendModal } from './components/AddFriendModal';

type AppState = 'title' | 'playing' | 'paused' | 'gameover' | 'select' | 'settings';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(() => getStoredCharacters());
  const [selectedId, setSelectedId] = useState<string>(() =>
    getStoredSelectedCharacterId(getStoredCharacters())
  );
  const [highScore, setHighScore] = useState<number>(() => getStoredHighScore());
  const [settings, setSettings] = useState<GameSettings>(() => getStoredSettings());
  const [gameState, setGameState] = useState<AppState>('title');
  const [lastScore, setLastScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Active Character
  const currentCharacter = useMemo(() => {
    return characters.find((c) => c.id === selectedId) || characters[0];
  }, [characters, selectedId]);

  // Mirror dataset.state to document.body per game guidelines
  useEffect(() => {
    let stateAttr = 'title';
    if (gameState === 'playing') stateAttr = 'playing';
    else if (gameState === 'paused') stateAttr = 'paused';
    else if (gameState === 'gameover') stateAttr = 'gameover';
    else stateAttr = 'title';

    document.body.dataset.state = stateAttr;
  }, [gameState]);

  // Initialize sound volumes on mount
  useEffect(() => {
    soundManager.setVolumes(settings.musicVolume, settings.sfxVolume, settings.isMuted);
  }, [settings]);

  // Check ?autostart=1 query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        setGameState('playing');
        soundManager.registerUserInteraction();
        soundManager.playCharacterSong(currentCharacter.audioSrc);
      }
    }
  }, [currentCharacter.audioSrc]);

  // Keyboard controls for game shell (Title Start, Game Over Retry)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startGame();
      } else if (gameState === 'gameover' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState]);

  // Start / Restart Gameplay
  const startGame = useCallback(() => {
    soundManager.registerUserInteraction();
    soundManager.playCharacterSong(currentCharacter.audioSrc);
    setGameState('playing');
  }, [currentCharacter.audioSrc]);

  // Handle Game Over
  const handleGameOver = useCallback((finalScore: number, newHighScore: boolean) => {
    setLastScore(finalScore);
    const updatedHigh = saveHighScore(finalScore);
    setHighScore(updatedHigh);
    setIsNewHigh(newHighScore);
    setGameState('gameover');
  }, []);

  // Character Selection handler
  const handleSelectCharacter = useCallback((char: Character) => {
    setSelectedId(char.id);
    saveSelectedCharacterId(char.id);
    // When a character is selected, their matching song starts playing in the background
    soundManager.playCharacterSong(char.audioSrc);
  }, []);

  // Add Custom Friend
  const handleAddCharacter = useCallback((newChar: Character) => {
    setCharacters((prev) => {
      const updated = [...prev, newChar];
      saveCharacters(updated);
      return updated;
    });
    setSelectedId(newChar.id);
    saveSelectedCharacterId(newChar.id);
    soundManager.playCharacterSong(newChar.audioSrc);
  }, []);

  // Rename Character
  const handleRenameCharacter = useCallback((id: string, newName: string) => {
    setCharacters((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, name: newName } : c));
      saveCharacters(updated);
      return updated;
    });
  }, []);

  // Delete Custom Character
  const handleDeleteCharacter = useCallback(
    (id: string) => {
      setCharacters((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveCharacters(updated);
        return updated;
      });
      if (selectedId === id) {
        setSelectedId(characters[0]?.id || 'chandana');
        saveSelectedCharacterId(characters[0]?.id || 'chandana');
      }
    },
    [characters, selectedId]
  );

  // Settings update
  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Reset High Score
  const handleResetHighScore = useCallback(() => {
    resetHighScore();
    setHighScore(0);
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev, isMuted: !prev.isMuted };
      saveSettings(updated);
      soundManager.setVolumes(updated.musicVolume, updated.sfxVolume, updated.isMuted);
      return updated;
    });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none flex items-center justify-center">
      {/* Active Canvas Game Viewport */}
      {gameState === 'playing' ? (
        <GameCanvas
          character={currentCharacter}
          settings={settings}
          highScore={highScore}
          onGameOver={handleGameOver}
          onScoreUpdate={(s) => {
            if (s > highScore) {
              setHighScore(s);
            }
          }}
          onPauseToggle={(paused) => setGameState(paused ? 'paused' : 'playing')}
          onMuteToggle={handleToggleMute}
        />
      ) : (
        /* Title Screen */
        <TitleScreen
          selectedCharacter={currentCharacter}
          highScore={highScore}
          totalFriends={characters.length}
          settings={settings}
          onStartGame={startGame}
          onOpenSelect={() => setGameState('select')}
          onOpenSettings={() => setGameState('settings')}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Character Selection Modal */}
      {gameState === 'select' && (
        <CharacterSelectModal
          characters={characters}
          selectedId={selectedId}
          onSelect={handleSelectCharacter}
          onStartGame={() => {
            setGameState('playing');
            soundManager.playCharacterSong(currentCharacter.audioSrc);
          }}
          onClose={() => setGameState('title')}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onDeleteCharacter={handleDeleteCharacter}
          onRenameCharacter={handleRenameCharacter}
        />
      )}

      {/* Settings Modal */}
      {gameState === 'settings' && (
        <SettingsModal
          settings={settings}
          highScore={highScore}
          onUpdateSettings={handleUpdateSettings}
          onResetHighScore={handleResetHighScore}
          onClose={() => setGameState('title')}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          score={lastScore}
          highScore={highScore}
          isNewHighScore={isNewHigh}
          character={currentCharacter}
          onRetry={startGame}
          onSelectCharacter={() => setGameState('select')}
          onMainMenu={() => setGameState('title')}
        />
      )}

      {/* Add Custom Friend Modal */}
      {isAddModalOpen && (
        <AddFriendModal
          onAddCharacter={handleAddCharacter}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
