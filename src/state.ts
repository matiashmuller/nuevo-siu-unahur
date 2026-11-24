import type { DatosZonaComisiones } from './guarani/tipos';
import type { Alumno, ComisionSeleccionada, Materia } from './types';

export const state = {
  usuario: {
    nombre: 'Matías Horacio Müller',
    iniciales: 'MM',
  },

  periodo: 'vigentes',
  periodosDisponibles: [] as { id: string; nombre: string }[],

  materias: [] as Materia[],

  comisionSeleccionada: null as ComisionSeleccionada | null,

  alumnos: [
    { nombre: 'Lucía Fernández', legajo: '10234', estado: 'Activo' },
    { nombre: 'Juan Pérez', legajo: '10567', estado: 'Activo' },
    { nombre: 'Sofía Gómez', legajo: '10891', estado: 'Activo' },
  ] satisfies Alumno[],
};

export function aplicarDatosZonaComisiones(
  datos: DatosZonaComisiones,
  periodoActual?: string
): void {
  state.periodosDisponibles = datos.periodos;

  const periodoCoincidente = datos.periodos.find(
    (p) => p.id === periodoActual || p.nombre === periodoActual
  )?.nombre;

  const periodoFallback =
    periodoCoincidente ??
    (periodoActual && periodoActual !== 'vigentes' ? periodoActual : undefined) ??
    datos.periodos[0]?.nombre ??
    'Período vigente';

  state.materias = datos.materias.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    comisiones: m.comisiones.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      turno: c.turno,
      inscriptos: c.inscriptos,
      periodo: c.periodo || periodoFallback,
      horarios: c.horarios ?? [],
      url: c.url,
    })),
  }));
}