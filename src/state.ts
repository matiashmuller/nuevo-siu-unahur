import type { Alumno, ComisionSeleccionada, Materia } from './types';

export const state = {
  usuario: {
    nombre: 'Matías Horacio Müller',
    iniciales: 'MM'
  },

  periodo: 'vigentes',

  materias: [
    {
      id: 'poo',
      nombre: 'Programación de objetos I',
      comisiones: [
        {
          id: 'poo-2',
          nombre: 'Comisión 2',
          turno: 'Tarde',
          inscriptos: 62,
          periodo: 'Segundo cuatrimestre 2026',
          horarios: [
            'Martes 14:00–18:00 · Presencial',
            'Sábado 10:00–12:00 · Virtual'
          ]
        },
        {
          id: 'poo-3',
          nombre: 'Comisión 3',
          turno: 'Noche',
          inscriptos: 46,
          periodo: 'Segundo cuatrimestre 2026',
          horarios: []
        }
      ]
    },
    {
      id: 'git',
      nombre: 'Taller de Git y GitHub',
      comisiones: [
        {
          id: 'git-ef',
          nombre: 'EF: Taller de Git y GitHub',
          turno: 'Tarde',
          inscriptos: 193,
          periodo: 'Segundo cuatrimestre 2026',
          horarios: []
        }
      ]
    }
  ] satisfies Materia[],

  comisionSeleccionada: null as ComisionSeleccionada | null,

  alumnos: [
    { nombre: 'Lucía Fernández', legajo: '10234', estado: 'Activo' },
    { nombre: 'Juan Pérez', legajo: '10567', estado: 'Activo' },
    { nombre: 'Sofía Gómez', legajo: '10891', estado: 'Activo' }
  ] satisfies Alumno[]
};