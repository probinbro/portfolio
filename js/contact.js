/* ═══════════════════════════════════════════════════════════
   contact.js — the scope configurator, the form, and the one
   place that actually delivers a message to Probin.
   ═══════════════════════════════════════════════════════════ */

import { CFG, PROFILE } from './config.js';

/* ── shared delivery ────────────────────────────────────────
   Two modes, decided by PROFILE.formEndpoint:
     endpoint set  → POST straight to the inbox, no app switch
     endpoint empty→ open the visitor's mail client, pre-filled
   ─────────────────────────────────────────────────────────── */
export async function sendBrief(data){
  const body = [
    `Name:    ${data.name || '—'}`,
    `Email:   ${data.email || '—'}`,
    `Company: ${data.company || '—'}`,
    `Budget:  ${data.budget || 'not stated'}`,
    `Scope:   ${data.scope || '—'}`,
    `Source:  ${data.source || 'contact form'}`,
    '',
    'Brief',
    '─────',
    data.message || '—'
  ].join('\n');

  if (PROFILE.formEndpoint){
    try {
      const res = await fetch(PROFILE.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ ...data, _subject: `New project brief — ${data.name || 'website enquiry'}`, body })
      });
      if (res.ok) return { ok:true, mode:'api' };
      return { ok:false, mode:'api', error:`HTTP ${res.status}` };
    } catch (err){
      return { ok:false, mode:'api', error:err.message };
    }
  }

  const subject = encodeURIComponent(`New project brief — ${data.name || 'website enquiry'}`);
  const mail = `mailto:${PROFILE.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
  window.open(mail, '_blank');
  return { ok:true, mode:'mailto' };
}

/* ── configurator ───────────────────────────────────────── */
export function initContact(){
  const elType  = document.getElementById('cfg-type');
  const elFeat  = document.getElementById('cfg-features');
  const elSpeed = document.getElementById('cfg-speed');
  const elWeeks = document.getElementById('cfg-weeks');
  const elPrice = document.getElementById('cfg-price');
  const elMeter = document.getElementById('cfg-meter-fill');
  const elScope = document.getElementById('f-scope');
  const elBudget = document.getElementById('cfg-budget');
  const elAmount = document.getElementById('cfg-amount');
  const elVerdict = document.getElementById('cfg-verdict');

  const state = { type:'business', features:new Set(['cms']), speed:'normal', budget:null, amount:null };

  const chip = (label, id, on) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip' + (on ? ' is-on' : '');
    b.textContent = label; b.dataset.id = id;
    return b;
  };

  CFG.types.forEach(t => elType.appendChild(chip(t.label, t.id, t.id === state.type)));
  CFG.features.forEach(f => elFeat.appendChild(chip(f.label, f.id, state.features.has(f.id))));
  CFG.speeds.forEach(s => elSpeed.appendChild(chip(s.label, s.id, s.id === state.speed)));
  CFG.budgets.forEach(b => elBudget.appendChild(chip(b.label, b.id, false)));


  function fmt(n){
    return '$' + (Math.round(n / 50) * 50).toLocaleString('en-US');
  }

  function calc(){
    const type  = CFG.types.find(t => t.id === state.type)   || CFG.types[1];
    const speed = CFG.speeds.find(s => s.id === state.speed) || CFG.speeds[0];
    let weeks = type.weeks, min = type.min, max = type.max;

    state.features.forEach(id => {
      const f = CFG.features.find(x => x.id === id);
      if (!f) return;
      weeks += f.weeks; min += f.min; max += f.max;
    });

    weeks = Math.max(1, Math.round(weeks * speed.wMul * 10) / 10);
    min = min * speed.pMul; max = max * speed.pMul;

    elWeeks.textContent = weeks % 1 === 0 ? weeks : weeks.toFixed(1);
    elPrice.textContent = `${fmt(min)} – ${fmt(max)}`;
    elMeter.style.width = Math.min(100, 8 + (max / 9000) * 92) + '%';

    const featNames = [...state.features]
      .map(id => CFG.features.find(f => f.id === id)?.label)
      .filter(Boolean);

    const budgetTxt = verdict(min, max, type, speed);

    const summary = `${type.label} · ${featNames.length ? featNames.join(', ') : 'no extras'} · ${speed.label}`
      + ` · ~${weeks} weeks · est ${fmt(min)}–${fmt(max)}`
      + (budgetTxt.label ? ` · budget: ${budgetTxt.label}` : '');
    if (elScope) elScope.value = summary;
    window.__probinScope = summary;
    return summary;
  }

  /* ── budget reconciliation ──────────────────────────────────
     The point of the whole section: say plainly whether the
     number works, and if it doesn't, what to drop so it does.
     ─────────────────────────────────────────────────────────── */
  function budgetCeiling(){
    if (state.amount > 0) return { value: state.amount, label: fmt(state.amount) };
    const b = CFG.budgets.find(x => x.id === state.budget);
    if (!b || b.id === 'ask') return { value: null, label: b ? b.label : '' };
    return { value: b.max ?? (b.min * 2), label: b.label };
  }

  function verdict(min, max, type, speed){
    const { value: B, label } = budgetCeiling();
    if (!elVerdict) return { label };

    if (!label){
      elVerdict.textContent = '';
      elVerdict.className = 'cfg__verdict';
      return { label:'' };
    }
    if (B === null){
      elVerdict.innerHTML = `No number yet — that's fine. Probin will size it on the call rather than guess at you.`;
      elVerdict.className = 'cfg__verdict is-neutral';
      return { label };
    }

    if (B >= max){
      elVerdict.innerHTML = `<b>That covers it comfortably.</b> There's room left for extra polish, or to bank the difference.`;
      elVerdict.className = 'cfg__verdict is-good';
      return { label };
    }
    if (B >= min){
      elVerdict.innerHTML = `<b>Workable.</b> This scope lands inside your number — Probin would prioritise the list so the important half ships first.`;
      elVerdict.className = 'cfg__verdict is-good';
      return { label };
    }

    // Below the range: work out what would actually fit.
    const baseMin = type.min * speed.pMul;
    if (baseMin > B){
      const fits = CFG.types
        .filter(t => t.min * speed.pMul <= B)
        .sort((a, b2) => b2.min - a.min)[0];
      elVerdict.innerHTML = fits
        ? `<b>${type.label} starts around ${fmt(baseMin)}.</b> At ${fmt(B)} the honest fit is a <b>${fits.label.toLowerCase()}</b> done properly — then grow it later.`
        : `<b>That's under the floor for custom work.</b> Say so anyway — Probin would rather point you somewhere sensible than sell you something thin.`;
      elVerdict.className = 'cfg__verdict is-warn';
      return { label };
    }

    // Drop the priciest extras until the floor fits under the budget.
    let running = baseMin;
    const chosen = [...state.features]
      .map(id => CFG.features.find(f => f.id === id))
      .filter(Boolean)
      .sort((a, b2) => b2.min - a.min);
    chosen.forEach(f => { running += f.min * speed.pMul; });

    const drop = [];
    for (const f of chosen){
      if (running <= B) break;
      running -= f.min * speed.pMul;
      drop.push(f.label);
    }
    elVerdict.innerHTML = drop.length
      ? `<b>About ${fmt(min - B)} over.</b> Drop <b>${drop.join('</b> and <b>')}</b> and it fits — or keep them and run it in two phases.`
      : `<b>About ${fmt(min - B)} over.</b> Phasing it is the usual answer: ship the core now, add the rest when it has earned its keep.`;
    elVerdict.className = 'cfg__verdict is-warn';
    return { label };
  }

  function wire(el, key, single){
    el.addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      if (single){
        [...el.children].forEach(c => c.classList.remove('is-on'));
        b.classList.add('is-on');
        state[key] = b.dataset.id;
      } else {
        const id = b.dataset.id;
        if (state.features.has(id)){ state.features.delete(id); b.classList.remove('is-on'); }
        else { state.features.add(id); b.classList.add('is-on'); }
      }
      calc();
      window.dispatchEvent(new CustomEvent('probin:blip'));
    });
  }
  wire(elType, 'type', true);
  wire(elFeat, 'features', false);
  wire(elSpeed, 'speed', true);
  wire(elBudget, 'budget', true);

  // An exact number beats a bracket, so clear the chips when one is typed.
  elAmount?.addEventListener('input', () => {
    const v = parseFloat(elAmount.value);
    state.amount = Number.isFinite(v) && v > 0 ? v : null;
    if (state.amount){
      [...elBudget.children].forEach(c => c.classList.remove('is-on'));
      state.budget = null;
    }
    calc();
  });
  // runs after wire()'s own listener, so recalculate once the amount is cleared
  elBudget?.addEventListener('click', e => {
    if (!e.target.closest('.chip') || !elAmount) return;
    elAmount.value = ''; state.amount = null;
    calc();
  });

  calc();

  /* ── form ─────────────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  const msg  = document.getElementById('f-msg');
  const btn  = document.getElementById('f-submit');

  const setErr = (input, text) => {
    const field = input.closest('.field');
    field.classList.toggle('is-bad', !!text);
    const err = field.querySelector('[data-err]');
    if (err) err.textContent = text || '';
  };

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    let bad = false;

    setErr(form.name, name ? '' : (bad = true, 'Tell me who you are.'));
    setErr(form.email, validEmail(email) ? '' : (bad = true, 'A working email, please — that is where the reply goes.'));
    setErr(form.message, message.length >= 10 ? '' : (bad = true, 'A sentence or two about the project.'));
    if (form._gotcha.value) return;            // honeypot: silently drop bots
    if (bad){
      msg.textContent = 'Nearly — check the highlighted fields.';
      msg.className = 'cform__msg is-bad';
      return;
    }

    btn.classList.add('is-busy');
    msg.textContent = 'Sending…'; msg.className = 'cform__msg';

    const res = await sendBrief({
      name, email,
      company: form.company.value.trim(),
      message,
      budget: budgetCeiling().label || 'not stated',
      scope: calc(),
      source: 'contact form'
    });

    btn.classList.remove('is-busy');
    if (res.ok && res.mode === 'api'){
      msg.innerHTML = `Sent. Probin replies within ${PROFILE.responseTime} — check your inbox (and the spam folder, just in case).`;
      msg.className = 'cform__msg is-ok';
      form.reset();
    } else if (res.ok){
      msg.innerHTML = `Your email app should be open with the brief filled in — hit send there and it lands with Probin.`;
      msg.className = 'cform__msg is-ok';
    } else {
      msg.innerHTML = `That did not go through (${res.error}). Email <a class="linkish" href="mailto:${PROFILE.email}">${PROFILE.email}</a> directly and it will definitely arrive.`;
      msg.className = 'cform__msg is-bad';
    }
  });

  ['name','email','message'].forEach(n => {
    form[n].addEventListener('input', () => setErr(form[n], ''));
  });

  return { calc, getScope: () => calc() };
}
