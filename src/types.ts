export interface Comision {
  id: string;
  nombre: string;
  turno: string;
  inscriptos: number;
  periodo: string;
  horarios: string[];
}

export interface Materia {
  id: string;
  nombre: string;
  comisiones: Comision[];
}

export interface ComisionSeleccionada {
  materia: Materia;
  comision: Comision;
}

export interface Alumno {
  nombre: string;
  legajo: string;
  estado: string;
}