/* ═══════════════════════════════════════════════════════════
   arcade.js — six things, one canvas, zero libraries.

   Games
   · Bug Squash  — reflex. Kill bugs before they hit production.
   · Div Stacker — precision. Stack divs, lose the overhang.
   · Hex Hunter  — colour eye. Match the hex before the bar dies.

   Experiences (no score, they just run)
   · 3D Verse        — a solid-shaded city, projected and sorted by hand.
   · Unicorn Journey — parallax layers and a rainbow that writes itself.
   · Particle Forge  — words sampled off an offscreen canvas.
   ═══════════════════════════════════════════════════════════ */

const VW = 960, VH = 540;          // logical resolution
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FONT_DISP = "'Bricolage Grotesque', 'Space Grotesk', system-ui, sans-serif";

/* ── tiny helpers ───────────────────────────────────────── */
const rand  = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

function rr(ctx, x, y, w, h, r){
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}
function text(ctx, str, x, y, { size = 16, font = FONT_MONO, col = '#fff', align = 'left', weight = '400', baseline = 'alphabetic' } = {}){
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

/* ═══════════════════════════════════════════════════════════
   GAME 1 · BUG SQUASH
   ═══════════════════════════════════════════════════════════ */
class BugSquash {
  static meta = {
    name:  'Bug Squash',
    kind:  'game',
    intro: 'Bugs are crawling toward production. Squash them before they cross the deploy line — but leave the green features alone.',
    hint:  'click or tap to squash · space to pause',
    blurb: 'Spawn rates, wiggle physics and particle bursts — all hand-rolled in about 120 lines.'
  };
  constructor(api){ this.api = api; }

  start(){
    this.bugs = []; this.parts = []; this.lives = 3; this.combo = 1; this.streak = 0;
    this.t = 0; this.next = 0.6; this.flash = 0; this.line = 892;
    this.api.setScore(0); this.api.setExtra(`LIVES <b>3</b>`);
  }

  spawn(){
    const feat = Math.random() < 0.18 && this.t > 8;
    this.bugs.push({
      x: -30, y: rand(70, VH - 40),
      vx: rand(30, 52) + Math.min(this.t * 1.9, 62),
      vy: rand(-9, 9),
      s: feat ? 15 : rand(11, 17),
      feat, ph: rand(0, 6.28), dead: 0
    });
  }

  burst(x, y, col, n = 14){
    for (let i = 0; i < n; i++){
      const a = rand(0, Math.PI * 2), sp = rand(40, 210);
      this.parts.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(.3,.75), t:0, col, r:rand(1.4,3.4) });
    }
  }

  update(dt){
    this.t += dt;
    this.flash = Math.max(0, this.flash - dt * 3.2);

    this.next -= dt;
    if (this.next <= 0){ this.spawn(); this.next = Math.max(0.26, 0.95 - this.t * 0.022); }

    for (let i = this.bugs.length - 1; i >= 0; i--){
      const b = this.bugs[i];
      if (b.dead){ b.dead += dt; if (b.dead > .25) this.bugs.splice(i, 1); continue; }
      b.x += b.vx * dt;
      b.y += Math.sin(this.t * 6 + b.ph) * 26 * dt + b.vy * dt;
      b.y = clamp(b.y, 46, VH - 26);
      if (b.x > this.line){
        this.bugs.splice(i, 1);
        if (!b.feat){ this.hit(); this.burst(this.line, b.y, '#FF4D6D', 20); }
      }
    }

    for (let i = this.parts.length - 1; i >= 0; i--){
      const p = this.parts[i];
      p.t += dt; if (p.t > p.life){ this.parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 380 * dt; p.vx *= .98;
    }
  }

  hit(){
    this.lives--; this.combo = 1; this.streak = 0; this.flash = 1;
    this.api.setExtra(`LIVES <b>${Math.max(0, this.lives)}</b>`);
    this.api.shake(9);
    if (this.lives <= 0) this.api.over(`A bug reached production.`);
  }

  pointer(x, y){
    for (let i = this.bugs.length - 1; i >= 0; i--){
      const b = this.bugs[i];
      if (b.dead) continue;
      if (Math.hypot(b.x - x, b.y - y) < b.s * 2.1){
        if (b.feat){
          b.dead = .001; this.burst(b.x, b.y, '#7CFF9E', 18);
          this.api.toast('That was a feature, not a bug.');
          this.hit();
        } else {
          b.dead = .001; this.streak++;
          this.combo = 1 + Math.floor(this.streak / 5);
          this.api.addScore(10 * this.combo);
          this.burst(b.x, b.y, '#FF7A9A');
        }
        return;
      }
    }
    this.streak = 0; this.combo = 1;
  }

  draw(ctx){
    ctx.fillStyle = '#05070E'; ctx.fillRect(0, 0, VW, VH);

    // faint code-ish background
    ctx.globalAlpha = .05;
    for (let i = 0; i < 14; i++){
      text(ctx, '0'.repeat(60), 20, 56 + i * 36, { size:13, col:'#4FF0D6' });
    }
    ctx.globalAlpha = 1;

    // deploy line
    const g = ctx.createLinearGradient(this.line - 40, 0, this.line, 0);
    g.addColorStop(0, 'rgba(255,77,109,0)'); g.addColorStop(1, 'rgba(255,77,109,.28)');
    ctx.fillStyle = g; ctx.fillRect(this.line - 40, 0, 40, VH);
    ctx.strokeStyle = '#FF4D6D'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]);
    ctx.beginPath(); ctx.moveTo(this.line, 0); ctx.lineTo(this.line, VH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.save(); ctx.translate(this.line + 26, VH / 2); ctx.rotate(Math.PI / 2);
    text(ctx, 'PRODUCTION', 0, 0, { size:13, col:'rgba(255,77,109,.85)', align:'center' });
    ctx.restore();

    for (const b of this.bugs) this.drawBug(ctx, b);

    for (const p of this.parts){
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (this.combo > 1){
      text(ctx, `×${this.combo} COMBO`, VW / 2, VH - 26, { size:16, col:'#FFC46B', align:'center', weight:'700' });
    }
    if (this.flash > 0){
      ctx.fillStyle = `rgba(255,77,109,${this.flash * .22})`;
      ctx.fillRect(0, 0, VW, VH);
    }
  }

  drawBug(ctx, b){
    const col = b.feat ? '#7CFF9E' : '#FF7A9A';
    ctx.save(); ctx.translate(b.x, b.y);
    if (b.dead){ const k = 1 + b.dead * 5; ctx.scale(k, 1 / k); ctx.globalAlpha = 1 - b.dead * 4; }
    // legs
    ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.globalAlpha *= .8;
    for (let i = -1; i <= 1; i++){
      const w = Math.sin(this.t * 14 + b.ph + i) * 4;
      ctx.beginPath();
      ctx.moveTo(i * b.s * .5, -b.s * .3); ctx.lineTo(i * b.s * .5 - 7, -b.s - 3 + w);
      ctx.moveTo(i * b.s * .5,  b.s * .3); ctx.lineTo(i * b.s * .5 - 7,  b.s + 3 - w);
      ctx.stroke();
    }
    ctx.globalAlpha = b.dead ? 1 - b.dead * 4 : 1;
    // body
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(0, 0, b.s, b.s * .74, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.beginPath(); ctx.ellipse(b.s * .42, 0, b.s * .5, b.s * .62, 0, 0, 6.283); ctx.fill();
    // eyes
    ctx.fillStyle = '#05070E';
    ctx.beginPath(); ctx.arc(b.s * .58, -b.s * .26, 2.1, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(b.s * .58,  b.s * .26, 2.1, 0, 6.283); ctx.fill();
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════════════════
   GAME 2 · DIV STACKER
   ═══════════════════════════════════════════════════════════ */
class DivStacker {
  static meta = {
    name:  'Div Stacker',
    kind:  'game',
    intro: 'Drop each div on the one below. Whatever hangs over the edge is trimmed — and once nothing is left, the layout collapses.',
    hint:  'click, tap or press space to drop',
    blurb: 'Overlap maths, a camera that pans as the tower grows, and a perfect-drop combo — no engine involved.'
  };
  constructor(api){ this.api = api; }

  start(){
    this.blocks = [{ x: VW / 2 - 170, w: 340, y: VH - 60 }];
    this.h = 30; this.level = 0; this.cam = 0; this.camT = 0;
    this.perfect = 0; this.parts = []; this.dead = false;
    this.next(); this.api.setScore(0); this.api.setExtra('PERFECT <b>0</b>');
  }

  next(){
    const prev = this.blocks[this.blocks.length - 1];
    const dir = this.level % 2 === 0 ? 1 : -1;
    // Travel edge-to-edge but always fully on screen — a block you
    // cannot see is not a game, it is a guess.
    this.cur = {
      x: dir > 0 ? 0 : VW - prev.w, w: prev.w, y: prev.y - this.h,
      v: (200 + this.level * 13) * dir
    };
  }

  update(dt){
    if (this.dead) return;
    const c = this.cur;
    c.x += c.v * dt;
    if (c.x < 0)          { c.x = 0;          c.v *= -1; }
    if (c.x > VW - c.w)   { c.x = VW - c.w;   c.v *= -1; }

    this.camT = Math.max(0, (VH - 60) - this.cur.y - 250);
    this.cam += (this.camT - this.cam) * Math.min(1, dt * 6);

    for (let i = this.parts.length - 1; i >= 0; i--){
      const p = this.parts[i];
      p.t += dt; if (p.t > 1.4){ this.parts.splice(i, 1); continue; }
      p.y += p.vy * dt; p.vy += 900 * dt; p.x += p.vx * dt; p.rot += p.vr * dt;
    }
  }

  drop(){
    if (this.dead) return;
    const prev = this.blocks[this.blocks.length - 1];
    const c = this.cur;
    const left  = Math.max(c.x, prev.x);
    const right = Math.min(c.x + c.w, prev.x + prev.w);
    const overlap = right - left;

    if (overlap <= 4){
      this.dead = true;
      this.parts.push({ x:c.x, y:c.y, w:c.w, h:this.h, vx:0, vy:-120, rot:0, vr:rand(-3,3), t:0, col:this.colFor(this.level) });
      this.api.shake(12);
      this.api.over(`Layout collapsed at <b>${this.level}</b> divs.`);
      return;
    }

    const off = Math.abs(c.x - prev.x);
    if (off < 5){
      this.perfect++;
      this.api.addScore(25 + this.perfect * 10);
      this.api.setExtra(`PERFECT <b>${this.perfect}</b>`);
      this.blocks.push({ x: prev.x, w: prev.w, y: c.y });
      this.api.pop('PERFECT', prev.x + prev.w / 2, c.y - this.cam);
    } else {
      this.perfect = 0;
      this.api.setExtra('PERFECT <b>0</b>');
      this.api.addScore(10);
      // the trimmed piece tumbles away
      const sliceX = (c.x < prev.x) ? c.x : right;
      const sliceW = c.w - overlap;
      this.parts.push({ x:sliceX, y:c.y, w:sliceW, h:this.h, vx:rand(-40,40), vy:-90, rot:0, vr:rand(-4,4), t:0, col:this.colFor(this.level) });
      this.blocks.push({ x:left, w:overlap, y:c.y });
    }

    this.level++;
    if (this.blocks.length > 26) this.blocks.shift();
    this.next();
  }

  colFor(i){
    const hues = [166, 258, 38, 340, 196];
    return `hsl(${hues[i % hues.length]} 78% ${58 - (i % 5) * 3}%)`;
  }

  pointer(){ this.drop(); }
  key(e){ if (e.code === 'Space' || e.code === 'Enter'){ e.preventDefault(); this.drop(); } }

  draw(ctx){
    const bg = ctx.createLinearGradient(0, 0, 0, VH);
    bg.addColorStop(0, '#0A0F1E'); bg.addColorStop(1, '#05070E');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, VW, VH);

    ctx.save(); ctx.translate(0, this.cam);

    // ground grid
    ctx.strokeStyle = 'rgba(79,240,214,.09)'; ctx.lineWidth = 1;
    for (let x = 0; x <= VW; x += 48){ ctx.beginPath(); ctx.moveTo(x, VH - 30); ctx.lineTo(x, VH + 400); ctx.stroke(); }

    this.blocks.forEach((b, i) => {
      const idx = this.level - (this.blocks.length - 1 - i);
      this.drawDiv(ctx, b.x, b.y, b.w, this.h, this.colFor(idx), idx);
    });

    if (!this.dead) this.drawDiv(ctx, this.cur.x, this.cur.y, this.cur.w, this.h, this.colFor(this.level), this.level, true);

    for (const p of this.parts){
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.t / 1.4);
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2); ctx.rotate(p.rot);
      ctx.fillStyle = p.col; rr(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 4); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    text(ctx, `${this.level} divs stacked`, VW / 2, VH - 18, { size:13, col:'rgba(255,255,255,.35)', align:'center' });
  }

  drawDiv(ctx, x, y, w, h, col, idx, active){
    ctx.save();
    if (active){ ctx.shadowColor = col; ctx.shadowBlur = 22; }
    ctx.fillStyle = col; rr(ctx, x, y, w, h, 5); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
    rr(ctx, x + .5, y + .5, w - 1, h - 1, 5); ctx.stroke();
    if (w > 96){
      ctx.save(); ctx.beginPath(); rr(ctx, x, y, w, h, 5); ctx.clip();
      text(ctx, `<div class="l${idx}">`, x + 10, y + h / 2 + 4, { size:11, col:'rgba(0,0,0,.55)' });
      ctx.restore();
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   GAME 3 · HEX HUNTER
   ═══════════════════════════════════════════════════════════ */
class HexHunter {
  static meta = {
    name:  'Hex Hunter',
    kind:  'game',
    intro: 'One hex code, several very similar swatches. Pick the right one before the bar runs out. It gets meaner every round.',
    hint:  'click a swatch · 1–6 on the keyboard also works',
    blurb: 'HSL maths generating decoys that creep closer to the answer each round.'
  };
  constructor(api){ this.api = api; }

  start(){
    this.round = 0; this.lives = 3; this.time = 1; this.dur = 6;
    this.msg = null; this.msgT = 0; this.dead = false;
    this.api.setScore(0); this.api.setExtra('LIVES <b>3</b>');
    this.deal();
  }

  deal(){
    this.round++;
    const n = clamp(2 + Math.ceil(this.round / 2), 3, 6);
    const spread = clamp(46 - this.round * 3, 8, 46);
    const h = irand(0, 359), s = irand(52, 92), l = irand(42, 66);
    this.answer = irand(0, n - 1);
    this.cards = [];
    for (let i = 0; i < n; i++){
      const dh = i === this.answer ? 0 : rand(-spread, spread) * (Math.random() < .5 ? 1 : -1) * .4 + rand(-6, 6);
      const dl = i === this.answer ? 0 : rand(-spread * .35, spread * .35);
      this.cards.push(hslToHex(h + dh, clamp(s + rand(-10, 10), 30, 100), clamp(l + dl, 20, 82)));
    }
    this.cards[this.answer] = hslToHex(h, s, l);
    this.target = this.cards[this.answer];
    this.dur = clamp(6.5 - this.round * 0.18, 2.4, 6.5);
    this.time = 1;
  }

  update(dt){
    if (this.dead) return;
    this.time -= dt / this.dur;
    if (this.msg) { this.msgT += dt; if (this.msgT > .7) this.msg = null; }
    if (this.time <= 0){ this.wrong('Too slow.'); }
  }

  wrong(why){
    this.lives--; this.api.setExtra(`LIVES <b>${Math.max(0, this.lives)}</b>`);
    this.api.shake(8); this.msg = why; this.msgT = 0;
    if (this.lives <= 0){ this.dead = true; this.api.over(`Made it to round <b>${this.round}</b>.`); return; }
    this.deal();
  }

  layout(){
    const n = this.cards.length;
    const cols = n <= 3 ? n : 3;
    const rows = Math.ceil(n / cols);
    const w = 190, h = 118, gx = 22, gy = 20;
    const totalW = cols * w + (cols - 1) * gx;
    const totalH = rows * h + (rows - 1) * gy;
    const x0 = (VW - totalW) / 2, y0 = 232 + (2 - rows) * 20;
    return this.cards.map((c, i) => ({
      col:c, i,
      x: x0 + (i % cols) * (w + gx),
      y: y0 + Math.floor(i / cols) * (h + gy),
      w, h
    }));
  }

  pointer(x, y){
    if (this.dead) return;
    for (const c of this.layout()){
      if (x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h){
        if (c.i === this.answer){
          const bonus = Math.round(this.time * 60);
          this.api.addScore(30 + bonus);
          this.msg = `+${30 + bonus}`; this.msgT = 0;
          this.deal();
        } else this.wrong('Not that one.');
        return;
      }
    }
  }

  key(e){
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= this.cards.length){
      const c = this.layout()[n - 1];
      this.pointer(c.x + 2, c.y + 2);
    }
  }

  draw(ctx){
    ctx.fillStyle = '#06070E'; ctx.fillRect(0, 0, VW, VH);

    text(ctx, `ROUND ${this.round}`, VW / 2, 78, { size:13, col:'rgba(255,255,255,.35)', align:'center' });
    text(ctx, this.target.toUpperCase(), VW / 2, 148, { size:66, font:FONT_MONO, col:'#fff', align:'center', weight:'700' });
    text(ctx, 'find this colour', VW / 2, 180, { size:12, col:'rgba(255,255,255,.3)', align:'center' });

    // timer bar
    const bw = 420, bx = (VW - bw) / 2;
    ctx.fillStyle = 'rgba(255,255,255,.09)'; rr(ctx, bx, 198, bw, 6, 3); ctx.fill();
    const tcol = this.time > .5 ? '#4FF0D6' : this.time > .22 ? '#FFC46B' : '#FF4D6D';
    ctx.fillStyle = tcol; rr(ctx, bx, 198, Math.max(0, bw * this.time), 6, 3); ctx.fill();

    this.layout().forEach(c => {
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
      ctx.fillStyle = c.col; rr(ctx, c.x, c.y, c.w, c.h, 12); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1;
      rr(ctx, c.x + .5, c.y + .5, c.w - 1, c.h - 1, 12); ctx.stroke();
      text(ctx, String(c.i + 1), c.x + 12, c.y + 24, { size:12, col:'rgba(0,0,0,.45)', weight:'700' });
    });

    if (this.msg){
      ctx.globalAlpha = 1 - this.msgT / .7;
      text(ctx, this.msg, VW / 2, VH - 40, { size:26, font:FONT_DISP, col:'#FFC46B', align:'center', weight:'800' });
      ctx.globalAlpha = 1;
    }
  }
}

function hslToHex(h, s, l){
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = v => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

/* ═══════════════════════════════════════════════════════════
   EXPERIENCE 1 · 3D VERSE
   A solid-shaded 3D city. Perspective projection, painter's
   depth sort and flat lighting, written out by hand — no
   three.js, no WebGL, just the 2D context and some matrices.
   ═══════════════════════════════════════════════════════════ */
const BOX_V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const BOX_F = [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]];
const BOX_N = [[0,0,-1],[0,0,1],[-1,0,0],[1,0,0],[0,1,0],[0,-1,0]];

class Verse3D {
  static meta = {
    name:  '3D Verse',
    kind:  'demo',
    intro: 'A city rendered in three dimensions with no 3D library — every face projected, sorted and lit by hand.',
    hint:  'move to orbit · click to rebuild the skyline',
    blurb: 'Perspective projection, painter\'s-algorithm depth sorting and flat shading in about 90 lines of plain canvas.'
  };
  constructor(api){ this.api = api; }

  start(){
    this.yaw = 0.6; this.pitch = 0.42;
    this.tYaw = 0.6; this.tPitch = 0.42;
    this.t = 0;
    this.build();
  }

  build(){
    const hues = [166, 258, 38, 196, 340];
    this.cubes = [];
    for (let gx = -3; gx <= 3; gx++){
      for (let gz = -3; gz <= 3; gz++){
        const d = Math.hypot(gx, gz);
        const h = Math.max(0.35, (3.6 - d * 0.55) * rand(0.35, 1.15));
        this.cubes.push({
          x: gx * 2.35, z: gz * 2.35, h,
          w: rand(0.72, 0.95),
          hue: hues[(Math.abs(gx * 7 + gz * 3)) % hues.length],
          phase: rand(0, 6.28)
        });
      }
    }
  }

  move(x, y){
    this.tYaw   = 0.6 + (x / VW - 0.5) * 2.6;
    this.tPitch = clamp(0.15 + (y / VH - 0.5) * 1.1, 0.06, 1.05);
  }
  pointer(){ this.build(); this.api.pop('REBUILT', VW / 2, 90); }

  update(dt){
    this.t += dt;
    this.tYaw += dt * 0.16;                       // gentle drift when idle
    this.yaw   += (this.tYaw - this.yaw) * Math.min(1, dt * 3);
    this.pitch += (this.tPitch - this.pitch) * Math.min(1, dt * 3);
  }

  draw(ctx){
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#080D1C'); g.addColorStop(1, '#04060E');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);

    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const DIST = 22, F = 620;

    const rot = (x, y, z) => {
      const x1 =  x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y2 =  y * cp - z1 * sp;
      const z2 =  y * sp + z1 * cp;
      return [x1, y2, z2];
    };
    const proj = (x, y, z) => {
      const k = F / (z + DIST);
      return [VW / 2 + x * k, VH / 2 - y * k, z];
    };

    // ground grid, drawn first so towers sit on it
    ctx.strokeStyle = 'rgba(79,240,214,.13)'; ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++){
      const a = rot(i * 1.2, -1.2, -9.6), b = rot(i * 1.2, -1.2, 9.6);
      const c = rot(-9.6, -1.2, i * 1.2), d = rot(9.6, -1.2, i * 1.2);
      if (a[2] + DIST > 1 && b[2] + DIST > 1){
        const p = proj(...a), q = proj(...b);
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }
      if (c[2] + DIST > 1 && d[2] + DIST > 1){
        const p = proj(...c), q = proj(...d);
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }
    }

    // collect every face, then paint far to near
    const L = [0.42, 0.78, 0.46];
    const faces = [];
    for (const c of this.cubes){
      const bob = Math.sin(this.t * 1.1 + c.phase) * 0.12;
      const hh = c.h + bob;
      const verts = BOX_V.map(([vx, vy, vz]) =>
        rot(c.x + vx * c.w, -1.2 + hh + vy * hh, c.z + vz * c.w));
      BOX_F.forEach((f, fi) => {
        const n = rot(...BOX_N[fi]);
        const depth = (verts[f[0]][2] + verts[f[1]][2] + verts[f[2]][2] + verts[f[3]][2]) / 4;
        if (depth + DIST < 1) return;
        const lit = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
        faces.push({ pts: f.map(i => proj(...verts[i])), depth, hue: c.hue, lit });
      });
    }
    faces.sort((a, b) => a.depth - b.depth);

    for (const f of faces){
      const l = 16 + f.lit * 46;
      ctx.fillStyle = `hsl(${f.hue} 72% ${l}%)`;
      ctx.beginPath();
      ctx.moveTo(f.pts[0][0], f.pts[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `hsl(${f.hue} 80% ${l + 14}%)`;
      ctx.lineWidth = 0.6; ctx.stroke();
    }

    text(ctx, `${faces.length} faces · sorted every frame`, VW / 2, VH - 22,
      { size:12, col:'rgba(255,255,255,.34)', align:'center' });
  }
}

/* ═══════════════════════════════════════════════════════════
   EXPERIENCE 2 · UNICORN JOURNEY
   Parallax scrolling, a hand-drawn gallop cycle and a rainbow
   particle trail. The silly one — on purpose.
   ═══════════════════════════════════════════════════════════ */
class UnicornJourney {
  static meta = {
    name:  'Unicorn Journey',
    kind:  'demo',
    intro: 'Five parallax layers, a hand-drawn gallop cycle and a rainbow that writes itself behind her.',
    hint:  'move up and down to fly · click for a burst',
    blurb: 'No sprite sheet and no tween library — the gallop, the mane and the rainbow are all maths.'
  };
  constructor(api){ this.api = api; }

  start(){
    this.t = 0; this.y = VH * 0.62; this.ty = VH * 0.62;
    this.trail = []; this.sparks = []; this.stars = [];
    for (let i = 0; i < 90; i++){
      this.stars.push({ x: rand(0, VW), y: rand(0, VH * 0.7), r: rand(.4, 1.5), tw: rand(0, 6.28) });
    }
    this.clouds = [];
    for (let i = 0; i < 7; i++){
      this.clouds.push({ x: rand(0, VW), y: rand(40, VH * 0.42), s: rand(.5, 1.3), v: rand(6, 20) });
    }
  }

  move(x, y){ this.ty = clamp(y, VH * 0.2, VH * 0.8); }
  pointer(){
    for (let i = 0; i < 40; i++){
      const a = rand(0, 6.28), sp = rand(60, 320);
      this.sparks.push({ x: this.hx(), y: this.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, t:0, life:rand(.4,1), hue:rand(0,360) });
    }
  }
  hx(){ return VW * 0.34; }

  update(dt){
    this.t += dt;
    this.y += (this.ty - this.y) * Math.min(1, dt * 5);

    // rainbow trail, emitted from where the tail is
    this.trail.push({ x: this.hx() - 46, y: this.y + 6 + Math.sin(this.t * 9) * 4, t: 0 });
    for (let i = this.trail.length - 1; i >= 0; i--){
      const p = this.trail[i];
      p.t += dt; p.x -= 210 * dt;
      if (p.t > 2.4 || p.x < -80) this.trail.splice(i, 1);
    }

    for (let i = this.sparks.length - 1; i >= 0; i--){
      const s = this.sparks[i];
      s.t += dt; if (s.t > s.life){ this.sparks.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 260 * dt; s.vx *= .97;
    }

    for (const c of this.clouds){
      c.x -= c.v * dt;
      if (c.x < -140) { c.x = VW + 80; c.y = rand(40, VH * 0.42); }
    }
  }

  draw(ctx){
    const t = this.t;
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, '#150C2E'); sky.addColorStop(.5, '#3A1C5C'); sky.addColorStop(1, '#7A2E63');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, VH);

    for (const s of this.stars){
      ctx.globalAlpha = .35 + Math.sin(t * 2 + s.tw) * .3;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // moon
    ctx.fillStyle = 'rgba(255,240,210,.92)';
    ctx.beginPath(); ctx.arc(VW * 0.8, 96, 40, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,.12)';
    ctx.beginPath(); ctx.arc(VW * 0.8, 96, 66, 0, 6.283); ctx.fill();

    for (const c of this.clouds){
      ctx.fillStyle = `rgba(255,255,255,${.06 * c.s + .04})`;
      for (let i = 0; i < 4; i++){
        ctx.beginPath();
        ctx.ellipse(c.x + i * 26 * c.s, c.y + Math.sin(i) * 5 * c.s, 34 * c.s, 15 * c.s, 0, 0, 6.283);
        ctx.fill();
      }
    }

    this.hills(ctx, VH * 0.74, 120, '#2A1547', t * 14, 0.9);
    this.hills(ctx, VH * 0.84, 90,  '#1D0E33', t * 30, 1.4);

    // rainbow trail
    const BANDS = ['#FF4D6D','#FFA24D','#FFE24D','#6BFF8F','#4FD8F0','#9080FF'];
    this.trail.forEach(p => {
      const fade = 1 - p.t / 2.4;
      BANDS.forEach((col, bi) => {
        ctx.globalAlpha = fade * .55;
        ctx.fillStyle = col;
        ctx.fillRect(p.x, p.y + bi * 5 - 15, 7, 5);
      });
    });
    ctx.globalAlpha = 1;

    this.unicorn(ctx, this.hx(), this.y, t);

    for (const s of this.sparks){
      ctx.globalAlpha = 1 - s.t / s.life;
      ctx.fillStyle = `hsl(${s.hue} 90% 68%)`;
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.6, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;

    this.hills(ctx, VH * 0.94, 60, '#120823', t * 52, 2.1);
  }

  hills(ctx, base, amp, col, off, freq){
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, VH);
    for (let x = 0; x <= VW; x += 12){
      const y = base - Math.sin((x + off) * 0.006 * freq) * amp * .5
                     - Math.sin((x + off) * 0.017 * freq) * amp * .28;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill();
  }

  unicorn(ctx, x, y, t){
    const gallop = Math.sin(t * 9);
    ctx.save();
    ctx.translate(x, y + gallop * 5);

    // tail — rainbow strands
    const MANE = ['#FF4D6D','#FFA24D','#FFE24D','#6BFF8F','#4FD8F0','#9080FF'];
    MANE.forEach((c, i) => {
      ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-34, -4 + i * 2);
      ctx.quadraticCurveTo(-56, 4 + i * 3 + Math.sin(t * 7 + i) * 5, -74, 16 + i * 4 + Math.sin(t * 6 + i) * 7);
      ctx.stroke();
    });

    // legs
    ctx.strokeStyle = '#F6EEFF'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    [[-16, 0], [-6, 1], [10, 2], [20, 3]].forEach(([lx, k]) => {
      const sw = Math.sin(t * 9 + k * 1.6);
      ctx.beginPath(); ctx.moveTo(lx, 8);
      ctx.quadraticCurveTo(lx + sw * 8, 22, lx + sw * 15, 34);
      ctx.stroke();
    });

    // body + neck + head
    ctx.fillStyle = '#F6EEFF';
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 20, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(18, -8); ctx.quadraticCurveTo(38, -26, 40, -40);
    ctx.lineTo(52, -38); ctx.quadraticCurveTo(50, -20, 32, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(48, -44, 15, 10, -.35, 0, 6.283); ctx.fill();
    // ear
    ctx.beginPath(); ctx.moveTo(44, -52); ctx.lineTo(47, -62); ctx.lineTo(52, -52); ctx.closePath(); ctx.fill();

    // horn
    const hg = ctx.createLinearGradient(54, -54, 70, -76);
    hg.addColorStop(0, '#FFE24D'); hg.addColorStop(1, '#FF9BD2');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.moveTo(54, -52); ctx.lineTo(72, -78); ctx.lineTo(60, -50); ctx.closePath(); ctx.fill();

    // mane
    MANE.forEach((c, i) => {
      ctx.strokeStyle = c; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(38 - i * 3, -40 + i * 5);
      ctx.quadraticCurveTo(24 - i * 4, -34 + i * 6 + Math.sin(t * 8 + i) * 4, 14 - i * 5, -18 + i * 6);
      ctx.stroke();
    });

    // eye
    ctx.fillStyle = '#2A1547';
    ctx.beginPath(); ctx.arc(52, -46, 2.2, 0, 6.283); ctx.fill();
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════════════════
   EXPERIENCE 3 · PARTICLE FORGE
   Words sampled from an offscreen canvas, rebuilt out of a few
   thousand particles that scatter when you get too close.
   ═══════════════════════════════════════════════════════════ */
class ParticleForge {
  static meta = {
    name:  'Particle Forge',
    kind:  'demo',
    intro: 'A few thousand particles reading the shape of a word off an offscreen canvas, then holding formation.',
    hint:  'move to disturb them · click to detonate',
    blurb: 'Pixel sampling, eased formation and a repulsion field — the sort of hero animation clients ask for by name.'
  };
  static WORDS = ['PROBIN', 'BUILD', 'SHIP', 'REPEAT', 'HIRE ME'];
  constructor(api){ this.api = api; }

  start(){
    this.i = 0; this.t = 0; this.hold = 0;
    this.px = -9999; this.py = -9999;
    this.parts = [];
    this.load(ParticleForge.WORDS[0]);
  }

  /* Draw the word once, read it back, and keep every lit pixel
     on a grid as a target position. */
  load(word){
    const off = document.createElement('canvas');
    off.width = VW; off.height = VH;
    const o = off.getContext('2d', { willReadFrequently:true });
    o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH);
    o.fillStyle = '#fff';
    o.font = `800 ${word.length > 6 ? 150 : 190}px ${FONT_DISP}`;
    o.textAlign = 'center'; o.textBaseline = 'middle';
    o.fillText(word, VW / 2, VH / 2);

    const data = o.getImageData(0, 0, VW, VH).data;
    const targets = [];
    const STEP = 6;
    for (let y = 0; y < VH; y += STEP){
      for (let x = 0; x < VW; x += STEP){
        if (data[(y * VW + x) * 4] > 128) targets.push([x, y]);
      }
    }

    // reuse the particle pool so letters morph instead of restarting
    for (let i = 0; i < targets.length; i++){
      const [tx, ty] = targets[i];
      if (this.parts[i]){ this.parts[i].tx = tx; this.parts[i].ty = ty; this.parts[i].dead = false; }
      else this.parts.push({
        x: rand(0, VW), y: rand(0, VH), vx:0, vy:0, tx, ty,
        hue: rand(150, 280), dead:false
      });
    }
    for (let i = targets.length; i < this.parts.length; i++) this.parts[i].dead = true;
    this.count = targets.length;
  }

  move(x, y){ this.px = x; this.py = y; }
  pointer(x, y){
    for (const p of this.parts){
      if (p.dead) continue;
      const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
      const f = Math.min(560, 34000 / d);
      p.vx += (dx / d) * f; p.vy += (dy / d) * f;
    }
    this.hold = 0;
  }

  update(dt){
    this.t += dt; this.hold += dt;
    if (this.hold > 5.5){
      this.hold = 0;
      this.i = (this.i + 1) % ParticleForge.WORDS.length;
      this.load(ParticleForge.WORDS[this.i]);
    }
    /* Position eases straight onto the target; velocity carries only the
       disturbance. A spring here reaches equilibrium as a fuzzy cloud —
       this lands the word crisply and still springs back when pushed. */
    const pull = Math.min(1, dt * 9);
    for (const p of this.parts){
      if (p.dead) continue;
      p.x += (p.tx - p.x) * pull;
      p.y += (p.ty - p.y) * pull;

      const dx = p.x - this.px, dy = p.y - this.py;
      const d2 = dx * dx + dy * dy;
      if (d2 < 12000){
        const d = Math.sqrt(d2) || 1, f = (1 - d / 110) * 1400;
        p.vx += (dx / d) * f * dt; p.vy += (dy / d) * f * dt;
      }

      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.90; p.vy *= 0.90;
    }
  }

  draw(ctx){
    ctx.fillStyle = '#05060D'; ctx.fillRect(0, 0, VW, VH);
    for (const p of this.parts){
      if (p.dead) continue;
      const sp = Math.min(1, (Math.abs(p.vx) + Math.abs(p.vy)) / 260);
      ctx.fillStyle = `hsl(${p.hue + sp * 90} 90% ${58 + sp * 26}%)`;
      ctx.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8);
    }
    text(ctx, `${this.count.toLocaleString()} particles`, VW / 2, VH - 22,
      { size:12, col:'rgba(255,255,255,.32)', align:'center' });
  }
}

/* ═══════════════════════════════════════════════════════════
   PLAYGROUND SHELL
   ═══════════════════════════════════════════════════════════ */
const GAMES = {
  bugs: BugSquash, stack: DivStacker, hex: HexHunter,
  verse: Verse3D, unicorn: UnicornJourney, forge: ParticleForge
};

export function initArcade(root, { onScore } = {}){
  const canvas  = root.querySelector('#game-canvas');
  const overlay = root.querySelector('#game-overlay');
  const ovTitle = root.querySelector('#ov-title');
  const ovText  = root.querySelector('#ov-text');
  const ovBtn   = root.querySelector('#ov-btn');
  const ovHint  = root.querySelector('#ov-hint');
  const elScore = root.querySelector('#hud-score');
  const elBest  = root.querySelector('#hud-best');
  const elExtra = root.querySelector('#hud-extra');
  const blurb   = root.querySelector('#game-blurb');
  const tabs    = [...root.querySelectorAll('.gtab')];
  const cabinet = root.querySelector('.cabinet');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let key = 'bugs', game = null, playing = false, paused = false, autoPaused = false;
  let score = 0, raf = 0, last = 0, shake = 0, pops = [];

  /* crisp canvas at any size */
  function size(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VW * dpr; canvas.height = VH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }
  size();
  window.addEventListener('resize', size);

  const best = k => +(localStorage.getItem('probin.best.' + k) || 0);
  const setBest = (k, v) => localStorage.setItem('probin.best.' + k, String(v));

  const api = {
    addScore(n){ score += n; elScore.textContent = score; },
    setScore(n){ score = n; elScore.textContent = score; },
    setExtra(html){ elExtra.innerHTML = html; },
    shake(n){ shake = n; },
    toast(m){ window.dispatchEvent(new CustomEvent('probin:toast', { detail:m })); },
    pop(t, x, y){ pops.push({ t, x, y, life:0 }); },
    over(reason){ end(reason); }
  };

  function select(k, { auto = false } = {}){
    key = k;
    tabs.forEach(t => {
      const on = t.dataset.game === k;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
    });
    stop();
    const M = GAMES[k].meta;
    const demo = M.kind === 'demo';
    cabinet?.classList.toggle('is-demo', demo);
    ovTitle.textContent = M.name;
    ovText.textContent  = M.intro;
    ovHint.textContent  = M.hint;
    blurb.textContent   = M.blurb;
    ovBtn.querySelector('span').textContent = demo ? 'Launch it' : 'Insert coin';
    overlay.classList.remove('is-off');
    elBest.textContent = best(k);
    elScore.textContent = '0';
    elExtra.innerHTML = '';
    // idle attract-mode frame
    game = new GAMES[k](api); game.start(); game.draw(ctx);
    if (!auto){
      canvas.focus({ preventScroll:true });
      // An experience has nothing to win, so it should not ask for a coin.
      if (demo) play();
    }
  }

  function play(){
    game = new GAMES[key](api);
    game.start();
    playing = true; paused = false; score = 0; pops = [];
    elScore.textContent = '0';
    overlay.classList.add('is-off');
    last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    canvas.focus({ preventScroll:true });
  }

  function stop(){ playing = false; cancelAnimationFrame(raf); }

  function end(reason){
    if (!playing) return;
    stop();
    const b = best(key);
    const record = score > b;
    if (record) setBest(key, score);
    elBest.textContent = best(key);
    ovTitle.textContent = record ? 'New high score' : 'Game over';
    ovText.innerHTML = `${reason} You scored <b>${score}</b>${record ? ' — a personal best.' : `. Best is ${b}.`}`;
    ovBtn.querySelector('span').textContent = 'Play again';
    overlay.classList.remove('is-off');
    if (record && onScore) onScore(GAMES[key].meta.name, score);
  }

  function loop(now){
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (paused){ drawPaused(); return; }

    game.update(dt);

    ctx.save();
    if (shake > 0){
      ctx.translate(rand(-shake, shake), rand(-shake, shake));
      shake *= 0.86; if (shake < 0.4) shake = 0;
    }
    game.draw(ctx);

    for (let i = pops.length - 1; i >= 0; i--){
      const p = pops[i]; p.life += dt;
      if (p.life > .9){ pops.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - p.life / .9;
      text(ctx, p.t, p.x, p.y - p.life * 40, { size:20, font:FONT_DISP, col:'#4FF0D6', align:'center', weight:'800' });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawPaused(){
    game.draw(ctx);
    ctx.fillStyle = 'rgba(5,7,14,.72)'; ctx.fillRect(0, 0, VW, VH);
    text(ctx, 'PAUSED', VW / 2, VH / 2, { size:40, font:FONT_DISP, col:'#fff', align:'center', weight:'800' });
    text(ctx, 'space to resume', VW / 2, VH / 2 + 30, { size:13, col:'rgba(255,255,255,.4)', align:'center' });
  }

  /* input */
  function toLocal(e){
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * VW, y: (e.clientY - r.top) / r.height * VH };
  }
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (!playing){ return; }
    const { x, y } = toLocal(e);
    game.pointer?.(x, y);
  });
  // the experiences steer off the pointer rather than off clicks
  canvas.addEventListener('pointermove', e => {
    if (!playing || !game.move) return;
    const { x, y } = toLocal(e);
    game.move(x, y);
  }, { passive:true });
  canvas.addEventListener('keydown', e => {
    if (e.code === 'Space' && playing && !game.key){ e.preventDefault(); paused = !paused; autoPaused = false; last = performance.now(); return; }
    if (e.code === 'KeyP'){ e.preventDefault(); paused = !paused; autoPaused = false; last = performance.now(); return; }
    if (!playing) return;
    game.key?.(e);
  });
  ovBtn.addEventListener('click', play);
  tabs.forEach(t => t.addEventListener('click', () => select(t.dataset.game)));

  // Pause when scrolled away — no point burning battery off-screen —
  // but resume on the way back, so a game is never silently stranded.
  new IntersectionObserver(([en]) => {
    if (!playing) return;
    if (!en.isIntersecting && !paused){ paused = true; autoPaused = true; }
    else if (en.isIntersecting && autoPaused){ paused = false; autoPaused = false; last = performance.now(); }
  }, { threshold:0.15 }).observe(canvas);

  select('bugs', { auto:true });

  return { select, play };
}
