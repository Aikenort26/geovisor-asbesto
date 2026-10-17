import type { Map as MapaML } from 'maplibre-gl';
import { RAMPA_CALOR, type Capa } from '../config/capas';

function fecha(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/** Exporta el mapa como PNG con cabecera institucional, leyenda breve y atribución. */
export async function exportarPNG(mapa: MapaML, activas: Capa[]) {
  await new Promise<void>((r) => (mapa.loaded() ? r() : mapa.once('idle', () => r())));
  mapa.triggerRepaint();
  await new Promise<void>((r) => mapa.once('render', () => r()));

  const fuente = mapa.getCanvas();
  const escala = window.devicePixelRatio || 1;
  const ancho = fuente.width;
  const cabecera = 64 * escala;
  const pie = (34 + 20 * Math.ceil(activas.length / 2)) * escala;
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = fuente.height + cabecera + pie;
  const ctx = lienzo.getContext('2d')!;
  const px = (n: number) => n * escala;

  ctx.fillStyle = '#d9e1e8';
  ctx.fillRect(0, 0, ancho, cabecera);
  ctx.fillStyle = '#2f5877';
  ctx.fillRect(0, cabecera - px(3), ancho, px(3));
  ctx.fillStyle = '#3b5266';
  ctx.font = `600 ${px(10)}px Segoe UI, Arial, sans-serif`;
  ctx.fillText('CARTAGENA DE INDIAS', px(18), px(24));
  ctx.fillStyle = '#14283a';
  ctx.font = `800 ${px(21)}px Segoe UI, Arial, sans-serif`;
  ctx.fillText('GEOVISOR ASBESTO', px(18), px(48));
  ctx.textAlign = 'right';
  ctx.font = `600 ${px(11)}px Segoe UI, Arial, sans-serif`;
  ctx.fillStyle = '#3b5266';
  ctx.fillText(new Date().toLocaleDateString('es-CO', { dateStyle: 'long' }), ancho - px(18), px(40));
  ctx.textAlign = 'left';

  ctx.drawImage(fuente, 0, cabecera);

  const y0 = cabecera + fuente.height;
  ctx.fillStyle = '#f3f6f8';
  ctx.fillRect(0, y0, ancho, pie);
  ctx.font = `600 ${px(11.5)}px Segoe UI, Arial, sans-serif`;
  activas.forEach((c, i) => {
    const x = px(18) + (i % 2) * (ancho / 2);
    const y = y0 + px(18) + Math.floor(i / 2) * px(20);
    if (c.tipo === 'calor' || c.id === 'calor_fibras') {
      const g = ctx.createLinearGradient(x, 0, x + px(22), 0);
      RAMPA_CALOR.forEach((col, k) => g.addColorStop(k / (RAMPA_CALOR.length - 1), col));
      ctx.fillStyle = g;
    } else ctx.fillStyle = c.color;
    ctx.fillRect(x, y - px(9), px(22), px(10));
    ctx.fillStyle = '#14283a';
    ctx.fillText(c.titulo, x + px(30), y);
  });
  ctx.fillStyle = '#3b5266';
  ctx.font = `${px(10.5)}px Segoe UI, Arial, sans-serif`;
  ctx.fillText('Proyecto BPIN 2020000100366 — Geovisor Asbesto Cartagena · Mapa base © OpenStreetMap / OpenFreeMap / Esri',
    px(18), y0 + pie - px(12));

  const enlace = document.createElement('a');
  enlace.download = `geovisor-asbesto-${fecha()}.png`;
  enlace.href = lienzo.toDataURL('image/png');
  enlace.click();
}
