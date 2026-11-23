export interface ComisionGuarani {
  id: string;
  nombre: string;
  turno: string;
  inscriptos: number;
}

export interface MateriaGuarani {
  id: string;
  nombre: string;
  comisiones: ComisionGuarani[];
}

export interface PeriodoGuarani {
  id: string;
  nombre: string;
}

export interface DatosZonaComisiones {
  periodos: PeriodoGuarani[];
  materias: MateriaGuarani[];
}