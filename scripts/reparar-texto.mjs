// Corrige textos UTF-8 que el servicio de ArcGIS entrega leídos como latin1 ("caÃ­da" → "caída").
export function repararTexto(s) {
  if (typeof s !== 'string' || !/[ÂÃ]/.test(s)) return s;
  const r = Buffer.from(s, 'latin1').toString('utf8');
  return r.includes('�') ? s : r;
}
