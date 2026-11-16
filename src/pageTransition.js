// Pixel-sweep page transition, used only when opening the Engineering, Sustainability, Media and Research pages.
// A canvas of square blocks fills the screen from top to bottom, the page changes underneath, then the blocks clear from top to bottom.
const GLYPHS = '0123456789ABCDEF#%&=+*<>/';
const COVER_MS = 650;
const REVEAL_MS = 750;
const BASE = '#111522';
// Colour of a block as it ages: bright flash first, then fading into the page colour
const AGES = [[0.06, '#FFFFFF'], [0.12, '#DCE3EF'], [0.2, '#98A9C4'], [0.3, '#536684'], [0.4, '#303D59']];

let busy = false;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const frames = (n) => new Promise((r) => { const step = () => (n-- > 0 ? requestAnimationFrame(step) : r()); step(); });

function run(target) {
  const root = document.documentElement;
  const w = window.innerWidth, h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '9999', pointerEvents: 'auto' });
  cv.width = w * dpr; cv.height = h * dpr;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cs = Math.max(32, Math.round(w / 26));
  const cols = Math.ceil(w / cs), rows = Math.ceil(h / cs);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // a / b: moment (0..1) this block appears while covering / disappears while revealing; rows go top to bottom with a ragged edge
      cells.push({ x: c * cs, y: r * cs, a: (r / rows) * 0.7 + Math.random() * 0.3, b: (r / rows) * 0.7 + Math.random() * 0.3, ch: glyph() });
    }
  }
  ctx.font = `${Math.round(cs * 0.46)}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const colour = (age) => { for (const [limit, col] of AGES) if (age < limit) return col; return BASE; };
  const drawBlock = (c, col) => {
    if (col === BASE) { ctx.fillStyle = BASE; ctx.fillRect(c.x, c.y, cs, cs); return; }
    ctx.fillStyle = col; ctx.fillRect(c.x + 1, c.y + 1, cs - 2, cs - 2);
    if (Math.random() < 0.1) c.ch = glyph();
    ctx.fillStyle = col === '#FFFFFF' || col === '#DCE3EF' || col === '#98A9C4' ? BASE : '#98A9C4';
    ctx.fillText(c.ch, c.x + cs / 2, c.y + cs / 2 + 1);
  };
  const paint = (mode, p) => {
    ctx.clearRect(0, 0, w, h);
    for (const c of cells) {
      if (mode === 'cover') { if (p >= c.a) drawBlock(c, colour(p - c.a)); }
      else if (p < c.b) drawBlock(c, BASE);
      else if (p < c.b + 0.14) drawBlock(c, colour(0.34 - (p - c.b) * 2.4));
    }
  };
  const play = (mode, ms) => new Promise((done) => {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms) * (mode === 'reveal' ? 1.14 : 1);
      paint(mode, p);
      if (now - t0 < ms) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });

  (async () => {
    try {
      await play('cover', COVER_MS);
      paint('cover', 1);
      // change page while the screen is fully covered; jump to the top without the smooth-scroll animation
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.location.hash = target;
      await frames(2); await wait(120);
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
      await play('reveal', REVEAL_MS);
    } finally {
      cv.remove();
      busy = false;
    }
  })();
}

// Use as a link's onClick: onClick={(e) => openWithTransition(e, 'research')}
// Plain clicks get the transition; ctrl/cmd-clicks and reduced-motion users get the normal link.
export function openWithTransition(e, hash) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduced()) return;
  const target = hash.replace(/^#/, '');
  e.preventDefault();
  if (busy || window.location.hash.slice(1) === target) return;
  busy = true;
  run(target);
}