// The giant laptop screen behind the characters, drawn on a 2D canvas (4 tall columns so each one
// fills a vertical close-up at roughly 1:1 texel density).
export const SW = 4096, SH = 2560;
export const COL_W = 970, COL_Y = 130, COL_H = 2380;
export const colX = (k: number) => 48 + k * 1010;

export type ScreenState = {hl: number; stars: number; chat: number; starLog: number; fontsOk: boolean};

type Ctx = CanvasRenderingContext2D;
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
const panel = (c: Ctx, k: number, title: string, accent: string) => {
  const x = colX(k);
  rr(c, x, COL_Y, COL_W, COL_H, 34); c.fillStyle = '#12131b'; c.fill();
  c.lineWidth = 3; c.strokeStyle = '#272b3b'; c.stroke();
  c.fillStyle = '#181a25'; rr(c, x, COL_Y, COL_W, 96, 34); c.fill(); c.fillRect(x, COL_Y + 60, COL_W, 36);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((d, i) => { c.fillStyle = d; c.beginPath(); c.arc(x + 54 + i * 44, COL_Y + 48, 13, 0, 7); c.fill(); });
  c.fillStyle = accent; c.font = `600 36px ${F.inter}`; c.textAlign = 'right'; c.fillText(title, x + COL_W - 44, COL_Y + 61); c.textAlign = 'left';
};
const F = {inter: 'Inter, sans-serif', mono: 'monospace'};
export const setFonts = (inter: string, mono: string) => { F.inter = `"${inter}", sans-serif`; F.mono = `"${mono}", monospace`; };

const fit = (c: Ctx, s: string, maxW: number, size: number, weight = 800) => {
  c.font = `${weight} ${size}px ${F.inter}`;
  const w = c.measureText(s).width;
  if (w > maxW) c.font = `${weight} ${Math.floor(size * maxW / w)}px ${F.inter}`;
};

const terminal = (c: Ctx, s: ScreenState) => {
  const x = colX(0) + 56; let y = 330;
  panel(c, 0, 'zsh — startup-app', '#7d8296');
  c.font = `500 52px ${F.mono}`;
  c.fillStyle = '#5ee08f'; c.fillText('$', x, y); c.fillStyle = '#e4e7f1'; c.fillText('git log --oneline', x + 60, y);
  y += 110;
  const rows: [string, string][] = [['a91f3c2', 'final final fix'], ['77be0d1', 'final fix'], ['3c0a9e4', 'fix'], ['d4e19b0', 'fix again'],
    ['e12b7f8', 'works on my machine'], ['5b2c8aa', 'add api key (temp)'], ['09fa1c3', 'initial commit']];
  rows.forEach(([h, m], i) => {
    if (i === 0 && s.hl > 0) {
      c.globalAlpha = s.hl; rr(c, x - 26, y - 64, COL_W - 60, 92, 16);
      c.fillStyle = 'rgba(255,122,69,0.2)'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#ff7a45'; c.stroke(); c.globalAlpha = 1;
    }
    c.font = `500 52px ${F.mono}`;
    c.fillStyle = '#e8b85c'; c.fillText(h, x, y);
    c.fillStyle = i === 0 && s.hl > 0.5 ? '#ffb08a' : '#d5d9e6'; c.font = `${i === 0 && s.hl > 0.5 ? 700 : 500} 52px ${F.mono}`;
    c.fillText(m, x + 270, y);
    y += 104;
  });
  c.font = `500 52px ${F.mono}`; c.fillStyle = '#5ee08f'; c.fillText('$', x, y); c.fillStyle = '#e4e7f1'; c.fillRect(x + 60, y - 44, 28, 54);
  // the leak
  y += 170;
  c.fillStyle = '#8b93a7'; c.font = `600 40px ${F.inter}`; c.fillText('src/config.js', x, y); y += 40;
  rr(c, x - 20, y, COL_W - 72, 420, 20); c.fillStyle = '#0d0e14'; c.fill();
  y += 90;
  const code = [['1', '// TODO: move to backend', '#6c7389'], ['2', 'export const API_KEY =', '#c9a2ff'], ['3', '  "sk-live-8f2c1e9a7b4d"', '#ff8f7a'], ['4', '', ''], ['5', 'fetch(url, {key: API_KEY})', '#d5d9e6']];
  code.forEach(([n, t, col], i) => {
    c.font = `500 44px ${F.mono}`; c.fillStyle = '#454b5e'; c.fillText(n, x, y); c.fillStyle = col; c.fillText(t, x + 64, y);
    if (i === 2) { c.strokeStyle = '#ff5d55'; c.lineWidth = 5; c.beginPath(); for (let k = 0; k < 26; k++) c.lineTo(x + 100 + k * 26, y + 16 + (k % 2) * 10); c.stroke(); }
    y += 70;
  });
  y += 120;
  c.fillStyle = '#8b93a7'; c.font = `600 40px ${F.inter}`; c.fillText('Network', x, y); y += 70;
  for (let k = 0; k < 6; k++) {
    c.font = `500 40px ${F.mono}`; c.fillStyle = '#6aa8ff'; c.fillText('POST', x, y); c.fillStyle = '#c4c8d6'; c.fillText('/v1/generate', x + 130, y);
    c.fillStyle = '#5ee08f'; c.fillText('200', x + 560, y); c.fillStyle = '#ff6b62'; c.fillText(`×${(1482903 - k * 9217).toLocaleString('en-US')}`, x + 660, y);
    y += 62;
  }
};

const repo = (c: Ctx, s: ScreenState) => {
  const x = colX(1) + 60; let y = 340;
  panel(c, 1, 'github.com', '#7d8296');
  c.fillStyle = '#8b93a7'; c.font = `600 46px ${F.inter}`; c.fillText('dev /', x, y);
  c.fillStyle = '#ffffff'; c.font = `800 74px ${F.inter}`; c.fillText('startup-app', x, y + 92);
  rr(c, x, y + 132, 200, 70, 35); c.lineWidth = 4; c.strokeStyle = '#8b93a7'; c.stroke();
  c.fillStyle = '#c4c8d6'; c.font = `600 40px ${F.inter}`; c.fillText('Public', x + 44, y + 181);
  y += 480;
  c.fillStyle = '#f5c44f'; c.font = `800 210px ${F.inter}`; c.fillText('★', x - 6, y);
  c.fillStyle = '#ffffff'; c.font = `800 210px ${F.inter}`; c.fillText(String(s.stars), x + 230, y);
  c.fillStyle = '#8b93a7'; c.font = `600 48px ${F.inter}`; c.fillText(s.stars === 1 ? 'star' : 'stars', x + 6, y + 80);
  c.fillText('Watch 1  ·  Fork 2', x + 6, y + 150);
  y += 260;
  const who = ['keyhunter_bot', 'free-gpt-4ever', 'crypto_miner_77', 'totally_not_a_bot'];
  for (let k = 0; k < Math.min(s.starLog, who.length); k++) {
    c.fillStyle = '#f5c44f'; c.font = `700 42px ${F.inter}`; c.fillText('★', x, y);
    c.fillStyle = '#e4e7f1'; c.font = `600 42px ${F.inter}`; c.fillText(`${who[k]} starred this`, x + 60, y);
    y += 70;
  }
  y = Math.max(y, 1500) + 20;
  rr(c, x - 24, y, COL_W - 72, 900, 22); c.fillStyle = '#0d0e14'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#272b3b'; c.stroke();
  c.fillStyle = '#8b93a7'; c.font = `600 40px ${F.inter}`; c.fillText('README.md', x + 10, y + 74);
  c.fillStyle = '#ffffff'; c.font = `800 64px ${F.inter}`; c.fillText('# startup-app', x + 10, y + 190);
  c.fillStyle = '#c4c8d6'; c.font = `500 44px ${F.mono}`; c.fillText('npm install', x + 10, y + 290); c.fillText('npm run dev', x + 10, y + 360);
  if (s.chat >= 3) {
    rr(c, x - 4, y + 420, COL_W - 112, 210, 16); c.fillStyle = 'rgba(255,224,102,0.18)'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#ffe066'; c.stroke();
    c.fillStyle = '#ffe066'; c.font = `700 44px ${F.mono}`; c.fillText('API_KEY=', x + 22, y + 500); c.fillText('sk-live-NEW-4c9e1d', x + 22, y + 580);
    c.fillStyle = '#8b93a7'; c.font = `500 38px ${F.inter}`; c.fillText('(safe here, nobody reads this)', x + 10, y + 720);
  }
};

const billing = (c: Ctx) => {
  const x = colX(2) + 60; let y = 340;
  panel(c, 2, 'Cloud Billing', '#7d8296');
  c.fillStyle = '#8b93a7'; c.font = `600 50px ${F.inter}`; c.fillText('October · month to date', x, y);
  y += 230;
  c.fillStyle = '#ff5d55'; fit(c, '$82,314.44', COL_W - 120, 168); c.fillText('$82,314.44', x - 6, y);
  y += 110;
  c.fillStyle = '#c4c8d6'; c.font = `600 50px ${F.inter}`; c.fillText('Budget  $50.00', x, y);
  y += 90;
  c.fillStyle = '#ff6b62'; c.font = `800 62px ${F.inter}`; c.fillText('▲ 164,128%', x, y);
  // daily cost bars
  y += 120;
  const bh = 760, bw = 24, base = y + bh;
  c.strokeStyle = '#272b3b'; c.lineWidth = 3;
  for (let k = 0; k <= 4; k++) { c.beginPath(); c.moveTo(x, y + k * bh / 4); c.lineTo(x + COL_W - 120, y + k * bh / 4); c.stroke(); }
  for (let d = 0; d < 26; d++) {
    const v = d < 22 ? 0.012 + (d % 3) * 0.006 : [0.18, 0.42, 0.77, 1][d - 22];
    c.fillStyle = d < 22 ? '#4a5372' : '#ff5d55';
    c.fillRect(x + d * (bw + 9), base - v * bh, bw, v * bh);
  }
  y = base + 130;
  rr(c, x - 20, y, COL_W - 80, 300, 22); c.fillStyle = 'rgba(255,93,85,0.13)'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#ff5d55'; c.stroke();
  c.fillStyle = '#ff8a82'; c.font = `700 46px ${F.inter}`; c.fillText('⚠  Unusual activity', x + 16, y + 86);
  c.fillStyle = '#e4e7f1'; c.font = `500 42px ${F.inter}`; c.fillText('1.4M requests from', x + 16, y + 166); c.fillText('63 countries', x + 16, y + 230);
};

const chat = (c: Ctx, s: ScreenState) => {
  const x = colX(3) + 56; let y = 330;
  panel(c, 3, 'Claude Code', '#ff9a6a');
  const say = (who: 'u' | 'c' | 'd', t: string) => {
    c.font = `${who === 'u' ? 600 : 500} 44px ${F.mono}`;
    if (who === 'd') {
      rr(c, x - 16, y - 54, COL_W - 80, 76, 10); c.fillStyle = 'rgba(94,224,143,0.16)'; c.fill();
      c.fillStyle = '#7cf0a8'; c.fillText(t, x, y);
    } else {
      c.fillStyle = who === 'u' ? '#8b93a7' : '#ff8a5c'; c.fillText(who === 'u' ? '>' : '●', x, y);
      c.fillStyle = who === 'u' ? '#ffffff' : '#d5d9e6'; c.fillText(t, x + 54, y);
    }
    y += 76;
  };
  const gap = () => { y += 40; };
  say('u', 'why is the bill $82k??'); gap();
  say('c', 'Found it. Your API key'); say('c', 'ships in the frontend'); say('c', 'bundle (config.js).'); gap();
  if (s.chat >= 1) { say('u', 'rotate it. now.'); gap(); say('c', 'Revoked old key   ✓'); say('c', 'Generated new key ✓'); gap(); }
  if (s.chat >= 2) { say('u', 'somewhere safe.'); say('u', 'nobody reads README'); gap(); }
  if (s.chat >= 3) {
    say('c', 'Editing README.md'); say('d', '+ API_KEY=sk-live-NEW…'); gap();
    say('c', 'git commit -m "safe"'); say('c', 'git push origin main ✓');
  }
  rr(c, x - 20, COL_Y + COL_H - 190, COL_W - 72, 120, 20); c.lineWidth = 3; c.strokeStyle = '#3a3f55'; c.stroke();
  c.fillStyle = '#8b93a7'; c.font = `500 44px ${F.mono}`; c.fillText('>', x + 10, COL_Y + COL_H - 114);
  c.fillStyle = '#e4e7f1'; c.fillRect(x + 64, COL_Y + COL_H - 154, 24, 50);
};

export const drawScreen = (c: Ctx, s: ScreenState) => {
  const g = c.createLinearGradient(0, 0, 0, SH);
  g.addColorStop(0, '#0b0c12'); g.addColorStop(1, '#090a10');
  c.fillStyle = g; c.fillRect(0, 0, SW, SH);
  c.fillStyle = '#0f1017'; c.fillRect(0, 0, SW, 96);
  c.fillStyle = '#6c7389'; c.font = `600 40px ${F.inter}`; c.textAlign = 'center'; c.fillText('startup-app', SW / 2, 62); c.textAlign = 'left';
  terminal(c, s); repo(c, s); billing(c); chat(c, s);
};
