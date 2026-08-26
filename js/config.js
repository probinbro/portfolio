/* ═══════════════════════════════════════════════════════════
   config.js — EVERYTHING EDITABLE LIVES HERE.
   Change copy, projects, prices and links without touching
   a single line of logic anywhere else in the site.
   ═══════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────
   Contact details live here and nowhere else — every mailto,
   footer link, palette command and chatbot reply reads from
   this object, so one edit updates the whole site.
   ─────────────────────────────────────────────────────────── */
export const PROFILE = {
  name:      'Probin',
  role:      'Full-stack web developer',
  years:     3,
  email:     'probinmajumderr@gmail.com',
  whatsapp:  '+8801634308360',
  location:  'Dhaka, Bangladesh · working remote worldwide',
  github:    'https://github.com/probinbro',
  linkedin:  'https://www.linkedin.com/in/mrprobin/',

  // Web3Forms delivers straight to the inbox above. The access key is meant to
  // live in the browser — it can only post to Probin's own form, so it is safe
  // in public source. Clear formEndpoint to fall back to a pre-filled email.
  formEndpoint: 'https://api.web3forms.com/submit',
  accessKey:    '9199740f-2163-43e9-b6fe-b3730a88f808',
  responseTime: '24 hours'
};

/* wa.me wants digits only — no plus, spaces or dashes */
export const waLink = (msg = '') =>
  `https://wa.me/${PROFILE.whatsapp.replace(/\D/g, '')}` +
  (msg ? `?text=${encodeURIComponent(msg)}` : '');

/* ── Hero ticker ────────────────────────────────────────── */
export const TICKER = [
  'Frontend', 'Backend', 'React & Next.js', 'Node · Express', 'PostgreSQL · MongoDB',
  'REST & APIs', 'Auth & payments', 'Performance', 'Accessibility', 'SEO',
  'Responsive by default', 'Deploys & DNS', 'Ongoing support'
];

/* ── Work ───────────────────────────────────────────────── */
/*  size: 'wide' (full row) | 'half' (default) | 'third'
    accent: card glow colour
    mini:   the CSS-art browser preview recipe                          */
export const PROJECTS = [
  {
    title:  'DJ JAI',
    client: 'Sydney, Australia',
    year:   '2025',
    kind:   'Live client site · custom domain',
    url:    'https://www.djjai.com.au/',
    size:   'wide',
    accent: '#FF7A9A',
    desc:   'A booking engine dressed as a nightclub. 25 years of DJ history turned into one scrolling story — hero reel, track player, live gallery, event calendar and an enquiry flow that lands bookings while he is on stage. Built for weddings and corporate clients who decide in about eleven seconds.',
    tags:   ['Marketing site', 'Booking funnel', 'Media gallery', 'SEO', 'Custom domain'],
    mini:   { bg:'#120810', hero:'linear-gradient(120deg,#FF7A9A,#7A3FFF 60%,#1a0f22)', layout:'hero' }
  },
  {
    title:  'Physio Rehab Point',
    client: 'Sports rehab clinic, Dhaka',
    year:   '2025',
    kind:   'Multi-page clinic platform',
    url:    'https://hospital-final.vercel.app/',
    size:   'half',
    accent: '#4FF0D6',
    desc:   'Thirty-plus treatment pages, a five-category condition directory, a four-stage recovery pathway and appointment booking wired through the whole thing. The hard part was not the code — it was making a patient in pain find the right page in two clicks.',
    tags:   ['30+ pages', 'Booking flow', 'Content architecture', 'Healthcare UX'],
    mini:   { bg:'#071614', hero:'linear-gradient(120deg,#4FF0D6,#1b6f7d 70%,#08202a)', layout:'grid' }
  },
  {
    title:  'Sujit Roy',
    client: 'Environmental data scientist',
    year:   '2024',
    kind:   'Academic portfolio',
    url:    'https://sujit-roy-web-ky1c.vercel.app/',
    size:   'half',
    accent: '#9080FF',
    desc:   'Forty-eight publications, a decade of fieldwork and a PhD application riding on it. Built as a credibility machine: expertise matrix, publication index, field gallery and a timeline that reads like a CV but does not look like one.',
    tags:   ['Publication index', 'Timeline', 'Gallery', 'Vercel'],
    mini:   { bg:'#0b0d1c', hero:'linear-gradient(120deg,#9080FF,#3b3f8f 65%,#0e1230)', layout:'doc' }
  },
  {
    title:  'Muhammad Yousuf',
    client: 'Motion designer, Chattogram',
    year:   '2024',
    kind:   'Showreel portfolio',
    url:    'https://yousuf-portfolio-phi.vercel.app/',
    size:   'third',
    accent: '#FFC46B',
    desc:   'A portfolio for someone whose entire craft is motion — so the site had to move without ever upstaging the reel. Three work streams, external Vimeo and Behance embeds, and a contact path built for one thing: getting the enquiry.',
    tags:   ['Video-first', 'Motion UI', 'Embeds'],
    mini:   { bg:'#161006', hero:'linear-gradient(120deg,#FFC46B,#a05c1b 60%,#1d1206)', layout:'grid' }
  },
  {
    title:  'Pratik Mojumder',
    client: 'Remote sensing researcher',
    year:   '2024',
    kind:   'Research portfolio · GitHub Pages',
    url:    'https://probinbro.github.io/Pratiks-portfolio/',
    size:   'third',
    accent: '#5EE6FF',
    desc:   'Published geospatial research rebuilt as browsable web pages — figures, methods and DOI links included — instead of a wall of PDF downloads. Static, free to host, and fast on a bad connection.',
    tags:   ['Static site', 'Data storytelling', 'Zero hosting cost'],
    mini:   { bg:'#06121a', hero:'linear-gradient(120deg,#5EE6FF,#1d5b7a 60%,#07161f)', layout:'doc' }
  },
  {
    title:  'This site',
    client: 'Probin',
    year:   '2026',
    kind:   'The one you are standing in',
    url:    '#hero',
    size:   'third',
    accent: '#4FF0D6',
    self:   true,
    desc:   'Custom canvas hero, an x-ray mode that exposes the DOM, three hand-written games, a chatbot and a live performance readout — with no framework, no build step and no dependencies. If it runs this smoothly, your site will too.',
    tags:   ['0 dependencies', '3 games', 'Canvas', 'Robo Probin'],
    mini:   { bg:'#06070B', hero:'linear-gradient(120deg,#4FF0D6,#9080FF 60%,#0a0d18)', layout:'hero' }
  }
];

/* ── Industry demo templates ────────────────────────────────
   These are NOT client work — they are starting points Probin
   built for this page, so a visitor can see their own industry
   before commissioning anything. Every one is a real, working
   page in /demos, framed live below.
   Add another by dropping an HTML file in /demos and adding a
   row here. Nothing else needs touching.
   ─────────────────────────────────────────────────────────── */
export const DEMOS = [
  {
    title:'Online store',
    file:'demos/ecommerce.html',
    bg:'#FBF7F2',
    brand:'Aurelia',
    accent:'#C4643B',
    desc:'Product grid, live cart, categories and a newsletter capture. The version you commission gets real payments, stock and an admin.',
    tags:['Cart', 'Product grid', 'Checkout-ready']
  },
  {
    title:'Hospital & clinic',
    file:'demos/hospital.html',
    bg:'#F4F8FB',
    brand:'Northside Medical',
    accent:'#0E9E8F',
    desc:'Department finder with live filtering, consultant profiles and an appointment request form that confirms on the page.',
    tags:['Appointments', 'Departments', 'Doctor profiles']
  },
  {
    title:'Restaurant & café',
    file:'demos/restaurant.html',
    bg:'#12100E',
    brand:'Saffron & Smoke',
    accent:'#D4A24C',
    desc:'A tabbed menu with real prices, opening hours and a reservation form. Built dark and slow-moving, the way food sites should be.',
    tags:['Menu tabs', 'Reservations', 'Gallery']
  },
  {
    title:'Real estate',
    file:'demos/realestate.html',
    bg:'#FCFCFA',
    brand:'Keystone Property',
    accent:'#3E7C5F',
    desc:'Search bar, filterable listings with beds/baths/area, saveable favourites and a valuation call-to-action.',
    tags:['Listings', 'Filters', 'Saved homes']
  },
  {
    title:'SaaS & startup',
    file:'demos/saas.html',
    bg:'#08090F',
    brand:'Flowdesk',
    accent:'#6D6BF6',
    desc:'Dark landing page with an animated product dashboard, feature grid and pricing that switches between monthly and yearly.',
    tags:['Pricing toggle', 'Product mock', 'Dark UI']
  },
  {
    title:'School & academy',
    file:'demos/school.html',
    bg:'#FFFBF5',
    brand:'Brightpath Academy',
    accent:'#7A5BC4',
    desc:'Programme cards by age group, news feed, an admissions pathway and an expanding FAQ. Built for anxious parents in a hurry.',
    tags:['Admissions', 'Programmes', 'FAQ accordion']
  }
];

/* ── Services ───────────────────────────────────────────── */
export const SERVICES = [
  {
    icon: 'layers',
    title: 'Frontend that feels expensive',
    desc: 'The layer your client actually judges you on. Pixel-honest layouts, motion with a purpose, and it holds together on a five-year-old Android.',
    points: ['React, Next.js or clean vanilla', 'Custom animation & interaction', 'Responsive from 320px up', 'Accessible, keyboard-complete']
  },
  {
    icon: 'server',
    title: 'Backend that stays up',
    desc: 'Everything behind the curtain: data, accounts, money, mail. Designed so it still makes sense the day someone else opens the code.',
    points: ['Node · Express · REST APIs', 'PostgreSQL, MongoDB, Firebase', 'Auth, roles & admin dashboards', 'Payments, email & third-party APIs']
  },
  {
    icon: 'gauge',
    title: 'Speed & search',
    desc: 'A beautiful site nobody can find or wait for is a very costly hobby. Performance and SEO are part of the build, not an upsell.',
    points: ['Core Web Vitals tuned', 'Semantic, crawlable markup', 'Image & asset budgets', 'Analytics that answer questions']
  },
  {
    icon: 'wrench',
    title: 'Launch & keep it alive',
    desc: 'Domains, DNS, deploys, SSL, backups — handled. Then I stay reachable, because sites need feeding after launch day.',
    points: ['Vercel, Netlify or your host', 'Domain & email setup', 'Content updates & new sections', 'Monthly care plans available']
  }
];

/* ── Process ────────────────────────────────────────────── */
export const STEPS = [
  { when:'Day 0 · free',      title:'A 20-minute call',      text:'You explain the business, not the tech. I ask the awkward questions early — budget, deadline, who signs off — so nothing derails us in week three.' },
  { when:'Week 1',            title:'Scope, price, sitemap', text:'A written scope with a fixed price and a real date. Everything in it is a promise; anything not in it is a conversation, never a surprise invoice.' },
  { when:'Weeks 2–5',         title:'Build in the open',     text:'A live preview link from day one, updated as I work. You watch it grow and correct me while corrections are still cheap.' },
  { when:'Launch + forever',  title:'Ship, then stay',       text:'Deploy, domain, SSL, analytics, a walkthrough of how to edit your own content — then I remain reachable. Five sites are still live and still mine to look after.' }
];

/* ── Tech stack marquee ─────────────────────────────────── */
export const STACK = [
  'HTML5','CSS3','JavaScript','TypeScript','React','Next.js','Tailwind','GSAP',
  'Node.js','Express','MongoDB','PostgreSQL','Firebase','REST APIs','Stripe',
  'Git','Vercel','Netlify','Figma','Canvas API','WebGL','SEO'
];

/* ── Project configurator ───────────────────────────────── */
export const CFG = {
  currency: 'USD',
  types: [
    { id:'landing',  label:'Landing page',      weeks:1, min:400,  max:900  },
    { id:'business', label:'Business website',  weeks:3, min:900,  max:2200 },
    { id:'shop',     label:'Online store',      weeks:4, min:1600, max:4500 },
    { id:'app',      label:'Web app / portal',  weeks:6, min:2600, max:7000 },
    { id:'redo',     label:'Rebuild an old site', weeks:2, min:700, max:2000 }
  ],
  features: [
    { id:'cms',      label:'I edit content myself', weeks:0.8, min:250, max:600 },
    { id:'auth',     label:'User accounts',         weeks:1.2, min:400, max:1100 },
    { id:'pay',      label:'Payments',              weeks:1.0, min:350, max:900 },
    { id:'book',     label:'Bookings / calendar',   weeks:1.0, min:350, max:950 },
    { id:'admin',    label:'Admin dashboard',       weeks:1.5, min:600, max:1600 },
    { id:'motion',   label:'Heavy animation',       weeks:1.0, min:300, max:900 },
    { id:'multi',    label:'More than one language',weeks:0.8, min:250, max:700 },
    { id:'api',      label:'Connect other tools',   weeks:0.8, min:300, max:800 },
    { id:'seo',      label:'SEO groundwork',        weeks:0.5, min:200, max:500 },
    { id:'care',     label:'Ongoing care plan',     weeks:0,   min:60,  max:180 }
  ],
  speeds: [
    { id:'normal', label:'No rush',        wMul:1,   pMul:1    },
    { id:'quick',  label:'Reasonably soon', wMul:.78, pMul:1.25 },
    { id:'rush',   label:'Yesterday',      wMul:.6,  pMul:1.55 }
  ],
  /* Budget comes second, not last. Probin shapes scope to the number
     rather than quoting something the client was never going to buy. */
  budgets: [
    { id:'b1',  label:'Under $500',   max:500  },
    { id:'b2',  label:'$500 – $1.5k', min:500,  max:1500 },
    { id:'b3',  label:'$1.5k – $4k',  min:1500, max:4000 },
    { id:'b4',  label:'$4k – $8k',    min:4000, max:8000 },
    { id:'b5',  label:'$8k and up',   min:8000 },
    { id:'ask', label:'Not sure yet' }
  ]
};

/* ── Robo Probin: intents ───────────────────────────────
   Matched on keyword hits. First best score wins.
   reply  : string OR array (one is picked at random)
   chips  : suggested follow-ups shown under the message
   action : optional command main.js understands
   ─────────────────────────────────────────────────────── */
export const INTENTS = [
  {
    id:'greet',
    keys:['hi','hello','hey','yo','salam','assalam','good morning','good evening','hola','namaste'],
    reply:[
      "Hello! I'm <b>Robo Probin</b> — the automated half. The human one builds websites for a living and replies within 24 hours.<br><br>What can I help you with?",
      "Hello, and welcome. Robo Probin here, standing in for the human. Do ask about the work, pricing, timelines or the stack — or I'm glad to simply take your details and pass them on."
    ],
    chips:['What does Probin do?','How much does a site cost?','Show me the work','I want to hire him']
  },
  {
    id:'about',
    keys:['who','about','probin','yourself','experience','background','years','tell me'],
    reply:"Probin is a full-stack web developer with <b>3 years</b> of shipping real client work — five live sites across Australia and Bangladesh, from a DJ's booking site to a rehab clinic with 30+ treatment pages.<br><br>Everything is hand-coded: frontend, backend, deployment, and support after launch. One person, whole stack, no handoffs.",
    chips:['What can he build?','Show me the work','What is his tech stack?','Hire him']
  },
  {
    id:'services',
    keys:['service','do you do','can he','can you build','offer','backend','frontend','api','database','fullstack','full stack','app','ecommerce','e-commerce','shop','store'],
    reply:"Both ends of the wire:<br><b>Frontend</b> — React, Next.js or clean vanilla, custom animation, responsive from 320px, accessible.<br><b>Backend</b> — Node/Express APIs, PostgreSQL/MongoDB/Firebase, auth, payments, admin dashboards.<br><b>Plus</b> — performance, SEO, deploys, domains, and ongoing care after launch.",
    chips:['How much?','How long does it take?','What is the process?','Start a project'],
    action:'goto:#services'
  },
  {
    id:'price',
    keys:['price','cost','budget','how much','charge','rate','quote','expensive','cheap','money','pay','$','usd','taka','dollar','configurator','estimate'],
    reply:"Straight answer, no cageyness:<br>• Landing page — <b>$400–900</b><br>• Business site — <b>$900–2,200</b><br>• Online store — <b>$1,600–4,500</b><br>• Web app / portal — <b>$2,600–7,000</b><br><br>Fixed price agreed before a line is written, so there is no meter running. Want me to scroll you to the configurator? It prices your actual scope.",
    chips:['Open the configurator','Why that range?','How long does it take?','Take my details'],
    action:'goto:#contact'
  },
  {
    id:'budget',
    keys:['budget','my budget','afford','only have','can only','tight','discount','negotiate','flexible','cheaper','lower','stretch','small budget','limited'],
    reply:"Probin works <b>to</b> a budget rather than against it. Say your number and he shapes the scope around it — fewer pages now, phase two later, a simpler CMS — instead of quoting something you were never going to buy.<br><br>There's a <b>budget field</b> in the configurator below, and it tells you honestly whether the scope fits. Or just say the number here.",
    chips:['Open the configurator','Take my details','What could I get for $800?'],
    action:'goto:#contact'
  },
  {
    id:'budget-small',
    keys:['800','500','$300','$500','$800','1000','what could i get','small project','one page','just a landing'],
    reply:"At the smaller end you'd get a <b>single-page site</b> done properly — custom design, mobile-perfect, fast, contact form wired up, deployed on your domain. Not a template with your logo dropped in.<br><br>What you would not get is a CMS, accounts or a store. Those come in phase two, and Probin will tell you which ones you can safely skip for now.",
    chips:['Open the configurator','Take my details','How long does it take?']
  },
  {
    id:'why-range',
    keys:['why that range','why range','depends','what changes the price','vary'],
    reply:"Because scope is the price. What moves it: number of unique pages, whether you edit content yourself, user accounts, payments, bookings, an admin dashboard, and how much custom motion you want.<br><br>The configurator below adds all of that up live — and the human will tell you if you're over-buying.",
    chips:['Open the configurator','Take my details']
  },
  {
    id:'time',
    keys:['how long','timeline','deadline','fast','when','duration','weeks','delivery','urgent','rush'],
    reply:"Landing page: <b>about a week</b>. Business site: <b>2–4 weeks</b>. Store: <b>3–6 weeks</b>. Web app: <b>5–10 weeks</b>.<br><br>Rush work is possible and priced honestly — roughly +25% for soon, +55% for yesterday. You get a live preview link from day one, so you're never waiting in the dark.",
    chips:['Open the configurator','What is the process?','I have a deadline']
  },
  {
    id:'process',
    keys:['process','how does it work','steps','what happens','workflow','how do we start','next step','revisions','contract'],
    reply:"Four steps, no mystery:<br><b>1.</b> A free 20-minute call — you talk business, he asks the awkward questions early.<br><b>2.</b> A written scope with a <b>fixed price</b> and a real date.<br><b>3.</b> Building in the open — a live preview link from day one, so you correct things while corrections are cheap.<br><b>4.</b> Launch, then he stays reachable.",
    chips:['Book a call','How much does a site cost?','How long does it take?'],
    action:'goto:#process'
  },
  {
    id:'work',
    keys:['work','portfolio','project','example','built','site','showcase','previous','client','case study'],
    reply:"Five live client sites — <b>DJ JAI</b> (Sydney events), <b>Physio Rehab Point</b> (clinic, 30+ pages), <b>Sujit Roy</b> (research portfolio), <b>Muhammad Yousuf</b> (motion designer) and <b>Pratik Mojumder</b> (published research).<br><br>Scrolling you there now — hit <b>Peek</b> on any card to load the real site inside this page.",
    chips:['Which was hardest?','How much?','Hire him'],
    action:'goto:#work'
  },
  {
    id:'hardest',
    keys:['hardest','difficult','challenge','proud','favourite','favorite','best'],
    reply:"Physio Rehab Point. Thirty-plus treatment pages sounds like a content problem until you remember the visitor is <i>in pain</i> and has no patience. It became an information-architecture job: five condition categories, a four-stage recovery pathway, and booking reachable from anywhere in two clicks.",
    chips:['Show me the work','Hire him']
  },
  {
    id:'stack',
    keys:['stack','tech','technology','language','framework','react','next','node','wordpress','tool','use'],
    reply:"Day to day: <b>JavaScript/TypeScript, React, Next.js, Node, Express, PostgreSQL, MongoDB, Firebase, Tailwind, GSAP, Git, Vercel</b>.<br><br>And when a site does not need a framework, he does not use one — this page is zero dependencies and no build step. The right tool, not the trendy one.",
    chips:['How was this site built?','What can he build?','Hire him']
  },
  {
    id:'thissite',
    keys:['this site','this page','this website','no framework','framework','how did you build','built this','dependencies','vanilla','how was this'],
    reply:"Zero dependencies, no build step, no page builder. The hero is a canvas simulation, x-ray mode walks the DOM, the three arcade games are hand-written canvas loops, and I'm a small intent engine — not a paid API.<br><br>Press <b>X</b> to strip the page to its wireframe, or <b>⌘K</b> for the command palette.",
    chips:['Show me x-ray mode','Take me to the games','Hire him']
  },
  {
    id:'games',
    keys:['game','games','play','arcade','fun','bored','bug squash','stacker','hex'],
    reply:"Three, all written from scratch in canvas: <b>Bug Squash</b> (reflex), <b>Div Stacker</b> (precision) and <b>Hex Hunter</b> (colour eye). No engine, no library.<br><br>Beat a high score and I'll happily brag to the human on your behalf.",
    chips:['Take me to the games','How was this site built?','Hire him'],
    action:'goto:#arcade'
  },
  {
    id:'xray',
    keys:['x-ray','xray','wireframe','blueprint','inspect','structure','skeleton'],
    reply:"Flipping it now. X-ray mode strips every colour and gradient off the page and shows the actual structure — element names, live dimensions, the grid it all sits on. Press <b>X</b> any time to switch it back.",
    chips:['How was this site built?','Take me to the games','Hire him'],
    action:'xray'
  },
  {
    id:'hire',
    keys:['hire','start','work with','available','details','take my details','begin','engage','interested','need a website','want a site','build me','looking for'],
    reply:"Wonderful — thank you for considering him. This takes about thirty seconds, and nothing is binding.<br><br>May I start with your <b>name</b>?",
    action:'lead'
  },
  {
    id:'contact',
    keys:['contact','email','reach','phone','whatsapp','call','talk','message','get in touch'],
    reply:`Whichever suits you best:<br>• <b>WhatsApp</b> — <a href="${waLink()}" target="_blank" rel="noopener">${PROFILE.whatsapp}</a>, usually the quickest<br>• <b>Email</b> — <a href="mailto:${PROFILE.email}">${PROFILE.email}</a><br>• Or leave your details with me and Probin will come back to you within <b>${PROFILE.responseTime}</b>.<br><br>No pressure either way — happy to just answer questions too.`,
    chips:['Take my details','Book a call','How much does a site cost?'],
    action:null
  },
  {
    id:'call',
    keys:['call','zoom','meet','meeting','book a call','video'],
    reply:"A 20-minute intro call, free, and no pitch deck — you describe the business, and he asks the practical questions early: budget, deadline, who signs off.<br><br>If you'd like one, leave me your name and either an email or a WhatsApp number, and he'll send some times over.",
    action:'lead'
  },
  {
    id:'location',
    keys:['where','location','based','country','timezone','remote','bangladesh','dhaka'],
    reply:`Based in ${PROFILE.location.split(' · ')[0]}, working remote worldwide — the DJ JAI site is a Sydney client, so the timezone gap is a solved problem. Async updates, a live preview link, and calls whenever your clock allows.`,
    chips:['Hire him','How much?']
  },
  {
    id:'support',
    keys:['support','maintain','maintenance','after','update','fix','host','hosting','domain','care'],
    reply:"Launch day is the start, not the end. Care plans cover content updates, new sections, dependency and security updates, backups and monitoring — from <b>$60/month</b>.<br><br>Domains, DNS, SSL and deploys are handled either way; you never touch a nameserver.",
    chips:['How much?','Hire him']
  },
  {
    id:'wordpress',
    keys:['wordpress','wix','squarespace','shopify','template','theme','builder','webflow'],
    reply:"He's happy to work with them — and here's the honest view: page builders are quick to start and slower to live with. Plugin bloat, sluggish scores, and a redesign that often means starting over.<br><br>Custom code costs a little more up front and stops costing you afterwards. That said, if Shopify genuinely is the right answer for your store, he'll tell you so rather than sell you a build.",
    chips:['How much for custom?','Show me the work']
  },
  {
    id:'thanks',
    keys:['thanks','thank','cheers','appreciate','great','awesome','nice','cool','love it','amazing'],
    reply:["Any time. I'm a robot — this is genuinely the highlight of my day.","Glad to help. Want me to pass your details to the human while you're in a good mood?"],
    chips:['Take my details','Show me the work']
  },
  {
    id:'bye',
    keys:['bye','goodbye','later','see ya','cya','gtg'],
    reply:"See you. If you change your mind, I'm the little face in the corner — and the contact form never sleeps either.",
    chips:['Actually, take my details']
  },
  {
    id:'joke',
    keys:['joke','funny','laugh','bored me','entertain'],
    reply:["A CSS developer walks into a bar. Then a pub. Then a tavern. He couldn't find the right <i>selector</i>.","Why did the developer go broke? He used up all his <i>cache</i>.<br><br>I'm contractually required to say the human writes better code than jokes."],
    chips:['Take me to the games','Show me the work']
  },
  {
    id:'human',
    keys:['human','real person','are you a bot','robot','ai','chatgpt','are you real'],
    reply:"Robot, and not shy about it — no language model behind me, just a few hundred lines of keyword matching the human wrote himself. Which is rather the point: he builds the thing rather than renting it.<br><br>For anything I can't answer, leave your details and you'll get a human reply within 24 hours.",
    chips:['Take my details','How was this site built?']
  }
];

export const FALLBACKS = [
  "That one's past my wiring — I'm keyword matching, not thinking. Try <b>pricing</b>, <b>work</b>, <b>timeline</b>, <b>stack</b> or <b>games</b>, or leave your details and the human will answer properly.",
  "I didn't catch that. I'm good on pricing, timelines, the stack and the work — anything deeper, let me take your details and pass it to the human.",
  "Not in my vocabulary yet. Ask about <b>cost</b>, <b>how long</b>, <b>what he builds</b>, or say <b>hire</b> and I'll grab your details."
];

export const GREETING = {
  reply: `Hey — I'm <b>Robo Probin</b>. 🤖<br><br>The human builds websites, front to back, and has done it for real clients for three years. I can answer the usual questions and take your details.`,
  chips: ['How much does a site cost?','Show me the work','What can he build?','I want to hire him']
};
