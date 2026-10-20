const express = require('express');
const swaggerUi = require('swagger-ui-express');
const festivosRutas = require('./rutas/festivos.rutas');
const documentoSwagger = require('./swagger');

const app = express();

app.use(express.json());
app.use('/api/festivos', festivosRutas);

app.get('/api-docs.json', (req, res) => res.json(documentoSwagger));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(documentoSwagger));

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
