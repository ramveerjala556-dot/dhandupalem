import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Character, GameSettings, Particle } from '../game/types';
import {
  BirdState,
  applyFlap,
  checkBoundaryCollision,
  checkPipeCollision,
  createPipe,
  getDifficultyConfig,
  updateBirdPhysics,
} from '../game/physics';
import { soundManager } from '../game/sound';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface GameCanvasProps {
  character: Character;
  settings: GameSettings;
  highScore: number;
  onGameOver: (finalScore: number, newHighScore: boolean) => void;
  onScoreUpdate: (score: number) => void;
  onPauseToggle: (isPaused: boolean) => void;
  onMuteToggle: () => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
  color: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  settings,
  highScore,
  onGameOver,
  onScoreUpdate,
  onPauseToggle,
  onMuteToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Loaded character image ref
  const characterImgRef = useRef<HTMLImageElement | null>(null);

  // Score display
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(true);

  // References to keep 60 FPS loop decoupled from React state updates
  const stateRef = useRef({
    score: 0,
    highScore: highScore,
    isPaused: false,
    isGameOver: false,
    isReady: true,
    lastTime: 0,
    screenShake: 0,
    hitFlash: 0,
    groundOffset: 0,
    cloudOffset: 0,
    hillOffset: 0,
    wingFlapPhase: 0,
    timeAlive: 0,
  });

  // Keep references to props updated without rebuilding loop
  const propsRef = useRef({
    character,
    settings,
    onGameOver,
    onScoreUpdate,
    onPauseToggle,
  });
  useEffect(() => {
    propsRef.current = { character, settings, onGameOver, onScoreUpdate, onPauseToggle };
    stateRef.current.highScore = highScore;
  }, [character, settings, highScore, onGameOver, onScoreUpdate, onPauseToggle]);

  // Load character image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = character.imageSrc;
    img.onload = () => {
      characterImgRef.current = img;
    };
  }, [character.imageSrc]);

  // Main game state simulation objects
  const birdRef = useRef<BirdState>({
    x: 100,
    y: 250,
    vy: 0,
    radius: 26,
    rotation: 0,
  });

  const pipesRef = useRef<ReturnType<typeof createPipe>[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Sound and music initialization
  useEffect(() => {
    soundManager.setVolumes(settings.musicVolume, settings.sfxVolume, settings.isMuted);
    soundManager.playCharacterSong(character.audioSrc);
  }, [character.audioSrc, settings.musicVolume, settings.sfxVolume, settings.isMuted]);

  // Trigger flap action
  const triggerFlap = useCallback(() => {
    if (stateRef.current.isGameOver || stateRef.current.isPaused) return;

    soundManager.registerUserInteraction();

    if (stateRef.current.isReady) {
      stateRef.current.isReady = false;
      setIsReady(false);
    }

    const diff = getDifficultyConfig(propsRef.current.settings.difficulty, stateRef.current.score);
    birdRef.current = applyFlap(birdRef.current, diff.jumpVelocity);
    soundManager.playFlap();

    // Spawn 3 tiny jump feather particles
    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        x: birdRef.current.x - 18,
        y: birdRef.current.y + 10 + (Math.random() * 8 - 4),
        vx: -1.5 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 5 + Math.random() * 4,
        color: propsRef.current.character.themeColor,
        alpha: 0.8,
        life: 0,
        maxLife: 20,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }, []);

  const togglePause = useCallback(() => {
    if (stateRef.current.isGameOver || stateRef.current.isReady) return;
    const next = !stateRef.current.isPaused;
    stateRef.current.isPaused = next;
    setIsPaused(next);
    propsRef.current.onPauseToggle(next);

    if (next) {
      soundManager.pauseMusic();
    } else {
      soundManager.resumeMusic();
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerFlap();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onMuteToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlap, togglePause, onMuteToggle]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const groundHeight = 90;

    // Resize canvas safely
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Adjust bird initial X
      birdRef.current.x = Math.min(130, rect.width * 0.28);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial ready state bird positioning
    birdRef.current.y = (canvas.height / (window.devicePixelRatio || 1) - groundHeight) * 0.45;
    birdRef.current.vy = 0;
    pipesRef.current = [];

    // Animation Tick
    const render = (time: number) => {
      if (!stateRef.current.lastTime) stateRef.current.lastTime = time;
      const rawDt = (time - stateRef.current.lastTime) / 1000;
      stateRef.current.lastTime = time;
      const dt = Math.min(rawDt, 0.05);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const groundY = height - groundHeight;

      const diff = getDifficultyConfig(propsRef.current.settings.difficulty, stateRef.current.score);

      // Advance physics if not paused or game over
      if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
        stateRef.current.timeAlive += dt;
        stateRef.current.wingFlapPhase += dt * 16;

        if (stateRef.current.isReady) {
          // Bobbing idle animation
          birdRef.current.y = (groundY * 0.45) + Math.sin(time * 0.005) * 12;
          birdRef.current.rotation = Math.sin(time * 0.004) * 0.1;
          stateRef.current.groundOffset = (stateRef.current.groundOffset + 1.2) % 32;
        } else {
          // Live simulation
          birdRef.current = updateBirdPhysics(birdRef.current, diff.gravity, 1.0);

          // Update background parallax
          stateRef.current.groundOffset = (stateRef.current.groundOffset + diff.pipeSpeed) % 32;
          stateRef.current.cloudOffset = (stateRef.current.cloudOffset + 0.3) % width;
          stateRef.current.hillOffset = (stateRef.current.hillOffset + 0.7) % width;

          // Check boundary collision (ground / ceiling)
          if (checkBoundaryCollision(birdRef.current, groundY)) {
            triggerGameOver();
          }

          // Pipe spawning logic
          const pipes = pipesRef.current;
          if (pipes.length === 0 || pipes[pipes.length - 1].x < width - diff.pipeDistance) {
            pipes.push(createPipe(width + 20, height, groundHeight, diff.gapSize));
          }

          // Pipe movement & collision checks
          for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= diff.pipeSpeed;

            // Score point when passing pipe
            if (!p.passed && p.x + p.width < birdRef.current.x) {
              p.passed = true;
              stateRef.current.score += 1;
              const newScore = stateRef.current.score;
              setCurrentScore(newScore);
              propsRef.current.onScoreUpdate(newScore);
              soundManager.playPoint();

              // Add floating "+1" text
              floatingTextsRef.current.push({
                id: Date.now() + Math.random(),
                x: birdRef.current.x + 20,
                y: birdRef.current.y - 15,
                text: '+1',
                alpha: 1.0,
                color: '#FFEA00',
              });
            }

            // Check collision with top or bottom pipe
            if (checkPipeCollision(birdRef.current, p, height)) {
              triggerGameOver();
            }

            // Remove offscreen pipes
            if (p.x + p.width < -50) {
              pipes.splice(i, 1);
            }
          }
        }
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.12; // gravity on particles
        pt.rotation += pt.vRot;
        pt.life++;
        pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update floating texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 1.2;
        ft.alpha -= 0.025;
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // Game over trigger helper
      function triggerGameOver() {
        if (stateRef.current.isGameOver) return;
        stateRef.current.isGameOver = true;
        stateRef.current.screenShake = 16;
        stateRef.current.hitFlash = 1.0;

        soundManager.playHit();
        setTimeout(() => {
          soundManager.playGameOver();
        }, 120);

        // Burst 24 feathers
        for (let i = 0; i < 24; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 5.5;
          particlesRef.current.push({
            x: birdRef.current.x,
            y: birdRef.current.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 2,
            size: 6 + Math.random() * 8,
            color: Math.random() > 0.5 ? propsRef.current.character.themeColor : '#FFFFFF',
            alpha: 1.0,
            life: 0,
            maxLife: 35 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.3,
          });
        }

        const isNewHigh = stateRef.current.score > stateRef.current.highScore;
        setTimeout(() => {
          propsRef.current.onGameOver(stateRef.current.score, isNewHigh);
        }, 450);
      }

      // -------------------------------------------------------------
      // DRAWING ROUTINES
      // -------------------------------------------------------------
      ctx.save();

      // Camera shake
      if (stateRef.current.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * stateRef.current.screenShake;
        const shakeY = (Math.random() - 0.5) * stateRef.current.screenShake;
        ctx.translate(shakeX, shakeY);
        stateRef.current.screenShake *= 0.88;
        if (stateRef.current.screenShake < 0.2) stateRef.current.screenShake = 0;
      }

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#58B9FF');
      skyGrad.addColorStop(0.65, '#A6E3E9');
      skyGrad.addColorStop(1, '#FFF5EA');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax Distant Sun / Rays
      ctx.save();
      const sunGrad = ctx.createRadialGradient(width * 0.85, 80, 10, width * 0.85, 80, 120);
      sunGrad.addColorStop(0, 'rgba(255, 248, 220, 0.9)');
      sunGrad.addColorStop(0.4, 'rgba(255, 230, 150, 0.4)');
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.85, 80, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Floating Clouds (Parallax Layer 1)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 18 * scale, cy - 8 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 42 * scale, cy - 4 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 56 * scale, cy, 16 * scale, 0, Math.PI * 2);
        ctx.fill();
      };
      const cOff = stateRef.current.cloudOffset;
      drawCloud(width * 0.15 - cOff * 0.4, 75, 1.1);
      drawCloud(width * 0.65 - cOff * 0.4, 110, 0.85);
      drawCloud(width * 1.15 - cOff * 0.4, 85, 1.3);

      // 4. Distant Hills (Parallax Layer 2)
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= width + 60; x += 30) {
        const hillY = groundY - 55 + Math.sin((x + stateRef.current.hillOffset) * 0.012) * 22;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(width, groundY);
      ctx.closePath();
      ctx.fill();

      // 5. Pipe Obstacles
      const pipes = pipesRef.current;
      for (const p of pipes) {
        // Colors for pipes
        const pipeBodyGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
        pipeBodyGrad.addColorStop(0, '#558B2F');
        pipeBodyGrad.addColorStop(0.18, '#7CB342');
        pipeBodyGrad.addColorStop(0.35, '#9CCC65');
        pipeBodyGrad.addColorStop(0.85, '#689F38');
        pipeBodyGrad.addColorStop(1, '#33691E');

        const lipOverhang = 5;
        const lipHeight = 22;

        // --- Top Pipe ---
        // Body
        ctx.fillStyle = pipeBodyGrad;
        ctx.fillRect(p.x, 0, p.width, p.topHeight);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#1B5E20';
        ctx.strokeRect(p.x, 0, p.width, p.topHeight);

        // Top Pipe Cap / Lip
        const topLipX = p.x - lipOverhang;
        const topLipY = p.topHeight - lipHeight;
        const topLipW = p.width + lipOverhang * 2;
        ctx.fillStyle = pipeBodyGrad;
        ctx.fillRect(topLipX, topLipY, topLipW, lipHeight);
        ctx.strokeRect(topLipX, topLipY, topLipW, lipHeight);

        // Highlight stripe on top pipe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(p.x + 6, 0, 6, p.topHeight - lipHeight);
        ctx.fillRect(topLipX + 8, topLipY, 6, lipHeight);

        // --- Bottom Pipe ---
        const botY = height - p.bottomHeight;
        // Body
        ctx.fillStyle = pipeBodyGrad;
        ctx.fillRect(p.x, botY, p.width, p.bottomHeight);
        ctx.strokeRect(p.x, botY, p.width, p.bottomHeight);

        // Bottom Pipe Cap / Lip
        ctx.fillStyle = pipeBodyGrad;
        ctx.fillRect(topLipX, botY, topLipW, lipHeight);
        ctx.strokeRect(topLipX, botY, topLipW, lipHeight);

        // Highlight stripe on bottom pipe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(p.x + 6, botY + lipHeight, 6, p.bottomHeight - lipHeight);
        ctx.fillRect(topLipX + 8, botY, 6, lipHeight);
      }

      // 6. Flying Particles / Feathers
      for (const pt of particlesRef.current) {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rotation);
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        // Oval feather shape
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size, pt.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Ground (Parallax Layer 3)
      ctx.fillStyle = '#D7CCC8';
      ctx.fillRect(0, groundY, width, groundHeight);

      // Top grass layer
      ctx.fillStyle = '#66BB6A';
      ctx.fillRect(0, groundY, width, 14);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, groundY + 14, width, 4);

      // Diagonal ground stripes for speed sensation
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, groundY + 18, width, groundHeight - 18);
      ctx.clip();
      ctx.strokeStyle = '#BCAAA4';
      ctx.lineWidth = 10;
      const offset = stateRef.current.groundOffset;
      for (let gx = -40 - offset; gx < width + 40; gx += 26) {
        ctx.beginPath();
        ctx.moveTo(gx, groundY + 18);
        ctx.lineTo(gx - 20, height);
        ctx.stroke();
      }
      ctx.restore();

      // Border between sky and ground
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // 8. The Playable Character (Friend Face + Animated Bird Wings & Body)
      const bird = birdRef.current;
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);

      const wingFlap = Math.sin(stateRef.current.wingFlapPhase) * 0.45;
      const themeColor = propsRef.current.character.themeColor;
      const accentColor = propsRef.current.character.accentColor;

      // Tail feathers (behind bird)
      ctx.save();
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(-bird.radius * 0.7, 4);
      ctx.lineTo(-bird.radius * 1.5, -4);
      ctx.lineTo(-bird.radius * 1.4, 8);
      ctx.lineTo(-bird.radius * 1.5, 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Circular Friend Face (Original Unaltered Photograph - 100% Unobstructed)
      const faceRadius = bird.radius;
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, faceRadius, 0, Math.PI * 2);
      ctx.clip();

      const img = characterImgRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        // Draw centered square crop preserving exact aspect ratio and facial features
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        let sx = 0;
        let sy = 0;

        if (imgAspect > 1) {
          sWidth = sHeight;
          sx = (img.naturalWidth - sWidth) / 2;
        } else {
          sHeight = sWidth;
          // Crop biased slightly towards upper half where faces naturally reside
          sy = Math.max(0, (img.naturalHeight - sHeight) * 0.25);
        }

        ctx.drawImage(
          img,
          sx,
          sy,
          sWidth,
          sHeight,
          -faceRadius,
          -faceRadius,
          faceRadius * 2,
          faceRadius * 2
        );
      } else {
        // High quality fallback with theme color and initials
        ctx.fillStyle = themeColor;
        ctx.fillRect(-faceRadius, -faceRadius, faceRadius * 2, faceRadius * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(propsRef.current.character.name.charAt(0), 0, 0);
      }
      ctx.restore();

      // Face Border Ring (crisp arcade framing)
      ctx.lineWidth = 3;
      ctx.strokeStyle = themeColor;
      ctx.beginPath();
      ctx.arc(0, 0, faceRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer dark shadow ring for clarity
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(0, 0, faceRadius + 1.2, 0, Math.PI * 2);
      ctx.stroke();

      // Golden Bird Beak at front
      ctx.save();
      ctx.fillStyle = '#FFA000';
      ctx.beginPath();
      ctx.moveTo(faceRadius - 3, -4);
      ctx.lineTo(faceRadius + 15, 3);
      ctx.lineTo(faceRadius - 3, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#B26A00';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      // Friend Name Badge above bird
      ctx.save();
      ctx.font = '700 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      const nameText = propsRef.current.character.name;
      const textMetrics = ctx.measureText(nameText);
      const badgeW = textMetrics.width + 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, -faceRadius - 19, badgeW, 16, 8);
      ctx.fill();
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(nameText, 0, -faceRadius - 7);
      ctx.restore();

      ctx.restore(); // end bird transform

      // 9. Floating score popups
      for (const ft of floatingTextsRef.current) {
        ctx.save();
        ctx.font = '700 20px Fredoka, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 10. Hit Flash on game over impact
      if (stateRef.current.hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${stateRef.current.hitFlash})`;
        ctx.fillRect(0, 0, width, height);
        stateRef.current.hitFlash *= 0.75;
        if (stateRef.current.hitFlash < 0.05) stateRef.current.hitFlash = 0;
      }

      // 11. "Tap / Space to Flap" Hint when in ready state
      if (stateRef.current.isReady) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '700 18px Fredoka, sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        const hintY = groundY * 0.68;

        const pulseScale = 1 + Math.sin(time * 0.008) * 0.06;
        ctx.translate(width / 2, hintY);
        ctx.scale(pulseScale, pulseScale);

        ctx.strokeText('TAP OR PRESS SPACE TO FLAP!', 0, 0);
        ctx.fillText('TAP OR PRESS SPACE TO FLAP!', 0, 0);

        ctx.font = '500 13px Fredoka, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(`Playing as ${propsRef.current.character.name}`, 0, 24);
        ctx.restore();
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden touch-none cursor-pointer"
      onClick={triggerFlap}
      onTouchStart={(e) => {
        e.preventDefault();
        triggerFlap();
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* In-Game World-Matched Perimeter HUD (Low-occlusion, pointer-events: none on wrapper) */}
      <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
        {/* Top Bar: Left Character & Score, Right Controls */}
        <div className="flex items-start justify-between">
          {/* Active Character Chip */}
          <div className="flex items-center gap-2.5 bg-slate-900/80 text-white px-3 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-auto">
            <img
              src={character.imageSrc}
              alt={character.name}
              className="w-7 h-7 rounded-full object-cover border-2"
              style={{ borderColor: character.themeColor }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">{character.name}</span>
              <span className="text-[10px] text-amber-300 font-medium leading-tight">
                🎵 {character.songTitle || 'Theme Song'}
              </span>
            </div>
          </div>

          {/* Central Giant Score Display */}
          <div className="flex flex-col items-center">
            <span
              className="text-5xl md:text-6xl font-arcade text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              style={{
                WebkitTextStroke: '3px #1E293B',
                paintOrder: 'stroke fill',
              }}
            >
              {currentScore}
            </span>
            <div className="text-[11px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-md mt-1 backdrop-blur-none border border-slate-300">
              BEST: <span className="tabular-nums font-arcade">{Math.max(highScore, currentScore)}</span>
            </div>
          </div>

          {/* Top-Right Game Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMuteToggle();
              }}
              title={settings.isMuted ? 'Unmute (M)' : 'Mute (M)'}
              className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-95"
            >
              {settings.isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              title={isPaused ? 'Resume (P)' : 'Pause (P)'}
              className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-95"
            >
              {isPaused ? <Play className="w-5 h-5 text-amber-400" /> : <Pause className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="flex justify-center text-center">
          <div className="text-xs font-medium text-slate-700 bg-white/70 px-3 py-1 rounded-full border border-slate-300/80 shadow-sm">
            Space / Tap Flap · [P] Pause · [M] Mute
          </div>
        </div>
      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-20">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4">
              <Pause className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-1">GAME PAUSED</h2>
            <p className="text-sm text-slate-500 mb-6">Take a breather, {character.name} is waiting!</p>

            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" /> RESUME GAME
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.reload();
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors"
              >
                RESTART RUN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
