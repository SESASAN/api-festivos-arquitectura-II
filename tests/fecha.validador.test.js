const { esFechaValida } = require('../src/validadores/fecha.validador');

describe('esFechaValida', () => {
  test.each([
    ['2023', '2', '28'],
    ['2024', '2', '29'],
    ['2000', '2', '29'],
    ['2023', '12', '31'],
    ['2023', '06', '12']
  ])('%s/%s/%s es válida', (anio, mes, dia) => {
    expect(esFechaValida(anio, mes, dia)).toBe(true);
  });

  test.each([
    ['2023', '2', '35'],
    ['2023', '2', '29'],
    ['1900', '2', '29'],
    ['2023', '13', '1'],
    ['2023', '0', '10'],
    ['2023', '4', '31'],
    ['2023', '4', '0'],
    ['2023', 'abc', '1'],
    ['2023', '1.5', '1'],
    ['2023', '-1', '1']
  ])('%s/%s/%s no es válida', (anio, mes, dia) => {
    expect(esFechaValida(anio, mes, dia)).toBe(false);
  });
});
