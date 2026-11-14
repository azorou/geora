// Kleine "i"-Knöpfe: Maus-Hover, Antippen (Handy) oder Tastatur blendet eine kurze Erklärung ein.
// Im HTML: <button class="info" data-i="schlüssel">; im Code: infoBtn('schlüssel'). Texte stehen hier, je Eintrag [Deutsch, English].
import { S } from './state.js';

export const INFO = {
  mode: ['Pin: Klicke das gesuchte Land auf der Karte an. Eingabe: Tippe den Namen des markierten Landes. Kleine Tippfehler zählen nicht als Fehlversuch.',
         'Pin: click the country you are asked for on the map. Typing: type the name of the highlighted country. Small typos do not count as a failed attempt.'],
  cat: ['Welt: alle Länder mit den kleinen Karten für Karibik und Ozeanien. Kontinente: nur ein Kontinent. Bundesländer: die 16 deutschen Länder. US-Staaten: die 50 Bundesstaaten.',
        'World: all countries with the small maps for the Caribbean and Oceania. Continents: one continent only. German states: the 16 Länder. US states: the 50 states.'],
  level: ['Top 50: die 50 bekanntesten Länder. UN-Staaten: alle 195 anerkannten Staaten. Länder & Territorien: dazu 30 weitere Gebiete.',
          'Top 50: the 50 best-known countries. UN states: all 195 recognised states. Countries & territories: plus 30 more territories.'],
  cont: ['Es wird nur der gewählte Kontinent angezeigt und abgefragt. Russland und die Türkei zählen zu Europa und Asien.',
         'Only the chosen continent is shown and quizzed. Russia and Turkey count for both Europe and Asia.'],
  terr: ['UN-Staaten: anerkannte Staaten. Mit Gebieten: zusätzlich abhängige Gebiete und nicht allgemein anerkannte Staaten dieses Kontinents.',
         'UN states: recognised states. With territories: also dependent territories and partly recognised states of this continent.'],
  lang: ['Sprache der Oberfläche und der Ländernamen.', 'Language of the interface and of the country names.'],
  zoom: ['Im Eingabemodus zoomt die Karte auf das gesuchte Land. Die Stufe bestimmt, wie nah.', 'In typing mode the map zooms to the country. The level sets how close.'],
  flag: ['Zeigt eine kleine Flagge des gesuchten Landes in der Aufgabe.', 'Shows a small flag of the country in the task.'],
  theme: ['Farben der Karte: Klassisch, Nacht oder Sand.', 'Map colours: Classic, Night or Sand.'],
  tip: ['Deckt Buchstaben auf (1, dann 2 weitere, dann 3 …), nie das ganze Wort. Jeder Tipp kostet einen Versuch und damit 25 % der Punkte. Beim letzten Versuch ist kein Tipp möglich.',
        'Reveals letters (1, then 2 more, then 3 …), never the whole word. Each tip uses one attempt and so costs 25 % of the points. No tip is possible on the last attempt.'],
  dots: ['Die Punkte zeigen deine übrigen Versuche. 1. Versuch: 100 %, dann 75 %, 50 % und 25 %. Nach 4 Fehlern gilt das Land als nicht gewusst (0 %).',
         'The dots show your remaining attempts. 1st attempt: 100 %, then 75 %, 50 % and 25 %. After 4 misses the country counts as not known (0 %).'],
  pct: ['Durchschnitt der Punkte aller beantworteten Länder. Am Ende ist das deine Genauigkeit.', 'Average score of all countries answered so far. At the end this is your accuracy.'],
  review: ['Die Farbe eines Landes zeigt, beim wievielten Versuch du es gefunden hast. Ein Klick auf ein Land zeigt Name und Versuche.',
           'A country colour shows on which attempt you found it. Click a country to see its name and attempts.'],
  xp: ['Für jedes Prozent Genauigkeit einer Runde gibt es 1 XP.', 'You earn 1 XP for every percent of accuracy in a round.'],
  best: ['Beste Runde je Modus und Schwierigkeit: höchste Genauigkeit, bei Gleichstand die kürzeste Zeit.', 'Best round per mode and difficulty: highest accuracy, shortest time if tied.'],
  account: ['Mit Konto wird dein Fortschritt gespeichert und auf allen Geräten abgeglichen. Es gibt keine E-Mail, daher auch kein Zurücksetzen des Passworts.',
            'With an account your progress is saved and synced across devices. There is no e-mail, so a password cannot be reset.']
};
export const infoBtn = k => '<button type="button" class="info" data-i="' + k + '" aria-label="Info">i</button>';

let pop, cur = null, lastPT = 'mouse';
function show(b) {
  const t = INFO[b.dataset.i]; if (!t) return;
  pop.textContent = t[S.lang === 'en' ? 1 : 0]; pop.classList.add('show'); b.setAttribute('aria-describedby', 'info-pop'); cur = b;
  const r = b.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  let y = r.bottom + 8; if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 8); // unten kein Platz: darüber anzeigen
  pop.style.left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8) + 'px'; pop.style.top = y + 'px';
}
function hide() { if (!cur) return; pop.classList.remove('show'); cur.removeAttribute('aria-describedby'); cur = null; }
export function initInfo() {
  pop = document.createElement('div'); pop.id = 'info-pop'; pop.setAttribute('role', 'tooltip'); document.body.appendChild(pop);
  const btn = t => t && t.closest && t.closest('.info');
  document.addEventListener('pointerdown', e => { lastPT = e.pointerType; }, true);
  document.addEventListener('pointerover', e => { const b = btn(e.target); if (b && e.pointerType === 'mouse') show(b); });
  document.addEventListener('pointerout', e => { const b = btn(e.target); if (b && e.pointerType === 'mouse' && cur === b) hide(); });
  document.addEventListener('click', e => { // vor dem Klick-Verteiler, damit ein "i" in einer Auswahlkarte diese nicht auswählt
    const b = btn(e.target);
    if (!b) { hide(); return; }
    e.stopPropagation(); e.preventDefault();
    if (lastPT === 'mouse' && e.detail) show(b); else if (cur === b) hide(); else show(b); // Handy/Tastatur: Antippen schaltet um
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, true); window.addEventListener('resize', hide);
}
