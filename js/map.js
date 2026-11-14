// Karte: Daten laden, Länder/Zonen/Punkte zeichnen, Farben
import { DATA, UN195, EXT30, FB, OCE, ZC, ZO, pxC, pxO, R_CAR_IN, R_OCE_IN, RIPPLE, CONTVIEW } from './data.js';
import { REGION, regionFeatures } from './regions.js';
import { $, S, th, fid } from './state.js';
import { tr } from './i18n.js';

export const parse = s => s.split('|').map(x => x.split(':'));

export function indexGeo() { // Länder über ADM0_A3 / ISO_A3 finden, Seterra-Namen setzen, fehlende Gebiete ergänzen
  const idx = S.idx = {};
  S.geo.forEach(f => { const p = f.properties; [p.ADM0_A3, p.ISO_A3, p.ISO_A3_EH].forEach(c => { if (c && c !== '-99' && !idx[c]) idx[c] = f; }); });
  [...parse(UN195), ...parse(EXT30)].forEach(([c, n]) => {
    if (!idx[c] && FB[c]) {
      const [la, lo, en] = FB[c], d = .15;
      const f = { type: 'Feature', properties: { ADM0_A3: c, NAME: en, NAME_LONG: en, POP_EST: 1 }, geometry: { type: 'Polygon', coordinates: [[[lo - d, la - d], [lo + d, la - d], [lo + d, la + d], [lo - d, la + d], [lo - d, la - d]]] } };
      S.geo.push(f); idx[c] = f;
    }
    if (idx[c]) { idx[c]._de = n; idx[c]._code = c; }
  });
}
export function prep(f) { // Mittelpunkt/Box des größten Teilstücks + Entscheidung, ob ein Klick-Punkt nötig ist
  const g = f.geometry, ps = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let best = [0, 0], lb = [0, 0, 0, 0], ba = -1, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  ps.forEach(p => {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    p[0].forEach(c => { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]); });
    minx = Math.min(minx, x0); maxx = Math.max(maxx, x1); miny = Math.min(miny, y0); maxy = Math.max(maxy, y1);
    const a = (x1 - x0) * (y1 - y0); if (a > ba) { ba = a; best = [(y0 + y1) / 2, (x0 + x1) / 2]; lb = [x0, y0, x1, y1]; }
  });
  f._lb = lb; f._b = [minx, miny, maxx, maxy]; f._c = best; f._dot = (maxx - minx < 3.5) || OCE.includes(fid(f));
}
const shiftGeom = g => { const m = c => typeof c[0] === 'number' ? [c[0] + 360, c[1]] : c.map(m); return { type: g.type, coordinates: m(g.coordinates) }; };

export function simp(g, tol = .05) { // Linien ausdünnen (kaum sichtbar, spart viel Rechenzeit)
  const ring = r => {
    if (r.length < 12) return r;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    r.forEach(c => { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]); });
    if (x1 - x0 < 1 && y1 - y0 < 1) return r; // winzige Inseln unverändert lassen
    const o = [r[0]]; let l = r[0];
    for (let i = 1; i < r.length - 1; i++) if (Math.abs(r[i][0] - l[0]) + Math.abs(r[i][1] - l[1]) >= tol) { o.push(r[i]); l = r[i]; }
    o.push(r[r.length - 1]); return o.length >= 4 ? o : r;
  };
  const poly = p => p.map(ring);
  return g.type === 'Polygon' ? { type: 'Polygon', coordinates: poly(g.coordinates) } : { type: 'MultiPolygon', coordinates: g.coordinates.map(poly) };
}

async function fetchGeo(list) { // 1. lokale Datei, danach Internet-Quellen mit Zeitlimit; liefert die Features oder null
  for (let i = 0; i < list.length; i++) {
    $('target-prompt').textContent = tr('Karte wird geladen …') + ' (' + tr('Quelle') + ' ' + (i + 1) + '/' + list.length + ')';
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), i === 0 ? 20000 : 45000);
    try { const r = await fetch(list[i], { signal: ctl.signal }); if (!r.ok) continue; const j = await r.json(); if (j && j.features) return j.features; } catch (e) {} finally { clearTimeout(to); }
  }
  return null;
}
export async function loadData() { const f = await fetchGeo(DATA); return f && f.filter(x => fid(x) !== 'ATA'); }
// Bundesländer / US-Staaten: laden, über die Namen zuordnen, einmal auf die Weltkarte bauen. Gibt eine Fehlermeldung zurück oder null.
export async function ensureRegion(kind) {
  if (S.reg[kind]) return null;
  const R = REGION[kind], raw = await fetchGeo(R.src);
  if (!raw) return tr('Kartendaten konnten nicht geladen werden:') + ' ' + R.file + ' (README)';
  const { feats, missing } = regionFeatures(kind, raw);
  if (missing.length) return tr('In den Kartendaten fehlen:') + ' ' + missing.join(', ') + ' (' + R.file + ')';
  let b = [90, 180, -90, -180];
  feats.forEach(f => { f.geometry = simp(f.geometry, kind === 'us' ? .02 : .005); prep(f); S.idx[fid(f)] = f; b = [Math.min(b[0], f._b[1]), Math.min(b[1], f._b[0]), Math.max(b[2], f._b[3]), Math.max(b[3], f._b[2])]; });
  build(S.mapWorld, feats);
  S.reg[kind] = { feats, bounds: [[b[0], b[1]], [b[2], b[3]]] };
  return null;
}

// ---------- Farben ----------
const solvedColor = id => S.tmp[id] || (S.solved[id] !== undefined ? th().att[(S.solved[id] || 4) - 1] : null); // solved: 1–4 = Versuch, 0 = nicht gewusst
function fillOf(id) {
  const c = solvedColor(id); if (c) return c;
  if (S.mode === 'type' && S.target && id === fid(S.target)) return th().hi;
  return S.valid.has(id) ? th().land : th().off;
}
// S.show: null = alle Länder zeichnen (Weltkarte); sonst nur diese Ids (Kontinent, Bundesländer ...), alle anderen Ebenen sind unsichtbar und nicht anklickbar
const shown = id => !S.show || S.show.has(id), HIDE = { fill: false, stroke: false };
const polySt = id => { if (!shown(id)) return HIDE; const sv = solvedColor(id); return { fill: true, stroke: true, fillColor: fillOf(id), fillOpacity: 1, color: sv ? th().solvedLine : th().line, weight: sv ? .9 : .5 }; }; // gelöste Länder: dunklere Grenzen
const dotOn = (id, l) => shown(id) && S.valid.has(id) && (l.always || l.wdeg < S.dotThr); // Klick-Punkt nur für schmale Länder dieser Karte
const dotSt = (id, l) => { if (!dotOn(id, l)) return { radius: 4, fill: false, stroke: false }; const c = solvedColor(id) || (S.mode === 'type' && S.target && id === fid(S.target) ? th().hi : '#ffffff'); return { radius: 4, fill: true, stroke: true, fillColor: c, fillOpacity: 1, color: '#0f3d22', weight: 1.3, opacity: 1 }; };
const zoneSt = id => { if (!shown(id)) return HIDE; const c = solvedColor(id), v = S.valid.has(id); return { stroke: true, color: th().zone, weight: 1.5, dashArray: '6 5', opacity: v ? 1 : .85, fill: true, fillColor: c || '#fff', fillOpacity: c && v ? .5 : .001 }; };

export function refresh(id) {
  const vis = shown(id), v = S.valid.has(id);
  (S.layers[id] || []).forEach(l => {
    l.options.interactive = l.zone ? vis && v : l.isDot ? dotOn(id, l) : vis; // unsichtbare oder ungültige Ebenen blockieren keine Klicks
    l.setStyle(l.zone ? zoneSt(id) : l.isDot ? dotSt(id, l) : polySt(id));
  });
}
export const refreshAll = () => Object.keys(S.layers).forEach(refresh);

let blinkT = null, blinkId = null;
export function setBlink(id, on) { // blinkt per Timer (funktioniert mit Canvas)
  clearInterval(blinkT);
  if (blinkId) { const o = blinkId; blinkId = null; delete S.tmp[o]; refresh(o); }
  if (!on) return;
  blinkId = id; let k = 0; blinkT = setInterval(() => { S.tmp[id] = (k++ % 2) ? '#ffffff' : th().hi; refresh(id); }, 400);
}
export function flyToBoundsInside(m, b, o) { // wie flyToBounds, nur wird der Ausschnitt vorher in die Kartengrenzen geschoben; sonst springt Leaflet nach dem Flug zurück
  const bounds = L.latLngBounds(b), tl = L.point(o.paddingTopLeft || [0, 0]), br = L.point(o.paddingBottomRight || [0, 0]);
  let z = m.getBoundsZoom(bounds, false, tl.add(br)); if (o.maxZoom) z = Math.min(z, o.maxZoom);
  if (!isFinite(z)) return;
  let c = m.project(bounds.getSouthWest(), z).add(m.project(bounds.getNorthEast(), z)).divideBy(2).add(br.subtract(tl).divideBy(2)); // gleicher Mittelpunkt wie bei Leaflet
  if (m.options.maxBounds) {
    const mb = L.latLngBounds(m.options.maxBounds), nw = m.project(mb.getNorthWest(), z), se = m.project(mb.getSouthEast(), z), h = m.getSize().divideBy(2);
    const lim = (v, lo, hi) => lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)); // Ansicht ganz in die Karte; ist die Karte kleiner als die Ansicht: mittig
    c = L.point(lim(c.x, nw.x + h.x, se.x - h.x), lim(c.y, nw.y + h.y, se.y - h.y));
  }
  m.flyTo(m.unproject(c, z), z, o);
}
export function ripple(m, ll, color) { // Abgabe-Effekt wie bei Seterra: durchsichtiger Ring wächst vom Landesmittelpunkt nach außen und verblasst
  if (!m || !ll || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  if (m === S.mapOce && ll[1] < 0) ll = [ll[0], ll[1] + 360]; // Ozeanien-Karte läuft über die Datumsgrenze
  const c = L.circleMarker(ll, { radius: 4, color, weight: 3, opacity: .9, fillColor: color, fillOpacity: .35, interactive: false }).addTo(m), t0 = performance.now();
  const go = now => {
    const k = Math.min(1, (now - t0) / RIPPLE.ms), e = 1 - (1 - k) * (1 - k); // läuft am Anfang schnell, am Ende langsam
    c.setStyle({ opacity: .9 * (1 - k), fillOpacity: .35 * (1 - k) }); c.setRadius(4 + (RIPPLE.r - 4) * e);
    if (k < 1) requestAnimationFrame(go); else m.removeLayer(c);
  };
  requestAnimationFrame(go);
}
export function flash(id) { S.tmp[id] = '#ff4b4b'; refresh(id); setTimeout(() => { delete S.tmp[id]; refresh(id); }, 450); }

// ---------- Ebenen bauen ----------
function addZones(m, Z, conv) { // gestrichelte Zonen, unter dem Land gezeichnet; große zuerst
  const area = p => Math.abs(p.reduce((a, c, i) => { const d = p[(i + 1) % p.length]; return a + c[0] * d[1] - d[0] * c[1]; }, 0)) / 2;
  Object.entries(Z).sort((a, b) => area(b[1]) - area(a[1])).forEach(([c, p]) => {
    const f = S.idx[c]; if (!f) return;
    const id = fid(f), z = L.polygon(p.map(conv), zoneSt(id)).addTo(m); z.zone = true;
    (S.layers[id] = S.layers[id] || []).push(z); z.on('click', e => { L.DomEvent.stopPropagation(e); S.onClick(f, z); });
  });
}
function build(m, data, zones, conv) { // Ebenen werden EINMAL gebaut und später nur umgefärbt
  if (zones) addZones(m, zones, conv);
  L.geoJSON(data, {
    style: f => polySt(fid(f)),
    onEachFeature: (f, l) => { (S.layers[fid(f)] = S.layers[fid(f)] || []).push(l); l.on('click', e => { L.DomEvent.stopPropagation(e); S.onClick(f, l); }); }
  }).addTo(m);
  data.forEach(f => {
    if (!f._dot) return;
    const d = L.circleMarker(f._c, { radius: 4 }).addTo(m); d.isDot = true; d.wdeg = f._b[2] - f._b[0]; d.always = OCE.includes(fid(f)); d.setStyle(dotSt(fid(f), d));
    (S.layers[fid(f)] = S.layers[fid(f)] || []).push(d);
    d.on('click', e => { L.DomEvent.stopPropagation(e); S.onClick(f, d); });
  });
}
function mk(id, o) {
  // Zeichenfläche (Renderer) ZUERST anmelden, sonst fehlt ihr beim Laden die Größe und Leaflet bricht mit "reading 'min'" ab
  const rend = L.canvas({ padding: .4 }); // gezeichnet wird 40 % über den sichtbaren Rand hinaus, dadurch bleibt beim Verschieben nichts leer
  const m = L.map(id, Object.assign({ renderer: rend, zoomControl: false, attributionControl: false, zoomSnap: .25 }, o));
  m.addLayer(rend);
  return m;
}
export async function initMaps(step) {
  S.map = S.mapWorld = mk('map', { minZoom: 1, maxBounds: [[-85, -180], [85, 180]], maxBoundsViscosity: 1 });
  S.mapCar = mk('map-car', { minZoom: 1, maxBounds: [[3, -90], [34, -52]], maxBoundsViscosity: 1 });
  S.mapOce = mk('map-oce', { minZoom: 1, maxBounds: [[-45, 120], [32, 245]], maxBoundsViscosity: 1 });
  const geo = S.geo;
  const hit = (b, w, so, e, n) => b[0] <= e && b[2] >= w && b[1] <= n && b[3] >= so;
  const wide = f => f._b[2] - f._b[0] >= 100 && !OCE.includes(fid(f)) && fid(f) !== 'NZL'; // z. B. Russland/USA nicht in Ozeanien
  const oce = f => !wide(f) && fid(f) !== 'CHN';
  // Ozeanien liegt an der Datumsgrenze: verschobene Kopie, damit Fidschi, Tonga, Samoa, Polynesien sichtbar sind
  const sh = f => ({ type: 'Feature', properties: f.properties, geometry: shiftGeom(f.geometry), _c: [f._c[0], f._c[1] + 360], _dot: f._dot, _de: f._de, _b: [f._b[0] + 360, f._b[1], f._b[2] + 360, f._b[3]] });
  await step(tr('Karte wird gebaut: Weltkarte …'));
  build(S.map, geo);
  await step(tr('Karte wird gebaut: Karibik …'));
  build(S.mapCar, geo.filter(f => hit(f._b, -90, 5, -52, 32)), ZC, pxC);
  await step(tr('Karte wird gebaut: Ozeanien …'));
  build(S.mapOce, geo.filter(f => oce(f) && hit(f._b, 115, -42, 240, 28)), ZO, pxO);
  build(S.mapOce, geo.filter(f => oce(f) && hit([f._b[0] + 360, f._b[1], f._b[2] + 360, f._b[3]], 115, -42, 240, 28)).map(sh));
  initGrips();
}

// ---------- Größe und Ausschnitt ----------
const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function layoutInsets() { // Standardhöhe nach Kartenhöhe; eine vom Spieler gezogene Größe bleibt erhalten
  if (S.cat !== 'world') { S.insetH = 0; return; } // die kleinen Karten gibt es nur bei der Weltkarte
  const fr = document.querySelector('.map-frame'), fh = fr.clientHeight, fw = fr.clientWidth, dh = clampN(Math.round(fh * .3), 90, 230);
  S.insetH = 0;
  document.querySelectorAll('.inset-box').forEach(e => {
    const z = S.insetSize[e.dataset.box], h = z ? clampN(z.h, 80, Math.round(fh * .7)) : dh;
    e.style.height = h + 'px'; S.insetH = Math.max(S.insetH, h); // die Weltkarte lässt unten so viel Platz wie das höchste Feld
    if (z) { e.style.maxWidth = 'none'; e.style.minWidth = '0'; e.style.width = clampN(z.w, 120, Math.round(fw * .7)) + 'px'; }
  });
}
let gripsReady = false;
function initGrips() { // Griff an der oberen Ecke: das Feld wächst nach oben und zur Mitte, bleibt aber in seiner Ecke
  if (gripsReady) return; gripsReady = true;
  document.querySelectorAll('.inset-grip').forEach(g => {
    const box = g.parentElement, k = box.dataset.box, dir = k === 'car' ? 1 : -1; // Karibik: Griff oben rechts, Ozeanien: oben links
    const other = () => document.querySelector('.inset-box:not([data-box="' + k + '"])'), map = () => k === 'car' ? S.mapCar : S.mapOce;
    g.addEventListener('pointerdown', e => {
      e.preventDefault(); g.setPointerCapture(e.pointerId);
      const x0 = e.clientX, y0 = e.clientY, w0 = box.offsetWidth, h0 = box.offsetHeight, fr = document.querySelector('.map-frame');
      const move = ev => {
        S.insetSize[k] = { w: clampN(w0 + dir * (ev.clientX - x0), 120, fr.clientWidth - other().offsetWidth - 4), h: clampN(h0 + (y0 - ev.clientY), 80, Math.round(fr.clientHeight * .7)) };
        layoutInsets(); map().invalidateSize({ animate: false });
      };
      const up = () => {
        ['pointermove', 'pointerup', 'pointercancel'].forEach((t, i) => g.removeEventListener(t, [move, up, up][i]));
        const m = map(); m.setMinZoom(0); m.fitBounds(k === 'car' ? R_CAR_IN : R_OCE_IN, { animate: false }); m.setMinZoom(m.getZoom()); // Ausschnitt neu einpassen
      };
      g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
    });
  });
}
window.addEventListener('resize', () => { if (S.mapCar) { layoutInsets(); [S.mapWorld, S.mapCar, S.mapOce].forEach(m => m.invalidateSize()); } });
const WORLD = [[-85, -180], [85, 180]];
const padB = b => { const dy = (b[1][0] - b[0][0]) * .35, dx = (b[1][1] - b[0][1]) * .35; return [[Math.max(-85, b[0][0] - dy), Math.max(-180, b[0][1] - dx)], [Math.min(85, b[1][0] + dy), Math.min(180, b[1][1] + dx)]]; }; // Rand zum Verschieben
export function fit() { // Hauptkarte und Ausschnitt passend zur Auswahl (Welt, Kontinent, Bundesländer, US-Staaten)
  const fr = document.querySelector('.map-frame'), world = S.cat === 'world', oc = S.cat === 'cont' && S.cont === 'oc';
  fr.dataset.scope = world ? 'world' : oc ? 'oc' : 'other'; // steuert per CSS, welche Felder sichtbar sind
  S.map = oc ? S.mapOce : S.mapWorld; // Ozeanien: die Karte mit Datumsgrenze füllt das ganze Feld
  layoutInsets();
  [S.mapWorld, S.mapCar, S.mapOce].forEach(m => { m.invalidateSize(); m.setMinZoom(0); });
  const m = S.map;
  if (world) {
    m.setMaxBounds(WORLD); m.fitBounds([[-56, -170], [78, 180]], { animate: false, paddingBottomRight: [0, S.insetH + 6] }); m.setMinZoom(m.getZoom());
    S.mapCar.fitBounds(R_CAR_IN, { animate: false }); S.mapOce.fitBounds(R_OCE_IN, { animate: false });
    S.mapCar.setMinZoom(S.mapCar.getZoom()); S.mapOce.setMinZoom(S.mapOce.getZoom()); // nicht weiter heraus als der Ausschnitt
  } else if (oc) { m.fitBounds(R_OCE_IN, { animate: false }); m.setMinZoom(m.getZoom()); }
  else { const b = S.cat === 'cont' ? CONTVIEW[S.cont] : S.reg[S.cat].bounds; m.setMaxBounds(WORLD); m.fitBounds(b, { animate: false }); m.setMinZoom(m.getZoom()); m.setMaxBounds(padB(b)); }
  S.fitZ = m.getZoom();
}
