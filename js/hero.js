/* ═══════════════════════════════════════════════════════════
   hero.js — the living wireframe.

   A jittered lattice of nodes that bends away from the cursor,
   with data packets running the edges and a build-pulse that
   sweeps the field every few seconds. Plain 2D canvas, no libs.
   ═══════════════════════════════════════════════════════════ */

const SPACING   = 78;     // px between lattice nodes
const REACH     = 190;    // cursor influence radius
const MAX_PACK  = 16;     // concurrent travelling packets
const PULSE_GAP = 4200;   // ms between build pulses

export function initHero(canvas, { reduced = false } = {}){
  if (!canvas) return { destroy(){} };
  const ctx = canvas.getContext('2d', { alpha:true });
  if (!ctx) return { destroy(){} };

  let W = 0, H = 0, dpr = 1;
  let nodes = [], edges = [], packets = [];
  let pointer = { x:-9999, y:-9999, active:false };
  let pulse = null, lastPulse = 0;
  let raf = 0, running = true, t0 = performance.now();
  let theme = readTheme();

  /* ── setup ─────────────────────────────────────────────── */
  function readTheme(){
    const css = getComputedStyle(document.documentElement);
    const grab = (n, f) => (css.getPropertyValue(n) || f).trim();
    return {
      node: grab('--cyan', '#4FF0D6'),
      alt:  grab('--violet', '#9080FF'),
      hot:  grab('--amber', '#FFC46B'),
      light: document.documentElement.dataset.theme === 'light'
    };
  }

  function build(){
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(W / SPACING) + 2;
    const rows = Math.ceil(H / SPACING) + 2;
    nodes = [];
    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        const jx = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const jy = (Math.sin(x * 39.3468 + y * 11.135) * 24634.6345) % 1;
        const bx = (x - 1) * SPACING + jx * SPACING * 0.42;
        const by = (y - 1) * SPACING + jy * SPACING * 0.42;
        nodes.push({
          bx, by, x:bx, y:by, vx:0, vy:0,
          col:x, row:y,
          e:0,                                   // energy 0..1
          ph: Math.random() * Math.PI * 2        // drift phase
        });
      }
    }

    edges = [];
    const at = (c, r) => (c >= 0 && c < cols && r >= 0 && r < rows) ? nodes[r * cols + c] : null;
    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        const a = at(x, y);
        const right = at(x + 1, y), down = at(x, y + 1);
        if (right) edges.push({ a, b:right });
        if (down)  edges.push({ a, b:down });
        // sparse diagonals give the lattice some irregularity
        if ((x + y) % 5 === 0){
          const dg = at(x + 1, y + 1);
          if (dg) edges.push({ a, b:dg, faint:true });
        }
      }
    }
    packets = [];
  }

  /* ── packets ───────────────────────────────────────────── */
  function spawnPacket(){
    if (!edges.length) return;
    const e = edges[(Math.random() * edges.length) | 0];
    packets.push({ e, t:0, sp: 0.006 + Math.random() * 0.012, hue: Math.random() < 0.3 ? 1 : 0 });
  }

  /* ── loop ──────────────────────────────────────────────── */
  function frame(now){
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const time = (now - t0) / 1000;

    ctx.clearRect(0, 0, W, H);

    // build pulse
    if (now - lastPulse > PULSE_GAP && !pulse){
      lastPulse = now;
      pulse = { x: pointer.active ? pointer.x : W * 0.5, y: pointer.active ? pointer.y : H * 0.42, r:0 };
    }
    if (pulse){
      pulse.r += 11;
      if (pulse.r > Math.hypot(W, H) * 1.1) pulse = null;
    }

    // node physics
    for (const n of nodes){
      // idle drift keeps it alive without the cursor
      const dx0 = Math.sin(time * 0.5 + n.ph) * 3.4;
      const dy0 = Math.cos(time * 0.42 + n.ph * 1.3) * 3.4;
      let tx = n.bx + dx0, ty = n.by + dy0;

      if (pointer.active){
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const d  = Math.hypot(dx, dy);
        if (d < REACH){
          const f = (1 - d / REACH) ** 2;
          tx += (dx / (d || 1)) * f * 62;
          ty += (dy / (d || 1)) * f * 62;
          n.e = Math.max(n.e, f);
        }
      }

      if (pulse){
        const d = Math.abs(Math.hypot(n.x - pulse.x, n.y - pulse.y) - pulse.r);
        if (d < 52) n.e = Math.max(n.e, (1 - d / 52) * 0.85);
      }

      n.vx += (tx - n.x) * 0.055; n.vy += (ty - n.y) * 0.055;
      n.vx *= 0.82; n.vy *= 0.82;
      n.x += n.vx; n.y += n.vy;
      n.e *= 0.94;
    }

    // edges
    ctx.lineWidth = 1;
    for (const e of edges){
      const { a, b } = e;
      const energy = Math.max(a.e, b.e);
      const base = e.faint ? 0.045 : 0.085;
      const alpha = (theme.light ? base * 0.9 : base) + energy * 0.5;
      if (alpha < 0.02) continue;
      ctx.strokeStyle = hexA(energy > 0.28 ? theme.hot : theme.node, alpha);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // nodes
    for (const n of nodes){
      const r = 1.05 + n.e * 3.1;
      ctx.fillStyle = hexA(n.e > 0.35 ? theme.hot : theme.node, (theme.light ? 0.3 : 0.34) + n.e * 0.66);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      if (n.e > 0.5){
        ctx.fillStyle = hexA(theme.hot, (n.e - 0.5) * 0.3);
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // packets
    if (packets.length < MAX_PACK && Math.random() < 0.09) spawnPacket();
    for (let i = packets.length - 1; i >= 0; i--){
      const p = packets[i];
      p.t += p.sp;
      if (p.t >= 1){ packets.splice(i, 1); continue; }
      const { a, b } = p.e;
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const col = p.hue ? theme.alt : theme.node;
      // trail
      const tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.22);
      const ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.22);
      const g = ctx.createLinearGradient(tx, ty, x, y);
      g.addColorStop(0, hexA(col, 0));
      g.addColorStop(1, hexA(col, 0.85));
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = hexA(col, 0.95);
      ctx.beginPath(); ctx.arc(x, y, 1.9, 0, Math.PI * 2); ctx.fill();
    }

    // pulse ring
    if (pulse){
      ctx.strokeStyle = hexA(theme.node, 0.1);
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function still(){
    build();
    ctx.clearRect(0, 0, W, H);
    for (const e of edges){
      ctx.strokeStyle = hexA(theme.node, e.faint ? 0.04 : 0.075);
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
    }
    for (const n of nodes){
      ctx.fillStyle = hexA(theme.node, 0.3);
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ── helpers ───────────────────────────────────────────── */
  function hexA(hex, a){
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  }

  /* ── events ────────────────────────────────────────────── */
  const onMove = e => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = pointer.y > -80 && pointer.y < r.height + 80;
  };
  const onLeave = () => { pointer.active = false; };
  const onDown  = e => {
    const r = canvas.getBoundingClientRect();
    pulse = { x:e.clientX - r.left, y:e.clientY - r.top, r:0 };
    lastPulse = performance.now();
  };
  const onResize = debounce(() => { reduced ? still() : build(); }, 180);

  // The canvas is sized from its own box, so watch the box directly —
  // a window listener alone misses a zero-width first layout pass.
  const ro = new ResizeObserver(([entry]) => {
    const r = entry.contentRect;
    if (Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 2) return;
    onResize();
  });
  ro.observe(canvas);
  const onTheme  = () => { theme = readTheme(); if (reduced) still(); };

  if (reduced){
    still();
    window.addEventListener('resize', onResize);
  } else {
    build();
    raf = requestAnimationFrame(frame);
    window.addEventListener('pointermove', onMove, { passive:true });
    window.addEventListener('pointerdown', onDown, { passive:true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);

    // stop burning cycles when the hero scrolls away or the tab hides
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running){ running = true; t0 = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!en.isIntersecting && running){ running = false; cancelAnimationFrame(raf); }
    }, { threshold:0 });
    io.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden){ running = false; cancelAnimationFrame(raf); }
      else if (!running){ running = true; raf = requestAnimationFrame(frame); }
    });
  }

  window.addEventListener('probin:theme', onTheme);

  return {
    destroy(){
      running = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('probin:theme', onTheme);
    }
  };
}

function debounce(fn, ms){
  let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
}
