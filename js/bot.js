/* ═══════════════════════════════════════════════════════════
   bot.js — Robo Probin.

   A small keyword-scoring intent engine plus a four-step lead
   capture that ends in a real email. No API key, no model, no
   monthly bill — which is exactly the point he likes to make.
   ═══════════════════════════════════════════════════════════ */

import { INTENTS, FALLBACKS, GREETING, PROFILE } from './config.js';
import { sendBrief } from './contact.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initBot({ onAction } = {}){
  const panel    = document.getElementById('bot');
  const launcher = document.getElementById('bot-launcher');
  const nudge    = document.getElementById('bot-nudge');
  const log      = document.getElementById('bot-log');
  const chipsBox = document.getElementById('bot-chips');
  const form     = document.getElementById('bot-form');
  const input    = document.getElementById('bot-text');
  const closeBtn = document.getElementById('bot-close');
  if (!panel) return { open(){}, close(){} };

  let started = false;
  let lead = null;              // null when not in the capture flow
  const memory = { name:null, asked:new Set() };

  /* ── rendering ─────────────────────────────────────────── */
  function bubble(html, who = 'bot'){
    const el = document.createElement('div');
    el.className = `msg msg--${who}`;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTo({ top: log.scrollHeight, behavior:'smooth' });
    return el;
  }

  function typing(){
    const el = document.createElement('div');
    el.className = 'msg msg--bot msg--typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(el);
    log.scrollTo({ top: log.scrollHeight, behavior:'smooth' });
    panel.classList.add('is-thinking');
    return el;
  }

  function chips(list = []){
    chipsBox.innerHTML = '';
    list.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'bchip'; b.textContent = c;
      b.style.animationDelay = (i * 55) + 'ms';
      b.addEventListener('click', () => { chipsBox.innerHTML = ''; submit(c); });
      chipsBox.appendChild(b);
    });
  }

  /* Reply with a human-ish pause proportional to the message length */
  function say(html, chipList, delay){
    const txt = String(html).replace(/<[^>]+>/g, '');
    const wait = delay ?? Math.min(1400, 320 + txt.length * 7);
    const t = typing();
    return new Promise(res => setTimeout(() => {
      t.remove();
      panel.classList.remove('is-thinking');
      bubble(html);
      chips(chipList);
      res();
    }, wait));
  }

  /* ── intent matching ───────────────────────────────────── */
  function match(raw){
    const q = ' ' + raw.toLowerCase().replace(/[^\w\s$'-]/g, ' ').replace(/\s+/g, ' ') + ' ';
    let best = null, bestScore = 0;
    for (const it of INTENTS){
      let score = 0;
      for (const k of it.keys){
        const key = k.toLowerCase();
        if (q.includes(' ' + key + ' ')) score += key.length * 2.2;   // whole phrase
        else if (q.includes(key))        score += key.length;          // substring
      }
      if (memory.asked.has(it.id)) score *= 0.72;                      // vary repeats
      if (score > bestScore){ bestScore = score; best = it; }
    }
    return bestScore >= 3 ? best : null;
  }

  const pick = v => Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;

  /* ── the lead capture flow ─────────────────────────────── */
  async function leadStep(raw){
    const v = raw.trim();

    if (lead.step === 'name'){
      if (v.length < 2){ await say("I'll need something to call you — first name is plenty."); return; }
      lead.name = v.replace(/^(i'?m|my name is|this is)\s+/i, '').trim();
      memory.name = lead.name;
      lead.step = 'email';
      await say(`Good to meet you, <b>${esc(lead.name)}</b>. What's the best <b>email</b> for the reply?`);
      return;
    }

    if (lead.step === 'email'){
      const found = v.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/);
      if (!found || !EMAIL_RE.test(found[0])){
        await say("That doesn't look like an email address. Something in the shape of <i>you@company.com</i> — it's only used for the reply.");
        return;
      }
      lead.email = found[0];
      lead.step = 'brief';
      await say(`Locked in. Last one: <b>what are you building</b>, and is there a deadline I should flag?`);
      return;
    }

    if (lead.step === 'brief'){
      lead.message = v;
      lead.step = 'budget';
      await say(
        `Got it. Last thing, and it genuinely helps: <b>roughly what's the budget?</b><br><br>` +
        `Probin shapes the scope around your number instead of quoting past it — so a small number is useful information, not a problem.`,
        ['Under $500', '$500 – $1.5k', '$1.5k – $4k', '$4k+', 'Rather not say']
      );
      return;
    }

    if (lead.step === 'budget'){
      lead.budget = /rather not|skip|not sure|no idea/i.test(v) ? 'not stated' : v;
      lead.step = 'sending';
      await say('Passing this to the human now…', [], 400);

      const res = await sendBrief({
        name: lead.name,
        email: lead.email,
        company: '',
        message: lead.message,
        budget: lead.budget || 'not stated',
        scope: window.__probinScope || 'not specified',
        source: 'Robo Probin (chat)'
      });

      lead = null;
      if (res.ok && res.mode === 'api'){
        await say(`Done — that's in his inbox. Expect a reply within <b>${PROFILE.responseTime}</b>, usually sooner.<br><br>Anything else while you're here?`,
          ['Show me the work','Take me to the games','How much does a site cost?']);
      } else if (res.ok){
        await say(`Your email app should have opened with everything filled in — <b>press send there</b> and it reaches him directly.<br><br>If nothing opened, mail <a href="mailto:${PROFILE.email}">${PROFILE.email}</a>.`,
          ['Show me the work','Take me to the games']);
      } else {
        await say(`Something went wrong on the way out (${esc(res.error || 'unknown')}). Mail him at <a href="mailto:${PROFILE.email}">${PROFILE.email}</a> and it will definitely land.`);
      }
    }
  }

  /* ── main turn ─────────────────────────────────────────── */
  async function submit(raw){
    const v = String(raw).trim();
    if (!v) return;
    bubble(esc(v), 'me');
    chipsBox.innerHTML = '';
    input.value = '';

    if (lead){
      if (/^(cancel|stop|never ?mind|forget it)$/i.test(v)){
        lead = null;
        await say("No problem, dropped it. Ask me anything else.", ['Show me the work','How much does a site cost?']);
        return;
      }
      await leadStep(v);
      return;
    }

    const it = match(v);
    if (!it){
      await say(pick(FALLBACKS), ['How much does a site cost?','Show me the work','How long does it take?','I want to hire him']);
      return;
    }

    memory.asked.add(it.id);

    if (it.action === 'lead'){
      lead = { step: memory.name ? 'email' : 'name' };
      if (memory.name){
        await say(`Welcome back, <b>${esc(memory.name)}</b>. What's the best <b>email</b> for the reply?`);
      } else {
        await say(pick(it.reply));
      }
      return;
    }

    await say(pick(it.reply), it.chips);

    if (it.action && onAction) onAction(it.action);
  }

  /* ── open / close ──────────────────────────────────────── */
  function open(seed){
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.classList.add('is-hidden');
    nudge?.classList.remove('is-on');

    if (!started){
      started = true;
      setTimeout(() => { bubble(GREETING.reply); chips(GREETING.chips); }, 260);
    }
    setTimeout(() => input.focus({ preventScroll:true }), 420);
    if (seed) setTimeout(() => submit(seed), started ? 700 : 1100);
  }

  function close(){
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.classList.remove('is-hidden');
  }

  launcher.addEventListener('click', () => open());
  closeBtn.addEventListener('click', close);
  form.addEventListener('submit', e => { e.preventDefault(); submit(input.value); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });

  document.querySelectorAll('[data-open-bot]').forEach(b => {
    b.addEventListener('click', () => open(b.dataset.botSeed || ''));
  });

  /* A single, non-annoying nudge — once per browser session */
  if (!sessionStorage.getItem('probin.nudged')){
    setTimeout(() => {
      if (!panel.classList.contains('is-open')){
        nudge?.classList.add('is-on');
        sessionStorage.setItem('probin.nudged', '1');
        setTimeout(() => nudge?.classList.remove('is-on'), 6500);
      }
    }, 12000);
  }

  return {
    open, close,
    brag(game, score){
      open();
      setTimeout(() => {
        bubble(`Not bad — <b>${score}</b> on ${esc(game)}. That's a new personal best on this device.<br><br>Want me to take your details while you're feeling competitive?`);
        chips(['Take my details','Show me the work','How much does a site cost?']);
      }, started ? 500 : 1200);
    }
  };
}

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
