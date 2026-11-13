// Profil: Runden, XP und Einstellungen. Lokal im Browser und – mit Konto – zusätzlich in Supabase.
// Platzsparend: eine Runde ist nur eine kurze Zahlenliste [id, Zeit(s), Modus, Umfang, Genauigkeit, XP, Sekunden, Länder, Tipps];
// ab 150 Runden werden die ältesten zu Summen (base) zusammengefasst; Bestwerte stehen in "best".
import { isLoggedIn, getRemote, putRemote } from './account.js';

const KEY = 'geora-profile:', MAXR = 150;
export const MODES = ['click', 'type'], DIFFS = ['easy', 'un', 'standard'];
export const hooks = { onChange() {}, onStatus() {}, onSessionLost() {} };
const empty = () => ({ v: 2, base: { xp: 0, n: 0 }, cut: 0, rounds: [], best: {}, opts: null, optsT: 0 });
let activeKey = 'guest';

function load(k) { try { const p = JSON.parse(localStorage.getItem(KEY + k)); if (p && p.v === 2) return p; } catch (e) {} return empty(); }
let profile = load('guest');
function save() { try { localStorage.setItem(KEY + activeKey, JSON.stringify(profile)); } catch (e) {} }

export const getProfile = () => profile;
export const totalXP = (p = profile) => (p.base ? p.base.xp : 0) + p.rounds.reduce((a, r) => a + r[5], 0);
export const roundsPlayed = (p = profile) => (p.base ? p.base.n : 0) + p.rounds.length;
const rid = () => Math.random().toString(36).slice(2, 8);
const betterB = (a, b) => !b || a[0] > b[0] || (a[0] === b[0] && a[1] < b[1]); // höhere Genauigkeit, bei Gleichstand schneller

function fold(p) { // älteste Runden zu Summen zusammenfassen, damit das Profil klein bleibt
  if (p.rounds.length <= MAXR) return p;
  p.rounds.sort((a, b) => a[1] - b[1]);
  const old = p.rounds.splice(0, p.rounds.length - MAXR);
  p.base = { xp: (p.base ? p.base.xp : 0) + old.reduce((a, r) => a + r[5], 0), n: (p.base ? p.base.n : 0) + old.length };
  p.cut = old[old.length - 1][1];
  return p;
}

// Zusammenführen ohne Doppelzählung: Runden über ihre ID, Bestwerte: besser gewinnt, Einstellungen: die neueste gewinnt
export function merge(...ps) {
  ps = ps.filter(Boolean);
  if (!ps.length) return empty();
  const cutOf = p => p.cut || 0, nOf = p => (p.base ? p.base.n : 0);
  const top = ps.reduce((a, p) => (cutOf(p) > cutOf(a) || (cutOf(p) === cutOf(a) && nOf(p) > nOf(a))) ? p : a, ps[0]);
  const cut = cutOf(top), base = { xp: top.base ? top.base.xp : 0, n: nOf(top) };
  const seen = new Map(), best = {}; let opts = null, optsT = 0;
  ps.forEach(p => {
    (p.rounds || []).forEach(r => { if (r[1] > cut && !seen.has(r[0])) seen.set(r[0], r); });
    Object.entries(p.best || {}).forEach(([k, b]) => { if (betterB(b, best[k])) best[k] = b; });
    if ((p.optsT || 0) > optsT) { optsT = p.optsT; opts = p.opts; }
  });
  return fold({ v: 2, base, cut, rounds: [...seen.values()].sort((a, b) => a[1] - b[1]), best, opts, optsT });
}

export function recordRound({ mode, diff, acc, xp, secs, n, tips }) {
  const m = MODES.indexOf(mode), d = DIFFS.indexOf(diff);
  const last = profile.rounds.length ? profile.rounds[profile.rounds.length - 1][1] : 0, t = Math.max(Date.now() / 1000 | 0, last + 1); // Zeit strikt steigend
  profile.rounds.push([rid(), t, m, d, acc, xp, secs, n, tips]);
  const k = m + ':' + d, b = [acc, secs];
  if (betterB(b, profile.best[k])) profile.best[k] = b;
  fold(profile); save(); pushCloud();
}
export function saveOpts(o) { profile.opts = { ...o }; profile.optsT = Date.now(); save(); pushCloud(); }

let pushTimer = null, syncing = false, again = false;
export function pushCloud() { if (activeKey === 'guest' || !isLoggedIn()) return; clearTimeout(pushTimer); pushTimer = setTimeout(syncNow, 800); }
export async function syncNow() {
  if (activeKey === 'guest' || !isLoggedIn()) return;
  if (syncing) { again = true; return; }
  syncing = true; hooks.onStatus('☁️ Synchronisiere …', '');
  try {
    const remote = await getRemote(), before = JSON.stringify(profile.opts);
    profile = merge(profile, remote); save();
    if (JSON.stringify(profile) !== JSON.stringify(remote)) await putRemote(profile); // nur schreiben, wenn sich etwas geändert hat
    hooks.onStatus('☁️ Gespeichert', 'ok');
    if (JSON.stringify(profile.opts) !== before) hooks.onChange();
  } catch (e) {
    if (e && e.code === 'session') hooks.onSessionLost();
    else { console.error(e); hooks.onStatus('⚠️ Synchronisierung fehlgeschlagen – wird später erneut versucht', 'err'); }
  }
  syncing = false;
  if (again) { again = false; pushCloud(); }
}

// Anmeldung: Gast-Fortschritt wandert mit ins Konto; Abmeldung: zurück zum (leeren) Gast-Profil
export async function afterLogin(name, remote) {
  const guest = load('guest');
  activeKey = 'u:' + name; profile = merge(load(activeKey), guest, remote);
  try { localStorage.setItem(KEY + 'guest', JSON.stringify(empty())); } catch (e) {}
  save(); hooks.onChange();
  await syncNow();
}
export function afterLogout() { activeKey = 'guest'; profile = load('guest'); hooks.onChange(); }
