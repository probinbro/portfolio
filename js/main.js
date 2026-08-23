/* ═══════════════════════════════════════════════════════════
   main.js — boot, chrome, and the wiring between modules.
   ═══════════════════════════════════════════════════════════ */

import { PROFILE } from './config.js';
import { initHero } from './hero.js';
import { initSections } from './sections.js';
import { initWork } from './work.js';
import { initVitals } from './vitals.js';
import { initArcade } from './arcade.js';
import { initBot } from './bot.js';
import { initContact } from './contact.js';
import { initBlueprint } from './blueprint.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ═══════════════ THEME ═══════════════ */
const THEME_KEY = 'probin.theme';
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  $('#btn-theme')?.setAttribute('aria-pressed', String(t === 'light'));
  $('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#F3F4F0' : '#06070B');
  localStorage.setItem(THEME_KEY, t);
  window.dispatchEvent(new Event('probin:theme'));
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  const sys = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(saved || sys);
  $('#btn-theme')?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
    sfx('tick');
  });
}

/* ═══════════════ SOUND ═══════════════ */
let audio = null, soundOn = localStorage.getItem('probin.sound') === '1';
function sfx(kind){
  if (!soundOn) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const o = audio.createOscillator(), g = audio.createGain();
    const map = { tick:[880, .04], blip:[1320, .05], pop:[520, .09], up:[1760, .07] };
    const [freq, dur] = map[kind] || map.tick;
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, audio.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    o.connect(g); g.connect(audio.destination);
    o.start(); o.stop(audio.currentTime + dur + 0.02);
  } catch { /* audio is a nicety, never a failure */ }
}
function initSound(){
  const btn = $('#btn-sound');
  btn?.setAttribute('aria-pressed', String(soundOn));
  btn?.addEventListener('click', () => {
    soundOn = !soundOn;
    localStorage.setItem('probin.sound', soundOn ? '1' : '0');
    btn.setAttribute('aria-pressed', String(soundOn));
    if (soundOn) sfx('up');
    toast(soundOn ? 'Sound on — small blips, nothing dramatic.' : 'Sound off.');
  });
  window.addEventListener('probin:blip', () => sfx('blip'));
}

/* ═══════════════ TOAST ═══════════════ */
let toastTimer = 0;
function toast(msg){
  const el = $('#toast');
  if (!el) return;
  el.innerHTML = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 3600);
}
window.addEventListener('probin:toast', e => toast(e.detail));

/* ═══════════════ BOOT SEQUENCE ═══════════════ */
function boot(){
  const box = $('#boot'), logEl = $('#boot-log'), bar = $('.boot__bar i'), skip = $('#boot-skip');
  const title = $('#hero-title');
  const seen = sessionStorage.getItem('probin.booted');

  const finish = () => {
    box.classList.add('is-done');
    document.body.style.overflow = '';
    setTimeout(() => { title?.classList.add('is-in'); }, 120);
    setTimeout(() => box.remove(), 800);
  };

  if (seen || reduced){
    box.style.transition = 'none';
    finish();
    return;
  }

  document.body.style.overflow = 'hidden';
  sessionStorage.setItem('probin.booted', '1');

  const lines = [
    'probin.dev — cold start',
    'loading <b>0</b> dependencies',
    'compiling interactions … <b>ok</b>',
    'waking <b>Robo Probin</b> … <b>ok</b>',
    'arcade cabinet … <b>3 games</b>',
    'ready.'
  ];
  let i = 0;
  const step = () => {
    if (i >= lines.length){ setTimeout(finish, 260); return; }
    logEl.innerHTML += (i ? '\n' : '') + '› ' + lines[i];
    bar.style.width = ((i + 1) / lines.length * 100) + '%';
    i++;
    setTimeout(step, i === 1 ? 260 : 190);
  };
  setTimeout(step, 220);
  skip?.addEventListener('click', finish);
}

/* ═══════════════ REVEAL ═══════════════ */
function initReveal(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });

  // Elements are injected by several modules, so scanning has to be
  // repeatable — anything unobserved stays invisible at opacity:0.
  const scan = () => $$('.reveal, .step').forEach(el => {
    if (el.dataset.revealed) return;
    el.dataset.revealed = '1';
    io.observe(el);
  });
  scan();
  return { scan };
}

/* ═══════════════ KINETIC PARAGRAPH ═══════════════ */
function initKinetic(){
  const p = $('#kinetic');
  if (!p) return;
  const words = p.textContent.trim().split(/\s+/);
  p.innerHTML = words.map(w => `<span class="k">${w}</span>`).join(' ');
  const spans = [...p.querySelectorAll('.k')];

  const onScroll = () => {
    const r = p.getBoundingClientRect();
    const start = window.innerHeight * 0.85;
    const end = window.innerHeight * 0.25;
    const prog = (start - r.top) / (start - end + r.height * 0.55);
    const lit = Math.round(Math.max(0, Math.min(1, prog)) * spans.length);
    spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

/* ═══════════════ NAV ═══════════════ */
function initNav(){
  const nav = $('#nav'), rail = $('#scroll-rail-fill');
  const links = $$('[data-nav]');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (rail) rail.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

    let active = null;
    for (const s of sections){
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) active = s.id;
    }
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + active));
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const burger = $('#btn-burger'), menu = $('.nav__links');
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  menu?.addEventListener('click', e => {
    if (e.target.tagName === 'A'){
      menu.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ═══════════════ CURSOR + MAGNETIC ═══════════════ */
function initCursor(){
  if (window.matchMedia('(hover: none)').matches || reduced) return;
  const cur = $('#cursor');
  const dot = cur.querySelector('.cursor__dot');
  const ring = cur.querySelector('.cursor__ring');
  const label = cur.querySelector('.cursor__label');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;

  window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive:true });
  (function loop(){
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    label.style.transform = `translate(${rx}px,${ry + 34}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  const HOT = 'a,button,input,textarea,[data-peek],.chip,.gtab,canvas,.rl__handle,.pitem';
  document.addEventListener('pointerover', e => {
    const hot = e.target.closest(HOT);
    cur.classList.toggle('is-hot', !!hot);
    const l = hot?.dataset?.cursor || (e.target.closest('[data-peek]') ? 'peek' : '');
    label.textContent = l;
    cur.classList.toggle('is-label', !!l);
  });

  // magnetic pull on primary CTAs
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * 0.22}px, ${my * 0.3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ═══════════════ COMMAND PALETTE ═══════════════ */
function initPalette({ xray, bot, arcade }){
  const modal = $('#palette'), input = $('#palette-input'), list = $('#palette-list');
  let sel = 0, items = [];

  const go = id => () => { close(); $(id)?.scrollIntoView({ behavior:'smooth' }); };

  const COMMANDS = [
    { ic:'◆', label:'Go to Work',            hint:'section', run:go('#work') },
    { ic:'◈', label:'Go to Live proof',      hint:'section', run:go('#proof') },
    { ic:'◇', label:'Go to Services',        hint:'section', run:go('#services') },
    { ic:'▤', label:'Go to Process',         hint:'section', run:go('#process') },
    { ic:'▶', label:'Go to the Playground',  hint:'section', run:go('#arcade') },
    { ic:'🤖', label:'About the chatbot',    hint:'section', run:go('#chatbot') },
    { ic:'✉', label:'Start a project',       hint:'section', run:go('#contact') },
    { ic:'$', label:'Set my budget',         hint:'section', run:() => { close(); $('#contact')?.scrollIntoView({ behavior:'smooth' }); setTimeout(() => $('#cfg-amount')?.focus({ preventScroll:true }), 900); } },
    { ic:'⊞', label:'Toggle x-ray mode',     hint:'X',       run:() => { close(); xray.toggle(); } },
    { ic:'◐', label:'Toggle light / dark',   hint:'T',       run:() => { close(); applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); } },
    { ic:'🤖', label:'Talk to Robo Probin',  hint:'chat',    run:() => { close(); bot.open(); } },
    { ic:'🐛', label:'Play Bug Squash',      hint:'game',    run:() => { close(); $('#arcade').scrollIntoView({ behavior:'smooth' }); setTimeout(() => arcade?.select('bugs'), 700); } },
    { ic:'▦', label:'Play Div Stacker',      hint:'game',    run:() => { close(); $('#arcade').scrollIntoView({ behavior:'smooth' }); setTimeout(() => arcade?.select('stack'), 700); } },
    { ic:'◉', label:'Play Hex Hunter',       hint:'game',    run:() => { close(); $('#arcade').scrollIntoView({ behavior:'smooth' }); setTimeout(() => arcade?.select('hex'), 700); } },
    { ic:'◫', label:'Launch 3D Verse',       hint:'demo',    run:() => { close(); $('#arcade').scrollIntoView({ behavior:'smooth' }); setTimeout(() => arcade?.select('verse'), 700); } },
    { ic:'🦄', label:'Launch Unicorn Journey', hint:'demo',  run:() => { close(); $('#arcade').scrollIntoView({ behavior:'smooth' }); setTimeout(() => arcade?.select('unicorn'), 700); } },
    { ic:'✦', label:'Launch Particle Forge', hint:'demo',    run:() => { close(); $('#arcade').scrollIntoView({ behavior:'smooth' }); setTimeout(() => arcade?.select('forge'), 700); } },
    { ic:'@', label:'Copy email address',    hint:'clipboard', run:async () => {
        close();
        try { await navigator.clipboard.writeText(PROFILE.email); toast(`Copied <b>${PROFILE.email}</b>`); }
        catch { toast(PROFILE.email); }
      } },
    { ic:'↗', label:'Open GitHub',           hint:'external', run:() => { close(); window.open(PROFILE.github, '_blank', 'noopener'); } },
    { ic:'↗', label:'Open LinkedIn',         hint:'external', run:() => { close(); window.open(PROFILE.linkedin, '_blank', 'noopener'); },
      skip: !PROFILE.linkedin || PROFILE.linkedin === '#' }
  ].filter(c => !c.skip);

  function render(q = ''){
    const needle = q.toLowerCase();
    items = COMMANDS.filter(c => c.label.toLowerCase().includes(needle) || c.hint.includes(needle));
    sel = 0;
    list.innerHTML = items.map((c, i) => `
      <li class="pitem${i === 0 ? ' is-sel' : ''}" data-i="${i}">
        <span class="pitem__ic">${c.ic}</span><b>${c.label}</b><small>${c.hint}</small>
      </li>`).join('') || `<li class="pitem"><span class="pitem__ic">∅</span><b>Nothing matches that</b></li>`;
  }

  function open(){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    input.value = ''; render();
    setTimeout(() => input.focus(), 60);
  }
  function close(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }
  function move(d){
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    [...list.children].forEach((li, i) => li.classList.toggle('is-sel', i === sel));
    list.children[sel]?.scrollIntoView({ block:'nearest' });
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); move(1); sfx('tick'); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); move(-1); sfx('tick'); }
    else if (e.key === 'Enter'){ e.preventDefault(); items[sel]?.run(); sfx('pop'); }
    else if (e.key === 'Escape'){ close(); }
  });
  list.addEventListener('click', e => {
    const li = e.target.closest('.pitem');
    if (li?.dataset.i) items[+li.dataset.i]?.run();
  });
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  $('#btn-palette')?.addEventListener('click', open);
  $('#foot-palette')?.addEventListener('click', open);

  return { open, close, isOpen: () => modal.classList.contains('is-open') };
}

/* ═══════════════ GLOBAL KEYS ═══════════════ */
function initKeys({ palette, xray }){
  const typing = () => /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '');

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      palette.isOpen() ? palette.close() : palette.open();
      return;
    }
    if (typing()) return;
    if (e.key.toLowerCase() === 'x'){ xray.toggle(); sfx('pop'); }
    if (e.key.toLowerCase() === 't'){ applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
  });

  // Konami — because someone always tries
  const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    if (typing()) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = (k === CODE[pos]) ? pos + 1 : (k === CODE[0] ? 1 : 0);
    if (pos === CODE.length){
      pos = 0;
      document.body.style.transition = 'filter 1.2s ease';
      document.body.style.filter = 'hue-rotate(180deg)';
      toast('Konami accepted. Everything is a different colour now. You are welcome.');
      sfx('up');
      setTimeout(() => { document.body.style.filter = ''; }, 6000);
    }
  });
}

/* ═══════════════ SFX ON UI ═══════════════ */
function initUiSfx(){
  document.addEventListener('click', e => {
    if (e.target.closest('button, .btn, a[href^="#"]')) sfx('pop');
  }, { passive:true });
}

/* ═══════════════ GO ═══════════════ */
function start(){
  initTheme();
  initSound();
  boot();
  initSections();
  const reveal = initReveal();
  initKinetic();
  initNav();
  initCursor();
  initUiSfx();

  initHero($('#hero-canvas'), { reduced });
  initVitals($('#proof'));
  initContact();

  const xray = initBlueprint({
    onToggle: on => { if (on) toast('X-ray on — hover anything. Press <b>X</b> to put the paint back.'); }
  });

  const bot = initBot({
    onAction: action => {
      if (action === 'xray'){ xray.set(true); return; }
      if (action.startsWith('goto:')){
        const id = action.slice(5);
        setTimeout(() => $(id)?.scrollIntoView({ behavior:'smooth' }), 500);
      }
    }
  });

  const arcade = initArcade($('#arcade'), {
    onScore: (game, score) => setTimeout(() => bot.brag(game, score), 900)
  });

  initWork({ onSelf: () => $('#hero').scrollIntoView({ behavior:'smooth' }) });
  reveal.scan();          // the project cards only exist as of this line

  const palette = initPalette({ xray, bot, arcade });
  initKeys({ palette, xray });

  // one quiet line in the console for the curious
  console.log(
    '%cProbin.dev%c\nHand-coded. Zero dependencies. No build step.\nLike what you see? ' + PROFILE.email,
    'font:800 22px/1.2 system-ui;color:#4FF0D6',
    'font:13px/1.6 ui-monospace,monospace;color:#7B8497'
  );
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', start)
  : start();
