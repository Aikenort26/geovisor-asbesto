// Descarga las capas públicas del geovisor ArcGIS a GeoJSON (EPSG:4326) en public/data/.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { repararTexto } from './reparar-texto.mjs';

const BASE = 'https://services6.arcgis.com/LRrHgbiRuSGXCRCl/arcgis/rest/services';
const PAGINA = 2000;
const capas = JSON.parse(await readFile(new URL('./capas-fuente.json', import.meta.url), 'utf8'));

const redondear = (c) => (typeof c[0] === 'number' ? c.map((v) => Math.round(v * 1e6) / 1e6) : c.map(redondear));

async function descargar({ servicio, capa }) {
  const features = [];
  for (let offset = 0; ; offset += PAGINA) {
    const url = `${BASE}/${servicio}/FeatureServer/${capa}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson` +
      `&resultOffset=${offset}&resultRecordCount=${PAGINA}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${servicio}/${capa}: HTTP ${r.status}`);
    const json = await r.json();
    features.push(...json.features);
    if (!json.exceededTransferLimit && !json.properties?.exceededTransferLimit) break;
  }
  for (const f of features) {
    for (const k of Object.keys(f.properties ?? {})) f.properties[k] = repararTexto(f.properties[k]);
    if (f.geometry) f.geometry.coordinates = redondear(f.geometry.coordinates);
  }
  return { type: 'FeatureCollection', features };
}

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
let errores = 0;
for (const c of capas) {
  const fc = await descargar(c);
  await writeFile(new URL(`../public/data/${c.archivo}`, import.meta.url), JSON.stringify(fc));
  const ok = fc.features.length === c.esperado;
  if (!ok) errores++;
  console.log(`${ok ? 'ok ' : 'ERR'} ${c.archivo}: ${fc.features.length} (esperado ${c.esperado})`);
}
process.exit(errores ? 1 : 0);
