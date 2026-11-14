// Oberfläche: Klick-Verteiler, Einstellungen, Profil/Konto, Start
import { $, S, th, switchScreen } from './state.js';
import { OPTDEF, SCOPES, CONTNAME, contCount } from './data.js';
import { refreshAll, loadData } from './map.js';
import { tr, applyLang } from './i18n.js';
import { initInfo, infoBtn } from './info.js';
import { startGame, quitGame, submitGuess, tip, startReview, backToResult, renderPrompt, clicked, pauseGame, resumeGame, updateXP } from './game.js';
import { hooks, getProfile, totalXP, roundsPlayed, saveOpts, afterLogin, afterLogout, MODES, DIFFS } from './storage.js';
import { isConfigured, currentUser, register, login, logout, deleteAccount, errText } from './account.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const persist = () => saveOpts({ ...S.opts, lang: S.lang });
const SEL = { selectMode: () => S.mode, selectCat: () => S.cat, selectCont: () => S.cont, selectVariant: () => S.variant, selectDifficulty: () => S.diff };
function updateSel() { // Auswahl-Bildschirm: passende Gruppen zeigen, Auswahl markieren, Anzahlen eintragen
  $('sel-world').style.display = S.cat === 'world' ? '' : 'none'; $('sel-cont').style.display = S.cat === 'cont' ? '' : 'none';
  const reg = $('sel-reg'); reg.style.display = S.cat === 'de' || S.cat === 'us' ? '' : 'none';
  reg.textContent = S.cat === 'de' ? tr('16 Bundesländer') : S.cat === 'us' ? tr('50 US-Staaten') : '';
  const un = contCount(S.cont, false), all = contCount(S.cont, true);
  $('var-un').textContent = tr('UN-Staaten') + ' (' + un + ')'; $('var-all').textContent = tr('Länder & Territorien') + ' (' + all + ')';
  $('var-all').style.display = all > un ? '' : 'none'; if (all === un) S.variant = 'un'; // Kontinente ohne Gebiete: nur eine Option
  document.querySelectorAll('#mode-selection .option-card[data-act]').forEach(e => e.classList.toggle('selected', e.dataset.v === SEL[e.dataset.act]()));
}
const scopeName = d => { // Umfang einer gespeicherten Runde als Text
  const id = SCOPES[d]; if (!id) return '?';
  if (id === 'easy') return tr('Welt') + ' Top 50'; if (id === 'un') return tr('Welt') + ' UN'; if (id === 'standard') return tr('Welt') + ' 225';
  if (id === 'de') return tr('Bundesländer'); if (id === 'us') return tr('US-Staaten');
  const [k, v] = id.split('-'); return tr(CONTNAME[k]) + (v === 'all' ? ' ' + tr('+ Gebiete') : '');
};
const markLang = () => { $('lang-de-card').classList.toggle('selected', S.lang === 'de'); $('lang-en-card').classList.toggle('selected', S.lang === 'en'); };

// ---------- Optionen (gleiche Schalter in Einstellungen und Spielauswahl) ----------
function renderOpts() {
  document.querySelectorAll('.opts').forEach(c => {
    c.innerHTML = ''; c.style.display = 'block';
    OPTDEF.forEach(([k, title, ch, inf]) => {
      const h = document.createElement('div'); h.className = 'opt-title'; h.textContent = tr(title); if (inf) h.insertAdjacentHTML('beforeend', infoBtn(inf)); c.appendChild(h);
      const g = document.createElement('div'); g.className = 'option-grid';
      ch.forEach(([v, label]) => {
        const d = document.createElement('div'); d.className = 'option-card' + (S.opts[k] === v ? ' selected' : ''); d.textContent = tr(label);
        d.onclick = () => { S.opts[k] = v; persist(); renderOpts(); applyOpts(); };
        g.appendChild(d);
      });
      c.appendChild(g);
    });
  });
}
const applyTheme = () => document.documentElement.style.setProperty('--sea', th().sea);
function applyOpts() { applyTheme(); if (Object.keys(S.layers).length) refreshAll(); renderPrompt(); }
function applyProfileOpts() { // gespeicherte Einstellungen (auch aus der Cloud) übernehmen
  const o = getProfile().opts; if (!o) return;
  OPTDEF.forEach(([k, , ch]) => { if (ch.some(([v]) => v === o[k])) S.opts[k] = o[k]; });
  if (o.lang === 'de' || o.lang === 'en') S.lang = o.lang;
  markLang(); applyLang(); renderOpts(); applyOpts();
}

// ---------- Einstellungen / Profil während des Spiels ----------
function openOverlay(id) {
  if (S.inGame) pauseGame(); // Zeit pausiert
  document.querySelectorAll('.back-label').forEach(b => { b.textContent = S.inGame ? tr('← Zurück zum Spiel') : tr('← Hauptmenü'); });
  renderOpts(); switchScreen(id);
}
function closeOverlay() {
  if (!S.inGame) { switchScreen('main-menu'); return; }
  switchScreen('game-screen');
  [S.mapWorld, S.mapCar, S.mapOce].forEach(m => m && m.invalidateSize());
  resumeGame(); renderPrompt();
}

// ---------- Profil und Konto ----------
const fmt = s => String(s / 60 | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const row = (a, b) => '<div class="pf-row"><span>' + a + '</span><span>' + b + '</span></div>';
function renderProfile() {
  const box = $('profile-body'), p = getProfile(); if (!box) return;
  let h = '';
  if (!isConfigured()) h += '<div class="pf-box">Konten sind noch nicht eingerichtet (siehe README.md und config.js). Dein Fortschritt wird bis dahin nur auf diesem Gerät gespeichert.</div>';
  else if (S.user) h += '<div class="pf-box">Angemeldet als <b>' + esc(S.user.name) + '</b><div id="sync-status" class="msg"></div><button class="btn-3d btn-red" data-act="logout" style="padding:8px 14px;font-size:.85rem">Abmelden</button> <button class="btn-3d" data-act="deleteAccount" style="padding:8px 14px;font-size:.85rem;background:#555;box-shadow:0 4px 0 #333">Konto löschen</button></div>';
  else h += '<div class="pf-box"><div class="opt-title" style="margin-top:0">Konto – Fortschritt auf allen Geräten' + infoBtn('account') + '</div><input id="acc-user" class="field" placeholder="Benutzername" autocomplete="username" autocapitalize="off" spellcheck="false"><input id="acc-pass" class="field" type="password" placeholder="Passwort (mind. 6 Zeichen)" autocomplete="current-password"><div id="acc-msg" class="msg"></div><button class="btn-3d" data-act="login" style="padding:8px 14px;font-size:.85rem">Anmelden</button> <button class="btn-3d btn-blue" data-act="register" style="padding:8px 14px;font-size:.85rem">Registrieren</button><div style="font-size:.8rem;color:var(--sub);margin-top:8px">Ohne E-Mail: Wer sein Passwort vergisst, kann es nicht zurücksetzen. Bitte kein Passwort verwenden, das du woanders nutzt.</div></div>';
  const best = Object.entries(p.best || {}).map(([k, [acc, secs]]) => { const [m, d] = k.split(':'); return row(esc(MODES[m] === 'click' ? 'Pin' : tr('Eingabe')) + ' · ' + scopeName(d), acc + ' % · ' + fmt(secs)); }).join('');
  const last = p.rounds.slice(-10).reverse().map(r => row(new Date(r[1] * 1000).toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit' }) + ' · ' + (r[2] ? tr('Eingabe') : 'Pin') + ' · ' + scopeName(r[3]), r[4] + ' % · +' + r[5] + ' XP')).join('');
  h += '<div class="pf-box"><div class="opt-title" style="margin-top:0">Statistik' + infoBtn('xp') + '</div>' + row('XP gesamt', totalXP()) + row('Runden', roundsPlayed()) + '</div>';
  if (best) h += '<div class="pf-box"><div class="opt-title" style="margin-top:0">Bestwerte (Genauigkeit · Zeit)' + infoBtn('best') + '</div>' + best + '</div>';
  if (last) h += '<div class="pf-box"><div class="opt-title" style="margin-top:0">Letzte Runden</div>' + last + '</div>';
  box.innerHTML = h; applyLang(box);
}
async function doAuth(kind) {
  const u = $('acc-user').value, pw = $('acc-pass').value, msg = $('acc-msg');
  msg.className = 'msg'; msg.textContent = '…';
  try {
    const r = await (kind === 'login' ? login : register)(u, pw);
    S.user = { name: r.name };
    await afterLogin(r.name, r.data); renderProfile();
  } catch (e) { msg.className = 'msg err'; msg.textContent = errText(e); }
}
async function doLogout() { await logout(); S.user = null; afterLogout(); renderProfile(); }
async function doDelete() {
  if (!confirm(tr('Konto und gespeicherten Fortschritt in der Cloud wirklich löschen? Das lokale Profil auf diesem Gerät bleibt als Gast-Profil erhalten.'))) return;
  try { await deleteAccount(); S.user = null; afterLogout(); renderProfile(); } catch (e) { alert(errText(e)); }
}

// ---------- Klick-Verteiler: <button data-act="name" data-v="wert"> ----------
const ACTIONS = {
  goto: v => switchScreen(v),
  openSettings: () => openOverlay('settings-screen'),
  openProfile: () => { renderProfile(); openOverlay('profile-screen'); },
  closeOverlay,
  selectMode: v => { S.mode = v; updateSel(); }, selectDifficulty: v => { S.diff = v; updateSel(); },
  selectCat: v => { S.cat = v; updateSel(); }, selectCont: v => { S.cont = v; updateSel(); }, selectVariant: v => { S.variant = v; updateSel(); },
  setLanguage: v => { S.lang = v; markLang(); persist(); applyLang(); updateSel(); renderOpts(); renderProfile(); renderPrompt(); },
  startGame, quitGame, submitGuess, tip, startReview, backToResult,
  login: () => doAuth('login'), register: () => doAuth('register'), logout: doLogout, deleteAccount: doDelete
};
function dispatch(e) {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACTIONS[el.dataset.act]; if (fn) fn(el.dataset.v !== undefined ? el.dataset.v : el.dataset.to, el);
}

export function boot() {
  S.onClick = clicked;
  hooks.onChange = () => { applyProfileOpts(); updateXP(); renderProfile(); };
  hooks.onStatus = (t, c) => { const el = $('sync-status'); if (el) { el.textContent = t; el.className = 'msg ' + c; } };
  hooks.onSessionLost = () => { S.user = null; afterLogout(); renderProfile(); };
  if (!getProfile().opts) { try { const o = JSON.parse(localStorage.getItem('geora-opts') || 'null'); if (o) getProfile().opts = o; } catch (e) {} } // Einstellungen aus der alten Einzeldatei-Version
  applyProfileOpts(); renderOpts(); applyTheme(); updateXP(); renderProfile();
  initInfo(); document.addEventListener('click', dispatch);
  $('type-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitGuess(); });
  const u = currentUser();
  if (isConfigured() && u) { S.user = u; renderProfile(); afterLogin(u.name).catch(console.error); }
  applyLang(); updateSel(); S.geoLoad = loadData(); // Kartendaten schon im Hintergrund laden, während das Menü offen ist
  window.__georaBooted = true; $('boot-msg').style.display = 'none';
}
