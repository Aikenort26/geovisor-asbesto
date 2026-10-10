export interface EstadoVista {
  lon: number;
  lat: number;
  zoom: number;
  capas: string[];
}

/** "#@lon,lat,zoom/capa1,capa2": enlace compartible que reproduce la vista. */
export function codificarEstado(e: EstadoVista): string {
  return `#@${e.lon.toFixed(5)},${e.lat.toFixed(5)},${e.zoom.toFixed(2)}/${e.capas.join(',')}`;
}

export function decodificarEstado(hash: string): EstadoVista | null {
  const m = /^#@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\/([\w,-]*)$/.exec(hash);
  if (!m) return null;
  const [lon, lat, zoom] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (Math.abs(lon) > 180 || Math.abs(lat) > 85 || zoom > 22) return null;
  return { lon, lat, zoom, capas: m[4] ? m[4].split(',') : [] };
}
