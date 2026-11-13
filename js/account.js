// Konto über Supabase (nur Funktionsaufrufe per fetch, kein Zusatzpaket). Siehe supabase.sql.
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

const SK = 'geora-session';
let sess = null;
try { sess = JSON.parse(localStorage.getItem(SK)); } catch (e) {}
const setSess = s => { sess = s; try { s ? localStorage.setItem(SK, JSON.stringify(s)) : localStorage.removeItem(SK); } catch (e) {} };

export const isConfigured = () => !!(SUPABASE_URL && SUPABASE_KEY);
export const isLoggedIn = () => !!sess;
export const currentUser = () => sess ? { name: sess.name } : null;

async function rpc(fn, args) {
  const h = { 'Content-Type': 'application/json', apikey: SUPABASE_KEY };
  if (SUPABASE_KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + SUPABASE_KEY; // alter anon-JWT; der neue publishable-Key braucht nur "apikey"
  const r = await fetch(SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, { method: 'POST', headers: h, body: JSON.stringify(args) });
  if (!r.ok) throw { code: 'http-' + r.status };
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
const parseData = d => { try { const o = JSON.parse(d); return o && typeof o === 'object' && Object.keys(o).length ? o : null; } catch (e) { return null; } };

async function auth(fn, name, pass) {
  const r = await rpc(fn, { p_name: name, p_pass: pass });
  if (r.e) throw { code: r.e };
  name = name.trim().toLowerCase(); setSess({ t: r.t, name });
  return { name, data: parseData(r.d) };
}
export const register = (name, pass) => auth('geora_register', name, pass);
export const login = (name, pass) => auth('geora_login', name, pass);
export async function logout() { const t = sess && sess.t; setSess(null); if (t) { try { await rpc('geora_logout', { p_tok: t }); } catch (e) {} } }
export async function deleteAccount() { const r = await rpc('geora_delete', { p_tok: sess.t }); if (r.e) throw { code: r.e }; setSess(null); }

export async function getRemote() { // liefert den gespeicherten Fortschritt oder null
  const r = await rpc('geora_get', { p_tok: sess.t });
  if (r.e) { if (r.e === 'session') setSess(null); throw { code: r.e }; }
  return parseData(r.d);
}
export async function putRemote(obj) {
  const r = await rpc('geora_put', { p_tok: sess.t, p_data: JSON.stringify(obj) });
  if (r.e) { if (r.e === 'session') setSess(null); throw { code: r.e }; }
}

export function errText(e) {
  const m = {
    name: 'Benutzername: 3–20 Zeichen, nur a–z, Zahlen, _ und -',
    pass: 'Passwort: 6 bis 72 Zeichen',
    taken: 'Dieser Benutzername ist schon vergeben', 'http-409': 'Dieser Benutzername ist schon vergeben',
    cred: 'Benutzername oder Passwort falsch',
    locked: 'Zu viele Fehlversuche – bitte 10 Minuten warten',
    session: 'Sitzung abgelaufen – bitte neu anmelden',
    big: 'Fortschritt zu groß zum Speichern'
  };
  const c = (e && e.code) || '';
  if (m[c]) return m[c];
  if (c.startsWith('http-')) return 'Server-Fehler (' + c.slice(5) + ') – ist supabase.sql ausgeführt und config.js richtig ausgefüllt?';
  return 'Keine Verbindung zum Server';
}
