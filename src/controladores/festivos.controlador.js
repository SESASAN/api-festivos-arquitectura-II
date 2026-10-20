const tipoRepositorio = require('../repositorios/tipo.repositorio');
const festivoRepositorio = require('../repositorios/festivo.repositorio');
const {
  calcularDomingoPascua,
  trasladarASiguienteLunes,
  sumarDias,
  formatearFecha
} = require('../servicios/pascua.servicio');

// La regla se decide por el id del tipo: los tipos 3 y 4 tienen `tipo` y `modoCalculo` vacíos en la BD.
function calcularFecha(tipoId, festivo, anio, domingoPascua) {
  switch (tipoId) {
    case 1:
      return new Date(Date.UTC(anio, festivo.mes - 1, festivo.dia));
    case 2:
      return trasladarASiguienteLunes(new Date(Date.UTC(anio, festivo.mes - 1, festivo.dia)));
    case 3:
      return sumarDias(domingoPascua, festivo.diasPascua);
    case 4:
      return trasladarASiguienteLunes(sumarDias(domingoPascua, festivo.diasPascua));
    default:
      return null;
  }
}

async function calcularFestivosDelAnio(anio) {
  const tipos = await tipoRepositorio.obtenerTodos();
  const domingoPascua = calcularDomingoPascua(anio);

  return tipos
    .flatMap((tipo) => tipo.festivos.map((festivo) => ({
      festivo: festivo.nombre,
      fecha: calcularFecha(tipo.id, festivo, anio, domingoPascua)
    })))
    .filter(({ fecha }) => fecha !== null)
    .sort((x, y) => x.fecha - y.fecha)
    .map(({ festivo, fecha }) => ({ festivo, fecha: formatearFecha(fecha) }));
}

async function verificar(req, res) {
  const anio = Number(req.params.anio);
  const fecha = formatearFecha(new Date(Date.UTC(anio, req.params.mes - 1, Number(req.params.dia))));
  const festivos = await calcularFestivosDelAnio(anio);
  const esFestivo = festivos.some((f) => f.fecha === fecha);
  res.type('text/plain').send(esFestivo ? 'Es Festivo' : 'No es festivo');
}

async function obtenerPorAnio(req, res) {
  res.json(await calcularFestivosDelAnio(Number(req.params.anio)));
}

async function listar(req, res) {
  res.json(await festivoRepositorio.listar());
}

function datosParaGuardar(tipoId, { nombre, dia, mes, diasPascua }) {
  const nombreLimpio = nombre.trim();
  if (tipoId === 1 || tipoId === 2) return { dia, mes, nombre: nombreLimpio };
  return { dia: 0, mes: 0, nombre: nombreLimpio, diasPascua };
}

async function crear(req, res) {
  const { tipoId } = req.body;
  const festivo = datosParaGuardar(tipoId, req.body);

  if (await festivoRepositorio.buscarPorNombre(festivo.nombre)) {
    return res.status(409).json({ mensaje: `Ya existe un festivo llamado '${festivo.nombre}'` });
  }
  if (!(await festivoRepositorio.agregar(tipoId, festivo))) {
    return res.status(404).json({ mensaje: `No existe el tipo ${tipoId}` });
  }
  res.status(201).json({ ...festivo, tipoId });
}

async function modificar(req, res) {
  const nombreActual = req.params.id;
  const existente = await festivoRepositorio.buscarPorNombre(nombreActual);
  if (!existente) {
    return res.status(404).json({ mensaje: `No existe el festivo '${nombreActual}'` });
  }

  const cambios = {};
  for (const campo of ['nombre', 'dia', 'mes', 'diasPascua']) {
    if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
  }
  if (cambios.nombre) cambios.nombre = cambios.nombre.trim();

  if (cambios.nombre && cambios.nombre !== nombreActual
      && await festivoRepositorio.buscarPorNombre(cambios.nombre)) {
    return res.status(409).json({ mensaje: `Ya existe un festivo llamado '${cambios.nombre}'` });
  }

  await festivoRepositorio.actualizar(nombreActual, cambios);
  const { tipoId, ...actual } = existente;
  res.json({ ...actual, ...cambios, tipoId });
}

async function eliminar(req, res) {
  const nombre = req.params.id;
  if (!(await festivoRepositorio.eliminar(nombre))) {
    return res.status(404).json({ mensaje: `No existe el festivo '${nombre}'` });
  }
  res.json({ mensaje: `Se eliminó el festivo '${nombre}'` });
}

module.exports = {
  calcularFecha,
  calcularFestivosDelAnio,
  verificar,
  obtenerPorAnio,
  listar,
  crear,
  modificar,
  eliminar
};
