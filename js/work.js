/* ═══════════════════════════════════════════════════════════
   work.js — project cards and the "Peek" viewer.

   Each card carries a small CSS-art browser built from the
   project's own palette, and Peek loads the genuine live site
   in a frame so nothing has to be taken on trust.
   ═══════════════════════════════════════════════════════════ */

import { PROJECTS } from './config.js';

export function initWork({ onSelf } = {}){
  const grid = document.getElementById('work-grid');
  if (!grid) return;

  PROJECTS.forEach((p, i) => grid.appendChild(card(p, i)));
  initPeek({ onSelf });
  initLiveShots();
  glowTrack(grid, '.pcard');
  glowTrack(document, '.mcard');
}

/* ── live thumbnails ────────────────────────────────────────
   Each card renders the genuine production site in a frame,
   scaled down to fit. Loaded only as the card approaches the
   viewport, so five external sites never block first paint.
   If one fails or refuses, the CSS placeholder simply stays.
   ─────────────────────────────────────────────────────────── */
function initLiveShots(){
  const boxes = document.querySelectorAll('.mini__live[data-src]');
  if (!boxes.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      mount(en.target);
    });
  }, { rootMargin:'400px 0px' });

  boxes.forEach(b => io.observe(b));
}

function mount(box){
  const frame = document.createElement('iframe');
  frame.src = box.dataset.src;
  frame.loading = 'lazy';
  frame.tabIndex = -1;
  frame.title = '';
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('scrolling', 'no');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  // no allow-top-navigation: a framed site cannot redirect this page away
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');

  // Render at a genuine desktop viewport, then scale the whole thing
  // down and let the card crop it. Matching the frame height to the
  // card instead would hand these sites a 400px-tall viewport, and
  // responsive layouts fall apart when you do that.
  // On a roomy card, render at a desktop width and scale down — 1024 is
  // the widest base that still fills edge to edge across all five sites.
  // On a small card, drop the scaling entirely and let the frame be its
  // own size: the site then lays out at exactly the width it is given,
  // which always fills and stays legible instead of shrinking to specks.
  const BASE_W = 1024, BASE_H = 700, NATIVE_BELOW = 420;
  const fit = () => {
    const w = box.clientWidth;
    if (!w) return;
    if (w < NATIVE_BELOW){
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.transform = 'none';
      return;
    }
    const s = w / BASE_W;
    frame.style.width = BASE_W + 'px';
    frame.style.height = BASE_H + 'px';
    frame.style.transform = `scale(${s})`;
  };

  box.appendChild(frame);
  fit();
  new ResizeObserver(fit).observe(box);
  frame.addEventListener('load', () => { fit(); box.classList.add('is-live'); });
}

/* ── card ───────────────────────────────────────────────── */
function card(p, i){
  const el = document.createElement('article');
  el.className = 'pcard reveal' + (p.size === 'wide' ? ' pcard--wide' : p.size === 'third' ? ' pcard--third' : '');
  el.style.setProperty('--pc', p.accent);
  el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
  el.dataset.x = 'article.pcard';

  const host = p.url.startsWith('#') ? 'probin.dev' : new URL(p.url).host.replace(/^www\./, '');

  el.innerHTML = `
    <div class="pcard__stage">
      ${p.self ? '' : '<span class="pcard__live"><i></i>live</span>'}
      <div class="mini" style="--mini-bg:${p.mini.bg};--mini-hero:${p.mini.hero}">
        <div class="mini__bar"><i></i><i></i><i></i><b>${host}</b></div>
        <div class="mini__view">${miniLayout(p.mini.layout)}</div>
        ${p.self ? '' : `<div class="mini__live" data-src="${p.url}"></div>`}
      </div>
    </div>
    <div class="pcard__body">
      <div class="pcard__meta"><b>${p.year}</b><span>·</span>${p.client}<span>·</span>${p.kind}</div>
      <h3 class="pcard__title">${p.title}</h3>
      <p class="pcard__desc">${p.desc}</p>
      <div class="pcard__tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="pcard__acts">
        ${p.self
          ? `<button class="btn btn--ghost btn--sm" type="button" data-self><span>You are already in it</span><i class="btn__arrow">↑</i></button>`
          : `<button class="btn btn--primary btn--sm" type="button" data-peek="${p.url}" data-title="${p.title}"><span>Peek inside</span><i class="btn__arrow">▸</i></button>
             <a class="btn btn--ghost btn--sm" href="${p.url}" target="_blank" rel="noopener"><span>Visit live</span><i class="btn__arrow">↗</i></a>`}
      </div>
    </div>`;
  return el;
}

function miniLayout(kind){
  const nav = `<div class="mini__row"><span class="mini__blk mini__blk--accent" style="flex:0 0 22px"></span>
    <span class="mini__blk" style="flex:0 0 16px"></span><span class="mini__blk" style="flex:0 0 16px"></span>
    <span class="mini__blk" style="flex:0 0 16px"></span><span style="flex:1"></span>
    <span class="mini__blk mini__blk--accent" style="flex:0 0 26px"></span></div>`;

  if (kind === 'hero'){
    return nav + `<div class="mini__hero"></div>
      <div class="mini__grid"><i></i><i></i><i></i></div>`;
  }
  if (kind === 'grid'){
    return nav + `<div class="mini__hero" style="flex:.8"></div>
      <div class="mini__grid"><i></i><i></i><i></i></div>
      <div class="mini__grid"><i></i><i></i><i></i></div>`;
  }
  // doc
  return nav + `<div class="mini__row" style="flex:1;align-items:stretch">
      <span class="mini__blk mini__blk--tall" style="flex:0 0 26%"></span>
      <span style="flex:1;display:flex;flex-direction:column;gap:5px;justify-content:flex-start">
        <span class="mini__blk mini__blk--accent" style="flex:0 0 9px"></span>
        <span class="mini__blk" style="flex:0 0 6px"></span>
        <span class="mini__blk" style="flex:0 0 6px"></span>
        <span class="mini__blk" style="flex:0 0 6px;max-width:70%"></span>
        <span class="mini__blk" style="flex:0 0 6px"></span>
        <span class="mini__blk" style="flex:0 0 6px;max-width:55%"></span>
      </span></div>`;
}

/* ── peek viewer ────────────────────────────────────────── */
function initPeek({ onSelf } = {}){
  const modal   = document.getElementById('peek');
  const frame   = document.getElementById('peek-frame');
  const urlEl   = document.getElementById('peek-url');
  const openEl  = document.getElementById('peek-open');
  const blocked = document.getElementById('peek-blocked');
  const blockedOpen = document.getElementById('peek-blocked-open');
  const loading = document.getElementById('peek-loading');
  const closeEl = document.getElementById('peek-close');
  let timer = 0, loaded = false;

  function open(url, title){
    loaded = false;
    urlEl.textContent = url;
    openEl.href = url;
    blockedOpen.href = url;
    blocked.classList.remove('is-on');
    loading.classList.add('is-on');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    frame.src = url;

    // A framed site that refuses X-Frame-Options never fires load;
    // give it a fair window, then offer the honest way out.
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!loaded){ loading.classList.remove('is-on'); blocked.classList.add('is-on'); }
    }, 7000);
  }

  function close(){
    clearTimeout(timer);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { frame.src = 'about:blank'; }, 350);
  }

  frame.addEventListener('load', () => {
    if (frame.src === 'about:blank') return;
    loaded = true;
    clearTimeout(timer);
    loading.classList.remove('is-on');
  });

  document.addEventListener('click', e => {
    const peek = e.target.closest('[data-peek]');
    if (peek){ open(peek.dataset.peek, peek.dataset.title); return; }
    if (e.target.closest('[data-self]')){ onSelf?.(); return; }
  });

  closeEl.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  return { open, close };
}

/* ── pointer-following glow on cards ────────────────────── */
function glowTrack(scope, selector){
  scope.addEventListener('pointermove', e => {
    const c = e.target.closest(selector);
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }, { passive:true });
}
