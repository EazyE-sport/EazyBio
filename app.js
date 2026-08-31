const c = document.getElementById('bg');
const ctx = c.getContext('2d');
let W = 0, H = 0, dpr = 1;
const rects = [];
const mouse = { x: -9999, y: -9999 };
const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  c.width = W * dpr;
  c.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  build();
}

function build() {
  rects.length = 0;
  const n = Math.round(Math.min(70, Math.max(22, (W * H) / 26000)));
  for (let i = 0; i < n; i++) {
    const s = 8 + Math.pow(Math.random(), 2) * 74;
    rects.push({
      x: Math.random() * W,
      y: Math.random() * H,
      w: s,
      h: s * (0.35 + Math.random() * 0.9),
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.06 - Math.random() * 0.3,
      a: Math.random() * Math.PI,
      va: (Math.random() - 0.5) * 0.0035,
      d: 0.25 + Math.random() * 0.9,
      hot: Math.random() < 0.14,
      p: Math.random() * 100
    });
  }
}

function grid(t) {
  const step = 64;
  ctx.strokeStyle = 'rgba(255,255,255,0.028)';
  ctx.lineWidth = 1;
  const off = (t * 0.006) % step;
  ctx.beginPath();
  for (let x = -off; x < W + step; x += step) {
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, H);
  }
  for (let y = -off; y < H + step; y += step) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(W, Math.round(y) + 0.5);
  }
  ctx.stroke();
}

let last = 0;
function frame(t) {
  const dt = Math.min(32, t - last) / 16.67;
  last = t;
  ctx.clearRect(0, 0, W, H);
  grid(t);

  for (const r of rects) {
    r.x += r.vx * dt * r.d;
    r.y += r.vy * dt * r.d;
    r.a += r.va * dt;
    r.p += 0.012 * dt;

    const dx = r.x - mouse.x, dy = r.y - mouse.y;
    const dist2 = dx * dx + dy * dy;
    if (dist2 < 34000) {
      const f = (1 - dist2 / 34000) * 0.9;
      r.x += dx * 0.012 * f * dt;
      r.y += dy * 0.012 * f * dt;
    }

    if (r.y + r.h < -40) { r.y = H + 60; r.x = Math.random() * W; }
    if (r.x < -120) r.x = W + 100;
    if (r.x > W + 120) r.x = -100;

    const blink = 0.5 + 0.5 * Math.sin(r.p);
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.a);
    if (r.hot) {
      ctx.strokeStyle = 'rgba(0,229,160,' + (0.1 + blink * 0.32) + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.fillStyle = 'rgba(0,229,160,0.035)';
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.04 + blink * 0.07) + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
    }
    ctx.restore();
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
resize();
if (!slow) requestAnimationFrame(frame);
else { ctx.clearRect(0, 0, W, H); grid(0); }

const boot = document.getElementById('boot');
const bar = boot.querySelector('.boot-bar i');
let p = 0;
const tick = setInterval(() => {
  p += 6 + Math.random() * 22;
  if (p >= 100) {
    p = 100;
    clearInterval(tick);
    setTimeout(() => {
      boot.classList.add('off');
      reveal();
    }, 180);
  }
  bar.style.width = p + '%';
}, 70);

let revealed = false;
function reveal() {
  if (revealed) return;
  revealed = true;
  const cards = [...document.querySelectorAll('.card')];
  const io = new IntersectionObserver((rows, obs) => {
    rows.forEach(r => {
      if (!r.isIntersecting) return;
      const i = cards.indexOf(r.target) % 3;
      setTimeout(() => r.target.classList.add('in'), 70 * i);
      obs.unobserve(r.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  cards.forEach(el => io.observe(el));
}
setTimeout(reveal, 2600);

document.querySelectorAll('.card').forEach(el => {
  el.addEventListener('pointermove', e => {
    const b = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - b.left) + 'px');
    el.style.setProperty('--my', (e.clientY - b.top) + 'px');
  });
});

const clock = document.getElementById('clock');
function time() {
  const d = new Date();
  clock.textContent = [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':');
}
time();
setInterval(time, 1000);
document.getElementById('year').textContent = new Date().getFullYear();

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&';
document.querySelectorAll('.card h2').forEach(h => {
  const card = h.closest('.card');
  let run = null;
  card.addEventListener('pointerenter', () => {
    if (slow || window.innerWidth < 700) return;
    const nodes = [...h.childNodes].filter(n => n.nodeType === 3);
    if (!nodes.length) return;
    const node = nodes[0];
    const orig = node.textContent;
    let step = 0;
    clearInterval(run);
    run = setInterval(() => {
      step++;
      node.textContent = orig.split('').map((ch, i) => {
        if (ch === ' ') return ch;
        if (i < step / 1.6) return ch;
        return letters[Math.floor(Math.random() * letters.length)];
      }).join('');
      if (step / 1.6 > orig.length) { clearInterval(run); node.textContent = orig; }
    }, 32);
  });
});
