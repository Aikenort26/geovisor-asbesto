import { TEMA } from '../src/config/tema';

test('tokens del traspaso', () => {
  expect(TEMA).toMatchObject({
    fondo: '#d9e1e8', rayas: '#8499ab', linea: '#b2c0cc', texto: '#14283a',
    textoSuave: '#3b5266', acento: '#2f5877', panel: '#f3f6f8'
  });
  expect(TEMA.textos.lugar).toBe('Cartagena de Indias');
});
