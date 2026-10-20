const parametroTexto = (name, description) => ({
  name, in: 'path', required: true, description, schema: { type: 'string' }
});
const parametroEntero = (name, description, ejemplo) => ({
  name, in: 'path', required: true, description, schema: { type: 'integer', example: ejemplo }
});
const respuestaMensaje = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Mensaje' } } }
});
const cuerpoFestivo = (schema) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } }
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API Festivos',
    version: '1.0.0',
    description: 'Valida si una fecha es festiva en Colombia. Los festivos se calculan a partir de la colección `tipos` de MongoDB.'
  },
  tags: [
    { name: 'Consultas', description: 'Verificación de fechas y festivos de un año' },
    { name: 'Festivos', description: 'CRUD de la información para calcular los festivos' }
  ],
  paths: {
    '/api/festivos/verificar/{anio}/{mes}/{dia}': {
      get: {
        tags: ['Consultas'],
        summary: 'Verifica si una fecha es festiva',
        parameters: [
          parametroEntero('anio', 'Año', 2023),
          parametroEntero('mes', 'Mes (1-12)', 6),
          parametroEntero('dia', 'Día del mes', 12)
        ],
        responses: {
          200: {
            description: 'Resultado de la verificación',
            content: {
              'text/plain': {
                schema: { type: 'string', enum: ['Es Festivo', 'No es festivo', 'Fecha No valida'] }
              }
            }
          }
        }
      }
    },
    '/api/festivos/obtener/{anio}': {
      get: {
        tags: ['Consultas'],
        summary: 'Lista los festivos de un año, ordenados por fecha',
        parameters: [parametroEntero('anio', 'Año', 2023)],
        responses: {
          200: {
            description: 'Festivos del año',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/FestivoDelAnio' } }
              }
            }
          },
          400: respuestaMensaje('Año no válido')
        }
      }
    },
    '/api/festivos': {
      get: {
        tags: ['Festivos'],
        summary: 'Lista los festivos registrados con su tipo',
        responses: {
          200: {
            description: 'Festivos registrados',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/FestivoConTipo' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Festivos'],
        summary: 'Agrega un festivo a un tipo existente',
        requestBody: cuerpoFestivo('NuevoFestivo'),
        responses: {
          201: {
            description: 'Festivo creado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FestivoGuardado' } } }
          },
          400: respuestaMensaje('Datos no válidos'),
          404: respuestaMensaje('El tipo no existe'),
          409: respuestaMensaje('Ya existe un festivo con ese nombre')
        }
      }
    },
    '/api/festivos/{id}': {
      put: {
        tags: ['Festivos'],
        summary: 'Modifica un festivo',
        parameters: [parametroTexto('id', 'Nombre del festivo, por ejemplo "Día del Trabajo"')],
        requestBody: cuerpoFestivo('CambiosFestivo'),
        responses: {
          200: {
            description: 'Festivo modificado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FestivoGuardado' } } }
          },
          400: respuestaMensaje('Datos no válidos'),
          404: respuestaMensaje('El festivo no existe'),
          409: respuestaMensaje('Ya existe un festivo con el nuevo nombre')
        }
      },
      delete: {
        tags: ['Festivos'],
        summary: 'Elimina un festivo',
        parameters: [parametroTexto('id', 'Nombre del festivo, por ejemplo "Navidad"')],
        responses: {
          200: respuestaMensaje('Festivo eliminado'),
          404: respuestaMensaje('El festivo no existe')
        }
      }
    }
  },
  components: {
    schemas: {
      Mensaje: {
        type: 'object',
        properties: { mensaje: { type: 'string' } }
      },
      FestivoDelAnio: {
        type: 'object',
        properties: {
          festivo: { type: 'string', example: 'Año nuevo' },
          fecha: { type: 'string', format: 'date', example: '2023-01-01' }
        }
      },
      FestivoConTipo: {
        type: 'object',
        properties: {
          dia: { type: 'integer', example: 1 },
          mes: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Año nuevo' },
          diasPascua: { type: 'integer' },
          tipo: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              tipo: { type: 'string', example: 'Fijo' },
              modoCalculo: { type: 'string', example: 'No se puede variar' }
            }
          }
        }
      },
      NuevoFestivo: {
        type: 'object',
        required: ['tipoId', 'nombre'],
        description: 'Tipos 1 y 2 requieren `dia` y `mes`; tipos 3 y 4 requieren `diasPascua`.',
        properties: {
          tipoId: { type: 'integer', enum: [1, 2, 3, 4], example: 2 },
          nombre: { type: 'string', example: 'Virgen de Chiquinquirá' },
          dia: { type: 'integer', example: 9 },
          mes: { type: 'integer', example: 7 },
          diasPascua: { type: 'integer' }
        }
      },
      CambiosFestivo: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          dia: { type: 'integer', example: 2 },
          mes: { type: 'integer' },
          diasPascua: { type: 'integer' }
        }
      },
      FestivoGuardado: {
        type: 'object',
        properties: {
          tipoId: { type: 'integer', example: 2 },
          nombre: { type: 'string', example: 'Virgen de Chiquinquirá' },
          dia: { type: 'integer', example: 9 },
          mes: { type: 'integer', example: 7 },
          diasPascua: { type: 'integer' }
        }
      }
    }
  }
};
