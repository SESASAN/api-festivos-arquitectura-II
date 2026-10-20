const { Schema, model } = require('mongoose');

const festivoSchema = new Schema({
  dia: Number,
  mes: Number,
  nombre: String,
  diasPascua: Number
}, { _id: false });

const tipoSchema = new Schema({
  id: Number,
  tipo: String,
  modoCalculo: String,
  festivos: [festivoSchema]
}, { collection: 'tipos', versionKey: false });

module.exports = model('Tipo', tipoSchema);
