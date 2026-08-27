/* ═══════════════════════════════════════════════════════════
   bot.js — Robo Probin.

   A small keyword-scoring intent engine plus a four-step lead
   capture that ends in a real email. No API key, no model, no
   monthly bill — which is exactly the point he likes to make.
   ═══════════════════════════════════════════════════════════ */

import { INTENTS, FALLBACKS, GREETING, PROFILE, INDUSTRIES, CFG, waLink } from './config.js';
import { sendBrief } from './contact.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SKIP_RE  = /^(skip|pass|later|rather not|prefer not|no thanks|not sure|no idea|dunno)/i;

/* ── project requests ──────────────────────────────────────
   "I wanna build a gym website, share it with Probin" is the
   single most useful sentence a visitor can type, and the intent
   table answered it with a paragraph about Probin's CV. These
   three tests read it properly: is this a build request, which
   trade is it for, and do they want it passed on.
   ─────────────────────────────────────────────────────────── */
const BUILD_RE = /\b(build|building|built|make|making|create|creating|design|designing|develop|launch|need|needs|needed|want|wants|wanna|require|looking for|after|start|set ?up|redo|rebuild|revamp|redesign|own)\b/;
const THING_RE = /\b(website|web ?site|sites|site|page|pages|webpage|web ?app|app|store|shop|platform|portal|blog|landing|presence|online)\b/;
const SHARE_RE = /\b(share|shared|send|sends|forward|pass|passed|tell|inform|notify|let him know|hand)\b/;
const WHO_RE   = /\b(probin|him|he|you|the human|details|it|this|over|through|along)\b/;
/* questions about money or time belong to the intent table, even
   when they mention a trade — "how much for a gym site?" */
const ASKING_RE = /\b(how much|how long|cost|costs|price|pricing|charge|budget|quote|timeline|when can|do you have|is there|can i see|show me)\b/;

function findIndustry(q){
  for (const ind of INDUSTRIES){
    for (const k of ind.keys){
      const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('(^|[^a-z])' + esc + '([^a-z]|$)', 'i').test(q)) return ind;
    }
  }
  return null;
}

/* Returns null when this isn't a build request at all. */
function readProject(raw){
  const q = ' ' + raw.toLowerCase().replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const ind      = findIndustry(q);
  const isBuild  = BUILD_RE.test(q);
  const isThing  = THING_RE.test(q);
  const wantsShare = SHARE_RE.test(q) && WHO_RE.test(q);

  /* a bare "a gym" is an answer to our own question, so a short
     line that names nothing but a trade counts as a request too */
  const terse = q.trim().split(' ').length <= 4;

  if (ASKING_RE.test(q) && !wantsShare) return null;      // let the intents answer
  if (ind && (isBuild || isThing || terse)) return { ind, wantsShare, raw };
  if (isBuild && isThing)                   return { ind:null, wantsShare, raw };
  return null;
}

const money = n => '$' + n.toLocaleString('en-US');

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
  const memory = { name:null, asked:new Set(), project:null };

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
      /* If they already told us what they want, don't make them
         type it twice — read it back and move on. */
      if (lead.message){
        lead.step = 'budget';
        await say(
          `Thank you. I have your brief as: <i>${esc(lead.message)}</i><br><br>` +
          `One last question, entirely optional: <b>do you have a budget in mind?</b> It genuinely helps — ` +
          `Probin shapes the scope around your number rather than quoting past it.`,
          ['Under $500', '$500 – $1.5k', '$1.5k – $4k', '$4k+', "I'd rather not say"]
        );
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

    /* Build requests get answered before the keyword table sees
       them, so "a gym website" doesn't score as "about Probin". */
    const proj = readProject(v);
    if (proj){ await projectReply(proj); return; }

    /* "send it to him" on its own, once we know what they're after */
    if (memory.project && SHARE_RE.test(v.toLowerCase()) && WHO_RE.test(v.toLowerCase())){
      await startLead(memory.project.raw);
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

  /* ── build requests ────────────────────────────────────── */
  async function startLead(brief){
    lead = { step: memory.name ? 'contact' : 'name', message: brief || '' };
    if (memory.name){
      lead.step = 'contact';
      await say(`Right you are, <b>${esc(memory.name)}</b> — what's the easiest way for him to reach you? An <b>email</b> or a <b>WhatsApp number</b>, either is plenty.`);
    } else {
      await say(`Happy to pass this straight to him. May I start with your <b>name</b>?`);
    }
  }

  async function projectReply({ ind, wantsShare, raw }){
    memory.project = { ind, raw };

    if (!ind){
      await say(
        `Yes — that's the job. To point you at something useful: <b>what's the business?</b> ` +
        `A shop, a clinic, a restaurant, a gym, a school, a property agency, something else entirely?<br><br>` +
        `Tell me the trade and I'll say what that build usually needs and roughly what it runs to.`,
        ['A gym', 'A restaurant', 'An online store', 'Just take my details']
      );
      return;
    }

    const t = CFG.types.find(x => x.id === ind.type) || CFG.types[1];
    const demoLine = ind.demo
      ? `The closest starting point on this page is the <b>${ind.demo}</b> demo — same shape, different trade. Probin rebuilds it around your brand rather than handing you a template.`
      : `There's no template for it on this page, which is rather the point — yours would be drawn from scratch around what you actually do.`;

    const priceLine = `Something like this usually prices as a <b>${t.label.toLowerCase()}</b> — <b>${money(t.min)}–${money(t.max)}</b>, about <b>${t.weeks} weeks</b>, before any extras. The configurator further down will price your exact list.`;

    const body =
      `A <b>${ind.label}</b> — yes, he builds those.<br><br>` +
      `What that one usually needs: ${ind.needs}.<br><br>` +
      `${demoLine}<br><br>${priceLine}`;

    if (wantsShare){
      await say(body);
      await startLead(raw);
      return;
    }

    await say(body, ['Send this to Probin', 'Show me that demo', 'How much exactly?', 'How long would it take?']);
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
