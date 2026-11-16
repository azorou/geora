// Spielablauf: Runde, Klicks, Eingabe, Tipps, Punkte/XP, Auswertung
import { $, S, th, fid, nameOf, switchScreen, scopeId } from './state.js';
import { TOP, UN195, EXT30, FLAGFB, SYN, ZOOM, ZREL, ATT_SCORE, RIPPLE, CONT, NEC, CONTDOT, CONTVIEW } from './data.js';
import { REGION } from './regions.js';
import { parse, indexGeo, prep, simp, gridFor, vertexCount, loadData, ensureRegion, initMaps, fit, refresh, refreshAll, setBlink, flash, ripple, flyToBoundsInside, inView } from './map.js';
import { tr } from './i18n.js';
import { CAP } from './capitals.js';
import { play } from './sound.js';
import { fireworks } from './fireworks.js';
import { recordRound, totalXP, bestOf } from './storage.js';

const step = async t => { $('target-prompt').textContent = t; await new Promise(r => setTimeout(r, 30)); };
export const updateXP = () => { $('xp').textContent = totalXP(); };

// ---------- Zeit ----------
function tick() { S.secs++; $('timer').textContent = String(S.secs / 60 | 0).padStart(2, '0') + ':' + String(S.secs % 60).padStart(2, '0'); }
function runTimer() { clearInterval(S.timerI); S.timerI = setInterval(tick, 1000); }
export const pauseGame = () => clearInterval(S.timerI);
export const resumeGame = () => { if (S.inGame && !S.over && !S.reviewing) runTimer(); };

// ---------- Start / Ende ----------
export async function startGame() { // nicht doppelt starten (zweiter Tipp auf "Jetzt spielen" während des Ladens)
  if (S.starting) return; S.starting = true;
  try { await startRun(); } finally { S.starting = false; }
}
/* Färbungen der letzten Runde sofort entfernen: beim Verlassen und gleich beim Start, nicht erst nach dem Laden der nächsten Runde */
function clearBoard() {
  S.solved = {}; S.tmp = {}; S.tipsBy = {}; S.wrong = {}; S.hover = null; setBlink(null, false);
  if (Object.keys(S.layers).length) refreshAll();
}
async function startRun() {
  clearTimeout(S.nextT); clearBoard();
  $('end-modal').classList.remove('active');
  $('game-stats').style.display = 'flex'; S.inGame = true; S.over = false; S.reviewing = false; document.body.classList.add('ingame');
  $('review-bar').style.display = 'none'; $('prompt-bar').style.display = 'flex';
  document.documentElement.style.setProperty('--sea', th().sea);
  $('type-wrap').style.display = S.mode === 'type' ? 'flex' : 'none';
  switchScreen('game-screen');
  clearInterval(S.timerI); S.target = null; $('hint').textContent = '';
  if (typeof L === 'undefined') { $('target-prompt').textContent = tr('Kartenbibliothek (Leaflet) konnte nicht geladen werden.'); return; }
  if (!S.geo) {
    $('target-prompt').textContent = tr('Karte wird geladen …');
    const data = await (S.geoLoad || (S.geoLoad = loadData())); // Download startet schon beim Öffnen der Seite (siehe boot in ui.js)
    if (!data) { S.geoLoad = null; $('target-prompt').textContent = tr('Kartendaten konnten nicht geladen werden. Bitte im normalen Browser öffnen (z. B. über GitHub Pages), nicht in einem Vorschau-Fenster.'); return; }
    try {
      await step(tr('Karte wird vorbereitet …'));
      const grid = gridFor(vertexCount(data)); data.forEach(f => { if (f.geometry && /Polygon/.test(f.geometry.type)) f.geometry = simp(f.geometry, grid); });
      S.geo = data; indexGeo(); S.geo.forEach(prep);
      Object.entries(CAP).forEach(([c, v]) => { if (S.idx[c]) S.idx[c]._cap = v; });
      await initMaps(step);
    } catch (e) { console.error(e); S.geo = null; S.geoLoad = null; $('target-prompt').textContent = tr('Fehler beim Kartenaufbau:') + ' ' + e.message + ' ' + tr('(Seite neu laden)'); return; }
  }
  if (S.cat === 'de' || S.cat === 'us') { // Bundesländer / US-Staaten: Kartendaten beim ersten Mal laden
    const err = await ensureRegion(S.cat); if (err) { $('target-prompt').textContent = err; return; }
  }
  try { await step(tr('Karte wird eingepasst …')); S.insetSize = { car: null, oce: null }; fit(); /* jeder Durchlauf: Größe und Zoom der kleinen Felder zurücksetzen */ resetDeck(); S.secs = 0; $('timer').textContent = '00:00'; runTimer(); nextRound(); }
  catch (e) { console.error(e); $('target-prompt').textContent = tr('Fehler beim Start:') + ' ' + e.message; }
}
const codes = s => parse(s).map(x => x[0]);
function contIds(k) { // Ids aller Länder eines Kontinents: Listen aus data.js (Länder und Gebiete), sonst das Natural-Earth-Feld CONTINENT
  const ids = new Set(), listed = new Set();
  Object.entries(CONT).forEach(([c, ks]) => { const f = S.idx[c]; if (!f) return; listed.add(fid(f)); if (ks.includes(k)) ids.add(fid(f)); });
  S.geo.forEach(f => { if (!listed.has(fid(f)) && NEC[f.properties.CONTINENT] === k) ids.add(fid(f)); });
  return ids;
}
/* Kontinent plus alle Länder im Kartenausschnitt: gefragt wird nur der Kontinent, alles andere erscheint ausgegraut */
function contShow(k) {
  const ids = contIds(k);
  if (k === 'oc') { Object.keys(S.layers).forEach(id => { if (S.layers[id].some(l => l._map === S.mapOce)) ids.add(id); }); return ids; }
  S.geo.forEach(f => { if (inView(f, CONTVIEW[k])) ids.add(fid(f)); });
  return ids;
}
function resetDeck() { // Aufgaben und Sichtbarkeit je nach Auswahl: Welt, Kontinent, Bundesländer, US-Staaten
  const L2 = a => [...new Set(a.map(c => S.idx[c]).filter(Boolean))], un = codes(UN195), ex = codes(EXT30);
  let pool; S.show = null; S.dotThr = 3.5;
  if (S.cat === 'world') pool = S.diff === 'easy' ? L2(TOP) : S.diff === 'un' ? L2(un) : L2([...un, ...ex]);
  else if (S.cat === 'cont') { const k = S.cont; pool = L2((S.variant === 'all' ? [...un, ...ex] : un).filter(c => (CONT[c] || []).includes(k))); S.show = contShow(k); S.dotThr = CONTDOT[k]; }
  else { pool = S.reg[S.cat].feats; S.show = new Set(pool.map(fid)); S.dotThr = REGION[S.cat].thr; }
  S.valid = new Set(pool.map(fid)); S.deck = [...pool]; // jedes Land genau einmal
  S.solved = {}; S.tmp = {}; S.tipsBy = {}; S.wrong = {}; S.done = 0; S.score = 0; S.tipsTotal = 0; S.total = S.deck.length; S.practice = false;
  setBlink(null, false); refreshAll(); counter();
}
const counter = () => { // Durchlauf-Prozent = Durchschnitt der bisher beantworteten Länder (am Ende gleich der Genauigkeit)
  $('counter').textContent = S.done + ' / ' + S.total; $('pct').textContent = (S.done ? Math.round(100 * S.score / S.done) : '–') + ' %';
};
export function quitGame() {
  clearTimeout(S.nextT); clearInterval(S.timerI); /* ein schon geplanter nächster Schritt darf nach dem Verlassen nichts mehr auslösen */ setBlink(null, false); clearBoard(); $('flag').style.display = 'none'; $('capital').textContent = ''; $('end-modal').classList.remove('active'); $('didyou').textContent = '';
  $('game-stats').style.display = 'none'; document.body.classList.remove('ingame'); S.inGame = false; S.reviewing = false; S.target = null;
  $('review-bar').style.display = 'none'; $('prompt-bar').style.display = 'flex'; switchScreen('main-menu');
}

// ---------- Anzeige der Aufgabe ----------
const hint = () => { // Punkte = übrige Versuche; Tipp-Knopf blass, wenn nur noch der letzte Versuch übrig ist
  $('hint').textContent = S.practice ? '' : '●'.repeat(4 - S.tries) + '○'.repeat(S.tries);
  const t = document.querySelector('[data-act="tip"]'); if (t) t.classList.toggle('off', S.tries >= 3);
};
function flagCode(f) {
  const p = f.properties; let c = p.ISO_A2_EH; if (!c || c === '-99') c = p.ISO_A2; if (!c || c === '-99') c = FLAGFB[f._code || fid(f)];
  return c && c !== '-99' ? c.toLowerCase() : null;
}
function flagChain(f) { // Quellen der Flagge der Reihe nach; für Bundesländer/US-Staaten steht die Liste in f._flag (regions.js)
  if (f._flag) return f._flag;
  const c = flagCode(f); return c ? [['https://flagcdn.com/w40/' + c + '.png', 'https://flagcdn.com/w80/' + c + '.png 2x']] : [];
}
/* Hauptstadt des gesuchten Landes unter der Aufgabe (Option), auch im Eingabemodus als Hilfe wie die Flagge */
function showCapital() {
  const c = S.opts.capital && S.target && S.target._cap ? S.target._cap[S.lang === 'en' ? 0 : 1] : '';
  $('capital').textContent = c ? tr('Hauptstadt') + ': ' + c : '';
}
/* Flagge groß im Fenster mit unscharfem Hintergrund. Der Name steht nur im Titel, wenn er in der Aufgabe sowieso zu sehen ist (Pin-Modus, Abschreiben). */
const bigUrl = u => u.replace('/w40/', '/w640/').replace('/w80/', '/w640/').replace('width=60', 'width=640').replace('width=120', 'width=640');
export function openFlag() {
  if (!S.target) return;
  const ch = flagChain(S.target); if (!ch.length) return;
  const im = $('fp-img'); let i = 0;
  $('fp-title').textContent = S.mode === 'click' || S.practice ? tr('Flagge von') + ' ' + nameOf(S.target) : tr('Flagge');
  const set = () => { if (i >= ch.length) { im.removeAttribute('src'); $('fp-msg').textContent = tr('Flagge nicht verfügbar'); return; } $('fp-msg').textContent = ''; im.src = bigUrl(ch[i][0]); };
  im.onerror = () => { i++; set(); }; set();
  $('flag-pop').classList.add('show');
}
export function closeFlag() { $('flag-pop').classList.remove('show'); }
function showFlag() { // kleine Flagge in der Aufgabe; lädt eine Quelle nicht, wird die nächste versucht, zuletzt wird die Flagge ausgeblendet
  const im = $('flag'), ch = S.opts.flag && S.target ? flagChain(S.target) : []; let i = 0;
  const set = () => { if (i >= ch.length) { im.style.display = 'none'; return; } im.src = ch[i][0]; im.srcset = ch[i][1] || ''; im.style.display = 'block'; };
  im.onerror = () => { i++; set(); }; set();
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
  hint(); showLetters(); showFlag(); showCapital();
}

// ---------- Runden ----------
function nextRound() {
  if (!S.inGame) return;
  S.locked = false; S.tries = 0; S.tips = 0; S.hintN = 0; S.practice = false; S.wrong = {}; $('didyou').textContent = '';
  if (!S.deck.length) return endRound();
  S.target = S.deck.splice(Math.random() * S.deck.length | 0, 1)[0];
  refresh(fid(S.target));
  renderPrompt();
  if (S.mode === 'type') {
    $('type-input').value = ''; $('type-input').focus();
    const zk = S.opts.zoom, z = zk === 'off' ? 0 : S.cat === 'world' ? ZOOM[zk] : S.fitZ + ZREL[zk]; // außerhalb der Weltkarte: relativ zum Kartenausschnitt
    if (z) { // sanfter Zoom auf das größte Teilstück; oben bleibt Platz für das Aufgabenfeld
      const b = S.target._lb.slice(), top = $('prompt-bar').offsetHeight + 40;
      if (S.map === S.mapOce && b[2] < 0) { b[0] += 360; b[2] += 360; } // Ozeanien-Karte läuft über die Datumsgrenze
      S.map.stop(); flyToBoundsInside(S.map, [[b[1], b[0]], [b[3], b[2]]], { paddingTopLeft: [60, top], paddingBottomRight: [60, S.insetH + 30], maxZoom: z, duration: .6 });
    }
  }
}
// Punkte je Land: 1. Versuch 100 %, 2. 75 %, 3. 50 %, 4. 25 %, nicht gewusst 0 %. Tipps zählen als Versuch (siehe tip()).
const scoreOf = n => n ? ATT_SCORE[n - 1] : 0;
function endRound() {
  clearInterval(S.timerI); S.over = true; S.target = null;
  ['hint', 'letters'].forEach(i => { $(i).textContent = ''; }); $('flag').style.display = 'none';
  // XP: Pin 1, Eingabe 2 je Land im 1. Versuch; jeder weitere Versuch (auch Tipps) zieht 25 % davon ab. Alle Länder werden addiert, am Ende wird abgerundet.
  const acc = Math.round(100 * S.score / Math.max(S.total, 1)), xp = Math.floor((S.mode === 'type' ? 2 : 1) * S.score), sc = scopeId(), prev = bestOf(S.mode, sc);
  recordRound({ mode: S.mode, diff: sc, acc, xp, secs: S.secs, n: S.total, tips: S.tipsTotal });
  const nb = bestOf(S.mode, sc), neu = !prev || nb[0] !== prev[0] || nb[1] !== prev[1];
  $('end-acc').textContent = acc + '%'; $('end-time').textContent = $('timer').textContent;
  $('end-xp').textContent = '+' + xp; $('end-tips').textContent = S.tipsTotal;
  $('end-best').textContent = neu ? tr('Neuer Bestwert!') : tr('Bestwert') + ': ' + nb[0] + ' % · ' + String(nb[1] / 60 | 0).padStart(2, '0') + ':' + String(nb[1] % 60).padStart(2, '0'); $('end-best').className = neu ? 'new' : '';
  play(acc >= 90 ? 'good' : 'end'); if (acc >= 100) fireworks();
  updateXP(); $('end-modal').classList.add('active');
}
function finish(n) { // n = Versuche (1–4), 0 = nicht gewusst
  const id = fid(S.target); S.solved[id] = n; S.tipsBy[id] = S.tips; S.score += scoreOf(n); setBlink(id, false); if (n > 0) play('ok');
  S.done++; counter(); refresh(id); S.locked = true; $('hint').textContent = ''; $('letters').textContent = ''; clearTimeout(S.nextT); S.nextT = setTimeout(nextRound, 400);
}
function startPractice() { S.practice = true; setBlink(fid(S.target), true); play('miss'); renderPrompt(); }

export function clicked(f, l) {
  const id = fid(f);
  if ((l.isDot || l.zone) && !S.valid.has(id)) return;
  if (S.mode === 'click' || S.reviewing || S.over) { // Namensschild; im Eingabemodus nicht, sonst wäre die Lösung verraten
    const n = S.solved[id], tp = S.tipsBy[id] ? ' · ' + tr('Tipps') + ' ' + S.tipsBy[id] : '';
    const lab = S.reviewing && n !== undefined ? ' · ' + (n ? (S.lang === 'en' ? 'try ' + n : n + '. Versuch') : tr('nicht gewusst')) + tp : '';
    clearTimeout(l._tt);
    l.bindTooltip(nameOf(f) + lab, { permanent: true, direction: 'center', className: 'country-label-temp' }).openTooltip();
    l._tt = setTimeout(() => l.unbindTooltip(), 1800);
  }
  if (!S.target || S.locked || S.over || S.reviewing || S.mode !== 'click') return;
  if (!S.valid.has(id) || S.solved[id] !== undefined) return; // gehört nicht zur Auswahl oder wurde schon abgegeben: kein Versuch, kein Abzug, kein Effekt
  const tid = fid(S.target);
  const ok = id === tid;
  if (!ok && !S.practice && S.wrong[id]) { flash(id); return; } // dasselbe falsche Land noch einmal: kein weiterer Abzug
  ripple(l._map, f._c, ok ? RIPPLE.ok : RIPPLE.bad); // Effekt auf der Karte, auf der geklickt wurde
  if (S.practice) { if (ok) finish(0); else flash(id); return; }
  S.tries++;
  if (ok) finish(S.tries);
  else { S.wrong[id] = true; flash(id); if (S.tries >= 4) startPractice(); else hint(); }
}

// ---------- Eingabe-Modus ----------
const n1 = t => (t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const n2 = t => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const namesOf = f => { const p = f.properties, id = fid(f); return [f._de, p.NAME_DE, p.NAME_LONG, p.NAME, p.NAME_EN, id, ...(SYN[id] || [])].filter(Boolean); };
export function typoDist(a, b) { // Damerau-Levenshtein: Vertauschen zweier Buchstaben zählt als 1 Fehler
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
let nameIdx = null, nameIdxGeo = null;
const scopeFeats = () => S.cat === 'de' || S.cat === 'us' ? S.reg[S.cat].feats : S.geo; // nur Namen aus der gespielten Karte zählen als "anderes Land"
function ownersOf(x) { // welche Gebiete tragen genau diesen Namen? (Cache pro Kartendaten)
  const fs = scopeFeats();
  if (nameIdxGeo !== fs) { nameIdxGeo = fs; nameIdx = new Map(); fs.forEach(f => namesOf(f).forEach(n => { const k = n1(n); if (k) (nameIdx.get(k) || nameIdx.set(k, new Set()).get(k)).add(fid(f)); })); }
  return nameIdx.get(x);
}
// Tippfehler: höchstens 1 falscher Buchstabe ab 5 Zeichen, 2 ab 8 Zeichen. Ist der Text der Name eines ANDEREN Landes (z. B. Irak statt Iran), ist es eine echte falsche Antwort.
export function nearMiss(g, f) {
  const own = ownersOf(n1(g)); if (own && [...own].some(i => i !== fid(f))) return false;
  return namesOf(f).some(n => [n1, n2].some(nf => { const a = nf(g), b = nf(n), max = b.length >= 8 ? 2 : b.length >= 5 ? 1 : 0; return max && a.length >= 3 && typoDist(a, b) <= max; }));
}
const didYou = w => { $('didyou').textContent = (S.lang === 'en' ? 'Did you mean “' + w + '”? ' : 'Meintest du „' + w + '“? ') + tr('Kein Punktabzug.'); };
export function submitGuess() {
  if (!S.target || S.mode !== 'type' || S.locked) return;
  const inp = $('type-input'), g = inp.value; if (!n1(g)) return;
  $('didyou').textContent = '';
  const ok = namesOf(S.target).some(n => n1(n) === n1(g) || n2(n) === n2(g));
  if (!ok && !S.practice && nearMiss(g, S.target)) { didYou(nameOf(S.target)); inp.value = ''; inp.focus(); return; } // Tippfehler: Hinweis, aber kein Versuch und kein Punktabzug
  ripple(S.map, S.target._c, ok ? RIPPLE.ok : RIPPLE.bad);
  if (S.practice) { if (ok) finish(0); return; }
  S.tries++;
  if (ok) return finish(S.tries);
  inp.classList.add('bad'); setTimeout(() => inp.classList.remove('bad'), 400); inp.value = '';
  if (S.tries >= 4) startPractice(); else hint();
}
// Tipp: 1. Tipp deckt 1 Buchstaben auf, 2. Tipp 2 weitere, 3. Tipp 3 weitere; nie das ganze Wort.
// Jeder Tipp verbraucht einen Versuch (und kostet damit dieselben Prozent wie ein Fehlversuch); der letzte Versuch bleibt immer übrig.
export function tip() {
  if (S.mode !== 'type' || !S.target || S.locked || S.practice || S.over || S.tries >= 3) return;
  const total = [...nameOf(S.target)].filter(isLetter).length;
  if (S.hintN >= total - 1) return;
  S.tries++; S.tips++; S.tipsTotal++;
  S.hintN = Math.min(total - 1, S.hintN + S.tips);
  hint(); showLetters(); $('type-input').focus();
}

// ---------- Auswertung ----------
export function startReview() { // Karte nach der Runde ansehen: Farben zeigen die Versuche, Klick zeigt Name und Versuche
  S.reviewing = true; $('end-modal').classList.remove('active'); $('prompt-bar').style.display = 'none';
  $('legend').innerHTML = th().att.map((c, i) => '<span><span class="lg" style="background:' + c + '"></span>' + (i < 3 ? i + 1 : '4 / ✕') + '</span>').join('');
  $('review-bar').style.display = 'flex';
}
export function backToResult() { S.reviewing = false; $('review-bar').style.display = 'none'; $('prompt-bar').style.display = 'flex'; $('end-modal').classList.add('active'); }
