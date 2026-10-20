const Tipo = require('../modelos/tipo.modelo');

function obtenerTodos() {
  return Tipo.find().lean();
}

function obtenerPorId(id) {
  return Tipo.findOne({ id }).lean();
}

module.exports = { obtenerTodos, obtenerPorId };
