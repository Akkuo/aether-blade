import { ROOM_COLS, ROOM_ROWS, TILE } from './constants.js';

/*
  Legend (20 cols x 12 rows):
  . = Grass (Overworld) / Dungeon Floor (Dungeon)
  p = Dirt Path
  f = Flowers
  T = Tree
  ~ = Water
  = = Bridge
  b = Cuttable Bush
  r = Rock
  W = Dungeon Wall
  X = Cracked Wall (Bombable!)
  P = Pushable Stone Block
  S = Floor Pressure Switch
  D = Locked Door (uses Small Key)
  t = Glowing Torch
  v = Stairs Down (enter dungeon)
  ^ = Stairs Up (exit dungeon)
  i = Signpost
  O = Pedestal
*/

const OVERWORLD_ROOMS = {
  '0,1': {
    name: '聖樹平原 — 旅途起點',
    isDungeon: false,
    grid: [
      'TTTTTTTTTppTTTTTTTTT',
      'T..f....pppp....f..T',
      'T..bb...p..p...bb..T',
      'T.......p..p.......T',
      'T..i....pppp.......T',
      'T.......pppppppppppp',
      'T..f....pppppppppppp',
      'T.......p..........T',
      'T..bbb..p....bbb...T',
      'T..b.b..p....f.....T',
      'T.......f..........T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    npc: { x: 10 * 16, y: 2 * 16 + 4, name: '長老', text: '勇者啊！東方森林藏著【迴力鏢】，北方裂岩可用【炸彈】炸開。收集鑰匙進入古神殿擊敗炎核守衛吧！' },
    signText: '路標：往東 → 低語森林（寶箱）｜ 往北 ↑ 裂岩密道',
    enemies: [{ type: 'slime', x: 14 * 16, y: 8 * 16 }],
    chests: [],
  },
  '1,1': {
    name: '低語森林 — 迴力鏢之林',
    isDungeon: false,
    grid: [
      'TTTTTTTTTppTTTTTTTTT',
      'T..bbbb..pp..bbbb..T',
      'T..b..b..pp..b..b..T',
      'T..b..b..pp..b.....T',
      'T........pp........T',
      'pppppppppppppppppppp',
      'pppppppppppppppppppp',
      'T..f.....bb.....f..T',
      'T..bb...bbbb...bb..T',
      'T.......b..b.......T',
      'T...f..........f...T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    enemies: [
      { type: 'slime', x: 5 * 16, y: 3 * 16 },
      { type: 'slime', x: 14 * 16, y: 8 * 16 },
      { type: 'octorok', x: 15 * 16, y: 3 * 16 },
    ],
    chests: [{ id: 'forest_boomerang', x: 4 * 16, y: 2 * 16, reward: 'boomerang', text: '獲得【疾風迴力鏢】！按 Q 切換道具、E 投擲，可擊暈敵人並回收戰利品！' }],
  },
  '2,1': {
    name: '湖畔遺跡 — 翠綠水域',
    isDungeon: false,
    grid: [
      'TTTTTTTTTppTTTTTTTTT',
      'T~~~~~~~pppp~~~~~~~T',
      'T~~~~~~~p..p~~~~~~~T',
      'T~~~....p..p....~~~T',
      'T~~~.bb.p..p.bb.~~~T',
      'pppp====pppp====...T',
      'pppp====pppp====...T',
      'T~~~.f..p..p..f.~~~T',
      'T~~~....p..p....~~~T',
      'T~~~~~~~....~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    enemies: [
      { type: 'octorok', x: 15 * 16, y: 3 * 16 },
      { type: 'octorok', x: 15 * 16, y: 8 * 16 },
    ],
    chests: [{ id: 'lake_heart', x: 17 * 16, y: 5 * 16, reward: 'heart_container', text: '獲得【生命之心容器】！最大生命值永久 +1 顆心！' }],
  },
  '0,0': {
    name: '裂岩密道 — 隱藏寶庫',
    isDungeon: false,
    grid: [
      'TTTTTTTTTTTTTTTTTTTT',
      'TWWWWWWWXWWWWWWWW..T',
      'TW.....W.W......W..T',
      'TW.....W.W..bb..W..T',
      'TW.....WXW......W..T',
      'TWWWWWWW.WWWWWW.pppp',
      'T........p......pppp',
      'T..f.....p...r.....T',
      'T..r.....p.........T',
      'T........pp........T',
      'T..bb....pp....f...T',
      'TTTTTTTTTppTTTTTTTTT',
    ],
    signText: '裂開的石壁可以用【炸彈 (Q切換/E放置)】炸開！',
    enemies: [{ type: 'slime', x: 12 * 16, y: 8 * 16 }],
    chests: [{ id: 'ravine_key', x: 4 * 16, y: 2 * 16, reward: 'key', text: '獲得【古神殿小鑰匙】！可以用來開啟神殿深處的上鎖大門！' }],
  },
  '1,0': {
    name: '古神殿前庭 — 聖殿入口',
    isDungeon: false,
    grid: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T..WWWWWWWWWWWWWW..T',
      'T..W............W..T',
      'T..W....t..t....W..T',
      'T..W.....vv.....W..T',
      'pppp....pppp....pppp',
      'pppp....pppp....pppp',
      'T..f....pppp....f..T',
      'T..bb....pp....bb..T',
      'T........pp........T',
      'T...i....pp........T',
      'TTTTTTTTTppTTTTTTTTT',
    ],
    signText: '古神殿入口：裡面棲息著炎核守衛，準備好迴力鏢與炸彈再往下走！',
    enemies: [
      { type: 'octorok', x: 5 * 16, y: 8 * 16 },
      { type: 'slime', x: 14 * 16, y: 8 * 16 },
    ],
    chests: [],
  },
  '2,0': {
    name: '東境石陣 — 補給聖壇',
    isDungeon: false,
    grid: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T...r....f.....r...T',
      'T..rrr..bbb...rrr..T',
      'T..................T',
      'T....b........b....T',
      'pppppp........b....T',
      'pppppp.............T',
      'T....f...pp...f....T',
      'T..r.....pp.....r..T',
      'T........pp........T',
      'T..bb....pp....bb..T',
      'TTTTTTTTTppTTTTTTTTT',
    ],
    enemies: [{ type: 'stalfos', x: 12 * 16, y: 4 * 16 }],
    chests: [{ id: 'east_bombs', x: 15 * 16, y: 3 * 16, reward: 'bombs', text: '獲得【炸彈補給袋】！炸彈 +5 顆！' }],
  },
};

const DUNGEON_ROOMS = {
  '0,1': {
    name: '古神殿 1F — 幽暗玄關',
    isDungeon: true,
    grid: [
      'WWWWWWWWW..WWWWWWWWW',
      'W..t............t..W',
      'W..................W',
      'W....W........W....W',
      'W..................W',
      'W..................D',
      'W..................D',
      'W..................W',
      'W....W........W....W',
      'W........^^........W',
      'W..t............t..W',
      'WWWWWWWWWWWWWWWWWWWW',
    ],
    enemies: [
      { type: 'stalfos', x: 6 * 16, y: 4 * 16 },
      { type: 'stalfos', x: 13 * 16, y: 6 * 16 },
    ],
    chests: [],
  },
  '0,0': {
    name: '古神殿 1F — 機關石室',
    isDungeon: true,
    grid: [
      'WWWWWWWWWWWWWWWWWWWW',
      'W..t............t..W',
      'W..................W',
      'W......S....P......W',
      'W..................W',
      'W....W........W....W',
      'W....W........W....W',
      'W..................W',
      'W..................W',
      'W..t............t..W',
      'W..................W',
      'WWWWWWWWW..WWWWWWWWW',
    ],
    puzzleChest: { id: 'dungeon_switch_key', x: 9 * 16 + 8, y: 2 * 16, reward: 'key', text: '解開機關！獲得【古神殿小鑰匙】！' },
    enemies: [{ type: 'bat', x: 5 * 16, y: 6 * 16 }, { type: 'bat', x: 14 * 16, y: 6 * 16 }],
    chests: [],
  },
  '1,1': {
    name: '古神殿 1F — 暗影迴廊',
    isDungeon: true,
    grid: [
      'WWWWWWWWWDDWWWWWWWWW',
      'W..t............t..W',
      'W....W........W....W',
      'W..................W',
      'W......WWXXWW......W',
      '...................W',
      '...................W',
      'W..................W',
      'W....W........W....W',
      'W..t............t..W',
      'W..................W',
      'WWWWWWWWWWWWWWWWWWWW',
    ],
    enemies: [
      { type: 'bat', x: 6 * 16, y: 3 * 16 },
      { type: 'bat', x: 13 * 16, y: 3 * 16 },
      { type: 'stalfos', x: 10 * 16, y: 7 * 16 },
    ],
    chests: [{ id: 'dungeon_bombs', x: 16 * 16, y: 2 * 16, reward: 'bombs', text: '獲得【炸彈補給袋】！炸彈 +5 顆，準備迎接炎核守衛！' }],
  },
  '1,0': {
    name: '古神殿最深處 — 炎核聖壇 (BOSS)',
    isDungeon: true,
    grid: [
      'WWWWWWWWWWWWWWWWWWWW',
      'W..t............t..W',
      'W..................W',
      'W..................W',
      'W..................W',
      'W.........O........W',
      'W..................W',
      'W..................W',
      'W..................W',
      'W..t............t..W',
      'W..................W',
      'WWWWWWWWW..WWWWWWWWW',
    ],
    enemies: [],
    hasBoss: true,
    chests: [],
  },
};

function parseGrid(grid, isDungeon) {
  const tiles = new Uint8Array(ROOM_COLS * ROOM_ROWS);
  for (let y = 0; y < ROOM_ROWS; y++) {
    const row = grid[y];
    for (let x = 0; x < ROOM_COLS; x++) {
      const ch = row[x] || '.';
      let t = isDungeon ? TILE.DUNGEON_FLOOR : TILE.GRASS;
      switch (ch) {
        case '.': t = isDungeon ? TILE.DUNGEON_FLOOR : TILE.GRASS; break;
        case 'p': t = TILE.PATH; break;
        case 'f': t = TILE.FLOWERS; break;
        case 'T': t = TILE.TREE; break;
        case '~': t = TILE.WATER; break;
        case '=': t = TILE.BRIDGE; break;
        case 'b': t = TILE.BUSH; break;
        case 'r': t = TILE.ROCK; break;
        case 'W': t = TILE.DUNGEON_WALL; break;
        case 'X': t = TILE.CRACKED_WALL; break;
        case 'P': t = TILE.PUSH_BLOCK; break;
        case 'S': t = TILE.SWITCH; break;
        case 'D': t = TILE.LOCKED_DOOR; break;
        case 't': t = TILE.TORCH; break;
        case 'v': t = TILE.STAIRS_IN; break;
        case '^': t = TILE.STAIRS_OUT; break;
        case 'i': t = TILE.SIGN; break;
        case 'O': t = TILE.PEDESTAL; break;
      }
      tiles[y * ROOM_COLS + x] = t;
    }
  }
  return tiles;
}

export class World {
  constructor() {
    this.maps = {
      overworld: {},
      dungeon: {},
    };
    this.visited = new Set();

    for (const [key, def] of Object.entries(OVERWORLD_ROOMS)) {
      this.maps.overworld[key] = this._instantiateRoom(key, def);
    }
    for (const [key, def] of Object.entries(DUNGEON_ROOMS)) {
      this.maps.dungeon[key] = this._instantiateRoom(key, def);
    }
  }

  _instantiateRoom(key, def) {
    return {
      key,
      name: def.name,
      isDungeon: def.isDungeon,
      tiles: parseGrid(def.grid, def.isDungeon),
      npc: def.npc ? { ...def.npc } : null,
      signText: def.signText || null,
      enemySpawns: def.enemies.map((e) => ({ ...e })),
      chests: def.chests.map((c) => ({ ...c, opened: false })),
      puzzleChest: def.puzzleChest ? { ...def.puzzleChest, revealed: false, opened: false } : null,
      switchSolved: false,
      hasBoss: Boolean(def.hasBoss),
      bossDefeated: false,
      relicSpawned: false,
    };
  }

  getRoom(zone, rx, ry) {
    return this.maps[zone][`${rx},${ry}`] || null;
  }

  markVisited(zone, rx, ry) {
    this.visited.add(`${zone}:${rx},${ry}`);
  }

  isSolidTile(t) {
    return (
      t === TILE.TREE ||
      t === TILE.WATER ||
      t === TILE.BUSH ||
      t === TILE.ROCK ||
      t === TILE.CRACKED_WALL ||
      t === TILE.DUNGEON_WALL ||
      t === TILE.PUSH_BLOCK ||
      t === TILE.LOCKED_DOOR ||
      t === TILE.TORCH ||
      t === TILE.SIGN
    );
  }
}
