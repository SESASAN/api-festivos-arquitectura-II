const {
  calcularDomingoPascua,
  trasladarASiguienteLunes,
  formatearFecha
} = require('../src/servicios/pascua.servicio');

const utc = (anio, mes, dia) => new Date(Date.UTC(anio, mes - 1, dia));

describe('calcularDomingoPascua', () => {
  test('1999 → 4 de abril (caso del enunciado)', () => {
    expect(formatearFecha(calcularDomingoPascua(1999))).toBe('1999-04-04');
  });

  test.each([
    [2023, '2023-04-09'],
    [2024, '2024-03-31'],
    [2025, '2025-04-20']
  ])('%i → %s', (anio, esperado) => {
    expect(formatearFecha(calcularDomingoPascua(anio))).toBe(esperado);
  });
});

describe('trasladarASiguienteLunes', () => {
  test('un lunes no se mueve', () => {
    expect(formatearFecha(trasladarASiguienteLunes(utc(2023, 1, 9)))).toBe('2023-01-09');
  });

  test('un domingo pasa al lunes siguiente', () => {
    expect(formatearFecha(trasladarASiguienteLunes(utc(2023, 3, 19)))).toBe('2023-03-20');
  });

  test('un martes pasa al lunes de la semana siguiente', () => {
    expect(formatearFecha(trasladarASiguienteLunes(utc(2023, 8, 15)))).toBe('2023-08-21');
  });
});
