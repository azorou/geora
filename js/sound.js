// Töne mit Web Audio (ohne Audiodateien). Browser erlauben Ton erst nach der ersten Berührung der Seite; dann wird er freigeschaltet.
import { S } from './state.js';
let ctx = null;
const AC = () => window.AudioContext || window.webkitAudioContext;
export function initSound() {
  const unlock = () => { try { if (!ctx && AC()) ctx = new (AC())(); if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) { /* kein Ton möglich */ } };
  ['pointerdown', 'keydown', 'touchstart'].forEach(t => document.addEventListener(t, unlock, { capture: true, passive: true }));
}
const ready = () => S.opts.sound !== false && ctx && ctx.state === 'running';
function tone(f, at, d, o = {}) { // eine Note: Frequenz, Beginn, Dauer (s); weicher Anschlag und Ausklang
  const t = ctx.currentTime + at, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || .2, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + d + .05);
}
const SND = {
  ok: () => { tone(784, 0, .14); tone(1047, .09, .26); },                                                   // richtig: kurzer, heller Zweiklang aufwärts
  miss: () => { tone(220, 0, .45, { type: 'sawtooth', to: 147, vol: .1 }); tone(110, 0, .45, { type: 'triangle', to: 90, vol: .14 }); }, // nicht gewusst: tiefer, fallender Ton
  end: () => [523, 659, 784].forEach((f, i) => tone(f, i * .14, .32, { type: 'triangle' })),                  // Runde zu Ende (unter 90 %): ruhiger Dreiklang
  good: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .34, { type: 'triangle', vol: .22 })); [784, 1047, 1319].forEach(f => tone(f, .5, .9, { vol: .13 })); } // ab 90 % (und bei 100 %): Fanfare
};
export function play(name) { try { if (ready() && SND[name]) SND[name](); } catch (e) { /* Ton ist nie wichtig genug für einen Fehler */ } }
export function pop() { // leises Knallen für das Feuerwerk (kurzes gefiltertes Rauschen)
  try {
    if (!ready()) return;
    const n = Math.floor(ctx.sampleRate * .18), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = b; g.gain.value = .12; src.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* ignorieren */ }
}
