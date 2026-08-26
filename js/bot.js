/* ═══════════════════════════════════════════════════════════
   bot.js — Robo Probin.

   A small keyword-scoring intent engine plus a four-step lead
   capture that ends in a real email. No API key, no model, no
   monthly bill — which is exactly the point he likes to make.
   ═══════════════════════════════════════════════════════════ */

import { INTENTS, FALLBACKS, GREETING, PROFILE, waLink } from './config.js';
import { sendBrief } from './contact.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SKIP_RE  = /^(skip|pass|later|rather not|prefer not|no thanks|not sure|no idea|dunno)/i;

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
      if (v.length < 2){ await say("Whatever you'd like to be called is perfectly fine — a first name is plenty."); return; }
      lead.name = v.replace(/^(i'?m|my name is|this is)\s+/i, '').trim();
      memory.name = lead.name;
      lead.step = 'contact';
      await say(
        `Lovely to meet you, <b>${esc(lead.name)}</b>. What's the easiest way to reach you?<br><br>` +
        `An <b>email</b> or a <b>WhatsApp number</b> — whichever you prefer. Just the one is enough.`
      );
      return;
    }

    /* One step, either channel — asking for both up front puts people off. */
    if (lead.step === 'contact'){
      const mail  = v.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/);
      const digits = v.replace(/[^\d]/g, '');
      if (mail && EMAIL_RE.test(mail[0])) lead.email = mail[0];
      else if (digits.length >= 7)        lead.phone = v.trim();
      else {
        await say("Sorry, I didn't quite catch that one. An email like <i>you@company.com</i>, or a phone number with the country code — either is fine.");
        return;
      }
      lead.step = 'brief';
      await say(
        `Thank you. And roughly <b>what are you hoping to build</b>? A sentence is plenty, and do mention a date if you have one in mind.`,
        ['I would rather explain on a call']
      );
      return;
    }

    if (lead.step === 'brief'){
      lead.message = SKIP_RE.test(v) || /rather explain/i.test(v)
        ? 'Would prefer to talk it through on a call.' : v;
      lead.step = 'budget';
      await say(
        `That's helpful, thank you. One last question, entirely optional: <b>do you have a budget in mind?</b><br><br>` +
        `It genuinely helps — Probin shapes the scope around your number rather than quoting past it, so a modest budget is useful information, never a problem.`,
        ['Under $500', '$500 – $1.5k', '$1.5k – $4k', '$4k+', "I'd rather not say"]
      );
      return;
    }

    if (lead.step === 'budget'){
      lead.budget = SKIP_RE.test(v) ? 'not stated' : v;
      lead.step = 'sending';
      await say('Thank you — passing this along to Probin now…', [], 400);

      const res = await sendBrief({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        company: '',
        message: lead.message,
        budget: lead.budget || 'not stated',
        prefer: lead.phone && !lead.email ? 'WhatsApp' : 'Either is fine',
        scope: window.__probinScope || 'not specified',
        source: 'Robo Probin (chat)'
      });

      lead = null;
      if (res.ok && res.mode === 'api'){
        await say(`All sent, and thank you for taking the time. Probin will come back to you within <b>${PROFILE.responseTime}</b>, usually sooner.<br><br>Anything else I can help with while you're here?`,
          ['Show me the work','Take me to the games','How much does a site cost?']);
      } else if (res.ok){
        await say(`Your email app should have opened with everything filled in — please <b>press send there</b> and it will reach him directly.<br><br>If nothing opened, you're very welcome to use <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:${PROFILE.email}">${PROFILE.email}</a>.`,
          ['Show me the work','Take me to the games']);
      } else {
        await say(`I'm sorry — that didn't go through (${esc(res.error || 'unknown error')}). Please try <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:${PROFILE.email}">${PROFILE.email}</a> and it will certainly reach him.`);
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
      if (/^(cancel|stop|never ?mind|forget it|quit)/i.test(v)){
        lead = null;
        await say("Of course — I've set that aside. Do ask me anything else whenever you like.",
          ['Show me the work','How much does a site cost?']);
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
      lead = { step: memory.name ? 'contact' : 'name' };
      if (memory.name){
        await say(`Welcome back, <b>${esc(memory.name)}</b>. What's the easiest way to reach you — an <b>email</b> or a <b>WhatsApp number</b>?`);
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
