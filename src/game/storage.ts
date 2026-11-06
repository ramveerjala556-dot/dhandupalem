import { Character, GameSettings, INITIAL_CHARACTERS } from './types';

const STORAGE_KEY_HIGH_SCORE = 'friends_flappy_high_score';
const STORAGE_KEY_CHARACTERS = 'friends_flappy_characters';
const STORAGE_KEY_SELECTED_CHAR = 'friends_flappy_selected_char';
const STORAGE_KEY_SETTINGS = 'friends_flappy_settings';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.85,
  isMuted: false,
  difficulty: 'normal',
};

export function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): number {
  if (typeof window === 'undefined') return score;
  try {
    const currentHigh = getStoredHighScore();
    if (score > currentHigh) {
      localStorage.setItem(STORAGE_KEY_HIGH_SCORE, score.toString());
      return score;
    }
    return currentHigh;
  } catch {
    return score;
  }
}

export function resetHighScore(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_HIGH_SCORE);
  } catch {
    // Ignore
  }
}

export function getStoredCharacters(): Character[] {
  if (typeof window === 'undefined') return INITIAL_CHARACTERS;
  try {
    const val = localStorage.getItem(STORAGE_KEY_CHARACTERS);
    if (!val) return INITIAL_CHARACTERS;
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all initial characters exist in case of updates, and preserve user added custom ones
      const customOnes = parsed.filter((c: Character) => c.isCustom);
      const userEditedDefaults = parsed.filter((c: Character) => !c.isCustom);

      // Merge defaults with stored custom characters
      const merged = INITIAL_CHARACTERS.map(def => {
        const found = userEditedDefaults.find((c: Character) => c.id === def.id);
        return found ? { ...def, name: found.name, quote: found.quote } : def;
      });

      return [...merged, ...customOnes];
    }
    return INITIAL_CHARACTERS;
  } catch {
    return INITIAL_CHARACTERS;
  }
}

export function saveCharacters(characters: Character[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(characters));
  } catch {
    // Ignore
  }
}

export function getStoredSelectedCharacterId(characters: Character[]): string {
  if (typeof window === 'undefined') return characters[0]?.id || 'chandana';
  try {
    const val = localStorage.getItem(STORAGE_KEY_SELECTED_CHAR);
    if (val && characters.some(c => c.id === val)) {
      return val;
    }
    return characters[0]?.id || 'chandana';
  } catch {
    return characters[0]?.id || 'chandana';
  }
}

export function saveSelectedCharacterId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_CHAR, id);
  } catch {
    // Ignore
  }
}

export function getStoredSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const val = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!val) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}
