// Gemeinsamer Zustand und kleine Helfer
import { THEMES } from './data.js';

export const $ = id => document.getElementById(id);
export const switchScreen = id => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); $(id).classList.add('active'); };

export const S = {
  lang: 'de', mode: 'click', diff: 'easy', cat: 'world', cont: 'eu', variant: 'un', // cat: world | cont | de | us
  show: null, dotThr: 3.5, reg: {}, mapWorld: null, fitZ: 2, // show: null = alles zeichnen, sonst Menge der gezeichneten Ids

  opts: { zoom: 'soft', flag: false, theme: 'classic' },
  user: null,
  geo: null, idx: {}, map: null, mapCar: null, mapOce: null, insetH: 150, insetSize: { car: null, oce: null }, geoLoad: null,
  layers: {}, solved: {}, tmp: {}, valid: new Set(), tipsBy: {},
  deck: [], target: null, tries: 0, tips: 0, tipsTotal: 0, hintN: 0, done: 0, total: 0, score: 0,
  practice: false, locked: false, inGame: false, reviewing: false, over: false, timerI: null, secs: 0,
  onClick: null // wird vom Spiel gesetzt (Klick auf Land, Punkt oder Zone)
};

export const th = () => THEMES[S.opts.theme] || THEMES.classic;
export const scopeId = () => S.cat === 'world' ? S.diff : S.cat === 'cont' ? S.cont + '-' + S.variant : S.cat; // Umfang als Text, z. B. 'easy', 'eu-un', 'de'
export const fid = f => f.properties.ADM0_A3 || f.properties.ISO_A3 || f.properties.NAME;
export const nameOf = (f, l = S.lang) => { const p = f.properties; return l === 'en' ? (p.NAME_LONG || p.NAME) : (f._de || p.NAME_DE || p.NAME_LONG || p.NAME); };
