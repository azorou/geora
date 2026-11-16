// Handbuch: erklärt alle Modi, Karten, Einstellungen und das Versionssystem. Texte stehen als [Deutsch, English]; **fett** wird hervorgehoben.
// Neue Funktion eingebaut? Hier im passenden Kapitel ergänzen.
import { S, th } from './state.js';
import { CONTS, CONTNAME, contCount, ATT_SCORE } from './data.js';
import { tr } from './i18n.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const T = a => md(a[S.lang === 'en' ? 1 : 0]);

const B = { // Bausteine
  p: t => '<p>' + T(t) + '</p>',
  h: t => '<h4>' + T(t) + '</h4>',
  ul: l => '<ul>' + l.map(t => '<li>' + T(t) + '</li>').join('') + '</ul>',
  ol: l => '<ol>' + l.map(t => '<li>' + T(t) + '</li>').join('') + '</ol>',
  note: t => '<div class="g-note">' + T(t) + '</div>',
  tbl: ([head, rows]) => '<div class="g-tw"><table><thead><tr>' + head.map(h => '<th>' + T(h) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map((c, i) => '<td>' + (Array.isArray(c) ? T(c) : esc(c)) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>',
  att: () => '<div class="g-att">' + th().att.map((c, i) => '<div><span class="g-dot" style="background:' + c + '"></span><b>' + (i + 1) + '.</b><small>' + Math.round(ATT_SCORE[i] * 100) + ' %</small></div>').join('') + '</div>',
  letters: () => '<div class="g-mono">_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_<small>' + T(['kein Tipp', 'no tip']) + '</small></div><div class="g-mono">D&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_<small>' + T(['1. Tipp', '1st tip']) + '</small></div><div class="g-mono">D&nbsp;e&nbsp;u&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_<small>' + T(['2. Tipp (+2)', '2nd tip (+2)']) + '</small></div>',
  cont: () => '<div class="g-tw"><table><thead><tr><th>' + T(['Kontinent', 'Continent']) + '</th><th>' + tr('UN-Staaten') + '</th><th>' + T(['mit Gebieten', 'with territories']) + '</th></tr></thead><tbody>'
    + CONTS.map(k => '<tr><td>' + esc(tr(CONTNAME[k])) + '</td><td>' + contCount(k, false) + '</td><td>' + contCount(k, true) + '</td></tr>').join('') + '</tbody></table></div>',
  ver: () => '<div class="g-ver"><span>' + T(['Aktuell', 'Current']) + '</span><b>v' + esc(window.GEORA_BUILD || '?') + '</b><small>' + esc(window.GEORA_DATE || '') + '</small></div>'
};

const CH = [
  { id: 'start', t: ['Schnellstart', 'Quick start'], b: [
    ['p', ['Geora ist ein Geografie-Quiz: Dir wird ein Land (oder Bundesland, US-Staat) genannt, und du findest es auf der Karte oder tippst seinen Namen.', 'Geora is a geography quiz: you are given a country (or German state, US state) and either find it on the map or type its name.']],
    ['ol', [['Hauptmenü → **Landkarten** öffnen.', 'Main menu → open **Maps**.'], ['**Spielmodus**, **Karte** und je nach Karte **Schwierigkeit** oder **Kontinent** wählen.', 'Choose the **game mode**, the **map** and the **difficulty** or **continent**.'], ['**Jetzt spielen**. Am Ende siehst du Genauigkeit, XP und Zeit.', '**Play now**. At the end you see accuracy, XP and time.']]],
    ['note', ['Ohne Konto wird dein Fortschritt nur auf diesem Gerät gespeichert. Mit Konto ist er auf allen Geräten verfügbar.', 'Without an account your progress is only saved on this device. With an account it is available on all devices.']]
  ] },
  { id: 'modes', t: ['Spielmodi', 'Game modes'], b: [
    ['h', ['Pin: Land anklicken', 'Pin: click the country']],
    ['p', ['Der gesuchte Name steht oben (auf Wunsch mit kleiner Flagge). Klicke das Land auf der Karte an; kurz erscheint der Name des angeklickten Landes. Kleine Staaten haben einen **weißen Klick-Punkt**, Inselgruppen **gestrichelte Zonen**. Beide lassen sich nur für Länder der Auswahl anklicken.', 'The name you are looking for is shown at the top (optionally with a small flag). Click the country on the map; the name of the clicked country appears briefly. Small states have a **white click dot**, island groups **dashed zones**. Both can only be clicked for countries in your selection.']],
    ['h', ['Eingabe: Namen tippen', 'Typing: type the name']],
    ['p', ['Ein Land ist farbig markiert (violett im klassischen Modus). Tippe seinen Namen und bestätige mit Enter oder OK. Deutsche und englische Namen sowie gängige Kürzel gelten. Namensschilder gibt es hier nicht, sonst wäre die Lösung verraten.', 'One country is highlighted (purple in the classic mode). Type its name and confirm with Enter or OK. German and English names and common abbreviations are accepted. There are no name labels here, as they would give away the answer.']],
    ['letters'],
    ['ul', [
      ['**Tipp**: deckt Buchstaben auf (1, dann 2 weitere, dann 3 …), nie das ganze Wort. Jeder Tipp verbraucht einen Versuch und kostet damit dieselben Punkte wie ein Fehlversuch. Beim letzten Versuch ist kein Tipp möglich.', '**Tip**: reveals letters (1, then 2 more, then 3 …), never the whole word. Each tip uses one attempt and costs the same points as a miss. No tip is possible on the last attempt.'],
      ['**Tippfehler**: Ist nur 1 Buchstabe falsch (ab 8 Zeichen 2), erscheint „Meintest du …?“. Das zählt nicht als Versuch und kostet keine Punkte; schreibe das Wort neu. Ist die Eingabe der Name eines anderen Gebiets, gilt sie als normale falsche Antwort.', '**Typos**: if only 1 letter is wrong (2 from 8 characters), “Did you mean …?” appears. It does not count as an attempt and costs no points; type the word again. If your input is the name of a different area it counts as a normal wrong answer.'],
      ['**Zoom**: die Karte zoomt auf das gesuchte Land (siehe Einstellungen).', '**Zoom**: the map zooms to the country (see settings).']
    ]]
  ] },
  { id: 'maps', t: ['Karten und Umfang', 'Maps and scope'], b: [
    ['h', ['Welt', 'World']],
    ['tbl', [[['Umfang', 'Scope'], ['Inhalt', 'Contents']], [['Top 50', 'Top 50'], ['die 50 bekanntesten Länder', 'the 50 best-known countries']], [['UN-Staaten (195)', 'UN states (195)'], ['alle anerkannten Staaten', 'all recognised states']], [['Länder & Territorien (225)', 'Countries & territories (225)'], ['dazu 30 weitere Gebiete', 'plus 30 more territories']]]],
    ['p', ['Zur Weltkarte gehören zwei **kleine Felder**: links die Karibik, rechts Ozeanien. Dort liegen viele Inselstaaten, die auf der großen Karte kaum zu treffen wären.', 'The world map comes with two **small maps**: the Caribbean on the left, Oceania on the right. They hold many island states that would be hard to hit on the large map.']],
    ['h', ['Kontinente', 'Continents']],
    ['p', ['Es wird nur der gewählte Kontinent abgefragt, ohne kleine Felder. Länder im Kartenausschnitt, die nicht dazugehören, erscheinen ausgegraut. Zur Wahl stehen **UN-Staaten** und **Länder & Territorien**. Gebiete erscheinen im Umfang „UN-Staaten“ grau und werden nicht gefragt.', 'Only the chosen continent is quizzed, without small maps. Countries inside the map area that do not belong to it appear greyed out. You can choose **UN states** or **countries & territories**. In the “UN states” scope territories appear grey and are not asked.']],
    ['cont'],
    ['note', ['Russland und die Türkei zählen zu Europa und zu Asien. Ozeanien nutzt die Karte mit Datumsgrenze im ganzen Feld.', 'Russia and Turkey count for both Europe and Asia. Oceania uses the map across the date line, filling the whole area.']],
    ['h', ['Bundesländer und US-Staaten', 'German states and US states']],
    ['ul', [['**Bundesländer**: die 16 deutschen Länder.', '**German states**: the 16 German Länder.'], ['**US-Staaten**: die 50 Bundesstaaten. Alaska und Hawaii sind verkleinert unten links eingefügt; Washington D.C. und Puerto Rico sind nicht dabei.', '**US states**: the 50 states. Alaska and Hawaii are shown reduced at the bottom left; Washington D.C. and Puerto Rico are not included.']]]
  ] },
  { id: 'score', t: ['Versuche, Farben und Punkte', 'Attempts, colours and points'], b: [
    ['p', ['Jedes Land hat **4 Versuche**. Die Farbe zeigt, im wievielten Versuch du es gefunden hast, darunter die Punkte dafür:', 'Every country gets **4 attempts**. The colour shows on which attempt you found it, with the points below:']],
    ['att'],
    ['ul', [
      ['**Nicht gewusst**: Nach 4 Fehlern blinkt das Land (Pin) bzw. der Name wird gezeigt (Eingabe). Du musst es nachholen; es zählt 0 %.', '**Not known**: after 4 misses the country blinks (Pin) or its name is shown (Typing). You must redo it; it counts 0 %.'],
      ['**Klicks, die nicht zählen**: Ein Klick auf ein Land, das nicht zur Auswahl gehört (z. B. graue Gebiete) oder schon abgegeben wurde, kostet keinen Versuch. Auch dasselbe falsche Land mehrfach anzuklicken kostet nur einmal einen Versuch.', '**Clicks that do not count**: clicking a country that is not part of your selection (e.g. grey territories) or has already been answered costs no attempt. Clicking the same wrong country several times costs only one attempt.'],
      ['**Tipps** verbrauchen einen Versuch (siehe Spielmodi).', '**Tips** use one attempt (see game modes).'],
      ['**Genauigkeit**: Durchschnitt der Punkte aller Länder. Während des Spiels zeigt der Prozentwert oben den Durchschnitt der bisher beantworteten Länder.', '**Accuracy**: average points of all countries. During the game the percentage at the top shows the average of the countries answered so far.'],
      ['**XP**: Pro Land gibt es im Pin-Modus bis zu **1 XP**, im Eingabemodus bis zu **2 XP**. Jeder weitere Versuch (auch ein Tipp) zieht 25 % davon ab, nicht gewusst gibt 0. Am Ende der Runde wird alles addiert und abgerundet.', '**XP**: per country you get up to **1 XP** in Pin mode and up to **2 XP** in Typing mode. Each further attempt (tips too) deducts 25 % of it, not known gives 0. At the end of the round everything is added up and rounded down.'],
      ['**Abgabe-Effekt**: Ein Ring wächst vom Land aus, grün bei richtig, rot bei falsch.', '**Answer effect**: a ring grows out from the country, green for right, red for wrong.'],
      ['**Töne** (Einstellung): einer für richtig, einer für nicht gewusst und am Rundenende drei Varianten: normal, ab 90 % und bei 100 % dazu ein **Feuerwerk**.', '**Sounds** (setting): one for right, one for not known, and three variants at the end of a round: normal, from 90 %, and at 100 % with **fireworks** on top.'],
      ['**Gelöste Länder** haben dunklere, kräftigere Grenzen, **abgegebene Punkte** sind größer und haben einen kräftigen Rand.', '**Solved countries** have darker, bolder borders; **answered dots** are larger with a bold outline.']
    ]]
  ] },
  { id: 'map', t: ['Die Karte bedienen', 'Using the map'], b: [
    ['ul', [
      ['**Zoomen und Verschieben**: Mausrad oder zwei Finger zum Zoomen, ziehen zum Verschieben. Die Karte bleibt innerhalb ihrer Grenzen.', '**Zoom and pan**: mouse wheel or two fingers to zoom, drag to pan. The map stays within its bounds.'],
      ['**Darüberfahren** (PC, Pin-Modus): Das Land unter der Maus färbt sich lila, wie das blinkende Land nach dem 4. Versuch.', '**Hovering** (PC, Pin mode): the country under the mouse turns purple, like the blinking country after the 4th attempt.'],
      ['**Kleine Felder** (nur Weltkarte): Karibik links, Ozeanien rechts. Jedes lässt sich einzeln zoomen und verschieben.', '**Small maps** (world map only): Caribbean on the left, Oceania on the right. Each can be zoomed and panned on its own.'],
      ['**Größe ändern**: Am Griff in der oberen Ecke ziehen (links oben rechts, rechts oben links). Das Feld bleibt in seiner Ecke. Bei jedem neuen Durchlauf werden Größe und Zoom zurückgesetzt.', '**Resize**: drag the handle at the top corner (top right for the left map, top left for the right map). The map stays in its corner. Size and zoom are reset with every new run.'],
      ['**Info-Knöpfe (i)**: Am PC darüberfahren, am Handy antippen: eine kurze Erklärung erscheint.', '**Info buttons (i)**: hover on a PC, tap on a phone: a short explanation appears.'],
      ['**Einstellungen im Spiel**: erreichbar über das Zahnrad; die Zeit ist dann pausiert.', '**Settings during a game**: reachable via the gear; the time is paused meanwhile.']
    ]]
  ] },
  { id: 'settings', t: ['Einstellungen', 'Settings'], b: [
    ['tbl', [[['Einstellung', 'Setting'], ['Wirkung', 'Effect']],
      [['Sprache', 'Language'], ['Deutsch oder English (UK): Oberfläche, Länder- und Gebietsnamen.', 'German or English (UK): interface, country and area names.']],
      [['Zoom im Eingabemodus', 'Zoom in typing mode'], ['Aus, Sanft, Mittel, Stark: wie nah die Karte auf das gesuchte Land zoomt.', 'Off, Gentle, Medium, Strong: how close the map zooms to the country.']],
      [['Flagge in der Aufgabe', 'Flag in the task'], ['Zeigt eine kleine Flagge des gesuchten Landes, Bundeslands oder Staats. Ein Klick darauf öffnet sie groß in einem Fenster.', 'Shows a small flag of the country, state or area. Clicking it opens a large version in a window.']],
      [['Hauptstadt in der Aufgabe', 'Capital in the task'], ['Zeigt die Hauptstadt des gesuchten Landes, Bundeslands oder Staats, auch im Eingabemodus als Hilfe.', 'Shows the capital of the country, state or area, also in typing mode as a hint.']],
      [['Töne', 'Sounds'], ['An oder Aus: Töne bei richtig, nicht gewusst und am Rundenende; bei 100 % mit Feuerwerk.', 'On or off: sounds for right, not known and at the end of a round; with fireworks at 100 %.']],
      [['Farbmodus', 'Colour mode'], ['Klassisch, Nacht oder Sand: Farben von Karte, Linien und Versuchen.', 'Classic, Night or Sand: colours of map, lines and attempts.']]]],
    ['p', ['Die Einstellungen erreichst du im Hauptmenü und im laufenden Spiel. Sie werden gespeichert und mit einem Konto auf deine Geräte übertragen.', 'You can open the settings in the main menu and during a game. They are saved and, with an account, carried over to your devices.']]
  ] },
  { id: 'after', t: ['Nach der Runde', 'After a round'], b: [
    ['ul', [
      ['**Ergebnis**: Genauigkeit, XP, Zeit und Anzahl der Tipps.', '**Result**: accuracy, XP, time and number of tips.'],
      ['**Karte ansehen**: Jedes Land trägt die Farbe seines Versuchs. Ein Klick zeigt Name und Versuche. Mit „Ergebnis“ kehrst du zurück.', '**View map**: every country shows the colour of its attempt. A click shows its name and attempts. “Result” takes you back.'],
      ['**Nochmal spielen** startet einen neuen Durchlauf, **Hauptmenü** bringt dich zurück.', '**Play again** starts a new run, **Main menu** takes you back.']
    ]]
  ] },
  { id: 'profile', t: ['Profil und Konto', 'Profile and account'], b: [
    ['ul', [
      ['**Profil**: XP gesamt, gespielte Runden, Bestwerte und die letzten Runden.', '**Profile**: total XP, rounds played, best results and recent rounds.'],
      ['**Bestwerte**: beste Runde je Modus und Umfang; zählt die höchste Genauigkeit, bei Gleichstand die kürzeste Zeit. Du siehst sie auch bei der Auswahl vor dem Start und nach jeder Runde.', '**Best results**: best round per mode and scope; highest accuracy counts, shortest time if tied. You also see them in the selection before you start and after every round.'],
      ['**Konto** (optional): Benutzername und Passwort (6 bis 72 Zeichen). Dein Fortschritt wird auf allen Geräten abgeglichen, ohne doppelte Zählung. Fortschritt als Gast wandert beim Anmelden ins Konto.', '**Account** (optional): username and password (6 to 72 characters). Your progress is synced across devices without double counting. Progress as a guest moves into the account when you sign in.'],
      ['Es gibt **keine E-Mail**, daher auch kein Zurücksetzen des Passworts. Nutze kein Passwort, das du woanders verwendest.', 'There is **no e-mail**, so a password cannot be reset. Do not use a password you use elsewhere.']
    ]]
  ] },
  { id: 'version', t: ['Version und Updates', 'Version and updates'], b: [
    ['ver'],
    ['p', ['Die Version steht unten rechts in der Ecke (im Spiel ausgeblendet). Sie besteht aus **Hauptversion.Update**, zum Beispiel **1.6**:', 'The version is shown in the bottom right corner (hidden during a game). It consists of **major.update**, for example **1.6**:']],
    ['ul', [
      ['**Hauptversion** (vor dem Punkt): große Ausbaustufe. Sie steigt nur, wenn ein ganzer neuer Funktionsblock dazukommt.', '**Major** (before the dot): large development stage. It only rises when a whole new block of features is added.'],
      ['**Update** (nach dem Punkt): zählt bei jedem Update um 1 hoch. Dahinter steht das Datum.', '**Update** (after the dot): increases by 1 with every update. The date follows.']
    ]],
    ['note', ['Zeigt die Ecke nicht die erwartete Version, läuft noch ein älterer Stand: 1 bis 3 Minuten warten, dann mit Strg+F5 neu laden (am Handy: privaten Tab öffnen). Die Version steuert auch, dass der Browser neue Dateien lädt statt alter aus dem Zwischenspeicher.', 'If the corner does not show the expected version an older build is still running: wait 1 to 3 minutes, then reload with Ctrl+F5 (on a phone: open a private tab). The version also makes the browser load new files instead of old ones from its cache.']]
  ] }
];

export function renderGuide() {
  const box = document.getElementById('guide-body'); if (!box) return;
  const en = S.lang === 'en', head = '<div class="g-hero"><div class="g-hero-t">' + (en ? 'Guide' : 'Handbuch') + '</div><div class="g-hero-s">' + (en ? 'Everything about modes, maps, settings and points.' : 'Alles zu Modi, Karten, Einstellungen und Punkten.') + '</div></div>';
  const toc = '<div class="g-toc">' + CH.map((c, i) => '<button type="button" class="g-chip" data-act="guideGo" data-v="' + c.id + '"><b>' + (i + 1) + '</b>' + esc(c.t[en ? 1 : 0]) + '</button>').join('')
    + '<button type="button" class="g-chip g-all" data-act="guideAll">' + (en ? 'Expand / collapse all' : 'Alle auf- / zuklappen') + '</button></div>';
  const open = document.querySelectorAll('#guide-body .g-ch[open]'), keep = new Set([...open].map(d => d.id)); if (!keep.size) keep.add('g-start');
  box.innerHTML = head + toc + CH.map((c, i) => '<details class="g-ch" id="g-' + c.id + '"' + (keep.has('g-' + c.id) ? ' open' : '') + '><summary><span class="g-n">' + (i + 1) + '</span><span class="g-t">' + esc(c.t[en ? 1 : 0]) + '</span></summary><div class="g-b">'
    + c.b.map(([k, d]) => B[k](d)).join('') + '</div></details>').join('');
}
