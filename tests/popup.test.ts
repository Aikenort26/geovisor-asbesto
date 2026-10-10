import { htmlPopup } from '../src/ui/popup';

test('usa etiquetas, unidades, omite vacíos y escapa HTML', () => {
  const h = htmlPopup(
    { Asbestos__: 'Chrysotile', Strucutres: 1240000, Polyline_2: ' ', Neighborho: '<b>x', Otro: 5 },
    { Asbestos__: 'Tipo de asbesto', Strucutres: 'Estructuras|s/cm²', Polyline_2: 'X', Neighborho: 'Barrio' }
  );
  expect(h).toContain('Tipo de asbesto');
  expect(h).toContain('1.240.000 s/cm²');
  expect(h).not.toContain('>X<');
  expect(h).toContain('&lt;b&gt;x');
  expect(h).not.toContain('Otro');
});

test('traduce resultados negativos y tipos de asbesto', () => {
  expect(htmlPopup({ Asbestos__: 'None Detected' }, { Asbestos__: 'Tipo de asbesto' })).toContain('No detectado');
  expect(htmlPopup({ Asbestos__: 'Chrysotile' }, { Asbestos__: 'Tipo de asbesto' })).toContain('Crisotilo');
});
