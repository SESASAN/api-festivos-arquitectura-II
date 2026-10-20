const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const TIPOS_VALIDOS = [1, 2, 3, 4];

function esBisiesto(anio) {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

function esEntero(valor) {
  return /^\d+$/.test(String(valor));
}

function esFechaValida(anio, mes, dia) {
  if (![anio, mes, dia].every(esEntero)) return false;
  const [a, m, d] = [Number(anio), Number(mes), Number(dia)];
  if (a < 1 || m < 1 || m > 12 || d < 1) return false;
  const diasDelMes = m === 2 && esBisiesto(a) ? 29 : DIAS_POR_MES[m - 1];
  return d <= diasDelMes;
}

function validarFecha(req, res, next) {
  const { anio, mes, dia } = req.params;
  if (!esFechaValida(anio, mes, dia)) {
    return res.type('text/plain').send('Fecha No valida');
  }
  next();
}

function validarAnio(req, res, next) {
  if (!esEntero(req.params.anio) || Number(req.params.anio) < 1) {
    return res.status(400).json({ mensaje: 'Año no válido' });
  }
  next();
}

function validarDatosFestivo(req, res, next) {
  const { tipoId, nombre, dia, mes, diasPascua } = req.body ?? {};
  const esCreacion = req.method === 'POST';

  if (esCreacion && !TIPOS_VALIDOS.includes(tipoId)) {
    return res.status(400).json({ mensaje: 'tipoId debe ser 1, 2, 3 o 4' });
  }
  if ((esCreacion || nombre !== undefined) && (typeof nombre !== 'string' || !nombre.trim())) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  }
  for (const [campo, valor] of Object.entries({ dia, mes, diasPascua })) {
    if (valor !== undefined && !Number.isInteger(valor)) {
      return res.status(400).json({ mensaje: `${campo} debe ser un número entero` });
    }
  }

  const calculoPorFecha = esCreacion && (tipoId === 1 || tipoId === 2);
  if (calculoPorFecha && !esFechaValida(2000, mes, dia)) {
    return res.status(400).json({ mensaje: 'dia/mes no forman una fecha válida' });
  }
  if (esCreacion && !calculoPorFecha && diasPascua === undefined) {
    return res.status(400).json({ mensaje: 'diasPascua es obligatorio para los tipos 3 y 4' });
  }
  next();
}

module.exports = { esFechaValida, esBisiesto, validarFecha, validarAnio, validarDatosFestivo };
