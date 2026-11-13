# Geora – Dateien und Einrichtung

## Dateien (alles mit dieser Struktur ins GitHub-Repository hochladen)
```
index.html        Aufbau der Seite
style.css         Aussehen
config.js         Supabase-Zugang (hier trägst du URL und Key ein)
supabase.sql      Einrichtung der Datenbank (einmal im Supabase SQL Editor ausführen)
countries.geojson Kartendaten (hast du schon im Repository, bleibt im Hauptordner)
js/
  main.js         Startpunkt
  data.js         Länderlisten (Seterra), Zonen, Farbmodi, Punkte-Werte
  state.js        gemeinsamer Zustand
  map.js          Karte, Zonen, Farben
  game.js         Spielablauf, Tipps, Punkte, XP, Auswertung
  storage.js      Profil, XP, Zusammenführen, Cloud-Sync
  account.js      Konto (Supabase)
  ui.js           Oberfläche, Einstellungen, Profil
```
Ohne Server geht es nicht per Doppelklick (Browser sperren dann Module). Auf GitHub Pages funktioniert es.
Lokal testen: VS Code → Erweiterung „Live Server“.
Nach einem Update ggf. mit Strg+F5 neu laden (Browser-Zwischenspeicher).

## Konten mit Supabase einrichten (einmalig, ca. 5 Minuten)
1. supabase.com → Konto → **New project** (oder dein bestehendes Projekt vom Vokabeltrainer verwenden, siehe unten).
2. Im Projekt: **SQL Editor → New query**, den kompletten Inhalt von `supabase.sql` einfügen, **Run**.
3. **Project Settings → API Keys** (bzw. „Data API“): *Project URL* und den **publishable bzw. anon** Key kopieren.
   **Niemals** den `secret`/`service_role` Key verwenden!
4. In `config.js` beides eintragen, Datei auf GitHub hochladen.
5. Fertig: Im Spiel oben auf ⚡ XP → Konto → Registrieren.

Falls „Data API“ im Projekt ausgeschaltet ist: Project Settings → Data API → einschalten (Schema `public` muss freigegeben sein).

## Wichtig
- Es gibt keine E-Mail. Wer sein Passwort vergisst, kann es nicht zurücksetzen.
- Passwörter werden in der Datenbank mit bcrypt gehasht; die Tabellen sind für Browser gesperrt, nur die Funktionen in `supabase.sql` sind erreichbar.
- Gratis-Projekte pausieren nach 1 Woche ohne Nutzung (im Dashboard mit einem Klick wieder starten).
- Pro Konto werden höchstens ca. 6–10 KB gespeichert (siehe storage.js).

## Werte zum Anpassen
- `js/data.js`: `TIP_COST` (Abzug je Tipp, 0.1 = 10 %), `ATT_SCORE` (Punkte je Versuch), Farbmodi `THEMES`, Zoomstufen `ZOOM`.
- XP pro Runde = Genauigkeit in Prozent (in `js/game.js`, Funktion `endRound`).
