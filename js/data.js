// Daten und Konstanten von Geora (Länderlisten nach Seterra, Zonen, Farbmodi, Spielwerte)
export const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
export const CDN = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/";
export const DATA = ["countries.geojson", CDN + "ne_50m_admin_0_countries.geojson", BASE + "ne_50m_admin_0_countries.geojson", CDN + "ne_10m_admin_0_countries.geojson"];
export const TOP = "AFG DZA AGO ARG BGD BRA CHN COD DEU FRA GHA IND IDN IRQ IRN ITA JPN YEM CAN KEN COL MYS MAR MEX MOZ MMR NPL NGA PAK PER PHL POL RUS SAU ESP SDN ZAF KOR TZA THA TUR USA UGA UKR UZB VEN GBR VNM EGY ETH".split(" "); // Seterra: Top 50
export const UN195 = "AFG:Afghanistan|ALB:Albanien|DZA:Algerien|AND:Andorra|AGO:Angola|ATG:Antigua und Barbuda|ARG:Argentinien|ARM:Armenien|AZE:Aserbaidschan|AUS:Australien|BHR:Bahrain|BGD:Bangladesch|BRB:Barbados|BLR:Belarus|BEL:Belgien|BLZ:Belize|BEN:Benin|BTN:Bhutan|BOL:Bolivien|BIH:Bosnien-Herzegowina|BWA:Botswana|BRA:Brasilien|BRN:Brunei|BGR:Bulgarien|BFA:Burkina Faso|BDI:Burundi|CHL:Chile|CHN:China|CRI:Costa Rica|COD:Demokratische Republik Kongo|DEU:Deutschland|BHS:Die Bahamas|DMA:Dominica|DOM:Dominikanische Republik|DJI:Dschibuti|DNK:Dänemark|ECU:Ecuador|SLV:El Salvador|CIV:Elfenbeinküste|ERI:Eritrea|EST:Estland|SWZ:Eswatini|FJI:Fidschi|FIN:Finnland|FRA:Frankreich|GAB:Gabun|GMB:Gambia|GEO:Georgien|GHA:Ghana|GRD:Grenada|GRC:Griechenland|GTM:Guatemala|GIN:Guinea|GNB:Guinea-Bissau|GUY:Guyana|HTI:Haiti|HND:Honduras|IND:Indien|IDN:Indonesien|IRQ:Irak|IRN:Iran|IRL:Irland|ISL:Island|ISR:Israel|ITA:Italien|JAM:Jamaika|JPN:Japan|YEM:Jemen|JOR:Jordanien|KHM:Kambodscha|CMR:Kamerun|CAN:Kanada|CPV:Kap Verde|KAZ:Kasachstan|QAT:Katar|KEN:Kenia|KGZ:Kirgisistan|KIR:Kiribati|COL:Kolumbien|COM:Komoren|HRV:Kroatien|CUB:Kuba|KWT:Kuwait|LAO:Laos|LSO:Lesotho|LVA:Lettland|LBN:Libanon|LBR:Liberia|LBY:Libyen|LIE:Liechtenstein|LTU:Litauen|LUX:Luxemburg|MDG:Madagaskar|MWI:Malawi|MYS:Malaysia|MDV:Malediven|MLI:Mali|MLT:Malta|MAR:Marokko|MHL:Marshallinseln|MRT:Mauretanien|MUS:Mauritius|MEX:Mexiko|FSM:Mikronesien|MDA:Moldawien|MCO:Monaco|MNG:Mongolei|MNE:Montenegro|MOZ:Mosambik|MMR:Myanmar|NAM:Namibia|NRU:Nauru|NPL:Nepal|NZL:Neuseeland|NIC:Nicaragua|NLD:Niederlande|NER:Niger|NGA:Nigeria|PRK:Nordkorea|MKD:Nordmazedonien|NOR:Norwegen|OMN:Oman|TLS:Ost Timor|PAK:Pakistan|PLW:Palau|PSE:Palästina|PAN:Panama|PNG:Papua-Neuguinea|PRY:Paraguay|PER:Peru|PHL:Philippinen|POL:Polen|PRT:Portugal|COG:Republik Kongo|RWA:Ruanda|ROU:Rumänien|RUS:Russland|SLB:Salomonen|ZMB:Sambia|WSM:Samoa|SMR:San Marino|SAU:Saudi-Arabien|SWE:Schweden|CHE:Schweiz|SEN:Senegal|SRB:Serbien|SYC:Seychellen|SLE:Sierra Leone|ZWE:Simbabwe|SGP:Singapur|SVK:Slowakei|SVN:Slowenien|SOM:Somalia|ESP:Spanien|LKA:Sri Lanka|KNA:St. Kitts und Nevis|LCA:St. Lucia|VCT:St. Vincent und die Grenadinen|SDN:Sudan|SUR:Surinam|SYR:Syrien|STP:São Tomé und Príncipe|ZAF:Südafrika|KOR:Südkorea|SSD:Südsudan|TJK:Tadschikistan|TZA:Tansania|THA:Thailand|TGO:Togo|TON:Tonga|TTO:Trinidad und Tobago|TCD:Tschad|CZE:Tschechien|TUN:Tunesien|TKM:Turkmenistan|TUV:Tuvalu|TUR:Türkei|USA:USA|UGA:Uganda|UKR:Ukraine|HUN:Ungarn|URY:Uruguay|UZB:Usbekistan|VUT:Vanuatu|VAT:Vatikanstadt|VEN:Venezuela|ARE:Vereinigte Arabische Emirate|GBR:Vereinigtes Königreich|VNM:Vietnam|CAF:Zentralafrikanische Republik|CYP:Zypern|EGY:Ägypten|GNQ:Äquatorialguinea|ETH:Äthiopien|AUT:Österreich"; // Seterra: 195 Länder (Code:deutscher Name)
export const EXT30 = "ABH:Abchasien|ASM:Amerikanisch-Samoa|VIR:Amerikanische Jungferninseln|AIA:Anguilla|ABW:Aruba|BES:Bonaire|VGB:Britische Jungferninseln|CYM:Cayman Islands|COK:Cookinseln|CUW:Curaçao|PYF:Französisch-Polynesien|GRL:Grönland|GLP:Guadeloupe|GUM:Guam|KOS:Kosovo|MTQ:Martinique|MSR:Montserrat|NCL:Neukaledonien|NIU:Niue|MNP:Nördliche Marianen|PCN:Pitcairninseln|PRI:Puerto Rico|SOL:Somaliland|OSS:Südossetien|TWN:Taiwan|TKL:Tokelau|TRN:Transnistrien|TCA:Turks- und Caicosinseln|WLF:Wallis und Futuna|ESH:West-Sahara"; // Seterra: +30 Gebiete = 225
export const FLAGFB = {KOS:'xk',TWN:'tw',ESH:'eh',PSE:'ps',GLP:'gp',MTQ:'mq',BES:'bq',TKL:'tk',PCN:'pn',MSR:'ms',AIA:'ai',NIU:'nu',TUV:'tv',NRU:'nr'}; // falls die Kartendaten keinen 2-Buchstaben-Code haben
export const FB = {TKL:[-9.2,-171.8,"Tokelau"],PCN:[-24.4,-128.3,"Pitcairn Islands"],MSR:[16.74,-62.19,"Montserrat"],AIA:[18.22,-63.05,"Anguilla"],BES:[12.2,-68.27,"Bonaire"],GLP:[16.25,-61.55,"Guadeloupe"],MTQ:[14.65,-61,"Martinique"],ABH:[43.1,41,"Abkhazia"],OSS:[42.35,44,"South Ossetia"],TRN:[47.2,29.4,"Transnistria"],TUV:[-8.5,179.2,"Tuvalu"],NRU:[-0.52,166.93,"Nauru"],NIU:[-19.05,-169.87,"Niue"]};
export const OCE = ["FJI","SLB","VUT","FSM","KIR","NRU","PLW","TON","TUV","WSM","MHL","NCL","PYF","COK","NIU","TKL","WLF","MDV"];
export const SYN = {USA:["usa","us","america","vereinigte staaten"],ARE:["vae","uae","emirate"],GBR:["uk","gb","grossbritannien","england"],COD:["dr kongo","drc"],COG:["kongo","congo"],RUS:["russland"],CZE:["tschechien"],TUR:["tuerkei"]};
export const ZC = {BHS:[[167,32],[262,58],[398,210],[398,228],[385,228],[385,270],[362,291],[215,187],[132,180],[132,165],[165,142]],TCA:[[385,228],[456,228],[456,270],[385,270]],PRI:[[538,334],[636,334],[636,383],[538,383]],VIR:[[636,346],[666,346],[666,383],[636,383]],VGB:[[648,326],[682,326],[682,352],[648,352]]};
export const ZO = {KIR:[[332,181],[412,181],[443,219],[565,219],[565,242],[592,242],[592,212],[571,170],[627,170],[692,255],[692,317],[617,317],[617,277],[527,277],[466,277],[405,247],[332,247]],PYF:[[617,317],[692,317],[692,255],[827,255],[827,437],[770,468],[692,468],[617,415]],MHL:[[228,18],[258,18],[412,118],[412,181],[332,181],[228,105]],MNP:[[98,18],[228,18],[228,105],[147,105],[147,93],[98,93]],FSM:[[68,105],[228,105],[332,181],[332,213],[150,213],[115,157],[68,157]],PLW:[[7,135],[68,105],[68,157],[115,157],[150,213],[97,213],[7,187]],COK:[[527,277],[617,277],[617,411],[505,411],[505,389],[527,389]],FJI:[[368,307],[410,307],[410,341],[455,341],[455,383],[447,411],[368,411]],SLB:[[236,254],[292,254],[292,247],[332,247],[368,307],[332,317],[237,317],[222,282]],NCL:[[237,355],[290,355],[337,392],[368,392],[368,411],[237,411]],VUT:[[237,317],[368,317],[368,392],[337,392],[290,355],[237,355]],TUV:[[332,247],[405,247],[466,277],[466,307],[368,307]],TON:[[455,341],[498,341],[498,389],[505,389],[505,411],[447,411],[455,383]],PCN:[[827,398],[900,398],[900,437],[827,437]],NRU:[[292,213],[332,213],[332,247],[292,247]],WLF:[[410,307],[466,307],[466,341],[410,341]],TKL:[[466,277],[527,277],[527,301],[466,301]],WSM:[[466,301],[498,301],[498,341],[466,341]],ASM:[[498,301],[527,301],[527,369],[498,369]],NIU:[[498,369],[527,369],[527,389],[498,389]],GUM:[[98,93],[147,93],[147,116],[98,116]]};
export const mer = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
export const unmer = m => (2 * Math.atan(Math.exp(m * Math.PI / 180)) - Math.PI / 2) * 180 / Math.PI;
export const pxC = ([x, y]) => [unmer(mer(18.1) - (y - 363) / 33.1), -77.3 + (x - 232) / 33.1];
export const pxO = ([x, y]) => [unmer(mer(-17.8) - (y - 366) / 8.03), 178 + (x - 412) / 8.05];

export const R_CAR_IN = [[9, -84.3], [28.9, -57.9]], R_OCE_IN = [[-39, 126.8], [26.7, 238.6]]; // Ausschnitte der kleinen Karten

// Farbmodi: Meer, Land, Land außerhalb des Modus, Grenzen, Grenzen gelöster Länder, Hervorhebung, Zonen, Farben für 1.–4. Versuch
export const THEMES = {
  classic: { sea: '#a5d0dc', land: '#1e8449', off: '#8dbcc6', line: '#d6efe0', solvedLine: '#0f3d22', hi: '#b44cff', zone: '#ffffff', att: ['#ffffff', '#ffeb3b', '#ff9800', '#ff4b4b'] },
  night:   { sea: '#0a1624', land: '#2f4f73', off: '#15283b', line: '#5c7ea6', solvedLine: '#0a1624', hi: '#00e5ff', zone: '#9fb6d3', att: ['#ffffff', '#fff176', '#ffb74d', '#ef5350'] },
  sand:    { sea: '#cfe6ee', land: '#cdb98b', off: '#e4ddc6', line: '#fbf6e8', solvedLine: '#5b4a24', hi: '#d81b60', zone: '#ffffff', att: ['#ffffff', '#fff59d', '#ffb74d', '#e53935'] }
};
export const ZOOM = { soft: 3, mid: 4, strong: 5 }; // maximale Zoomstufe im Eingabemodus
export const OPTDEF = [
  ['zoom', 'Zoom im Eingabemodus', [['off', 'Aus'], ['soft', 'Sanft'], ['mid', 'Mittel'], ['strong', 'Stark']], 'zoom'],
  ['flag', 'Flagge in der Aufgabe', [[false, 'Aus'], [true, 'An']], 'flag'],
  ['theme', 'Farbmodus', [['classic', 'Klassisch'], ['night', 'Nacht'], ['sand', 'Sand']], 'theme']
];

// Punkte: Anteil je Versuch (1.–4.); Tipps zählen als Versuch; Genauigkeit in % = XP
export const ATT_SCORE = [1, 0.75, 0.5, 0.25];

// Abgabe-Effekt: Ring wächst vom Landesmittelpunkt nach außen und verblasst (r = Pixel, ms = Dauer)
export const RIPPLE = { ok: '#58cc02', bad: '#ff4b4b', r: 56, ms: 650 };

// ---------- Karten und Umfänge ----------
// Kontinente: jedes Land steht in der Liste seines Kontinents (Russland und die Türkei in zwei Listen). Gebiete stehen mit in der Liste.
const CONTL = {
  eu: 'ALB AND AUT BLR BEL BIH BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ITA LVA LIE LTU LUX MLT MDA MCO MNE NLD MKD NOR POL PRT ROU RUS SMR SRB SVK SVN ESP SWE CHE UKR GBR VAT TUR KOS TRN CYN',
  as: 'AFG ARM AZE BHR BGD BTN BRN KHM CHN GEO IND IDN IRQ IRN ISR JPN JOR KAZ KWT KGZ LAO LBN MYS MDV MNG MMR NPL PRK OMN PAK PHL QAT SAU SGP KOR LKA SYR TJK THA TLS TKM ARE UZB VNM YEM PSE RUS TUR ABH OSS TWN',
  af: 'DZA AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COD COG CIV DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE ESH SOL',
  na: 'ATG BHS BRB BLZ CAN CRI CUB DMA DOM SLV GRD GTM HTI HND JAM MEX NIC PAN KNA LCA VCT TTO USA AIA ABW BES VGB CYM CUW GRL GLP MTQ MSR PRI TCA VIR',
  sa: 'ARG BOL BRA CHL COL ECU GUY PRY PER SUR URY VEN',
  oc: 'AUS FJI KIR MHL FSM NRU NZL PLW PNG WSM SLB TON TUV VUT ASM COK PYF GUM NCL NIU MNP PCN TKL WLF'
};
export const CONTS = ['eu', 'as', 'af', 'na', 'sa', 'oc'];
export const CONTNAME = { eu: 'Europa', as: 'Asien', af: 'Afrika', na: 'Nord- & Mittelamerika', sa: 'Südamerika', oc: 'Australien & Ozeanien' };
export const CONT = {}; // Land-Code -> Liste der Kontinente
CONTS.forEach(k => CONTL[k].split(' ').forEach(c => { (CONT[c] = CONT[c] || []).push(k); }));
export const NEC = { Europe: 'eu', Asia: 'as', Africa: 'af', 'North America': 'na', 'South America': 'sa', Oceania: 'oc' }; // Natural-Earth-Feld CONTINENT (für Gebiete außerhalb der Listen)
// Ausschnitt je Kontinent (Süd, West, Nord, Ost); Ozeanien nutzt die Karte mit Datumsgrenze (R_OCE_IN)
export const CONTVIEW = { eu: [[34, -31], [71.5, 45]], as: [[-11, 26], [76, 150]], af: [[-36, -20], [38, 53]], na: [[6, -170], [72, -50]], sa: [[-56, -82], [13, -34]] };
export const CONTDOT = { eu: .9, as: 1.9, af: 1.7, na: 1.4, sa: 1.4, oc: 3.5 }; // Länder schmaler als so viele Grad bekommen einen Klick-Punkt
export const ZREL = { soft: 1.5, mid: 2.5, strong: 3.5 }; // Zoom im Eingabemodus außerhalb der Weltkarte: so viele Stufen über dem Kartenausschnitt
export const SCOPES = ['easy', 'un', 'standard', ...CONTS.flatMap(k => [k + '-un', k + '-all']), 'de', 'us']; // Umfang einer Runde; die Reihenfolge ist Teil der gespeicherten Daten, nur hinten anhängen!
export const contCount = (k, all) => [...UN195.split('|'), ...(all ? EXT30.split('|') : [])].filter(x => (CONT[x.split(':')[0]] || []).includes(k)).length; // Länder je Kontinent (für die Auswahl)
