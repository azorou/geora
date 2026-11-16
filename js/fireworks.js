// Feuerwerk über der ganzen Seite (bei 100 %). Eine Leinwand, die sich nach dem Ende selbst entfernt; bei "Bewegung reduzieren" im System entfällt sie.
import { pop } from './sound.js';
export const FX_MS = 3800; // Dauer der Raketen
export function fireworks(ms = FX_MS) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const old = document.getElementById('fx'); if (old) old.remove();
  const cv = document.createElement('canvas'); cv.id = 'fx'; document.body.appendChild(cv);
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  const P = []; const t0 = performance.now(); let last = -1e9;
  const burst = () => {
    const x = W * (.15 + Math.random() * .7), y = H * (.12 + Math.random() * .38), hue = Math.random() * 360, n = 50 + (Math.random() * 30 | 0);
    for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n + Math.random() * .2, s = 1.5 + Math.random() * 4.2; P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, d: .011 + Math.random() * .012, h: hue + Math.random() * 40 }); }
    pop();
  };
  const frame = now => {
    const el = now - t0;
    if (el < ms && now - last > 400) { burst(); last = now; }
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, 0, W, H); // Schweife: altes Bild langsam ausblenden
    c.globalCompositeOperation = 'lighter';
    for (const p of P) { p.x += p.vx; p.y += p.vy; p.vy += .055; p.vx *= .985; p.vy *= .985; p.life -= p.d; if (p.life > 0) { c.fillStyle = 'hsla(' + p.h + ',100%,60%,' + p.life + ')'; c.beginPath(); c.arc(p.x, p.y, 2.2, 0, 7); c.fill(); } }
    for (let i = P.length - 1; i >= 0; i--) if (P[i].life <= 0) P.splice(i, 1);
    if (el < ms || P.length) requestAnimationFrame(frame); else cv.remove();
  };
  requestAnimationFrame(frame);
}
