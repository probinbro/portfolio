/* ═══════════════════════════════════════════════════════════
   blueprint.js — X-ray mode.

   Strips the paint off the page and shows the structure it was
   built from, plus a live inspector HUD that reads the element
   under the cursor. The whole point of the site in one keypress.
   ═══════════════════════════════════════════════════════════ */

export function initBlueprint({ onToggle } = {}){
  const root = document.documentElement;
  const btn  = document.getElementById('btn-xray');

  /* HUD */
  const hud = document.createElement('div');
  hud.className = 'xray-hud';
  hud.innerHTML = `
    <h6>Structure inspector</h6>
    <dl>
      <dt>viewport</dt><dd id="xh-vp">—</dd>
      <dt>breakpoint</dt><dd id="xh-bp">—</dd>
      <dt>dom nodes</dt><dd id="xh-nodes">—</dd>
      <dt>element</dt><dd id="xh-el" class="xh-el">—</dd>
      <dt>box</dt><dd id="xh-box">—</dd>
    </dl>
    <footer>press X to exit · hover anything</footer>`;
  document.body.appendChild(hud);

  const $ = id => hud.querySelector('#' + id);
  const vp = $('xh-vp'), bp = $('xh-bp'), nodes = $('xh-nodes'), el = $('xh-el'), box = $('xh-box');

  const bpName = w => w < 520 ? 'xs · phone' : w < 760 ? 'sm · phone+' : w < 1000 ? 'md · tablet'
                   : w < 1080 ? 'lg · small laptop' : w < 1400 ? 'xl · laptop' : '2xl · desktop';

  function measure(){
    const w = window.innerWidth, h = window.innerHeight;
    vp.textContent = `${w}×${h}`;
    bp.textContent = bpName(w);
    nodes.textContent = document.getElementsByTagName('*').length.toLocaleString();
  }

  function describe(node){
    if (!node || node === document.body || node === root) return null;
    const tag = node.tagName.toLowerCase();
    const id  = node.id ? '#' + node.id : '';
    const cls = typeof node.className === 'string' && node.className.trim()
      ? '.' + node.className.trim().split(/\s+/).filter(c => !c.startsWith('is-')).slice(0, 2).join('.')
      : '';
    return (node.dataset.x || `${tag}${id}${cls}`).slice(0, 34);
  }

  let rafPending = false, lastEvent = null;
  function onMove(e){
    lastEvent = e;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      if (!root.classList.contains('xray') || !lastEvent) return;
      const target = document.elementFromPoint(lastEvent.clientX, lastEvent.clientY);
      const named = target?.closest('[data-x]') || target;
      const label = describe(named);
      if (!label) return;
      el.textContent = label;
      const r = named.getBoundingClientRect();
      box.textContent = `${Math.round(r.width)}×${Math.round(r.height)}`;
    });
  }

  function sweep(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const s = document.createElement('div');
    s.className = 'xray-sweep';
    document.body.appendChild(s);
    requestAnimationFrame(() => s.classList.add('run'));
    setTimeout(() => s.remove(), 900);
  }

  function set(on){
    const was = root.classList.contains('xray');
    if (was === on) return;
    root.classList.toggle('xray', on);
    btn?.setAttribute('aria-pressed', String(on));
    if (on){ sweep(); measure(); }
    onToggle?.(on);
  }

  const toggle = () => set(!root.classList.contains('xray'));

  btn?.addEventListener('click', toggle);
  document.getElementById('foot-xray')?.addEventListener('click', toggle);
  document.querySelectorAll('[data-xray-toggle]').forEach(b2 => b2.addEventListener('click', toggle));
  window.addEventListener('resize', measure);
  window.addEventListener('pointermove', onMove, { passive:true });
  measure();

  return { toggle, set, isOn: () => root.classList.contains('xray') };
}
