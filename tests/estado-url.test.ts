import { codificarEstado, decodificarEstado } from '../src/mapa/estado-url';

test('ida y vuelta del estado en la URL', () => {
  const e = { lon: -75.51234, lat: 10.40567, zoom: 14.25, capas: ['barrios', 'mcv-calor'] };
  expect(decodificarEstado(codificarEstado(e))).toEqual(e);
});

test('hash corrupto devuelve null', () => {
  expect(decodificarEstado('#basura')).toBeNull();
  expect(decodificarEstado('#@a,b,c/x')).toBeNull();
  expect(decodificarEstado('#@-75.5,10.4,99/barrios')).toBeNull();
  expect(decodificarEstado('')).toBeNull();
});
