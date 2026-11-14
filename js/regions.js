// Bundesländer und US-Staaten: Namen, Zuordnung der Kartendaten (über die Namen), Anordnung von Alaska/Hawaii, Flaggen
import { SYN } from './data.js';

// [Kürzel, deutscher Name, englischer Name, weitere Schreibweisen]
export const DE16 = [
  ['BW', 'Baden-Württemberg', 'Baden-Württemberg', []], ['BY', 'Bayern', 'Bavaria', []], ['BE', 'Berlin', 'Berlin', []], ['BB', 'Brandenburg', 'Brandenburg', []],
  ['HB', 'Bremen', 'Bremen', []], ['HH', 'Hamburg', 'Hamburg', []], ['HE', 'Hessen', 'Hesse', []], ['MV', 'Mecklenburg-Vorpommern', 'Mecklenburg-Western Pomerania', ['Mecklenburg Vorpommern', 'Mecklenburg-West Pomerania']],
  ['NI', 'Niedersachsen', 'Lower Saxony', []], ['NW', 'Nordrhein-Westfalen', 'North Rhine-Westphalia', ['NRW', 'Nordrhein Westfalen']], ['RP', 'Rheinland-Pfalz', 'Rhineland-Palatinate', ['Rheinland Pfalz']], ['SL', 'Saarland', 'Saarland', []],
  ['SN', 'Sachsen', 'Saxony', []], ['ST', 'Sachsen-Anhalt', 'Saxony-Anhalt', ['Sachsen Anhalt']], ['SH', 'Schleswig-Holstein', 'Schleswig-Holstein', ['Schleswig Holstein']], ['TH', 'Thüringen', 'Thuringia', []]
];
export const US50 = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'Kalifornien', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
  ['NM', 'New Mexico', 'New Mexico', ['Neumexiko']], ['NY', 'New York'], ['NC', 'North Carolina', 'North Carolina', ['Nordkarolina']], ['ND', 'North Dakota', 'North Dakota', ['Norddakota']], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania', 'Pennsylvania', ['Pennsylvanien']], ['RI', 'Rhode Island'], ['SC', 'South Carolina', 'South Carolina', ['Südkarolina']], ['SD', 'South Dakota', 'South Dakota', ['Süddakota']], ['TN', 'Tennessee'], ['TX', 'Texas'],
  ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia', 'West Virginia', ['Westvirginia']], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
].map(([k, de, en, alt]) => [k, de, en || de, alt || []]);

export const REGION = { // je Karte: Liste, Id-Vorsilbe, Kartendaten (lokale Datei zuerst, danach Internet), Schwelle für Klick-Punkte (Grad)
  de: { list: DE16, pre: 'DE-', thr: .35, src: ['de-states.geojson', 'https://cdn.jsdelivr.net/gh/isellsoap/deutschlandGeoJSON@main/2_bundeslaender/4_niedrig.geo.json', 'https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json'], flag: 'de-', file: 'de-states.geojson' },
  us: { list: US50, pre: 'US-', thr: 1.2, src: ['us-states.geojson', 'https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json', 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'], flag: 'us-', file: 'us-states.geojson' }
};

const norm = t => String(t == null ? '' : t).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const CODEKEY = /(postal|abbr|code|iso|stusps|hasc|^id$)/i; // Kürzel (2 Buchstaben) gelten nur in Feldern mit so einem Namen

export function matchRegion(kind, props) { // Kartendaten-Eigenschaften -> Kürzel des Bundeslands/Staats (oder null)
  const R = REGION[kind], names = new Map(), codes = new Map();
  R.list.forEach(([k, de, en, alt]) => { [de, en, ...alt].forEach(n => names.set(norm(n), k)); codes.set(k, k); codes.set(R.pre + k, k); });
  const ent = Object.entries(props || {}).filter(([, v]) => typeof v === 'string' || typeof v === 'number');
  for (const [, v] of ent) { const k = names.get(norm(v)); if (k && String(v).length > 2) return k; }
  for (const [key, v] of ent) { if (!CODEKEY.test(key)) continue; const s = String(v).toUpperCase().replace(/^US[-_]|^DE[-_]/, ''); if (codes.has(s)) return codes.get(s); }
  return null;
}

// Alaska und Hawaii werden verkleinert unter den Südwesten gesetzt (Rechnung im Mercator-Raum, damit die Form stimmt)
const mercY = la => Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360)) * 180 / Math.PI, unY = y => (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2) * 180 / Math.PI;
const US_MOVE = { AK: { from: [-152, 63], to: [-116.5, 24.5], s: .33 }, HI: { from: [-157.5, 20.5], to: [-102.5, 22.2], s: 1 } };
function moveGeom(g, m, k) {
  const fy = mercY(m.from[1]), ty = mercY(m.to[1]);
  const pt = c => { let lo = c[0]; if (k === 'AK' && lo > 0) lo -= 360; return [m.to[0] + (lo - m.from[0]) * m.s, unY(ty + (mercY(c[1]) - fy) * m.s)]; };
  const walk = a => typeof a[0] === 'number' ? pt(a) : a.map(walk);
  return { type: g.type, coordinates: walk(g.coordinates) };
}

const wikiName = (kind, k, en) => 'Flag_of_' + (kind === 'us' && k === 'GA' ? 'Georgia_(U.S._state)' : kind === 'de' && k === 'BY' ? 'Bavaria_(lozengy)' : en.replace(/ /g, '_')) + '.svg';
function flagChain(kind, k, en) { // erst flagcdn.com, danach Wikimedia Commons; schlägt beides fehl, wird die Flagge nicht angezeigt
  const R = REGION[kind], c = R.flag + k.toLowerCase(), w = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(wikiName(kind, k, en));
  return [['https://flagcdn.com/w40/' + c + '.png', 'https://flagcdn.com/w80/' + c + '.png 2x'], [w + '?width=60', w + '?width=120 2x']];
}

// Wählt aus den Kartendaten die gesuchten Gebiete aus und macht Features im Format des Spiels daraus.
export function regionFeatures(kind, features) {
  const R = REGION[kind], out = {}, seen = new Set();
  features.forEach(f => {
    if (!f.geometry || !/Polygon/.test(f.geometry.type)) return;
    const k = matchRegion(kind, f.properties); if (!k || seen.has(k)) return; seen.add(k);
    const [, de, en, alt] = R.list.find(r => r[0] === k), id = R.pre + k;
    let g = f.geometry; if (kind === 'us' && US_MOVE[k]) g = moveGeom(g, US_MOVE[k], k);
    out[k] = { type: 'Feature', properties: { ADM0_A3: id, NAME: en, NAME_LONG: en, NAME_DE: de, POP_EST: 1 }, geometry: g, _de: de, _code: id, _flag: flagChain(kind, k, en) };
    SYN[id] = [k, ...alt]; // auch das Kürzel und weitere Schreibweisen werden als Antwort akzeptiert
  });
  const feats = R.list.map(r => out[r[0]]).filter(Boolean), missing = R.list.filter(r => !out[r[0]]).map(r => r[1]);
  return { feats, missing };
}
