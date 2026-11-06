import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCircleRectCollision,
  checkBoundaryCollision,
  checkPipeCollision,
  applyFlap,
  updateBirdPhysics,
  getDifficultyConfig,
  createPipe,
  BirdState,
} from './physics';

test('checkCircleRectCollision detects intersecting circle and rectangle', () => {
  // Circle at (100, 100) with r=20
  // Rect at (90, 90, 40, 40) overlaps
  assert.equal(checkCircleRectCollision(100, 100, 20, 90, 90, 40, 40), true);

  // Rect far away at (200, 200, 30, 30)
  assert.equal(checkCircleRectCollision(100, 100, 20, 200, 200, 30, 30), false);

  // Circle tangent on edge: distance 25 from center to rect, radius 20 -> no collision
  assert.equal(checkCircleRectCollision(100, 100, 20, 125, 90, 40, 40), false);

  // Circle overlapping edge: distance 15 from center to rect, radius 20 -> collision
  assert.equal(checkCircleRectCollision(100, 100, 20, 115, 90, 40, 40), true);
});

test('checkBoundaryCollision detects ground and ceiling', () => {
  const bird: BirdState = { x: 100, y: 15, vy: 0, radius: 20, rotation: 0 };
  const groundY = 600;

  // y = 15, radius = 20 -> hits ceiling (15 - 20 <= 0)
  assert.equal(checkBoundaryCollision(bird, groundY), true);

  // Safe middle
  const safeBird: BirdState = { x: 100, y: 300, vy: 0, radius: 20, rotation: 0 };
  assert.equal(checkBoundaryCollision(safeBird, groundY), false);

  // Hits ground (585 + 20 >= 600)
  const groundBird: BirdState = { x: 100, y: 585, vy: 0, radius: 20, rotation: 0 };
  assert.equal(checkBoundaryCollision(groundBird, groundY), true);
});

test('applyFlap gives upward velocity and tilts bird up', () => {
  const bird: BirdState = { x: 100, y: 200, vy: 5, radius: 22, rotation: 0.5 };
  const jumped = applyFlap(bird, -8.5);

  assert.equal(jumped.vy, -8.5);
  assert.equal(jumped.rotation, -0.35);
  assert.equal(jumped.x, 100);
  assert.equal(jumped.y, 200);
});

test('updateBirdPhysics applies gravity correctly', () => {
  const bird: BirdState = { x: 100, y: 100, vy: 0, radius: 22, rotation: 0 };
  const updated = updateBirdPhysics(bird, 0.5, 1.0);

  assert.equal(updated.vy, 0.5);
  assert.equal(updated.y, 100.5);
});

test('difficulty configuration scales gracefully with score', () => {
  const easyStart = getDifficultyConfig('easy', 0);
  const easyMid = getDifficultyConfig('easy', 15);
  assert.ok(easyMid.pipeSpeed > easyStart.pipeSpeed);
  assert.ok(easyMid.gapSize <= easyStart.gapSize);

  const spicyStart = getDifficultyConfig('spicy', 0);
  assert.ok(spicyStart.pipeSpeed > easyStart.pipeSpeed);
});

test('createPipe builds valid top and bottom pipes with exact gap', () => {
  const canvasHeight = 700;
  const groundHeight = 100;
  const gapSize = 150;
  const pipe = createPipe(400, canvasHeight, groundHeight, gapSize, 65);

  assert.equal(pipe.x, 400);
  assert.equal(pipe.width, 65);
  assert.equal(pipe.passed, false);
  // Total playable height is 600, topHeight + bottomHeight + gap must equal 600
  const total = pipe.topHeight + pipe.bottomHeight + pipe.gap;
  assert.ok(Math.abs(total - (canvasHeight - groundHeight)) < 0.001);
});

test('checkPipeCollision correctly detects bird crashing into top pipe', () => {
  const pipe = {
    x: 100,
    topHeight: 180,
    bottomHeight: 250,
    gap: 170,
    width: 60,
    passed: false,
  };

  // Bird is at x=120, y=100 (inside top pipe area)
  const crashingBird: BirdState = { x: 120, y: 100, vy: 0, radius: 24, rotation: 0 };
  assert.equal(checkPipeCollision(crashingBird, pipe, 600), true);

  // Bird is right in the safe gap: y = 260
  const safeBird: BirdState = { x: 120, y: 260, vy: 0, radius: 24, rotation: 0 };
  assert.equal(checkPipeCollision(safeBird, pipe, 600), false);
});
