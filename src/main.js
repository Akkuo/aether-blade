import { SoundEngine } from './audio.js';
import { createAtlas } from './sprites.js';
import { WebGLPost } from './webgl-post.js';
import { ZeldaRenderer } from './renderer.js';
import { ZeldaGame } from './game.js';

const displayCanvas = document.getElementById('game');
const canvasWrap = document.getElementById('canvas-wrap');
const areaPill = document.getElementById('area-pill');

const sound = new SoundEngine();
const atlas = createAtlas();
const post = new WebGLPost(displayCanvas);
const renderCanvas = post.supported ? document.createElement('canvas') : displayCanvas;
const renderer = new ZeldaRenderer(renderCanvas, atlas, displayCanvas);
window.addEventListener('resize', () => renderer.resize());

function syncAreaUI(room) {
  canvasWrap.classList.toggle('in-dungeon', room.isDungeon);
  areaPill.className = `badge ${room.isDungeon ? 'dungeon' : ''}`;
  areaPill.textContent = room.isDungeon ? 'DUNGEON 古神殿' : 'OVERWORLD 聖樹平原';
}

const game = new ZeldaGame(sound, syncAreaUI, (strength) => post.pulse(strength));

const keys = new Set();
const justPressed = new Set();
const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

window.addEventListener('keydown', (e) => {
  sound.unlock();
  if (PREVENT.has(e.code)) e.preventDefault();
  if (!keys.has(e.code)) justPressed.add(e.code);
  keys.add(e.code);
  if (e.code === 'KeyM') sound.toggleMute();
  if (e.code === 'KeyG') post.enabled = !post.enabled;
});

window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());
displayCanvas.addEventListener('pointerdown', () => sound.unlock());

function readInput() {
  const down = (...c) => c.some((k) => keys.has(k));
  const pressed = (...c) => c.some((k) => justPressed.has(k));
  const inp = {
    left: down('ArrowLeft', 'KeyA'),
    right: down('ArrowRight', 'KeyD'),
    up: down('ArrowUp', 'KeyW'),
    down: down('ArrowDown', 'KeyS'),
    attack: down('Space', 'KeyZ', 'KeyJ'),
    attackPressed: pressed('Space', 'KeyZ', 'KeyJ'),
    itemPressed: pressed('KeyE', 'KeyX', 'KeyK'),
    cyclePressed: pressed('KeyQ', 'Tab'),
    rollPressed: pressed('ShiftLeft', 'ShiftRight'),
    startPressed: pressed('Enter'),
    pausePressed: pressed('Escape', 'KeyP'),
    restartPressed: pressed('KeyR'),
  };
  justPressed.clear();
  return inp;
}

const STEP = 1 / 60;
let acc = 0;
let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  acc += dt;
  while (acc >= STEP) {
    game.update(STEP, readInput());
    post.update(STEP);
    acc -= STEP;
  }
  renderer.render(game);
  if (post.supported) post.render(renderCanvas);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
