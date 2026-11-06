import { GameDifficulty, PipeData } from './types';

export interface BirdState {
  x: number;
  y: number;
  vy: number;
  radius: number;
  rotation: number;
}

export interface DifficultyConfig {
  pipeSpeed: number;
  gapSize: number;
  gravity: number;
  jumpVelocity: number;
  pipeDistance: number;
}

export function getDifficultyConfig(difficulty: GameDifficulty, score: number): DifficultyConfig {
  switch (difficulty) {
    case 'easy':
      return {
        pipeSpeed: 2.0 + Math.min(score * 0.03, 1.0),
        gapSize: Math.max(170 - score * 0.5, 145),
        gravity: 0.38,
        jumpVelocity: -7.5,
        pipeDistance: 230,
      };
    case 'spicy':
      return {
        pipeSpeed: 2.8 + Math.min(score * 0.06, 2.0),
        gapSize: Math.max(140 - score * 0.8, 110),
        gravity: 0.46,
        jumpVelocity: -8.8,
        pipeDistance: 195,
      };
    case 'normal':
    default:
      return {
        pipeSpeed: 2.4 + Math.min(score * 0.04, 1.4),
        gapSize: Math.max(155 - score * 0.6, 125),
        gravity: 0.42,
        jumpVelocity: -8.2,
        pipeDistance: 215,
      };
  }
}

/**
 * Checks circle (bird) against axis-aligned rectangle (pipe segment).
 * cx, cy: circle center
 * r: circle radius
 * rx, ry, rw, rh: rectangle position and dimensions
 */
export function checkCircleRectCollision(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  const dx = cx - closestX;
  const dy = cy - closestY;

  return dx * dx + dy * dy < r * r;
}

/**
 * Checks if bird collides with a pipe pair (top or bottom pipe).
 */
export function checkPipeCollision(
  bird: BirdState,
  pipe: PipeData,
  canvasHeight: number
): boolean {
  // Hitbox margin gives a tiny bit of forgiving arcade grace (15% padding)
  const collisionRadius = bird.radius * 0.85;

  // Top pipe rectangle
  const topCollision = checkCircleRectCollision(
    bird.x,
    bird.y,
    collisionRadius,
    pipe.x,
    0,
    pipe.width,
    pipe.topHeight
  );

  if (topCollision) return true;

  // Bottom pipe rectangle
  const bottomY = canvasHeight - pipe.bottomHeight;
  const bottomCollision = checkCircleRectCollision(
    bird.x,
    bird.y,
    collisionRadius,
    pipe.x,
    bottomY,
    pipe.width,
    pipe.bottomHeight
  );

  return bottomCollision;
}

/**
 * Checks if bird hits ceiling or ground.
 */
export function checkBoundaryCollision(
  bird: BirdState,
  groundY: number
): boolean {
  // Hit ceiling
  if (bird.y - bird.radius <= 0) {
    return true;
  }
  // Hit ground
  if (bird.y + bird.radius >= groundY) {
    return true;
  }
  return false;
}

/**
 * Applies a jump impulse to the bird.
 */
export function applyFlap(bird: BirdState, jumpVelocity: number): BirdState {
  return {
    ...bird,
    vy: jumpVelocity,
    rotation: -0.35, // Tilt upwards
  };
}

/**
 * Updates physics for one simulation tick.
 */
export function updateBirdPhysics(
  bird: BirdState,
  gravity: number,
  timeScale: number = 1.0
): BirdState {
  const newVy = bird.vy + gravity * timeScale;
  const newY = bird.y + newVy * timeScale;

  // Smooth rotation: pointing up when rising, diving down when falling
  let targetRotation = -0.35;
  if (newVy > 0) {
    targetRotation = Math.min(Math.PI / 2.2, newVy * 0.08);
  }
  const newRotation = bird.rotation + (targetRotation - bird.rotation) * 0.12 * timeScale;

  return {
    ...bird,
    y: newY,
    vy: newVy,
    rotation: newRotation,
  };
}

/**
 * Generates a new pipe obstacle given canvas height and gap size.
 */
export function createPipe(
  x: number,
  canvasHeight: number,
  groundHeight: number,
  gapSize: number,
  pipeWidth: number = 68
): PipeData {
  const playableHeight = canvasHeight - groundHeight;
  const minPipeHeight = 60;
  const maxAvailable = playableHeight - gapSize - (minPipeHeight * 2);

  // Randomize top height within safe boundaries
  const randomFactor = Math.random();
  const topHeight = minPipeHeight + (randomFactor * Math.max(0, maxAvailable));
  const bottomHeight = playableHeight - topHeight - gapSize;

  return {
    x,
    topHeight,
    bottomHeight,
    gap: gapSize,
    width: pipeWidth,
    passed: false,
  };
}
