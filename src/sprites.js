// Procedural 16-bit Top-Down Zelda-Style Pixel Art Atlas

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function paint(grid, pal) {
  const h = grid.length;
  const w = grid[0].length;
  const c = mk(w, h);
  const ctx = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch === '.' || ch === ' ') continue;
      if (pal[ch]) {
        ctx.fillStyle = pal[ch];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return c;
}

function flipH(src) {
  const c = mk(src.width, src.height);
  const ctx = c.getContext('2d');
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
}

export function createAtlas() {
  const atlas = { tiles: {}, hero: {}, enemies: {}, items: {}, npcs: {} };

  // --- TILES (16x16) ---
  atlas.tiles.grass = bakeGrass();
  atlas.tiles.flowers = bakeFlowers();
  atlas.tiles.path = bakePath();
  atlas.tiles.tree = bakeTree();
  atlas.tiles.bush = bakeBush();
  atlas.tiles.rock = bakeRock();
  atlas.tiles.cracked = bakeCrackedWall();
  atlas.tiles.dungeonFloor = bakeDungeonFloor();
  atlas.tiles.dungeonWall = bakeDungeonWall();
  atlas.tiles.pushBlock = bakePushBlock();
  atlas.tiles.switchOff = bakeSwitch(false);
  atlas.tiles.switchOn = bakeSwitch(true);
  atlas.tiles.lockedDoor = bakeLockedDoor();
  atlas.tiles.bridge = bakeBridge();
  atlas.tiles.stairsIn = bakeStairs(true);
  atlas.tiles.stairsOut = bakeStairs(false);
  atlas.tiles.sign = bakeSign();
  atlas.tiles.pedestal = bakePedestal();

  // --- HERO (16x16, 4 directions) ---
  const heroPal = {
    o: '#151c14',
    G: '#2eb85c',
    g: '#6de684',
    d: '#1b7a3d',
    Y: '#ffd859',
    S: '#f7cfa0',
    s: '#d9a473',
    B: '#6e4228',
    K: '#18141f',
    W: '#ffffff',
    C: '#3bb8ff',
  };

  const heroDown = [
    '.....oooooo.....',
    '....oGGGGGGoo...',
    '...oGggggGGGGo..',
    '...oYYYYYYYYYo..',
    '...oYSSSSSSSYo..',
    '...oSSKSSKSSSo..',
    '...oSSSSSSSSSo..',
    '....oGGGGGGGo...',
    '..ooGGGGGGGGoo..',
    '..oSGGYYYYGGSo..',
    '..oSGGGGGGGGSo..',
    '...oGddGGddGo...',
    '...oGGGGGGGGo...',
    '....oBBo.oBBo...',
    '....oBBo.oBBo...',
    '.....oo...oo....',
  ];

  const heroUp = [
    '.....oooooo.....',
    '....oGGGGGGoo...',
    '...oGggggGGGGo..',
    '...oGGGGGGGGGo..',
    '...oGddddddGGo..',
    '...oYYYYYYYYYo..',
    '...oYBBBBBBBYo..',
    '....oGGGGGGGo...',
    '..ooGGGGGGGGoo..',
    '..oSGGCCCCGGSo..',
    '..oSGGCCCCGGSo..',
    '...oGGYYYYGGo...',
    '...oGGGGGGGGo...',
    '....oBBo.oBBo...',
    '....oBBo.oBBo...',
    '.....oo...oo....',
  ];

  const heroRight = [
    '....oooooo......',
    '...oGGGGGGoo....',
    '..oGggggGGGGo...',
    '...oYYYYYYYYo...',
    '...oYYSSSSSSo...',
    '...oYYSSSKSSo...',
    '....oSSSSSSSo...',
    '....oGGGGGGoo...',
    '...oGGGGGCCCoo..',
    '...oGGYYGCCCSo..',
    '...oGGGGGCCCSo..',
    '....oGddddGGo...',
    '....oGGGGGGoo...',
    '....oBBo.oBBo...',
    '....oBBo.oBBo...',
    '.....oo...oo....',
  ];

  atlas.hero.down = paint(heroDown, heroPal);
  atlas.hero.up = paint(heroUp, heroPal);
  atlas.hero.right = paint(heroRight, heroPal);
  atlas.hero.left = flipH(atlas.hero.right);

  // --- ENEMIES ---
  const slimeG = [
    '................',
    '................',
    '....oooooooo....',
    '..ooCCCCCCCCoo..',
    '.oCCccccccccCCo.',
    '.oCcCCCCCCCCcCo.',
    'oCcCCWWCCWWCCcCo',
    'oCcCCWKCCWKCCcCo',
    'oCcCCCCCCCCCCcCo',
    'oCCccDDDDDDccCCo',
    '.oCCCDDDDDDCCCo.',
    '..oooooooooooo..',
    '................',
    '................',
  ];
  atlas.enemies.slime = paint(slimeG, { o: '#102028', C: '#33c9a6', c: '#96ffdf', D: '#1b7a78', W: '#ffffff', K: '#102028' });

  const octoG = [
    '....oooooooo....',
    '..ooRRRRRRRRoo..',
    '.oRRrrrrrrrrRRo.',
    '.oRrRRRRRRRRrRo.',
    'oRRRRWWrrWWRRRRo',
    'oRRRRWKrrWKRRRRo',
    'oRRRRRRRRRRRRRRo',
    'oRRRROOOOOORRRRo',
    '.oRRROddddORRR..',
    '.oRRROOOOOORRo..',
    '..ooRRooRRoo....',
    '..oRRo..oRRo....',
    '...oo....oo.....',
  ];
  atlas.enemies.octorok = paint(octoG, { o: '#261016', R: '#e0424f', r: '#ff8a92', W: '#ffffff', K: '#1b1124', O: '#ffd06b', d: '#9c2432' });

  const stalfosG = [
    '....oooooooo....',
    '...oWWWWWWWWo...',
    '..oWWwwwwwwWWo..',
    '..oWWKKWWKKWWo..',
    '..oWWWWKKWWWWo..',
    '...oWWWWWWWWo...',
    '....ooWWWWoo....',
    '..ooWWddddWWoo..',
    '.oWWddWWWWddWWo.',
    '.oWWddWWWWddWWo.',
    '..ooWWddddWWoo..',
    '...oWWooooWWo...',
    '...oWWo..oWWo...',
    '..oWWWo..oWWWo..',
    '..oooo....oooo..',
  ];
  atlas.enemies.stalfos = paint(stalfosG, { o: '#161624', W: '#edf2ff', w: '#ffffff', d: '#8c96b5', K: '#161624' });

  const batG = [
    '................',
    'oo............oo',
    'oPPoo......ooPPo',
    'oPPPooOOOOooPPPo',
    '.oPPPPRRRRPPPPost',
    '..oPPRWRWRWPPo..',
    '...ooPRRRRPo....',
    '.....oPPPPo.....',
    '......oooo......',
  ].map((r) => r.slice(0, 16));
  atlas.enemies.bat = paint(batG, { o: '#150d24', P: '#7a42c4', O: '#b078ff', R: '#452278', W: '#ff5978' });

  // --- NPC ELDER ---
  const elderG = [
    '....oooooooo....',
    '...oBBBBBBBBo...',
    '..oBbbbbbbbbBo..',
    '..oBSSSSSSSSBo..',
    '..oBSKSSSSKSBo..',
    '..oBWWWWWWWWBo..',
    '...oWWWWWWWWo...',
    '..ooRRWWWWWRoo..',
    '.oRRRRWWWWWRRRo.',
    '.oRRRRRWWWRRRRo.',
    '.oRRRRRRRRRRRRo.',
    '..oRRYYYYYYRRo..',
    '..oRRRRRRRRRRo..',
    '...oBBBBBBBBo...',
    '...oooo..oooo...',
  ];
  atlas.npcs.elder = paint(elderG, { o: '#1a1218', B: '#4a3340', b: '#785666', S: '#f5cda0', K: '#1a1218', W: '#eef4ff', R: '#b83249', Y: '#ffd561' });

  // --- ITEMS ---
  atlas.items.heartFull = paint(
    [
      '.ooo..ooo.',
      'oRRRooRRRo',
      'oRwwRRRRRo',
      'oRwRRRRRRo',
      'oRRRRRRRRo',
      '.oRRRRRRo.',
      '..oRRRRo..',
      '...oRRo...',
      '....oo....',
    ],
    { o: '#260b14', R: '#ff3b5c', w: '#ffc4d0' }
  );
  atlas.items.heartEmpty = paint(
    [
      '.ooo..ooo.',
      'oDDDooDDDo',
      'oDDDDDDDDo',
      'oDDDDDDDDo',
      'oDDDDDDDDo',
      '.oDDDDDDo.',
      '..oDDDDo..',
      '...oDDo...',
      '....oo....',
    ],
    { o: '#260b14', D: '#3a2c38' }
  );
  atlas.items.rupee = paint(
    [
      '...oo...',
      '..oGGo..',
      '.oGgGGo.',
      'oGgWWGGo',
      'oGgWWGGo',
      'oGGddGGo',
      '.oGddGo.',
      '..oGGo..',
      '...oo...',
    ],
    { o: '#0e2418', G: '#2de072', g: '#9effbe', W: '#ffffff', d: '#168c48' }
  );
  atlas.items.key = paint(
    [
      '..oooo..',
      '.oYYYYo.',
      '.oYooYo.',
      '.oYYYYo.',
      '..oYYo..',
      '..oYYoo.',
      '..oYYo..',
      '..oYYoo.',
      '...oo...',
    ],
    { o: '#2e1d08', Y: '#ffd54f' }
  );
  atlas.items.bomb = paint(
    [
      '.....oYo.',
      '....oWo..',
      '...ooo...',
      '..oBBBo..',
      '.oBBbBBo.',
      '.oBBBBBo.',
      '.oBBBBBo.',
      '..oBBBo..',
      '...ooo...',
    ],
    { o: '#101422', B: '#34466b', b: '#7898cc', W: '#ffd966', Y: '#ff5238' }
  );
  atlas.items.boomerang = paint(
    [
      '..ooooo..',
      '.oCCCCCo.',
      'oCCccCCCo',
      'oCCooCCo.',
      'oCCo..oo.',
      'oCCo.....',
      '.oo......',
    ],
    { o: '#102038', C: '#3ec7ff', c: '#d0f8ff' }
  );
  atlas.items.chestClosed = bakeChest(false);
  atlas.items.chestOpen = bakeChest(true);

  return atlas;
}

function bakeGrass() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#389948';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#47b354';
  ctx.fillRect(2, 3, 2, 1);
  ctx.fillRect(10, 6, 2, 1);
  ctx.fillRect(5, 12, 2, 1);
  ctx.fillStyle = '#2d7d3c';
  ctx.fillRect(11, 13, 2, 1);
  ctx.fillRect(3, 8, 1, 2);
  return c;
}

function bakeFlowers() {
  const c = bakeGrass();
  const ctx = c.getContext('2d');
  const pts = [[3, 4, '#fff07c'], [10, 5, '#ff8aa8'], [6, 11, '#a8e6ff'], [12, 11, '#fff07c']];
  for (const [x, y, col] of pts) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, 1, 1);
  }
  return c;
}

function bakePath() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c9a675';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#dfc092';
  ctx.fillRect(2, 2, 3, 2);
  ctx.fillRect(10, 9, 4, 2);
  ctx.fillStyle = '#a88456';
  ctx.fillRect(6, 6, 3, 2);
  ctx.fillRect(2, 12, 3, 2);
  return c;
}

function bakeTree() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1b4d28';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#5c3824';
  ctx.fillRect(5, 11, 6, 5);
  ctx.fillStyle = '#226b36';
  ctx.fillRect(1, 2, 14, 11);
  ctx.fillStyle = '#339449';
  ctx.fillRect(2, 1, 12, 9);
  ctx.fillStyle = '#58bf64';
  ctx.fillRect(3, 2, 5, 4);
  ctx.fillRect(9, 3, 4, 3);
  return c;
}

function bakeBush() {
  const c = bakeGrass();
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#164526';
  ctx.fillRect(2, 3, 12, 11);
  ctx.fillStyle = '#278040';
  ctx.fillRect(3, 2, 10, 10);
  ctx.fillStyle = '#4ec464';
  ctx.fillRect(4, 3, 4, 4);
  ctx.fillRect(9, 4, 3, 3);
  ctx.fillStyle = '#8ef096';
  ctx.fillRect(5, 4, 2, 2);
  return c;
}

function bakeRock() {
  const c = bakeGrass();
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a2d3b';
  ctx.fillRect(2, 3, 12, 11);
  ctx.fillStyle = '#6c7287';
  ctx.fillRect(3, 4, 10, 9);
  ctx.fillStyle = '#9aa2ba';
  ctx.fillRect(4, 4, 6, 4);
  return c;
}

function bakeCrackedWall() {
  const c = bakeDungeonWall();
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#14121f';
  ctx.fillRect(7, 2, 2, 5);
  ctx.fillRect(5, 6, 4, 2);
  ctx.fillRect(8, 8, 2, 6);
  ctx.fillRect(10, 10, 3, 1);
  ctx.fillStyle = '#ff9844';
  ctx.fillRect(7, 7, 2, 2);
  return c;
}

function bakeDungeonFloor() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2d3145';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#393e57';
  ctx.fillRect(1, 1, 14, 14);
  ctx.fillStyle = '#464c69';
  ctx.fillRect(1, 1, 14, 1);
  ctx.fillRect(1, 1, 1, 14);
  return c;
}

function bakeDungeonWall() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#181a26';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#4c5270';
  ctx.fillRect(1, 1, 6, 6);
  ctx.fillRect(8, 1, 7, 6);
  ctx.fillRect(1, 8, 10, 7);
  ctx.fillRect(12, 8, 3, 7);
  ctx.fillStyle = '#6c7499';
  ctx.fillRect(1, 1, 6, 1);
  ctx.fillRect(8, 1, 7, 1);
  ctx.fillRect(1, 8, 10, 1);
  return c;
}

function bakePushBlock() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1b1d2b';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#6a7496';
  ctx.fillRect(1, 1, 14, 14);
  ctx.fillStyle = '#9aa6cc';
  ctx.fillRect(2, 2, 12, 2);
  ctx.fillRect(2, 2, 2, 12);
  ctx.fillStyle = '#3f4663';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillStyle = '#ffd561';
  ctx.fillRect(7, 7, 2, 2);
  return c;
}

function bakeSwitch(on) {
  const c = bakeDungeonFloor();
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1c29';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillStyle = on ? '#4af7c8' : '#d9534f';
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6, 6, 4, 4);
  return c;
}

function bakeLockedDoor() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#291a14';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#8a5230';
  ctx.fillRect(1, 1, 14, 14);
  ctx.fillStyle = '#ffd54f';
  ctx.fillRect(6, 4, 4, 4);
  ctx.fillRect(7, 8, 2, 4);
  ctx.fillStyle = '#1f120c';
  ctx.fillRect(7, 5, 2, 2);
  return c;
}

function bakeBridge() {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#693c20';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#9c5f34';
  for (let y = 1; y < 16; y += 4) ctx.fillRect(1, y, 14, 3);
  ctx.fillStyle = '#472512';
  ctx.fillRect(0, 0, 2, 16);
  ctx.fillRect(14, 0, 2, 16);
  return c;
}

function bakeStairs(enter) {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = enter ? '#10121c' : '#3a425e';
  ctx.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = enter ? `rgb(${95 - i * 18}, ${102 - i * 18}, ${130 - i * 18})` : `rgb(${70 + i * 24}, ${90 + i * 24}, ${115 + i * 20})`;
    ctx.fillRect(2, 2 + i * 3, 12, 2);
  }
  return c;
}

function bakeSign() {
  const c = bakeGrass();
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#472814';
  ctx.fillRect(7, 9, 2, 6);
  ctx.fillRect(2, 3, 12, 7);
  ctx.fillStyle = '#b57845';
  ctx.fillRect(3, 4, 10, 5);
  ctx.fillStyle = '#5c361a';
  ctx.fillRect(4, 5, 8, 1);
  ctx.fillRect(4, 7, 6, 1);
  return c;
}

function bakePedestal() {
  const c = bakeDungeonFloor();
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6e769c';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#ffd561';
  ctx.fillRect(4, 4, 8, 8);
  return c;
}

function bakeChest(open) {
  const c = mk(16, 16);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#24140c';
  ctx.fillRect(1, 3, 14, 11);
  ctx.fillStyle = open ? '#4f2c19' : '#b8682c';
  ctx.fillRect(2, 4, 12, 9);
  ctx.fillStyle = '#ffd54f';
  ctx.fillRect(2, 7, 12, 2);
  ctx.fillRect(7, 6, 2, 4);
  if (open) {
    ctx.fillStyle = '#180d08';
    ctx.fillRect(3, 4, 10, 4);
  }
  return c;
}
