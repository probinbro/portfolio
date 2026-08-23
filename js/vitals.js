/* ═══════════════════════════════════════════════════════════
   vitals.js — measure this page, on this device, right now.

   Everything here is read from the browser's own Performance
   API. Nothing is hard-coded, which is the only reason the
   claim is worth making.
   ═══════════════════════════════════════════════════════════ */

export function initVitals(section){
  if (!section) return;
  const cards = {};
  section.querySelectorAll('[data-vital]').forEach(c => cards[c.dataset.vital] = c);

  const set = (key, value, note, ratio) => {
    const c = cards[key]; if (!c) return;
    countTo(c.querySelector('[data-val]'), value);
    c.querySelector('[data-note]').textContent = note;
    c.querySelector('.vital__bar i').style.width = Math.max(4, Math.min(100, ratio * 100)) + '%';
    c.classList.toggle('is-good', ratio >= 0.6);
  };

  /* Fire once the section is actually looked at, so the count-up is seen */
  let done = false;
  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting || done) return;
    done = true; io.disconnect();
    requestAnimationFrame(read);
  }, { threshold:0.25 });
  io.observe(section);

  function read(){
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const offline = location.protocol === 'file:';

    /* 1 · time to interactive */
    const tti = nav ? Math.round(nav.domInteractive) : Math.round(performance.now());
    set('load', tti,
      tti < 800 ? 'faster than a blink' : tti < 1800 ? 'comfortably quick' : 'slower — probably a cold cache',
      1 - Math.min(1, tti / 3000));

    /* 2 · bytes over the wire (falls back to decoded size when
          a cross-origin server withholds Timing-Allow-Origin) */
    let bytes = nav ? (nav.transferSize || nav.decodedBodySize || 0) : 0;
    let opaque = 0;
    for (const r of res){
      if (r.transferSize) bytes += r.transferSize;
      else if (r.decodedBodySize) bytes += r.decodedBodySize;
      else opaque++;
    }
    const kb = Math.round(bytes / 1024);
    set('weight', kb || '—',
      offline ? 'opened from disk — no transfer'
        : `this page's own assets${opaque ? `, ${opaque} live previews not counted` : ', fonts included'}`,
      1 - Math.min(1, kb / 1200));

    /* 3 · DOM size */
    const n = document.getElementsByTagName('*').length;
    set('nodes', n,
      n < 1200 ? 'lean — the browser barely notices' : n < 2200 ? 'reasonable for six sections' : 'getting chunky',
      1 - Math.min(1, n / 3000));

    /* 4 · live frame rate, sampled over ~1s */
    sampleFps(fps => {
      set('fps', fps,
        fps >= 58 ? 'locked to your display' : fps >= 45 ? 'smooth' : 'your device is working hard',
        Math.min(1, fps / 60));
    });
  }
}

function sampleFps(cb){
  let frames = 0;
  const t0 = performance.now();
  (function tick(){
    frames++;
    const dt = performance.now() - t0;
    if (dt < 1000) requestAnimationFrame(tick);
    else cb(Math.min(240, Math.round(frames / (dt / 1000))));
  })();
}

function countTo(el, target){
  if (!el) return;
  if (typeof target !== 'number'){ el.textContent = target; return; }
  const dur = 1100, t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  (function step(now){
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(target * ease(p)).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
