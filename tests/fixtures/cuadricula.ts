import type { Cuadricula } from '../../src/lib/types';

// Cuadrícula de prueba: la estructura de una real (tipos, fechas, ventanas, hábitos con día fijo…)
// con textos neutros. 32 tareas, 7 hábitos y 25 principios.
export const CUADRICULA: Cuadricula = {
  id: 'prueba',
  objetivo: 'Objetivo de prueba',
  objetivoCorto: 'Prueba',
  fechaObjetivo: '2027-02-08',
  fechaInicio: null,
  fechaFin: null,
  pilares: [
    {
      id: "stack", nombre: 'Pilar 1', color: 1, porque: 'Por qué del pilar 1.',
      acciones: [
      {"id": "stack-1", "corto": "Acción 1.1", "texto": "Texto de la acción 1.1.", "tipo": "tarea", "cuando": {"semanas": [1, 1]}},
      {"id": "stack-2", "corto": "Acción 1.2", "texto": "Texto de la acción 1.2.", "tipo": "tarea", "cuando": {"antesInicio": true}},
      {"id": "stack-3", "corto": "Acción 1.3", "texto": "Texto de la acción 1.3.", "tipo": "tarea"},
      {"id": "stack-4", "corto": "Acción 1.4", "texto": "Texto de la acción 1.4.", "tipo": "tarea"},
      {"id": "stack-5", "corto": "Acción 1.5", "texto": "Texto de la acción 1.5.", "tipo": "tarea"},
      {"id": "stack-6", "corto": "Acción 1.6", "texto": "Texto de la acción 1.6.", "tipo": "tarea"},
      {"id": "stack-7", "corto": "Acción 1.7", "texto": "Texto de la acción 1.7.", "tipo": "principio", "trasInicio": true},
      {"id": "stack-8", "corto": "Acción 1.8", "texto": "Texto de la acción 1.8.", "tipo": "principio", "trasInicio": true},
      ],
    },
    {
      id: "coste", nombre: 'Pilar 2', color: 2, porque: 'Por qué del pilar 2.',
      acciones: [
      {"id": "coste-1", "corto": "Acción 2.1", "texto": "Texto de la acción 2.1.", "tipo": "principio", "trasInicio": true},
      {"id": "coste-2", "corto": "Acción 2.2", "texto": "Texto de la acción 2.2.", "tipo": "principio", "trasInicio": true},
      {"id": "coste-3", "corto": "Acción 2.3", "texto": "Texto de la acción 2.3.", "tipo": "principio", "trasInicio": true},
      {"id": "coste-4", "corto": "Acción 2.4", "texto": "Texto de la acción 2.4.", "tipo": "principio", "trasInicio": true},
      {"id": "coste-5", "corto": "Acción 2.5", "texto": "Texto de la acción 2.5.", "tipo": "principio", "trasInicio": true},
      {"id": "coste-6", "corto": "Acción 2.6", "texto": "Texto de la acción 2.6.", "tipo": "principio", "trasInicio": true},
      {"id": "coste-7", "corto": "Acción 2.7", "texto": "Texto de la acción 2.7.", "tipo": "tarea", "cuando": {"semanas": [1, 1]}},
      {"id": "coste-8", "corto": "Acción 2.8", "texto": "Texto de la acción 2.8.", "tipo": "principio", "trasInicio": true},
      ],
    },
    {
      id: "visibilidad", nombre: 'Pilar 3', color: 3, porque: 'Por qué del pilar 3.',
      acciones: [
      {"id": "visibilidad-1", "corto": "Acción 3.1", "texto": "Texto de la acción 3.1.", "tipo": "principio", "trasInicio": true},
      {"id": "visibilidad-2", "corto": "Acción 3.2", "texto": "Texto de la acción 3.2.", "tipo": "tarea", "cuando": {"semanas": [1, 2]}},
      {"id": "visibilidad-3", "corto": "Acción 3.3", "texto": "Texto de la acción 3.3.", "tipo": "principio", "trasInicio": true, "cuando": {"semanas": [1, 4]}},
      {"id": "visibilidad-4", "corto": "Acción 3.4", "texto": "Texto de la acción 3.4.", "tipo": "principio", "trasInicio": true},
      {"id": "visibilidad-5", "corto": "Acción 3.5", "texto": "Texto de la acción 3.5.", "tipo": "tarea", "cuando": {"semanas": [4, 8]}},
      {"id": "visibilidad-6", "corto": "Acción 3.6", "texto": "Texto de la acción 3.6.", "tipo": "principio", "trasInicio": true},
      {"id": "visibilidad-7", "corto": "Acción 3.7", "texto": "Texto de la acción 3.7.", "tipo": "tarea", "cuando": {"semanas": [1, 1]}},
      {"id": "visibilidad-8", "corto": "Acción 3.8", "texto": "Texto de la acción 3.8.", "tipo": "tarea", "cuando": {"semanas": [4, 6]}},
      ],
    },
    {
      id: "equipo", nombre: 'Pilar 4', color: 4, porque: 'Por qué del pilar 4.',
      acciones: [
      {"id": "equipo-1", "corto": "Acción 4.1", "texto": "Texto de la acción 4.1.", "tipo": "principio", "trasInicio": true},
      {"id": "equipo-2", "corto": "Acción 4.2", "texto": "Texto de la acción 4.2.", "tipo": "tarea", "cuando": {"semanas": [1, 1]}},
      {"id": "equipo-3", "corto": "Acción 4.3", "texto": "Texto de la acción 4.3.", "tipo": "principio", "trasInicio": true},
      {"id": "equipo-4", "corto": "Acción 4.4", "texto": "Texto de la acción 4.4.", "tipo": "principio", "trasInicio": true},
      {"id": "equipo-5", "corto": "Acción 4.5", "texto": "Texto de la acción 4.5.", "tipo": "principio", "trasInicio": true},
      {"id": "equipo-6", "corto": "Acción 4.6", "texto": "Texto de la acción 4.6.", "tipo": "principio", "trasInicio": true},
      {"id": "equipo-7", "corto": "Acción 4.7", "texto": "Texto de la acción 4.7.", "tipo": "principio", "trasInicio": true},
      {"id": "equipo-8", "corto": "Acción 4.8", "texto": "Texto de la acción 4.8.", "tipo": "principio", "trasInicio": true},
      ],
    },
    {
      id: "negocio", nombre: 'Pilar 5', color: 5, porque: 'Por qué del pilar 5.',
      acciones: [
      {"id": "negocio-1", "corto": "Acción 5.1", "texto": "Texto de la acción 5.1.", "tipo": "tarea", "cuando": {"antesInicio": true}},
      {"id": "negocio-2", "corto": "Acción 5.2", "texto": "Texto de la acción 5.2.", "tipo": "tarea", "cuando": {"semanas": [2, 4]}},
      {"id": "negocio-3", "corto": "Acción 5.3", "texto": "Texto de la acción 5.3.", "tipo": "principio", "trasInicio": true},
      {"id": "negocio-4", "corto": "Acción 5.4", "texto": "Texto de la acción 5.4.", "tipo": "principio", "trasInicio": true},
      {"id": "negocio-5", "corto": "Acción 5.5", "texto": "Texto de la acción 5.5.", "tipo": "principio", "trasInicio": true},
      {"id": "negocio-6", "corto": "Acción 5.6", "texto": "Texto de la acción 5.6.", "tipo": "tarea", "cuando": {"semanas": [5, 8]}},
      {"id": "negocio-7", "corto": "Acción 5.7", "texto": "Texto de la acción 5.7.", "tipo": "tarea", "cuando": {"semanas": [2, 4]}},
      {"id": "negocio-8", "corto": "Acción 5.8", "texto": "Texto de la acción 5.8.", "tipo": "tarea", "cuando": {"semanas": [3, 6]}},
      ],
    },
    {
      id: "conversacion", nombre: 'Pilar 6', color: 6, porque: 'Por qué del pilar 6.',
      acciones: [
      {"id": "conversacion-1", "corto": "Acción 6.1", "texto": "Texto de la acción 6.1.", "tipo": "tarea", "cuando": {"semanas": [1, 2]}},
      {"id": "conversacion-2", "corto": "Acción 6.2", "texto": "Texto de la acción 6.2.", "tipo": "tarea", "cuando": {"semanas": [1, 2]}},
      {"id": "conversacion-3", "corto": "Acción 6.3", "texto": "Texto de la acción 6.3.", "tipo": "tarea", "cuando": {"semanas": [3, 4]}},
      {"id": "conversacion-4", "corto": "Acción 6.4", "texto": "Texto de la acción 6.4.", "tipo": "tarea", "cuando": {"semanas": [6, 6]}},
      {"id": "conversacion-5", "corto": "Acción 6.5", "texto": "Texto de la acción 6.5.", "tipo": "tarea", "cuando": {"semanas": [6, 8]}},
      {"id": "conversacion-6", "corto": "Acción 6.6", "texto": "Texto de la acción 6.6.", "tipo": "tarea", "cuando": {"hasta": "2026-12-18"}},
      {"id": "conversacion-7", "corto": "Acción 6.7", "texto": "Texto de la acción 6.7.", "tipo": "tarea", "cuando": {"desde": "2027-01-01", "hasta": "2027-01-31"}},
      {"id": "conversacion-8", "corto": "Acción 6.8", "texto": "Texto de la acción 6.8.", "tipo": "tarea", "cuando": {"hastaFin": true}},
      ],
    },
    {
      id: "grado", nombre: 'Pilar 7', color: 7, porque: 'Por qué del pilar 7.',
      acciones: [
      {"id": "grado-1", "corto": "Acción 7.1", "texto": "Texto de la acción 7.1.", "tipo": "tarea", "cuando": {"antesInicio": true}},
      {"id": "grado-2", "corto": "Acción 7.2", "texto": "Texto de la acción 7.2.", "tipo": "tarea", "cuando": {"antesInicio": true}},
      {"id": "grado-3", "corto": "Acción 7.3", "texto": "Texto de la acción 7.3.", "tipo": "tarea", "cuando": {"semanas": [5, 6]}},
      {"id": "grado-4", "corto": "Acción 7.4", "texto": "Texto de la acción 7.4.", "tipo": "tarea"},
      {"id": "grado-5", "corto": "Acción 7.5", "texto": "Texto de la acción 7.5.", "tipo": "habito", "objetivoSemana": 2, "soloDias": [1, 2, 3, 4]},
      {"id": "grado-6", "corto": "Acción 7.6", "texto": "Texto de la acción 7.6.", "tipo": "principio"},
      {"id": "grado-7", "corto": "Acción 7.7", "texto": "Texto de la acción 7.7.", "tipo": "principio"},
      {"id": "grado-8", "corto": "Acción 7.8", "texto": "Texto de la acción 7.8.", "tipo": "tarea", "cuando": {"semanas": [1, 2]}},
      ],
    },
    {
      id: "energia", nombre: 'Pilar 8', color: 8, porque: 'Por qué del pilar 8.',
      acciones: [
      {"id": "energia-1", "corto": "Acción 8.1", "texto": "Texto de la acción 8.1.", "tipo": "habito", "objetivoSemana": 6},
      {"id": "energia-2", "corto": "Acción 8.2", "texto": "Texto de la acción 8.2.", "tipo": "habito", "trasInicio": true, "objetivoSemana": 4, "soloDias": [1, 2, 3, 4, 5]},
      {"id": "energia-3", "corto": "Acción 8.3", "texto": "Texto de la acción 8.3.", "tipo": "habito", "objetivoSemana": 3, "maxSeguidos": 3},
      {"id": "energia-4", "corto": "Acción 8.4", "texto": "Texto de la acción 8.4.", "tipo": "habito", "objetivoSemana": 1, "soloDias": [0]},
      {"id": "energia-5", "corto": "Acción 8.5", "texto": "Texto de la acción 8.5.", "tipo": "habito", "objetivoSemana": 1, "soloDias": [5]},
      {"id": "energia-6", "corto": "Acción 8.6", "texto": "Texto de la acción 8.6.", "tipo": "habito", "objetivoSemana": 1, "soloDias": [1]},
      {"id": "energia-7", "corto": "Acción 8.7", "texto": "Texto de la acción 8.7.", "tipo": "tarea", "cuando": {"semanas": [3, 4]}},
      {"id": "energia-8", "corto": "Acción 8.8", "texto": "Texto de la acción 8.8.", "tipo": "tarea", "cuando": {"antesInicio": true}},
      ],
    },
  ],
};
