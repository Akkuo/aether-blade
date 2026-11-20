import { ROOM_COLS, ROOM_ROWS, TILE_SIZE, PLAY_W, PLAY_H, HUD_H, VIEW_W, VIEW_H, DIR, STATE, TILE } from './constants.js';

export class ZeldaRenderer {
  constructor(canvas, atlas, displayCanvas = null) {
    this.canvas = canvas;
    this.displayCanvas = displayCanvas || canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.atlas = atlas;
    this.scale = 3;
    this.resize();
  }

  resize() {
    const rect = this.displayCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(960, Math.round((rect.width || 960) * dpr));
    const h = Math.max(600, Math.round((rect.height || 600) * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.scaleX = this.canvas.width / VIEW_W;
    this.scaleY = this.canvas.height / VIEW_H;
  }

  render(game) {
    const ctx = this.ctx;

    // --- PASS 1: CRISP 16-BIT PIXEL WORLD ---
    ctx.save();
    ctx.setTransform(this.scaleX, 0, 0, this.scaleY, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#0c1018';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // Clip playfield below HUD
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, HUD_H, PLAY_W, PLAY_H);
    ctx.clip();
    ctx.translate(Math.round(game.shakeX), HUD_H + Math.round(game.shakeY));

    if (game.state === STATE.TRANSITION && game.transition) {
      const tr = game.transition;
      const ease = 1 - Math.pow(1 - tr.t, 3);
      const ox = -tr.dx * PLAY_W * ease;
      const oy = -tr.dy * PLAY_H * ease;
      ctx.save();
      ctx.translate(Math.round(ox), Math.round(oy));
      this._drawRoomTiles(ctx, tr.fromRoom, game.world.crystalState, game.time);
      ctx.restore();
      ctx.save();
      ctx.translate(Math.round(ox + tr.dx * PLAY_W), Math.round(oy + tr.dy * PLAY_H));
      this._drawRoomTiles(ctx, tr.toRoom, game.world.crystalState, game.time);
      ctx.restore();
    } else {
      this._drawRoomTiles(ctx, game.room, game.world.crystalState, game.time);
      this._drawRoomEntities(ctx, game);
      this._drawHero(ctx, game);
      this._drawEffects(ctx, game);
      if (game.room.isDungeon) {
        this._drawDungeonLighting(ctx, game);
      }
    }

    ctx.restore();
    ctx.restore();

    // --- PASS 2: NATIVE HI-RES UI, HUD, MINIMAP & DIALOGUE (960x648 logical) ---
    const uiSx = this.canvas.width / 960;
    const uiSy = this.canvas.height / 648;
    ctx.save();
    ctx.setTransform(uiSx, 0, 0, uiSy, 0, 0);
    ctx.imageSmoothingEnabled = false;

    this._drawFloatingTextsHD(ctx, game);
    this._drawZeldaHUD(ctx, game);

    if (game.state === STATE.TITLE) this._drawTitle(ctx, game);
    else if (game.state === STATE.DIALOGUE) this._drawDialogue(ctx, game);
    else if (game.state === STATE.PAUSED) this._drawCenterBanner(ctx, 'PAUSED 暫停中', '[ESC / P] 繼續    [R] 重新開始');
    else if (game.state === STATE.GAME_OVER) this._drawCenterBanner(ctx, '勇者倒下了⋯⋯', '按 [ENTER / SPACE] 重新展開冒險', '#ff647e');
    else if (game.state === STATE.VICTORY) this._drawVictory(ctx, game);

    ctx.restore();
  }

  _drawRoomTiles(ctx, room, crystalState, time) {
    const t = this.atlas.tiles;
    const baseFloor = room.isDungeon ? t.dungeonFloor : t.grass;
    for (let y = 0; y < ROOM_ROWS; y++) {
      for (let x = 0; x < ROOM_COLS; x++) {
        const tile = room.tiles[y * ROOM_COLS + x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        switch (tile) {
          case TILE.GRASS: ctx.drawImage(t.grass, px, py); break;
          case TILE.FLOWERS: ctx.drawImage(t.flowers, px, py); break;
          case TILE.PATH: ctx.drawImage(t.path, px, py); break;
          case TILE.TREE: ctx.drawImage(t.tree, px, py); break;
          case TILE.BUSH: ctx.drawImage(t.bush, px, py); break;
          case TILE.ROCK: ctx.drawImage(t.rock, px, py); break;
          case TILE.CRACKED_WALL: ctx.drawImage(t.cracked, px, py); break;
          case TILE.DUNGEON_FLOOR: ctx.drawImage(t.dungeonFloor, px, py); break;
          case TILE.DUNGEON_WALL: ctx.drawImage(t.dungeonWall, px, py); break;
          case TILE.PUSH_BLOCK: ctx.drawImage(t.pushBlock, px, py); break;
          case TILE.SWITCH: ctx.drawImage(room.switchSolved ? t.switchOn : t.switchOff, px, py); break;
          case TILE.LOCKED_DOOR: ctx.drawImage(t.lockedDoor, px, py); break;
          case TILE.BRIDGE: ctx.drawImage(t.bridge, px, py); break;
          case TILE.STAIRS_IN: ctx.drawImage(t.stairsIn, px, py); break;
          case TILE.STAIRS_OUT: ctx.drawImage(t.stairsOut, px, py); break;
          case TILE.SIGN: ctx.drawImage(t.sign, px, py); break;
          case TILE.PEDESTAL: ctx.drawImage(t.pedestal, px, py); break;
          case TILE.POT:
            ctx.drawImage(baseFloor, px, py);
            ctx.drawImage(t.pot, px, py);
            break;
          case TILE.CRYSTAL_ORB:
            ctx.drawImage(baseFloor, px, py);
            ctx.drawImage(crystalState === 0 ? t.crystalRed : t.crystalBlue, px, py);
            break;
          case TILE.RED_BLOCK:
            ctx.drawImage(baseFloor, px, py);
            ctx.drawImage(crystalState === 0 ? t.redUp : t.redDown, px, py);
            break;
          case TILE.BLUE_BLOCK:
            ctx.drawImage(baseFloor, px, py);
            ctx.drawImage(crystalState === 1 ? t.blueUp : t.blueDown, px, py);
            break;
          case TILE.BRAZIER_OFF:
            ctx.drawImage(baseFloor, px, py);
            ctx.drawImage(t.brazierOff, px, py);
            break;
          case TILE.BRAZIER_ON:
            ctx.drawImage(baseFloor, px, py);
            ctx.drawImage(t.brazierOn, px, py);
            break;
          case TILE.FAIRY_SPRING: {
            ctx.drawImage(t.fairySpring, px, py);
            const fx = px + 8 + Math.cos(time * 4 + x) * 4;
            const fy = py + 8 + Math.sin(time * 5 + y) * 4;
            ctx.fillStyle = '#fff5b0';
            ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2);
            break;
          }
          case TILE.WATER: {
            ctx.fillStyle = '#247bb8';
            ctx.fillRect(px, py, 16, 16);
            ctx.fillStyle = '#52b8f0';
            const shift = Math.floor(Math.sin(time * 3 + x + y) * 2);
            ctx.fillRect(px + 2 + shift, py + 4, 5, 1);
            ctx.fillRect(px + 8 - shift, py + 11, 5, 1);
            break;
          }
          case TILE.TORCH: {
            ctx.drawImage(room.isDungeon ? t.dungeonFloor : t.path, px, py);
            ctx.fillStyle = '#473124';
            ctx.fillRect(px + 6, py + 7, 4, 8);
            const fl = Math.sin(time * 18 + x) > 0;
            ctx.fillStyle = fl ? '#ff9838' : '#ff5e2e';
            ctx.fillRect(px + 5, py + 2, 6, 6);
            ctx.fillStyle = '#fff3a8';
            ctx.fillRect(px + 6, py + 3, 4, 3);
            break;
          }
        }
      }
    }
  }

  _drawRoomEntities(ctx, game) {
    const { room, atlas } = game;

    // Chests
    for (const c of room.chests) {
      ctx.drawImage(c.opened ? this.atlas.items.chestOpen : this.atlas.items.chestClosed, c.x, c.y);
    }

    // Elder / Merchant NPC
    if (room.npc) {
      const spr = room.npc.kind === 'merchant' ? this.atlas.npcs.merchant : this.atlas.npcs.elder;
      ctx.drawImage(spr, room.npc.x, room.npc.y);
    }

    // Shop Display Items
    for (const s of room.shopItems || []) {
      if (s.sold) continue;
      ctx.fillStyle = '#3b2e26';
      ctx.fillRect(s.x - 1, s.y + 6, 14, 6);
      const bob = Math.sin(game.time * 4 + s.x) * 1.2;
      const iconSpr = this.atlas.items[s.icon] || this.atlas.items.bomb;
      ctx.drawImage(iconSpr, Math.round(s.x + 1), Math.round(s.y - 1 + bob));
    }

    // Patrolling Dungeon Blade Traps
    for (const tr of game.traps || []) {
      const tx = Math.round(tr.x);
      const ty = Math.round(tr.y);
      ctx.fillStyle = '#1b1d2b';
      ctx.fillRect(tx, ty, 14, 14);
      ctx.fillStyle = '#8b96b8';
      ctx.fillRect(tx + 2, ty + 2, 10, 10);
      ctx.fillStyle = '#ff4b64';
      ctx.fillRect(tx + 5, ty + 5, 4, 4);
      // Corner spikes
      ctx.fillStyle = '#edf2ff';
      ctx.fillRect(tx - 1, ty + 6, 2, 2);
      ctx.fillRect(tx + 13, ty + 6, 2, 2);
      ctx.fillRect(tx + 6, ty - 1, 2, 2);
      ctx.fillRect(tx + 6, ty + 13, 2, 2);
    }

    // Drops
    for (const d of game.drops) {
      const bob = Math.sin(game.time * 6 + d.x) * 1.5;
      const spr = d.kind === 'rupee' ? this.atlas.items.rupee : d.kind === 'heart' ? this.atlas.items.heartFull : this.atlas.items.bomb;
      ctx.drawImage(spr, Math.round(d.x), Math.round(d.y + bob));
    }

    // Bombs
    for (const b of game.bombs) {
      const flash = b.fuse < 0.5 && Math.floor(game.time * 22) % 2 === 0;
      ctx.drawImage(this.atlas.items.bomb, Math.round(b.x), Math.round(b.y));
      if (flash) {
        ctx.fillStyle = 'rgba(255, 100, 80, 0.7)';
        ctx.fillRect(Math.round(b.x), Math.round(b.y), 9, 9);
      }
    }

    // Boomerang
    if (game.boomerang) {
      ctx.save();
      ctx.translate(game.boomerang.x + 4, game.boomerang.y + 4);
      ctx.rotate(game.time * 18);
      ctx.drawImage(this.atlas.items.boomerang, -4, -4);
      ctx.restore();
    }

    // Enemies
    for (const e of game.enemies) {
      if (!e.alive) continue;
      if (e.hurtTimer > 0 && Math.floor(game.time * 24) % 2 === 0) continue;
      const spr =
        e.type === 'octorok'
          ? this.atlas.enemies.octorok
          : e.type === 'stalfos'
          ? this.atlas.enemies.stalfos
          : e.type === 'bat'
          ? this.atlas.enemies.bat
          : this.atlas.enemies.slime;
      const jitter = e.stunTimer > 0 ? Math.sin(game.time * 40) * 1.5 : 0;
      ctx.drawImage(spr, Math.round(e.x - 2 + jitter), Math.round(e.y - 2));
    }

    // Boss (Ignis Guardian)
    if (game.boss && game.boss.alive) {
      const b = game.boss;
      const flash = b.hurtTimer > 0 && Math.floor(game.time * 24) % 2 === 0;
      const bx = Math.round(b.x);
      const by = Math.round(b.y);
      ctx.fillStyle = flash ? '#ffffff' : b.stunTimer > 0 ? '#3aa8d8' : '#7a1f24';
      ctx.fillRect(bx, by, 28, 28);
      ctx.fillStyle = flash ? '#ffffff' : '#d9452e';
      ctx.fillRect(bx + 2, by + 2, 24, 24);
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(bx + 6, by + 8, 5, 5);
      ctx.fillRect(bx + 17, by + 8, 5, 5);
      ctx.fillStyle = '#fff8c4';
      ctx.fillRect(bx + 10, by + 16, 8, 6);
    }

    // Aether Triforce Relic
    if (game.relic) {
      const rx = game.relic.x + 6;
      const ry = game.relic.y + 6 + Math.sin(game.time * 5) * 2;
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.moveTo(rx, ry - 7);
      ctx.lineTo(rx + 7, ry + 5);
      ctx.lineTo(rx - 7, ry + 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx - 1, ry - 2, 2, 4);
    }

    // Projectiles
    for (const pr of game.projectiles) {
      if (pr.kind === 'beam') {
        ctx.fillStyle = game.player.swordLevel >= 2 ? '#ffd54f' : '#7ef7ff';
        ctx.fillRect(Math.round(pr.x), Math.round(pr.y), 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(pr.x + 1), Math.round(pr.y + 1), 4, 4);
      } else if (pr.kind === 'fire' || pr.kind === 'player_fire') {
        ctx.fillStyle = '#ff5e2e';
        ctx.fillRect(Math.round(pr.x), Math.round(pr.y), 7, 7);
        ctx.fillStyle = '#fff08a';
        ctx.fillRect(Math.round(pr.x + 1), Math.round(pr.y + 1), 4, 4);
      } else {
        ctx.fillStyle = '#9c7858';
        ctx.fillRect(Math.round(pr.x), Math.round(pr.y), 6, 6);
      }
    }
  }

  _drawHero(ctx, game) {
    const p = game.player;
    if (p.invulnTimer > 0 && Math.floor(game.time * 20) % 2 === 0) return;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(Math.round(p.x + 1), Math.round(p.y + 10), 10, 4);

    // Charge aura
    if (p.chargeTimer >= 0.3) {
      ctx.strokeStyle = p.chargeTimer >= 0.45 ? '#7ef7ff' : '#ffe066';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x + 6, p.y + 6, 9 + Math.sin(game.time * 24) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    const spr =
      p.dir === DIR.UP
        ? this.atlas.hero.up
        : p.dir === DIR.LEFT
        ? this.atlas.hero.left
        : p.dir === DIR.RIGHT
        ? this.atlas.hero.right
        : this.atlas.hero.down;

    const bob = p.rollTimer > 0 ? -2 : Math.sin(p.walkAnim) * 0.8;
    ctx.drawImage(spr, Math.round(p.x - 2), Math.round(p.y - 3 + bob));

    // Sword Arc / Spin Attack Visual
    if (p.spinTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#9effe8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x + 6, p.y + 6, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (p.attackTimer > 0) {
      const prog = 1 - p.attackTimer / 0.16;
      const baseAngle =
        p.dir === DIR.RIGHT ? 0 : p.dir === DIR.DOWN ? Math.PI * 0.5 : p.dir === DIR.LEFT ? Math.PI : -Math.PI * 0.5;
      const a0 = baseAngle - 1.1 + prog * 1.8;
      ctx.save();
      ctx.translate(p.x + 6, p.y + 6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, baseAngle - 1.1, a0);
      ctx.stroke();
      ctx.strokeStyle = p.swordLevel >= 2 ? '#ffd54f' : '#7ef7ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a0) * 16, Math.sin(a0) * 16);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawEffects(ctx, game) {
    for (const pt of game.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
  }

  _drawDungeonLighting(ctx, game) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, col) => {
      const g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    glow(game.player.x + 6, game.player.y + 6, 36, 'rgba(130, 230, 255, 0.16)');
    for (let y = 0; y < ROOM_ROWS; y++) {
      for (let x = 0; x < ROOM_COLS; x++) {
        const tile = game.room.tiles[y * ROOM_COLS + x];
        if (tile === TILE.TORCH || tile === TILE.BRAZIER_ON) {
          const r = 34 + Math.sin(game.time * 12 + x) * 3;
          glow(x * 16 + 8, y * 16 + 6, r, 'rgba(255, 164, 62, 0.30)');
        }
      }
    }
    if (game.boss && game.boss.alive) {
      glow(game.boss.x + 14, game.boss.y + 14, 48, 'rgba(255, 110, 48, 0.32)');
    }
    ctx.restore();
  }

  _drawFloatingTextsHD(ctx, game) {
    ctx.font = '700 15px "Noto Sans TC", "Microsoft JhengHei", ui-monospace, sans-serif';
    ctx.textAlign = 'center';
    // Shop price labels in crisp HD
    for (const s of game.room.shopItems || []) {
      if (s.sold) continue;
      const sx = (s.x + 6) * 3;
      const sy = (HUD_H + s.y + 18) * 3;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(10, 12, 18, 0.92)';
      const tag = `${s.label} ${s.price}R`;
      ctx.strokeText(tag, sx, sy);
      ctx.fillStyle = game.player.rupees >= s.price ? '#ffe066' : '#ff8a9e';
      ctx.fillText(tag, sx, sy);
    }
    for (const t of game.texts) {
      const sx = t.x * 3;
      const sy = (HUD_H + t.y) * 3;
      ctx.globalAlpha = Math.min(1, (t.life / t.maxLife) * 1.4);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(10, 12, 18, 0.9)';
      ctx.strokeText(t.text, sx, sy);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, sx, sy);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  _drawZeldaHUD(ctx, game) {
    const p = game.player;
    const UI_FONT = '"Noto Sans TC", "Microsoft JhengHei", ui-monospace, sans-serif';

    ctx.fillStyle = '#0d1218';
    ctx.fillRect(0, 0, 960, 72);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, 71, 960, 2);

    // Minimap (left)
    const isD = game.zone === 'dungeon';
    const cols = isD ? 2 : 3;
    const rows = 2;
    ctx.fillStyle = '#18212b';
    ctx.fillRect(14, 10, 96, 52);
    ctx.strokeStyle = '#3a4a5e';
    ctx.strokeRect(14.5, 10.5, 95, 51);
    const cellW = 26;
    const cellH = 18;
    const ox = isD ? 36 : 23;
    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const visited = game.world.visited.has(`${game.zone}:${rx},${ry}`);
        const curr = rx === game.rx && ry === game.ry;
        ctx.fillStyle = curr ? '#ffd54f' : visited ? (isD ? '#5d6b8f' : '#3a9958') : '#232c38';
        ctx.fillRect(ox + rx * (cellW + 3), 16 + ry * (cellH + 3), cellW, cellH);
      }
    }

    // Room Name
    ctx.font = `700 15px ${UI_FONT}`;
    ctx.fillStyle = isD ? '#ffd085' : '#a8ffb8';
    ctx.fillText(game.room.name, 126, 28);

    // Equipped Item Slot
    ctx.fillStyle = '#1b2430';
    ctx.fillRect(126, 36, 162, 26);
    ctx.strokeStyle = '#4f6580';
    ctx.strokeRect(126.5, 36.5, 161, 25);
    const eqIcon =
      p.equipped === 'boomerang'
        ? this.atlas.items.boomerang
        : p.equipped === 'fire_rod'
        ? this.atlas.items.fireRod
        : this.atlas.items.bomb;
    ctx.drawImage(eqIcon, 134, 41, 18, 16);
    ctx.font = `700 13px ${UI_FONT}`;
    ctx.fillStyle = '#eaf4ff';
    const eqText =
      p.equipped === 'boomerang'
        ? '裝備：迴力鏢 [E]'
        : p.equipped === 'fire_rod'
        ? '裝備：聖火法杖 [E]'
        : `裝備：炸彈 x${p.bombs} [E]`;
    ctx.fillText(eqText, 158, 54);

    // Counters (Rupees / Keys / Bombs)
    ctx.drawImage(this.atlas.items.rupee, 304, 24, 18, 22);
    ctx.font = '700 18px ui-monospace, monospace';
    ctx.fillStyle = '#6df598';
    ctx.fillText(`${p.rupees}`, 328, 42);

    ctx.drawImage(this.atlas.items.key, 396, 24, 18, 22);
    ctx.fillStyle = '#ffd54f';
    ctx.fillText(`${p.keys}`, 420, 42);

    ctx.drawImage(this.atlas.items.bomb, 470, 24, 20, 22);
    ctx.fillStyle = '#c8d6f0';
    ctx.fillText(`${p.bombs}`, 496, 42);

    // Hearts (right side)
    ctx.font = `700 13px ${UI_FONT}`;
    ctx.fillStyle = '#ff8a9e';
    ctx.fillText('— LIFE —', 744, 22);
    const totalHearts = Math.ceil(p.maxHp / 2);
    for (let i = 0; i < totalHearts; i++) {
      const full = p.hp >= (i + 1) * 2;
      const half = !full && p.hp === i * 2 + 1;
      const hx = 680 + i * 32;
      ctx.drawImage(this.atlas.items.heartEmpty, hx, 30, 26, 24);
      if (full) ctx.drawImage(this.atlas.items.heartFull, hx, 30, 26, 24);
      else if (half) ctx.drawImage(this.atlas.items.heartFull, 0, 0, 5, 9, hx, 30, 13, 24);
    }

    // Boss HP Bar
    if (game.boss && game.boss.alive) {
      ctx.fillStyle = 'rgba(12, 10, 18, 0.85)';
      ctx.fillRect(280, 86, 400, 38);
      ctx.fillStyle = '#ff9868';
      ctx.font = `700 14px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('IGNIS GUARDIAN — 炎核守衛', 480, 103);
      ctx.fillStyle = '#2d1c24';
      ctx.fillRect(296, 110, 368, 8);
      ctx.fillStyle = '#ff5e38';
      ctx.fillRect(296, 110, 368 * (game.boss.hp / game.boss.maxHp), 8);
      ctx.textAlign = 'left';
    }
  }

  _drawDialogue(ctx, game) {
    const UI_FONT = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = 'rgba(10, 14, 24, 0.92)';
    ctx.fillRect(60, 472, 840, 144);
    ctx.strokeStyle = '#ffd561';
    ctx.lineWidth = 3;
    ctx.strokeRect(61.5, 473.5, 837, 141);

    ctx.font = `800 18px ${UI_FONT}`;
    ctx.fillStyle = '#ffd561';
    ctx.fillText(game.dialogueSpeaker, 86, 506);

    ctx.font = `600 18px ${UI_FONT}`;
    ctx.fillStyle = '#f2f7ff';
    // Simple wrap for CJK text
    const maxChars = 38;
    const text = game.dialogueText;
    let y = 540;
    for (let i = 0; i < text.length; i += maxChars) {
      ctx.fillText(text.slice(i, i + maxChars), 86, y);
      y += 28;
    }

    ctx.font = `600 13px ${UI_FONT}`;
    ctx.fillStyle = '#8effb0';
    ctx.textAlign = 'right';
    ctx.fillText('按 [SPACE / ENTER] 繼續 ▼', 876, 600);
    ctx.textAlign = 'left';
  }

  _drawTitle(ctx, game) {
    const UI_FONT = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = 'rgba(8, 16, 12, 0.72)';
    ctx.fillRect(0, 72, 960, 576);
    ctx.textAlign = 'center';

    const bob = Math.sin(game.time * 3) * 6;
    ctx.font = '900 62px ui-monospace, "Cascadia Mono", monospace';
    ctx.fillStyle = '#0c1c12';
    ctx.fillText('AETHER BLADE', 484, 234 + bob);
    ctx.fillStyle = '#ffe066';
    ctx.fillText('AETHER BLADE', 480, 230 + bob);

    ctx.font = `700 24px ${UI_FONT}`;
    ctx.fillStyle = '#9effb8';
    ctx.fillText('— 聖 樹 傳 說 ： 俯 視 冒 險 —', 480, 276 + bob);

    ctx.font = `600 16px ${UI_FONT}`;
    ctx.fillStyle = '#d4e8d8';
    ctx.fillText('無縫捲動大地圖  •  滿血劍氣 & 蓄力迴旋斬  •  迴力鏢 & 炸彈解謎  •  古神殿推箱機關與 BOSS 戰', 480, 344);

    const pulse = 0.65 + 0.35 * Math.sin(game.time * 5);
    ctx.fillStyle = `rgba(255, 240, 150, ${pulse.toFixed(2)})`;
    ctx.font = `700 22px ${UI_FONT}`;
    ctx.fillText('按 [ENTER] 或 [SPACE] 展開冒險', 480, 434);
    ctx.textAlign = 'left';
  }

  _drawCenterBanner(ctx, title, sub, color = '#ffffff') {
    const UI_FONT = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = 'rgba(6, 10, 14, 0.76)';
    ctx.fillRect(0, 72, 960, 576);
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = `800 40px ${UI_FONT}`;
    ctx.fillText(title, 480, 310);
    ctx.fillStyle = '#d4e4f4';
    ctx.font = `600 19px ${UI_FONT}`;
    ctx.fillText(sub, 480, 366);
    ctx.textAlign = 'left';
  }

  _drawVictory(ctx, game) {
    const UI_FONT = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = 'rgba(10, 14, 22, 0.84)';
    ctx.fillRect(0, 72, 960, 576);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe066';
    ctx.font = '900 46px ui-monospace, monospace';
    ctx.fillText('LEGEND FULFILLED!', 480, 250);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 24px ${UI_FONT}`;
    ctx.fillText('你擊敗了炎核守衛，奪回【聖樹之印】！', 480, 306);
    ctx.fillStyle = '#9effb8';
    ctx.font = `600 20px ${UI_FONT}`;
    ctx.fillText(`收集盧比：${game.player.rupees}    最大生命：${game.player.maxHp / 2} 顆心`, 480, 356);
    ctx.fillStyle = '#d4e8ff';
    ctx.font = `600 18px ${UI_FONT}`;
    ctx.fillText('按 [ENTER / SPACE] 再次踏上旅程', 480, 424);
    ctx.textAlign = 'left';
  }
}
