const Tipo = require('../modelos/tipo.modelo');

async function listar() {
  const tipos = await Tipo.find().lean();
  return tipos.flatMap(({ id, tipo, modoCalculo, festivos }) =>
    festivos.map((festivo) => ({ ...festivo, tipo: { id, tipo, modoCalculo } }))
  );
}

async function buscarPorNombre(nombre) {
  const tipo = await Tipo.findOne({ 'festivos.nombre': nombre }, { id: 1, 'festivos.$': 1 }).lean();
  return tipo ? { ...tipo.festivos[0], tipoId: tipo.id } : null;
}

async function agregar(tipoId, festivo) {
  const resultado = await Tipo.updateOne({ id: tipoId }, { $push: { festivos: festivo } });
  return resultado.matchedCount > 0;
}

async function actualizar(nombre, cambios) {
  const set = Object.fromEntries(
    Object.entries(cambios).map(([campo, valor]) => [`festivos.$.${campo}`, valor])
  );
  const resultado = await Tipo.updateOne({ 'festivos.nombre': nombre }, { $set: set });
  return resultado.matchedCount > 0;
}

async function eliminar(nombre) {
  const resultado = await Tipo.updateOne(
    { 'festivos.nombre': nombre },
    { $pull: { festivos: { nombre } } }
  );
  return resultado.modifiedCount > 0;
}

module.exports = { listar, buscarPorNombre, agregar, actualizar, eliminar };
