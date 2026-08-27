# Probin.dev — portfolio

A portfolio that argues for itself. Instead of showing screenshots of work, it hands
the visitor the tools: an x-ray mode that exposes the page's own structure, a playground
of six hand-written canvas builds, a chatbot that captures leads, a budget-aware scope
configurator, and a performance readout measured live from the page they're standing in.

**No framework. No build step. No dependencies.** Open `index.html` and it runs.

---

## Run it

Any static server works. From this folder:

```bash
python devserver.py
```

Then open <http://localhost:4321>. It's `python -m http.server` with `no-store`
headers — without them the browser keeps serving stale ES modules after an edit,
which will cost you an hour before you work out why. Development only; the
deployed site is plain static files.

Opening `index.html` directly via `file://` mostly works too, but ES modules and the
page-weight metric behave better over HTTP.

## Deploy it

Drag this folder onto **Netlify Drop**, or:

```bash
npx vercel --prod
```

For GitHub Pages: push the folder to a repo and enable Pages on the branch root.
There is nothing to compile, so every host is a static host.

---

## Where to edit things

Almost everything you'll want to change lives in **`js/config.js`** — one file, no logic.

| What | Where in `config.js` |
|---|---|
| Name, email, WhatsApp, location, social links | `PROFILE` |
| Hero social buttons (incl. WhatsApp) | built from `PROFILE` automatically |
| **Contact form delivery** | `PROFILE.formEndpoint` |
| Scrolling words under the hero | `TICKER` |
| The six project cards | `PROJECTS` |
| Industry demo templates | `DEMOS` |
| Service blocks | `SERVICES` |
| The four process steps | `STEPS` |
| Tech marquee | `STACK` |
| Prices, timelines, configurator options | `CFG` |
| Budget brackets | `CFG.budgets` |
| Everything Robo Probin knows | `INTENTS`, `FALLBACKS`, `GREETING` |

### The contact form is already wired up

Both the contact form and the chatbot deliver straight to `probinmajumderr@gmail.com`
via **Web3Forms**, using the access key set on `PROFILE.accessKey` in `js/config.js`.
It's safe to have the key in the client — Web3Forms scopes it to Probin's inbox only.

Do send a real test submission after any hostname change (e.g. moving to Vercel), as
Web3Forms rate-limits by origin and it's worth confirming the reply lands in the inbox
rather than the spam folder.

To fall back to the mail-client flow, clear `PROFILE.formEndpoint` to an empty string.

**Flexible on purpose.** The form asks for a name and *either* an email or a WhatsApp
number, plus an optional preference for how to hear back. The written brief is also
optional — people who would rather explain on a call now can. `sendBrief()` in
`js/contact.js` composes the message body and only sends the `email` field to
Web3Forms when it's a real address (a blank one would be rejected as a bad reply-to).

### Teaching the bot something new

Add an object to `INTENTS`:

```js
{
  id:   'hosting',
  keys: ['hosting','server','where is it hosted','uptime'],
  reply:'Vercel or Netlify for most builds — free tier, global CDN, deploys on push.',
  chips:['How much does a site cost?','Hire him'],
  action:'goto:#services'          // optional: 'lead', 'xray', or 'goto:#id'
}
```

Matching is keyword scoring — a whole-word hit counts more than a substring. Keep the
`keys` lowercase. Anything a `chips` button says should itself match some intent,
otherwise clicking it hits the fallback.

---

## File map

```
index.html            all markup — sections are commented and numbered
css/
  main.css            design tokens, reset, type, nav, hero, footer
  components.css      cards, vitals, arcade, contact, bot, palette, peek
  blueprint.css       x-ray mode only
js/
  config.js           ← all content and copy
  main.js             boot, theme, sound, cursor, nav, palette, shortcuts
  hero.js             the canvas lattice behind the headline
  sections.js         ticker, services, process, marquee, responsive lab
  work.js             project cards + the "Peek" live-site viewer
  vitals.js           real Performance API measurements
  arcade.js           the playground — three games and three experiences
  bot.js              Robo Probin: intents + lead capture
  contact.js          scope configurator, form, and mail delivery
  blueprint.js        x-ray toggle and the inspector HUD
demos/                six self-contained industry templates
  ecommerce.html      Aurelia — store, live cart, product grid
  hospital.html       Northside Medical — departments, appointments
  restaurant.html     Saffron & Smoke — tabbed menu, reservations
  realestate.html     Keystone — filterable listings, saved homes
  saas.html           Flowdesk — product mock, pricing toggle
  school.html         Brightpath — programmes, admissions, FAQ
assets/
  probin.webp         hero portrait, background removed (46 KB, served first)
  probin.png          same image, fallback for browsers without WebP
  Segment_*.png       the transparent portrait Probin cut out himself (source)
  IMG_20260826_*.png  the original photo, before the background was removed
  og.png             1200x630 social preview card (built from the photo)
  favicon.svg
devserver.py          local static server with caching disabled
```

## Adding another demo template

Every demo carries one real, working feature rather than a static mock:

| Demo | The thing that actually works |
| --- | --- |
| `ecommerce.html` | Category filter, search and sort · quick-view with size and colour · a bag kept in `localStorage` · validated checkout that issues an order number |
| `hospital.html` | Symptom-to-department finder · four-step booking (department → consultant → day → slot) with seeded availability, so taken slots stay taken |
| `restaurant.html` | Dietary filters and dish notes · reservations that know the closing day, both sittings and the covers left on each |
| `realestate.html` | Budget/bed filters and sort · detail modal with gallery, spec and a live repayment calculator · saved homes compared side by side |
| `saas.html` | Seat slider that reprices every plan · comparison table · a payback calculator · sign-up that creates a workspace slug |
| `school.html` | Age-to-year-group finder · fee calculator with sibling discounts, plans and extras · tour booking on the two mornings tours actually run |

Availability in the booking demos is **seeded from a hash**, not `Math.random()` — a
slot that reads "full" stays full while the visitor clicks around, which is the
difference between a demo that feels real and one that feels fake.

Each file in `demos/` is **completely self-contained** — its own CSS, its own
JavaScript, its own Google Font. Nothing is shared, deliberately: a client can be
sent one file on its own, and changing one template can never break another.

1. Copy the closest existing demo and rewrite it.
2. Add a row to `DEMOS` in `js/config.js` — `title`, `file`, `bg`, `brand`,
   `accent`, `desc`, `tags`. Set `bg` to the demo's own page background so the
   card does not flash white while the frame loads.

The card, the live thumbnail and the "Try it live" viewer all appear on their own.

Gyms, law firms, travel agencies, NGOs, wedding/events and construction are the
usual next requests.

---

## Things worth knowing

- **X-ray mode** is driven by `data-x` attributes in the HTML. Add `data-x="section#foo"`
  to any new element and it joins the schematic with a label.
- **Keyboard**: `X` x-ray · `T` theme · `⌘K` / `Ctrl+K` palette · `Esc` closes things.
  Shortcuts are suppressed while typing in a field.
- **Live vitals** read `performance.getEntriesByType()`. Over `file://` the transfer
  size reads zero and the card says so rather than inventing a number.
- **Work thumbnails are the live sites**, not screenshots. Each card frames the real
  production URL, loaded lazily 400px before it scrolls into view, and fades in over a
  CSS placeholder that stays put if the site never loads. Frames are `pointer-events:
  none` and sandboxed without `allow-top-navigation`, so a framed site can't hijack the
  page. On cards wider than 420px the site renders at 1024px and is scaled down to show
  its desktop layout; on narrower cards the frame renders at its own size so the site's
  responsive layout fills it. Nothing to regenerate when a client redesigns.
- **Peek** opens the same sites full size. Sites that send `X-Frame-Options` can't be
  framed — after 7 seconds the viewer says so and offers a real link instead. That's
  expected behaviour, not a bug.
- **Light is the default theme.** `index.html` ships `data-theme="light"` so the very
  first paint is light, and `initTheme()` falls back to light rather than following the
  visitor's OS setting. The toggle still works and still remembers a visitor's choice in
  `localStorage` under `probin.theme` — clear that key to see a first-time visit.
- **The hero portrait is Probin's own transparent PNG** (`assets/Segment_*.png`),
  re-encoded to `probin.webp` (50 KB) with `probin.png` as a fallback for browsers
  without WebP. Keep any replacement transparent — the hero paints its own bloom and
  ground shadow behind the image, and an opaque rectangle would sit on top of both.
  To swap it: drop the new file in and re-run the two-line convert (trim to `getbbox()`,
  `thumbnail` to 760 wide, save WebP + a 520-wide PNG), then update the `width`/`height`
  on the `<img>` so the layout does not shift while it loads.
- **The social preview is a real PNG, not an SVG.** Facebook, LinkedIn, WhatsApp and X
  all ignore SVG `og:image` values, so `assets/og.png` is a 1200x630 raster built from
  the portrait plus the headline. Rebuild it if the headline, photo or handles change.
- **Reduced motion** is honoured throughout: the hero renders one static frame, the
  boot sequence is skipped, and transitions collapse.
- **The playground** holds six canvas modules, split into two kinds by the `kind`
  field on each class's `static meta`. A `'game'` shows the score HUD and waits for
  "Insert coin"; a `'demo'` hides the HUD and starts the moment its tab is clicked,
  because an experience has nothing to win. Adding a seventh is one class plus one
  entry in the `GAMES` map plus one `<button class="gtab">` in the markup.
- **Games** pause when scrolled off-screen and resume when scrolled back.
  High scores are per-device, in `localStorage`.
- **The contact section has two modes.** `Just send a message` is the default —
  three fields and a button — and `Build a full brief` reveals the configurator plus
  the optional fields (`data-brief-only` in the markup). The switch is `setMode()` in
  `js/contact.js`, and anything that deep-links to the estimate (the chatbot's pricing
  answers, the palette's "Set my budget") calls it first so the configurator is on
  screen when the visitor arrives.
- **Budget is a first-class field**, not an afterthought. The configurator reconciles
  the visitor's number against the estimated range and says plainly whether it fits —
  and when it doesn't, it works out which features to drop, or which smaller project
  type is the honest answer. That logic is `verdict()` in `js/contact.js`; the wording
  is all in that one function. The number rides along in the email either way.
- **The command palette** has a labelled `Jump to… ⌘K` button in the header at every
  breakpoint (icon-only under 1240px), plus a footer link and the keyboard shortcut.

## Known limits

- The arcade is cramped on phones — the canvas is a fixed 960×540 scaled to fit, so on a
  375px screen it renders about 336×189. Playable, but the desktop experience is the
  real one.
- **The contact form still needs a `formEndpoint`.** Until one is set, the form and the
  chatbot open the visitor's mail client pre-filled to `probinmajumderr@gmail.com`
  rather than delivering straight to the inbox — see "Making the contact form actually
  deliver" above. That is the last thing standing between this and a fully live site.
- Five external sites load in the work section. They're lazy and off the critical path,
  but on a very slow connection the placeholders are visible for a moment first.
#   p o r t f o l i o 
 
 