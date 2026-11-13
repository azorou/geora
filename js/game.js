// Spielablauf: Runde, Klicks, Eingabe, Tipps, Punkte/XP, Auswertung
import { $, S, th, fid, nameOf, switchScreen } from './state.js';
import { TOP, UN195, EXT30, FLAGFB, SYN, ZOOM, TIP_COST, ATT_SCORE, RIPPLE } from './data.js';
import { parse, indexGeo, prep, simp, loadData, initMaps, fit, refresh, refreshAll, setBlink, flash, ripple } from './map.js';
import { tr } from './i18n.js';
import { recordRound, totalXP } from './storage.js';

const step = async t => { $('target-prompt').textContent = t; await new Promise(r => setTimeout(r, 30)); };
export const updateXP = () => { $('xp').textContent = totalXP(); };

// ---------- Zeit ----------
function tick() { S.secs++; $('timer').textContent = String(S.secs / 60 | 0).padStart(2, '0') + ':' + String(S.secs % 60).padStart(2, '0'); }
function runTimer() { clearInterval(S.timerI); S.timerI = setInterval(tick, 1000); }
export const pauseGame = () => clearInterval(S.timerI);
export const resumeGame = () => { if (S.inGame && !S.over && !S.reviewing) runTimer(); };

// ---------- Start / Ende ----------
export async function startGame() {
  $('end-modal').classList.remove('active');
  $('game-stats').style.display = 'flex'; S.inGame = true; S.over = false; S.reviewing = false; document.body.classList.add('ingame');
  $('review-bar').style.display = 'none'; $('prompt-bar').style.display = 'flex';
  document.documentElement.style.setProperty('--sea', th().sea);
  $('type-wrap').style.display = S.mode === 'type' ? 'flex' : 'none';
  switchScreen('game-screen');
  clearInterval(S.timerI); S.target = null; $('hint').textContent = '';
  if (typeof L === 'undefined') { $('target-prompt').textContent = tr('⚠️ Kartenbibliothek (Leaflet) konnte nicht geladen werden.'); return; }
  if (!S.geo) {
    $('target-prompt').textContent = tr('Karte wird geladen …');
    const data = await (S.geoLoad || (S.geoLoad = loadData())); // Download startet schon beim Öffnen der Seite (siehe boot in ui.js)
    if (!data) { S.geoLoad = null; $('target-prompt').textContent = tr('⚠️ Kartendaten konnten nicht geladen werden. Bitte im normalen Browser öffnen (z. B. über GitHub Pages), nicht in einem Vorschau-Fenster.'); return; }
    try {
      await step(tr('Karte wird vorbereitet …'));
      data.forEach(f => { if (f.geometry && /Polygon/.test(f.geometry.type)) f.geometry = simp(f.geometry); });
      S.geo = data; indexGeo(); S.geo.forEach(prep);
      await initMaps(step);
    } catch (e) { console.error(e); S.geo = null; S.geoLoad = null; $('target-prompt').textContent = tr('⚠️ Fehler beim Kartenaufbau:') + ' ' + e.message + ' ' + tr('(Seite neu laden)'); return; }
  }
  try { await step(tr('Karte wird eingepasst …')); fit(); resetDeck(); S.secs = 0; $('timer').textContent = '00:00'; runTimer(); nextRound(); }
  catch (e) { console.error(e); $('target-prompt').textContent = tr('⚠️ Fehler beim Start:') + ' ' + e.message; }
}
function resetDeck() {
  const L2 = a => [...new Set(a.map(c => S.idx[c]).filter(Boolean))], un = parse(UN195).map(x => x[0]), ex = parse(EXT30).map(x => x[0]);
  const pool = S.diff === 'easy' ? L2(TOP) : S.diff === 'un' ? L2(un) : L2([...un, ...ex]);
  S.valid = new Set(pool.map(fid)); S.deck = [...pool]; // jedes Land genau einmal
  S.solved = {}; S.tmp = {}; S.tipsBy = {}; S.done = 0; S.score = 0; S.tipsTotal = 0; S.total = S.deck.length; S.practice = false;
  setBlink(null, false); refreshAll(); counter();
}
const counter = () => { // Durchlauf-Prozent = Durchschnitt der bisher beantworteten Länder (am Ende gleich der Genauigkeit)
  $('counter').textContent = S.done + ' / ' + S.total; $('pct').textContent = (S.done ? Math.round(100 * S.score / S.done) : '–') + ' %';
};
export function quitGame() {
  clearInterval(S.timerI); setBlink(null, false); $('flag').style.display = 'none'; $('end-modal').classList.remove('active');
  $('game-stats').style.display = 'none'; document.body.classList.remove('ingame'); S.inGame = false; S.reviewing = false; S.target = null;
  $('review-bar').style.display = 'none'; $('prompt-bar').style.display = 'flex'; switchScreen('main-menu');
}

// ---------- Anzeige der Aufgabe ----------
const hint = () => { $('hint').textContent = S.practice ? '' : '●'.repeat(4 - S.tries) + '○'.repeat(S.tries) + (S.tips ? '   💡×' + S.tips : ''); };
function flagCode(f) {
  const p = f.properties; let c = p.ISO_A2_EH; if (!c || c === '-99') c = p.ISO_A2; if (!c || c === '-99') c = FLAGFB[f._code || fid(f)];
  return c && c !== '-99' ? c.toLowerCase() : null;
}
function showFlag() { // kleine Flagge in der Aufgabe (flagcdn.com)
  const im = $('flag'), c = S.opts.flag && S.target ? flagCode(S.target) : null;
  if (!c) { im.style.display = 'none'; return; }
  im.src = 'https://flagcdn.com/w40/' + c + '.png'; im.srcset = 'https://flagcdn.com/w80/' + c + '.png 2x'; im.style.display = 'block';
}
const isLetter = c => /[\p{L}\p{N}]/u.test(c);
function showLetters() { // z. B. "D e _ _ _ _ _ _ _ _"
  if (S.mode !== 'type' || !S.target || S.practice) { $('letters').textContent = ''; return; }
  let k = 0;
  $('letters').textContent = [...nameOf(S.target)].map(ch => isLetter(ch) ? (k++ < S.hintN ? ch : '_') : (ch === ' ' ? '\u00a0\u00a0' : ch)).join(' ');
}
export function renderPrompt() { // Aufgabentext, Versuche, Tipps und Flagge neu zeichnen (auch nach Änderung der Optionen)
  if (!S.target || S.over || S.reviewing) return;
  $('target-prompt').textContent = S.practice
    ? (S.mode === 'type' ? tr('Schreibe ab: ') + nameOf(S.target) : tr('Klicke auf das blinkende Land!'))
    : S.mode === 'type' ? tr('Welches Land ist hervorgehoben?') : tr('Finde: ') + nameOf(S.target);
  hint(); showLetters(); showFlag();
}

// ---------- Runden ----------
function nextRound() {
  S.locked = false; S.tries = 0; S.tips = 0; S.hintN = 0; S.practice = false;
  if (!S.deck.length) return endRound();
  S.target = S.deck.splice(Math.random() * S.deck.length | 0, 1)[0];
  refresh(fid(S.target));
  renderPrompt();
  if (S.mode === 'type') {
    $('type-input').value = ''; $('type-input').focus();
    const z = ZOOM[S.opts.zoom];
    if (z) { // sanfter Zoom auf das größte Teilstück; oben bleibt Platz für das Aufgabenfeld
      const b = S.target._lb, top = $('prompt-bar').offsetHeight + 40;
      S.map.stop(); S.map.flyToBounds([[b[1], b[0]], [b[3], b[2]]], { paddingTopLeft: [60, top], paddingBottomRight: [60, S.insetH + 30], maxZoom: z, duration: .6 });
    }
  }
}
// Punkte je Land: 1. Versuch 100 %, 2. 75 %, 3. 50 %, 4. 25 %, nicht gewusst 0 %, minus 10 % je Tipp
const scoreOf = (n, tips) => n ? Math.max(0, ATT_SCORE[n - 1] - TIP_COST * tips) : 0;
function endRound() {
  clearInterval(S.timerI); S.over = true; S.target = null;
  ['hint', 'letters'].forEach(i => { $(i).textContent = ''; }); $('flag').style.display = 'none';
  const acc = Math.round(100 * S.score / Math.max(S.total, 1)), xp = acc; // 1 XP pro Prozent Genauigkeit
  recordRound({ mode: S.mode, diff: S.diff, acc, xp, secs: S.secs, n: S.total, tips: S.tipsTotal });
  $('end-acc').textContent = acc + '%'; $('end-time').textContent = $('timer').textContent;
  $('end-xp').textContent = '+' + xp; $('end-tips').textContent = S.tipsTotal;
  updateXP(); $('end-modal').classList.add('active');
}
function finish(n) { // n = Versuche (1–4), 0 = nicht gewusst
  const id = fid(S.target); S.solved[id] = n; S.tipsBy[id] = S.tips; S.score += scoreOf(n, S.tips); setBlink(id, false);
  S.done++; counter(); refresh(id); S.locked = true; $('hint').textContent = ''; $('letters').textContent = ''; setTimeout(nextRound, 400);
}
function startPractice() { S.practice = true; setBlink(fid(S.target), true); renderPrompt(); }

export function clicked(f, l) {
  const id = fid(f);
  if ((l.isDot || l.zone) && !S.valid.has(id)) return;
  if (S.mode === 'click' || S.reviewing || S.over) { // Namensschild; im Eingabemodus nicht, sonst wäre die Lösung verraten
    const n = S.solved[id], tp = S.tipsBy[id] ? ' · 💡×' + S.tipsBy[id] : '';
    const lab = S.reviewing && n !== undefined ? ' · ' + (n ? (S.lang === 'en' ? 'try ' + n : n + '. Versuch') : tr('nicht gewusst')) + tp : '';
    clearTimeout(l._tt);
    l.bindTooltip(nameOf(f) + lab, { permanent: true, direction: 'center', className: 'country-label-temp' }).openTooltip();
    l._tt = setTimeout(() => l.unbindTooltip(), 1800);
  }
  if (!S.target || S.locked || S.over || S.reviewing || S.mode !== 'click') return;
  const tid = fid(S.target);
  const ok = id === tid; ripple(l._map, f._c, ok ? RIPPLE.ok : RIPPLE.bad); // Effekt auf der Karte, auf der geklickt wurde
  if (S.practice) { if (ok) finish(0); else flash(id); return; }
  S.tries++;
  if (ok) finish(S.tries);
  else { flash(id); if (S.tries >= 4) startPractice(); else hint(); }
}

// ---------- Eingabe-Modus ----------
const n1 = t => (t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const n2 = t => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
export function submitGuess() {
  if (!S.target || S.mode !== 'type' || S.locked) return;
  const inp = $('type-input'), g = inp.value; if (!n1(g)) return;
  const p = S.target.properties, id = fid(S.target);
  const ok = [S.target._de, p.NAME_DE, p.NAME_LONG, p.NAME, p.NAME_EN, id, ...(SYN[id] || [])].filter(Boolean).some(n => n1(n) === n1(g) || n2(n) === n2(g));
  ripple(S.map, S.target._c, ok ? RIPPLE.ok : RIPPLE.bad);
  if (S.practice) { if (ok) finish(0); return; }
  S.tries++;
  if (ok) return finish(S.tries);
  inp.classList.add('bad'); setTimeout(() => inp.classList.remove('bad'), 400); inp.value = '';
  if (S.tries >= 4) startPractice(); else hint();
}
// Tipps kosten Punkte: 1. Tipp deckt 1 Buchstaben auf, 2. Tipp 2 weitere, 3. Tipp 3 weitere …; nie das ganze Wort
export function tip() {
  if (S.mode !== 'type' || !S.target || S.locked || S.practice || S.over) return;
  const total = [...nameOf(S.target)].filter(isLetter).length;
  if (S.hintN >= total - 1) return;
  S.tips++; S.tipsTotal++;
  S.hintN = Math.min(total - 1, S.hintN + S.tips);
  hint(); showLetters(); $('type-input').focus();
}

// ---------- Auswertung ----------
export function startReview() { // Karte nach der Runde ansehen: Farben zeigen die Versuche, Klick zeigt Name und Versuche
  S.reviewing = true; $('end-modal').classList.remove('active'); $('prompt-bar').style.display = 'none';
  $('legend').innerHTML = th().att.map((c, i) => '<span><span class="lg" style="background:' + c + '"></span>' + (i < 3 ? i + 1 : '4 / ✖') + '</span>').join('');
  $('review-bar').style.display = 'flex';
}
export function backToResult() { S.reviewing = false; $('review-bar').style.display = 'none'; $('prompt-bar').style.display = 'flex'; $('end-modal').classList.add('active'); }
