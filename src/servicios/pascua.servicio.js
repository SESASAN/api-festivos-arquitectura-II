function sumarDias(fecha, dias) {
  const resultado = new Date(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

function calcularDomingoPascua(anio) {
  const a = anio % 19;
  const b = anio % 4;
  const c = anio % 7;
  const d = (19 * a + 24) % 30;
  const dias = d + ((2 * b + 4 * c + 6 * d + 5) % 7);

  const domingoRamos = sumarDias(new Date(Date.UTC(anio, 2, 15)), dias);
  return sumarDias(domingoRamos, 7);
}

function trasladarASiguienteLunes(fecha) {
  let resultado = new Date(fecha);
  while (resultado.getUTCDay() !== 1) {
    resultado = sumarDias(resultado, 1);
  }
  return resultado;
}

function formatearFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

module.exports = { calcularDomingoPascua, trasladarASiguienteLunes, sumarDias, formatearFecha };
