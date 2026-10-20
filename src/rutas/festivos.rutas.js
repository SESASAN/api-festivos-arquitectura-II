const { Router } = require('express');
const controlador = require('../controladores/festivos.controlador');
const { validarFecha, validarAnio, validarDatosFestivo } = require('../validadores/fecha.validador');

const router = Router();

router.get('/verificar/:anio/:mes/:dia', validarFecha, controlador.verificar);
router.get('/obtener/:anio', validarAnio, controlador.obtenerPorAnio);

router.get('/', controlador.listar);
router.post('/', validarDatosFestivo, controlador.crear);
router.put('/:id', validarDatosFestivo, controlador.modificar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
