# API Festivos — Taller 1 Arquitectura de Software

**Instituto Tecnológico Metropolitano (ITM)** · Arquitectura de Software 2

**Entrega 1:** diagramas de arquitectura de la API Festivos (Express JS + MongoDB).

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
| POST | `/api/festivos` | Agrega un festivo a un tipo existente |
| PUT | `/api/festivos/:id` | Modifica un festivo |
| DELETE | `/api/festivos/:id` | Elimina un festivo |

### Tipos de festivo

| id | Tipo | Cálculo de la fecha |
|---|---|---|
| 1 | Fijo | Día y mes fijos |
| 2 | Ley de Puente festivo | Día y mes fijos, trasladado al siguiente lunes |
| 3 | Basado en el domingo de Pascua | Domingo de Pascua + días de Pascua |
| 4 | Basado en el domingo de Pascua y Ley de Puente festivo | Domingo de Pascua + días de Pascua, trasladado al siguiente lunes |

## Diagramas

| Diagrama | Archivo |
|---|---|
| Arquitectura por capas | [diagramas/diagrama-arquitectura-festivos.md](diagramas/diagrama-arquitectura-festivos.md) |
| Modelo de la base de datos (objetual) | [diagramas/diagrama-objetual-festivos.md](diagramas/diagrama-objetual-festivos.md) |
