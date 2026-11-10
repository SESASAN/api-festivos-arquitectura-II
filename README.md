# API Festivos — Taller 1 Arquitectura de Software

**Instituto Tecnológico Metropolitano (ITM)** · Arquitectura de Software 2

**Entrega 1:** diagramas de arquitectura de la API Festivos (Express JS + MongoDB).

**Entrega 3:** implementación de la API Festivos.

## Integrantes

| Nombre | Correo |
|---|---|
| Nathalie Gabriela Miranda Rejón | nathaliemiranda1117738@correo.itm.edu.co |
| Samuel Quiroz Rincón | samuelquiroz1113937@correo.itm.edu.co |
| Sebastián Jesús Pérez Araujo | sebastianperez1116036@correo.itm.edu.co |
| Kevin Daniel Mendoza Castillo | kevinmendoza1111192@correo.itm.edu.co |

## Contexto

La API Festivos es un servicio web en Express JS + MongoDB que indica si una fecha es festiva en
Colombia. La base de datos no guarda fechas festivas, sino la información **para calcularlas**: los
festivos móviles se calculan en tiempo real a partir del Domingo de Pascua de cada año.

### Operaciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/festivos/verificar/:anio/:mes/:dia` | Responde `Es Festivo`, `No es festivo` o `Fecha No valida` |
| GET | `/api/festivos/obtener/:anio` | Lista los festivos de un año en fecha concreta |
| GET | `/api/festivos` | Lista los festivos registrados con su tipo |
| GET | `/api/festivos/:id` | Obtiene un festivo |
| POST | `/api/festivos` | Agrega un festivo a un tipo existente |
| PUT | `/api/festivos/:id` | Modifica un festivo |
| DELETE | `/api/festivos/:id` | Elimina un festivo |

En `GET /:id`, `PUT` y `DELETE`, el `:id` es el nombre del festivo (por ejemplo `Navidad`), porque los festivos
están embebidos en cada tipo sin un identificador propio.

### Tipos de festivo

| id | Tipo | Cálculo de la fecha |
|---|---|---|
| 1 | Fijo | Día y mes fijos |
| 2 | Ley de Puente festivo | Día y mes fijos, trasladado al siguiente lunes |
| 3 | Basado en el domingo de Pascua | Domingo de Pascua + días de Pascua |
| 4 | Basado en el domingo de Pascua y Ley de Puente festivo | Domingo de Pascua + días de Pascua, trasladado al siguiente lunes |

## Ejecución

### Requisitos

| Software | Versión | Linux | macOS | Windows |
|---|---|---|---|---|
| Node.js | 20 o superior | `nvm install --lts` o el gestor de paquetes | `brew install node` | `winget install OpenJS.NodeJS.LTS` |
| MongoDB | 7 o superior | [guía oficial](https://www.mongodb.com/docs/manual/administration/install-on-linux/) | `brew tap mongodb/brew && brew install mongodb-community` | `winget install MongoDB.Server` |
| mongosh | cualquiera | [guía oficial](https://www.mongodb.com/docs/mongodb-shell/install/) | `brew install mongosh` | `winget install MongoDB.Shell` |

Comprobar la instalación:

```bash
node -v
mongosh --version
```

### Configuración

Copiar `.env.example` como `.env` y ajustar los valores:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `MONGO_URI` | Conexión a MongoDB | `mongodb://localhost:27017/festivos` (sin autenticación) |
| | | `mongodb://usuario:clave@localhost:27017/festivos?authSource=admin` (con autenticación) |
| `PORT` | Puerto de la API | `8080` |

Si la clave de MongoDB tiene caracteres especiales, se escriben codificados en la URI: `%` → `%25`,
`#` → `%23`, `@` → `%40`, `:` → `%3A`, `/` → `%2F`.

Si el puerto 8080 ya está en uso, cambiar `PORT` (por ejemplo `3000`) y arrancar la API Calendario con
`FESTIVOS_API_URL=http://localhost:3000`.

### Linux / macOS

```bash
npm install
cp .env.example .env
mongosh "mongodb://localhost:27017" < seeds/BDFestivos.mjs
npm start
npm test
```

### Windows (PowerShell)

```powershell
npm install
Copy-Item .env.example .env
Get-Content seeds\BDFestivos.mjs | mongosh "mongodb://localhost:27017"
npm start
npm test
```

Si MongoDB tiene autenticación, la carga de datos usa la misma URI con usuario (pide la clave):
`mongosh "mongodb://usuario@localhost:27017/?authSource=admin"`.

La API queda en `http://localhost:8080` y la documentación Swagger en `http://localhost:8080/api-docs`.

Prueba rápida (debe devolver 19 festivos para 2023):

```bash
curl http://localhost:8080/api/festivos/obtener/2023
```

## Diagramas

| Diagrama | Archivo |
|---|---|
| Arquitectura por capas | [diagramas/diagrama-arquitectura-festivos.md](diagramas/diagrama-arquitectura-festivos.md) |
| Modelo de la base de datos (objetual) | [diagramas/diagrama-objetual-festivos.md](diagramas/diagrama-objetual-festivos.md) |
