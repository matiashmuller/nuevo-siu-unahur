import type {
  ComisionGuarani,
  DatosZonaComisiones,
  MateriaGuarani,
  PeriodoGuarani,
} from "./tipos";

function texto(elemento: Element | null): string {
  return elemento?.textContent?.trim() ?? "";
}

function extraerPeriodos(): PeriodoGuarani[] {
  const selector = document.querySelector<HTMLSelectElement>(
    'select[name="periodo"], select[id*="periodo"]',
  );

  if (!selector) {
    return [];
  }

  return Array.from(selector.options).map((option) => ({
    id: option.value,
    nombre: option.textContent?.trim() ?? "",
  }));
}

function detectarTurno(valor: string): string {
  if (/tarde/i.test(valor)) return "Tarde";
  if (/noche/i.test(valor)) return "Noche";
  if (/mañana|manana/i.test(valor)) return "Mañana";

  return "Sin turno";
}

function extraerInscriptos(valor: string): number {
  const numero = Number(valor.replace(/[^\d]/g, ""));

  return Number.isNaN(numero) ? 0 : numero;
}

function limpiarNombreMateria(nombre: string): string {
  return nombre
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerMaterias(): MateriaGuarani[] {
  const contenido = document.getElementById("kernel_contenido");

  if (!contenido) {
    return [];
  }

  const tablas = Array.from(
    contenido.querySelectorAll<HTMLTableElement>("table.table"),
  );

  const materias: MateriaGuarani[] = [];

  tablas.forEach((tabla) => {
    const tituloMateria = tabla.querySelector<HTMLTableCellElement>("thead th");

    const nombreCompleto = texto(tituloMateria);

    if (!nombreCompleto) {
      return;
    }

    const nombre = limpiarNombreMateria(nombreCompleto);

    const filas = Array.from(
      tabla.querySelectorAll<HTMLTableRowElement>("tbody tr"),
    );

    const comisiones: ComisionGuarani[] = filas
      .map((fila) => {
        const celdas = Array.from(fila.querySelectorAll("td")).map(texto);

        const nombreComision = celdas[0] ?? "";
        const turno = celdas[4] ?? "";
        const inscriptos = extraerInscriptos(celdas[5] ?? "");

        if (!nombreComision) {
          return null;
        }

        const id: string = crypto.randomUUID();

        return {
          id,
          nombre: nombreComision,
          turno: detectarTurno(turno),
          inscriptos,
        };
      })
      .filter((comision): comision is ComisionGuarani => comision !== null);

    if (comisiones.length === 0) {
      return;
    }

    const id: string = crypto.randomUUID();

    materias.push({
      id,
      nombre,
      comisiones,
    });
  });

  return materias;
}

export function esperarZonaComisiones(
  intentosMaximos = 40,
  intervalo = 250,
): Promise<DatosZonaComisiones> {
  return new Promise((resolve) => {
    let intentos = 0;

    const revisar = () => {
      const datos = extraerZonaComisiones();

      if (datos.materias.length > 0 || intentos >= intentosMaximos) {
        resolve(datos);
        return;
      }

      intentos += 1;
      window.setTimeout(revisar, intervalo);
    };

    revisar();
  });
}

export function extraerZonaComisiones(): DatosZonaComisiones {
  return {
    periodos: extraerPeriodos(),
    materias: extraerMaterias(),
  };
}
