export interface Character {
  id: string;
  name: string;
  imageSrc: string;
  audioSrc: string;
  themeColor: string;
  accentColor: string;
  quote?: string;
  songTitle?: string;
  isCustom?: boolean;
}

export type GameDifficulty = 'easy' | 'normal' | 'spicy';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  difficulty: GameDifficulty;
}

export interface PipeData {
  x: number;
  topHeight: number;
  bottomHeight: number;
  gap: number;
  width: number;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'chandana',
    name: 'Chandana',
    imageSrc: '/assets/aistudio/chandana_ecff0658.jpeg',
    audioSrc: '/assets/audio/chandana_e6f188f9.mp3',
    themeColor: '#FF4081',
    accentColor: '#F50057',
    songTitle: "Chandana's Beat",
    quote: "Chandana flew with pure elegance!",
  },
  {
    id: 'charan',
    name: 'Charan',
    imageSrc: '/assets/aistudio/charan_dc8360c9.jpeg',
    audioSrc: '/assets/audio/chiru_charan_311b4dd3.mp3',
    themeColor: '#00B0FF',
    accentColor: '#0091EA',
    songTitle: "Chiru & Charan Mass Track",
    quote: "Charan couldn't dodge the pipe!",
  },
  {
    id: 'chiruhaas',
    name: 'Chiruhaas',
    imageSrc: '/assets/aistudio/chiruhaas_5d324b4b.jpeg',
    audioSrc: '/assets/audio/chiru_charan_311b4dd3.mp3',
    themeColor: '#FFD600',
    accentColor: '#FFAB00',
    songTitle: "Chiru & Charan Mass Track",
    quote: "Chiruhaas was flying too high!",
  },
  {
    id: 'eshwar',
    name: 'Eshwar',
    imageSrc: '/assets/aistudio/eshwar_97d01a57.jpeg',
    audioSrc: '/assets/audio/eshwar_ram_sai_0a406211.mp3',
    themeColor: '#00E676',
    accentColor: '#00C853',
    songTitle: "Trio Anthem (Eshwar-Ram-Sai)",
    quote: "Eshwar challenged gravity and lost!",
  },
  {
    id: 'keerthy',
    name: 'Keerthy',
    imageSrc: '/assets/aistudio/keerthy_03d2f989.jpeg',
    audioSrc: '/assets/audio/keerthy_4ca58e1c.mp3',
    themeColor: '#D500F9',
    accentColor: '#AA00FF',
    songTitle: "Keerthy's Rhythm",
    quote: "Keerthy's wings needed a quick rest!",
  },
  {
    id: 'radhika',
    name: 'Radhika',
    imageSrc: '/assets/aistudio/radhika_24ffa949.jpeg',
    audioSrc: '/assets/audio/radhika_72df142a.mp3',
    themeColor: '#FF6D00',
    accentColor: '#FF3D00',
    songTitle: "Radhika's Melodic Vibe",
    quote: "Radhika made a sensational dive!",
  },
  {
    id: 'ram',
    name: 'Ram',
    imageSrc: '/assets/aistudio/ram_bc544a8a.jpeg',
    audioSrc: '/assets/audio/eshwar_ram_sai_0a406211.mp3',
    themeColor: '#1DE9B6',
    accentColor: '#00BFA5',
    songTitle: "Trio Anthem (Eshwar-Ram-Sai)",
    quote: "Ram almost set a world record!",
  },
  {
    id: 'renu',
    name: 'Renu',
    imageSrc: '/assets/aistudio/renu_b58d5227.jpeg',
    audioSrc: '/assets/audio/renu_audio_9a5a93d5.mp3',
    themeColor: '#FFEA00',
    accentColor: '#FFC400',
    songTitle: "Renu's Groove",
    quote: "Renu flew with unstoppable energy!",
  },
  {
    id: 'sai',
    name: 'Sai',
    imageSrc: '/assets/aistudio/sai_c1f24ca2.jpeg',
    audioSrc: '/assets/audio/eshwar_ram_sai_0a406211.mp3',
    themeColor: '#3D5AFE',
    accentColor: '#2979FF',
    songTitle: "Trio Anthem (Eshwar-Ram-Sai)",
    quote: "Sai tried a risky mid-air maneuver!",
  },
  {
    id: 'shilpa',
    name: 'Shilpa',
    imageSrc: '/assets/aistudio/shilpa_7eb98d23.jpeg',
    audioSrc: '/assets/audio/shilpa_audio_2b2e5c15.mp3',
    themeColor: '#FF1744',
    accentColor: '#D50000',
    songTitle: "Shilpa's Power Beat",
    quote: "Shilpa soared like a fearless eagle!",
  },
];
