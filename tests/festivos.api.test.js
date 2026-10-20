const request = require('supertest');
const crearDatos = require('./datos-semilla');

let mockTipos;

jest.mock('../src/repositorios/tipo.repositorio', () => ({
  obtenerTodos: async () => mockTipos,
  obtenerPorId: async (id) => mockTipos.find((t) => t.id === id) ?? null
}));

jest.mock('../src/repositorios/festivo.repositorio', () => {
  const buscar = (nombre) => {
    for (const tipo of mockTipos) {
      const festivo = tipo.festivos.find((f) => f.nombre === nombre);
      if (festivo) return { tipo, festivo };
    }
    return null;
  };
  return {
    listar: async () => mockTipos.flatMap(({ id, tipo, modoCalculo, festivos }) =>
      festivos.map((f) => ({ ...f, tipo: { id, tipo, modoCalculo } }))),
    buscarPorNombre: async (nombre) => {
      const encontrado = buscar(nombre);
      return encontrado ? { ...encontrado.festivo, tipoId: encontrado.tipo.id } : null;
    },
    agregar: async (tipoId, festivo) => {
      const tipo = mockTipos.find((t) => t.id === tipoId);
      if (!tipo) return false;
      tipo.festivos.push(festivo);
      return true;
    },
    actualizar: async (nombre, cambios) => {
      const encontrado = buscar(nombre);
      if (!encontrado) return false;
      Object.assign(encontrado.festivo, cambios);
      return true;
    },
    eliminar: async (nombre) => {
      const encontrado = buscar(nombre);
      if (!encontrado) return false;
      encontrado.tipo.festivos = encontrado.tipo.festivos.filter((f) => f.nombre !== nombre);
      return true;
    }
  };
});

const app = require('../src/app');

beforeEach(() => {
  mockTipos = crearDatos();
});

const verificar = (ruta) => request(app).get(`/api/festivos/verificar/${ruta}`);

describe('GET /api/festivos/verificar/:anio/:mes/:dia', () => {
  test('1. 2023/6/12 → Es Festivo (Corpus Christi, trasladado a lunes)', async () => {
    const res = await verificar('2023/6/12');
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/plain');
    expect(res.text).toBe('Es Festivo');
  });

  test('2. 2023/2/28 → No es festivo', async () => {
    const res = await verificar('2023/2/28');
    expect(res.text).toBe('No es festivo');
  });

  test('3. 2023/2/35 → Fecha No valida', async () => {
    const res = await verificar('2023/2/35');
    expect(res.text).toBe('Fecha No valida');
  });

  test('4. 1999/4/4 → Es Festivo (Domingo de Pascua, tipo 3)', async () => {
    const res = await verificar('1999/4/4');
    expect(res.text).toBe('Es Festivo');
  });

  test('6. San José 2023 (tipo 2, domingo 19/3) se traslada al lunes 20/3', async () => {
    expect((await verificar('2023/3/19')).text).toBe('No es festivo');
    expect((await verificar('2023/3/20')).text).toBe('Es Festivo');
  });

  test('tipo 3 no se traslada: Jueves Santo 2023 cae en jueves 6/4', async () => {
    expect((await verificar('2023/4/6')).text).toBe('Es Festivo');
  });

  test('29 de febrero en año no bisiesto → Fecha No valida', async () => {
    expect((await verificar('2023/2/29')).text).toBe('Fecha No valida');
  });

  test('mes 13 → Fecha No valida', async () => {
    expect((await verificar('2023/13/1')).text).toBe('Fecha No valida');
  });
});

describe('GET /api/festivos/obtener/:anio', () => {
  test('5. 2023 → todos los festivos en fecha concreta y ordenados', async () => {
    const res = await request(app).get('/api/festivos/obtener/2023');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { festivo: 'Año nuevo', fecha: '2023-01-01' },
      { festivo: 'Santos Reyes', fecha: '2023-01-09' },
      { festivo: 'San José', fecha: '2023-03-20' },
      { festivo: 'Jueves Santo', fecha: '2023-04-06' },
      { festivo: 'Viernes Santo', fecha: '2023-04-07' },
      { festivo: 'Domingo de Pascua', fecha: '2023-04-09' },
      { festivo: 'Día del Trabajo', fecha: '2023-05-01' },
      { festivo: 'Ascensión del Señor', fecha: '2023-05-22' },
      { festivo: 'Corpus Christi', fecha: '2023-06-12' },
      { festivo: 'Sagrado Corazón de Jesús', fecha: '2023-06-19' },
      { festivo: 'San Pedro y San Pablo', fecha: '2023-07-03' },
      { festivo: 'Independencia Colombia', fecha: '2023-07-20' },
      { festivo: 'Batalla de Boyacá', fecha: '2023-08-07' },
      { festivo: 'Asunción de la Virgen', fecha: '2023-08-21' },
      { festivo: 'Día de la Raza', fecha: '2023-10-16' },
      { festivo: 'Todos los santos', fecha: '2023-11-06' },
      { festivo: 'Independencia de Cartagena', fecha: '2023-11-13' },
      { festivo: 'Inmaculada Concepción', fecha: '2023-12-08' },
      { festivo: 'Navidad', fecha: '2023-12-25' }
    ]);
  });

  test('año no numérico → 400', async () => {
    const res = await request(app).get('/api/festivos/obtener/abc');
    expect(res.status).toBe(400);
  });
});

describe('CRUD /api/festivos', () => {
  test('GET lista los 19 festivos con su tipo', async () => {
    const res = await request(app).get('/api/festivos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(19);
    expect(res.body[0]).toEqual({
      dia: 1, mes: 1, nombre: 'Año nuevo',
      tipo: { id: 1, tipo: 'Fijo', modoCalculo: 'No se puede variar' }
    });
  });

  test('POST agrega la Virgen de Chiquinquirá (tipo 2) y se calcula', async () => {
    const res = await request(app)
      .post('/api/festivos')
      .send({ tipoId: 2, dia: 9, mes: 7, nombre: 'Virgen de Chiquinquirá' });
    expect(res.status).toBe(201);
    // 9/7/2026 es jueves → lunes 13/7/2026
    expect((await verificar('2026/7/9')).text).toBe('No es festivo');
    expect((await verificar('2026/7/13')).text).toBe('Es Festivo');
  });

  test('POST de tipo 3/4 guarda dia y mes en 0', async () => {
    const res = await request(app)
      .post('/api/festivos')
      .send({ tipoId: 4, dia: 5, mes: 5, nombre: 'Prueba Pascua', diasPascua: 50 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ dia: 0, mes: 0, nombre: 'Prueba Pascua', diasPascua: 50, tipoId: 4 });
  });

  test('POST con tipo inexistente → 400', async () => {
    const res = await request(app)
      .post('/api/festivos')
      .send({ tipoId: 5, dia: 1, mes: 1, nombre: 'X' });
    expect(res.status).toBe(400);
  });

  test('POST con fecha inválida → 400', async () => {
    const res = await request(app)
      .post('/api/festivos')
      .send({ tipoId: 1, dia: 31, mes: 2, nombre: 'X' });
    expect(res.status).toBe(400);
  });

  test('POST con nombre repetido → 409', async () => {
    const res = await request(app)
      .post('/api/festivos')
      .send({ tipoId: 1, dia: 2, mes: 1, nombre: 'Navidad' });
    expect(res.status).toBe(409);
  });

  test('PUT modifica un festivo identificado por su nombre', async () => {
    const res = await request(app)
      .put(`/api/festivos/${encodeURIComponent('Día del Trabajo')}`)
      .send({ dia: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ dia: 2, mes: 5, nombre: 'Día del Trabajo', tipoId: 1 });
    expect((await verificar('2023/5/2')).text).toBe('Es Festivo');
  });

  test('PUT de un festivo inexistente → 404', async () => {
    const res = await request(app).put('/api/festivos/NoExiste').send({ dia: 2 });
    expect(res.status).toBe(404);
  });

  test('DELETE elimina el festivo y deja de ser festivo', async () => {
    const res = await request(app).delete('/api/festivos/Navidad');
    expect(res.status).toBe(200);
    expect((await verificar('2023/12/25')).text).toBe('No es festivo');
  });

  test('DELETE de un festivo inexistente → 404', async () => {
    const res = await request(app).delete('/api/festivos/NoExiste');
    expect(res.status).toBe(404);
  });
});

describe('Swagger', () => {
  test('GET /api-docs/ sirve la interfaz de Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('swagger-ui');
  });

  test('GET /api-docs.json documenta las 6 operaciones de la API', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    const operaciones = Object.entries(res.body.paths)
      .flatMap(([ruta, metodos]) => Object.keys(metodos).map((m) => `${m.toUpperCase()} ${ruta}`))
      .sort();
    expect(operaciones).toEqual([
      'DELETE /api/festivos/{id}',
      'GET /api/festivos',
      'GET /api/festivos/obtener/{anio}',
      'GET /api/festivos/verificar/{anio}/{mes}/{dia}',
      'POST /api/festivos',
      'PUT /api/festivos/{id}'
    ]);
  });
});
