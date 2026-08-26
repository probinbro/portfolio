/* ═══════════════════════════════════════════════════════════
   sections.js — the straightforward renderers.
   Ticker · services · process · stack marquee · responsive lab
   ═══════════════════════════════════════════════════════════ */

import { TICKER, SERVICES, STEPS, STACK, PROFILE, waLink } from './config.js';

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
  heroSocial();
  ticker();
  services();
  steps();
  stack();
  responsiveLab();
  footer();
}

/* ── hero social row ────────────────────────────────────────
   Built from PROFILE so there is still exactly one place to
   change a handle. A link left as '#' is dropped, not shown.
   ─────────────────────────────────────────────────────────── */
const SOCIAL_ICONS = {
  github: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.5 8.75 21 11.1 21 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21H9z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.22 8.22 0 1 1 6.97 3.86Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>`
};

function heroSocial(){
  const el = document.getElementById('hero-social');
  if (!el) return;
  const links = [
    { k:'whatsapp', label:'WhatsApp', href:PROFILE.whatsapp ? waLink('Hello Probin, I found your site and would like to talk about a project.') : '' },
    { k:'github',   label:'GitHub',   href:PROFILE.github },
    { k:'linkedin', label:'LinkedIn', href:PROFILE.linkedin },
    { k:'mail',     label:'Email',    href:`mailto:${PROFILE.email}?subject=${encodeURIComponent('Website project')}` }
  ].filter(l => l.href && l.href !== '#');

  el.innerHTML = links.map(l => {
    const ext = l.k !== 'mail' ? ' target="_blank" rel="noopener"' : '';
    return `<li><a href="${l.href}"${ext} aria-label="${l.label}">${SOCIAL_ICONS[l.k]}<span>${l.label}</span></a></li>`;
  }).join('');
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

  // WhatsApp: footer entry plus the link under the contact form
  const waMsg = 'Hello Probin, I found your site and would like to talk about a project.';
  const formWa = document.getElementById('wa-link');
  if (formWa) formWa.href = waLink(waMsg);
  const col = document.querySelector('.foot__cols div:nth-child(2)');
  if (col && PROFILE.whatsapp && !col.querySelector('[data-wa]')){
    const a = document.createElement('a');
    a.href = waLink(waMsg); a.target = '_blank'; a.rel = 'noopener';
    a.dataset.wa = '1'; a.textContent = 'WhatsApp';
    col.insertBefore(a, col.firstElementChild?.nextSibling || null);
  }

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
