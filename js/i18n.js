// Sprache der Oberfläche. Deutsch ist die Grundsprache (steht so im HTML und im Code), EN enthält die englischen Texte.
// tr('deutscher Text') liefert bei Englisch die Übersetzung; applyLang() übersetzt den festen Text der Seite.
import { S } from './state.js';

const EN = {
  // Seite (index.html)
  'Abbrechen': 'Cancel', 'Einstellungen': 'Settings',
  'Erkunde die Welt, meistere Geografie & lerne alle Länder.': 'Explore the world, master geography & learn every country.',
  '🗺️ Länder-Quiz': '🗺️ Country quiz', '👤 Profil & Konto': '👤 Profile & account',
  '← Hauptmenü': '← Main menu', '← Zurück zum Spiel': '← Back to game',
  'Sprache / Language': 'Language', 'Spieloptionen': 'Game options', 'Profil': 'Profile',
  '1. Spielmodus wählen': '1. Choose game mode', 'Eingabe': 'Typing', '2. Schwierigkeitsgrad': '2. Difficulty',
  'UN-Staaten (195)': 'UN states (195)', 'Länder & Territorien (225)': 'Countries & territories (225)', '🚀 JETZT SPIELEN': '🚀 PLAY NOW',
  'Land eingeben...': 'Enter country...', 'Größe ändern': 'Resize', '💡 Tipp': '💡 Tip',
  '📋 Auswertung': '📋 Review', '↩ Ergebnis': '↩ Result', '🏠 Menü': '🏠 Menu',
  '🎉 RUNDE VOLLENDET!': '🎉 ROUND COMPLETE!', 'Genauigkeit': 'Accuracy', 'Zeit': 'Time', 'Tipps': 'Tips',
  '🗺️ Karte ansehen': '🗺️ View map', '🔄 Nochmal spielen': '🔄 Play again', '🏠 Hauptmenü': '🏠 Main menu',
  // Optionen (data.js)
  '🔍 Zoom im Eingabemodus': '🔍 Zoom in typing mode', 'Aus': 'Off', 'Sanft': 'Gentle', 'Mittel': 'Medium', 'Stark': 'Strong',
  '🏳️ Flagge in der Aufgabe': '🏳️ Flag in the task', 'An': 'On',
  '🎨 Farbmodus': '🎨 Colour mode', 'Klassisch': 'Classic', 'Nacht': 'Night', 'Sand': 'Sand',
  // Spiel (game.js, map.js)
  'Karte wird geladen …': 'Loading map …', 'Quelle': 'source',
  'Karte wird vorbereitet …': 'Preparing map …', 'Karte wird gebaut: Weltkarte …': 'Building map: world …',
  'Karte wird gebaut: Karibik …': 'Building map: Caribbean …', 'Karte wird gebaut: Ozeanien …': 'Building map: Oceania …',
  'Karte wird eingepasst …': 'Fitting map …',
  '⚠️ Kartenbibliothek (Leaflet) konnte nicht geladen werden.': '⚠️ The map library (Leaflet) could not be loaded.',
  '⚠️ Kartendaten konnten nicht geladen werden. Bitte im normalen Browser öffnen (z. B. über GitHub Pages), nicht in einem Vorschau-Fenster.': '⚠️ Map data could not be loaded. Please open in a normal browser (e.g. via GitHub Pages), not in a preview window.',
  '⚠️ Fehler beim Kartenaufbau:': '⚠️ Error while building the map:', '(Seite neu laden)': '(reload the page)', '⚠️ Fehler beim Start:': '⚠️ Error at start:',
  'Schreibe ab: ': 'Copy: ', 'Klicke auf das blinkende Land!': 'Click the blinking country!',
  'Welches Land ist hervorgehoben?': 'Which country is highlighted?', 'Finde: ': 'Find: ', 'nicht gewusst': 'not known',
  // Profil und Konto (ui.js, account.js, storage.js)
  '☁️ Konten sind noch nicht eingerichtet (siehe README.md und config.js). Dein Fortschritt wird bis dahin nur auf diesem Gerät gespeichert.': '☁️ Accounts are not set up yet (see README.md and config.js). Until then your progress is only saved on this device.',
  '👤 Angemeldet als': '👤 Signed in as', 'Abmelden': 'Sign out', 'Konto löschen': 'Delete account',
  'Konto – Fortschritt auf allen Geräten': 'Account – progress on all devices',
  'Benutzername': 'Username', 'Passwort (mind. 6 Zeichen)': 'Password (min. 6 characters)',
  'Anmelden': 'Sign in', 'Registrieren': 'Register',
  'Ohne E-Mail: Wer sein Passwort vergisst, kann es nicht zurücksetzen. Bitte kein Passwort verwenden, das du woanders nutzt.': 'No e-mail: if you forget your password it cannot be reset. Please do not use a password you use elsewhere.',
  'Statistik': 'Statistics', '⚡ XP gesamt': '⚡ Total XP', '🎮 Runden': '🎮 Rounds',
  'Bestwerte (Genauigkeit · Zeit)': 'Best results (accuracy · time)', 'Letzte Runden': 'Recent rounds',
  'Konto und gespeicherten Fortschritt in der Cloud wirklich löschen? Das lokale Profil auf diesem Gerät bleibt als Gast-Profil erhalten.': 'Really delete the account and the progress saved in the cloud? The local profile on this device stays as a guest profile.',
  '☁️ Synchronisiere …': '☁️ Syncing …', '☁️ Gespeichert': '☁️ Saved',
  '⚠️ Synchronisierung fehlgeschlagen – wird später erneut versucht': '⚠️ Sync failed – will retry later',
  'Benutzername: 3–20 Zeichen, nur a–z, Zahlen, _ und -': 'Username: 3–20 characters, only a–z, digits, _ and -',
  'Passwort: 6 bis 72 Zeichen': 'Password: 6 to 72 characters',
  'Dieser Benutzername ist schon vergeben': 'This username is already taken',
  'Benutzername oder Passwort falsch': 'Wrong username or password',
  'Zu viele Fehlversuche – bitte 10 Minuten warten': 'Too many failed attempts – please wait 10 minutes',
  'Sitzung abgelaufen – bitte neu anmelden': 'Session expired – please sign in again',
  'Fortschritt zu groß zum Speichern': 'Progress too large to save',
  'Server-Fehler': 'Server error', 'ist supabase.sql ausgeführt und config.js richtig ausgefüllt?': 'did supabase.sql run and is config.js filled in correctly?',
  'Keine Verbindung zum Server': 'No connection to the server'
};

export const tr = s => (S.lang === 'en' && EN[s]) || s;

export function applyLang(root = document.body) { // festen Text (und Platzhalter) unter root in die gewählte Sprache setzen
  const en = S.lang === 'en';
  document.documentElement.lang = en ? 'en' : 'de';
  document.title = en ? 'Geora - The geography quiz' : 'Geora - Das Geografie-Quiz';
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const cur = n.nodeValue.trim(), k = n._k || cur; // _k merkt sich den deutschen Originaltext
    if (!EN[k]) continue;
    n._k = k; n.nodeValue = n.nodeValue.replace(cur, en ? EN[k] : k);
  }
  ['placeholder', 'title'].forEach(at => root.querySelectorAll('[' + at + ']').forEach(el => { // Platzhalter und Tooltips
    const k = el.dataset['k' + at] || el.getAttribute(at);
    if (EN[k]) { el.dataset['k' + at] = k; el.setAttribute(at, en ? EN[k] : k); }
  }));
}
