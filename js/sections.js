/* ═══════════════════════════════════════════════════════════
   sections.js — the straightforward renderers.
   Ticker · services · process · stack marquee · responsive lab
   ═══════════════════════════════════════════════════════════ */

import { TICKER, SERVICES, STEPS, STACK, PROFILE } from './config.js';

const ICONS = {
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path class="an" d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`,
  server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/>
    <circle class="an" cx="6.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/>
    <circle class="an" cx="6.5" cy="17.5" r="1.1" fill="currentColor" stroke="none"/>
    <path d="M17 6.5h2M17 17.5h2"/></svg>`,
  gauge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M3.5 18a9.5 9.5 0 1 1 17 0"/><path class="an" d="M12 18 16.5 9.5"/>
    <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="an" d="M14.7 6.3a4.5 4.5 0 0 0 5.9 5.9l-8.5 8.5a2.5 2.5 0 0 1-3.5-3.5l8.5-8.5Z"/>
    <path d="M14.7 6.3 18.4 2.6a4.5 4.5 0 0 1 3 3l-3.7 3.7"/></svg>`
};

export function initSections(){
  ticker();
  services();
  steps();
  stack();
  responsiveLab();
  footer();
}

/* ── hero ticker (duplicated once so the loop is seamless) ── */
function ticker(){
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const run = TICKER.map(t => `<span>${t}</span>`).join('');
  track.innerHTML = run + run;
}

function stack(){
  const track = document.getElementById('stack-track');
  if (!track) return;
  const run = STACK.map(s => `<b>${s}</b>`).join('');
  track.innerHTML = run + run;
}

/* ── services ───────────────────────────────────────────── */
function services(){
  const grid = document.getElementById('svc-grid');
  if (!grid) return;
  grid.innerHTML = SERVICES.map((s, i) => `
    <article class="scard reveal" data-x="article.scard" style="transition-delay:${i * 80}ms">
      <span class="scard__glow"></span>
      <div class="scard__ic">${ICONS[s.icon] || ICONS.layers}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      <ul>${s.points.map(p => `<li>${p}</li>`).join('')}</ul>
    </article>`).join('');
}

/* ── process, with a progress line that fills as you scroll ── */
function steps(){
  const list = document.getElementById('steps');
  if (!list) return;
  list.innerHTML = STEPS.map((s, i) => `
    <li class="step reveal" data-x="li.step">
      <span class="step__no">0${i + 1}</span>
      <span class="step__when">${s.when}</span>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </li>`).join('');

  const onScroll = () => {
    const r = list.getBoundingClientRect();
    const total = r.height;
    const seen = Math.min(total, Math.max(0, window.innerHeight * 0.72 - r.top));
    list.style.setProperty('--prog', (seen / total * 100).toFixed(1) + '%');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

/* ── responsive lab ─────────────────────────────────────── */
function responsiveLab(){
  const frame  = document.getElementById('rl-frame');
  const handle = document.getElementById('rl-handle');
  const label  = document.getElementById('rl-width');
  if (!frame || !handle) return;

  const stage = frame.parentElement;
  let dragging = false;

  const name = w => w < 430 ? 'phone' : w < 700 ? 'large phone' : w < 1000 ? 'tablet' : 'desktop';

  function paint(w){
    label.textContent = `${Math.round(w)}px · ${name(w)}`;
  }

  function setW(px){
    const max = stage.clientWidth;
    const w = Math.max(300, Math.min(max, px));
    frame.style.width = w + 'px';
    paint(w);
  }

  const move = e => {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    setW(x - frame.getBoundingClientRect().left);
  };

  handle.addEventListener('pointerdown', e => {
    dragging = true;
    handle.setPointerCapture?.(e.pointerId);
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('pointermove', move, { passive:true });
  window.addEventListener('pointerup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  // keyboard: the handle is a button, so it should work without a mouse
  handle.addEventListener('keydown', e => {
    const cur = frame.getBoundingClientRect().width;
    if (e.key === 'ArrowLeft'){ e.preventDefault(); setW(cur - 40); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); setW(cur + 40); }
  });

  new ResizeObserver(() => paint(frame.getBoundingClientRect().width)).observe(frame);
  paint(frame.getBoundingClientRect().width);
}

/* ── footer ─────────────────────────────────────────────── */
function footer(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const gh = document.getElementById('lnk-github');
  const li = document.getElementById('lnk-linkedin');
  const ml = document.getElementById('lnk-mail');
  const direct = document.getElementById('mail-link');
  if (gh) gh.href = PROFILE.github;
  // A link to '#' is worse than no link — hide it until it's filled in.
  if (li){
    if (PROFILE.linkedin && PROFILE.linkedin !== '#') li.href = PROFILE.linkedin;
    else li.hidden = true;
  }
  [ml, direct].forEach(a => {
    if (!a) return;
    a.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent('Website project')}`;
    if (a === direct) a.textContent = PROFILE.email;
  });

  // footer wordmark: each letter lifts on hover
  const big = document.getElementById('foot-big');
  if (big){
    const word = big.textContent.trim();
    big.innerHTML = [...word].map(c => `<span>${c}</span>`).join('');
    big.addEventListener('pointermove', e => {
      const r = big.getBoundingClientRect();
      [...big.children].forEach(s => {
        const sr = s.getBoundingClientRect();
        const d = Math.abs((sr.left + sr.width / 2) - e.clientX);
        const k = Math.max(0, 1 - d / 160);
        s.style.transform = `translateY(${-k * 16}px)`;
        s.style.color = k > 0.55 ? 'var(--cyan)' : '';
      });
    }, { passive:true });
    big.addEventListener('pointerleave', () => {
      [...big.children].forEach(s => { s.style.transform = ''; s.style.color = ''; });
    });
  }
}
