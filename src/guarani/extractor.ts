import type {
  ComisionGuarani,
  DatosZonaComisiones,
  MateriaGuarani,
  PeriodoGuarani,
} from "./tipos";

export interface DetalleComisionGuarani {
  periodo?: string;
  horarios: string[];
  turno?: string;
  inscriptos?: number;
}

function texto(elemento: Element | null): string {
  return elemento?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

export function extraerPeriodoLectivo(doc: Document = document): string {
  const contenido = doc.getElementById("kernel_contenido") ?? doc.body;
  if (!contenido) return "";

  const parrafos = Array.from(contenido.querySelectorAll("#home p"));
  for (const p of parrafos) {
    const label = texto(p.querySelector("strong"));
    if (/per[ií]odo lectivo/i.test(label)) {
      const limpio = texto(p)
        .replace(/^per[ií]odo lectivo\s*:?\s*/i, "")
        .trim();
      if (limpio) return limpio;
    }
  }

  const filasDetalle = Array.from(
    contenido.querySelectorAll<HTMLTableRowElement>(".detalle-tabla tr"),
  );
  for (const fila of filasDetalle) {
    const celdas = Array.from(fila.querySelectorAll("td"));
    for (let i = 0; i < celdas.length - 1; i++) {
      if (/per[ií]odo lectivo/i.test(texto(celdas[i]))) {
        const valor = texto(celdas[i + 1]);
        if (valor) return valor;
      }
    }
  }

  return "";
}

function extraerPeriodos(doc: Document = document): PeriodoGuarani[] {
  const selector = doc.querySelector<HTMLSelectElement>(
    'select[name="periodo"], select[id*="periodo"]',
  );

  if (selector) {
    return Array.from(selector.options).map((option) => ({
      id: option.value,
      nombre: option.textContent?.trim() ?? "",
    }));
  }

  const periodoLectivo = extraerPeriodoLectivo(doc);
  if (periodoLectivo) {
    return [{ id: periodoLectivo, nombre: periodoLectivo }];
  }

  return [];
}

function extraerDetalleZonaCampo(doc: Document, patronLabel: RegExp): string {
  const contenido = doc.getElementById("kernel_contenido") ?? doc.body;
  if (!contenido) return "";

  const filas = Array.from(
    contenido.querySelectorAll<HTMLTableRowElement>(".detalle-tabla tr"),
  );

  for (const fila of filas) {
    const celdas = Array.from(fila.querySelectorAll("td"));
    for (let i = 0; i < celdas.length - 1; i++) {
      if (patronLabel.test(texto(celdas[i]))) {
        return texto(celdas[i + 1]);
      }
    }
  }

  return "";
}

export function extraerHorariosZona(doc: Document = document): string[] {
  const raw = extraerDetalleZonaCampo(doc, /^horarios?$/i);
  if (!raw || /^sin\s+horarios?/i.test(raw)) {
    return [];
  }

  return raw
    .split(/\s+-\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extraerDetalleDesdeDocumento(
  doc: Document,
): DetalleComisionGuarani {
  const periodo = extraerPeriodoLectivo(doc) || undefined;
  const horarios = extraerHorariosZona(doc);
  const turnoRaw = extraerDetalleZonaCampo(doc, /^turno\s*:?$/i);
  const inscriptosRaw = extraerDetalleZonaCampo(doc, /^inscriptos\s*:?$/i);

  return {
    periodo,
    horarios,
    turno: turnoRaw ? detectarTurno(turnoRaw) : undefined,
    inscriptos: inscriptosRaw ? extraerInscriptos(inscriptosRaw) : undefined,
  };
}

function extraerHtmlPageletsDeScript(html: string): string {
  const fragmentos: string[] = [];
  const regex = /kernel\.renderer\.on_arrival\((\{[\s\S]*?\})\)\s*;?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const rawJson = match[1];
    try {
      const payload = JSON.parse(rawJson) as { content?: unknown };
      if (typeof payload.content === "string" && payload.content.trim()) {
        fragmentos.push(payload.content);
      }
    } catch {
      const contentMatch = /"content"\s*:\s*"((?:\\.|[^"\\])*)"/.exec(
        rawJson,
      );
      if (contentMatch?.[1]) {
        try {
          fragmentos.push(JSON.parse(`"${contentMatch[1]}"`) as string);
        } catch {
          fragmentos.push(contentMatch[1]);
        }
      }
    }
  }

  return fragmentos.join("\n");
}

export async function extraerDetalleComisionDesdeUrl(
  url: string,
): Promise<DetalleComisionGuarani | null> {
  try {
    const respuesta = await fetch(url, { credentials: "include" });
    if (!respuesta.ok) return null;

    const html = await respuesta.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    let detalle = extraerDetalleDesdeDocumento(doc);

    if (detalle.horarios.length === 0) {
      const htmlPagelets = extraerHtmlPageletsDeScript(html);
      if (htmlPagelets) {
        const docPagelets = new DOMParser().parseFromString(
          htmlPagelets,
          "text/html",
        );
        const detallePagelets = extraerDetalleDesdeDocumento(docPagelets);

        detalle = {
          periodo: detalle.periodo ?? detallePagelets.periodo,
          horarios:
            detallePagelets.horarios.length > 0
              ? detallePagelets.horarios
              : detalle.horarios,
          turno: detalle.turno ?? detallePagelets.turno,
          inscriptos: detalle.inscriptos ?? detallePagelets.inscriptos,
        };
      }
    }

    return detalle;
  } catch {
    return null;
  }
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

function extraerUrlFila(fila: HTMLTableRowElement): string | undefined {
  const enlaceHome = fila.querySelector<HTMLAnchorElement>(
    'a[href*="zona_comisiones/home/"]',
  );
  const enlace = enlaceHome ?? fila.querySelector<HTMLAnchorElement>("a[href]");
  const href = enlace?.getAttribute("href")?.trim();
  if (!href) return undefined;

  try {
    return new URL(href, window.location.origin).toString();
  } catch {
    return href;
  }
}

function extraerMateriaDesdeHome(): MateriaGuarani | null {
  const contenido = document.getElementById("kernel_contenido");
  if (!contenido) return null;

  const tituloMateriaRaw = texto(
    contenido.querySelector("#home .actividad-titulo"),
  );
  const tituloComisionRaw = texto(
    contenido.querySelector("#home .comision-titulo"),
  )
    .replace(/^comisi[oó]n\s*:?\s*/i, "")
    .trim();

  if (!tituloMateriaRaw && !tituloComisionRaw) {
    return null;
  }

  const nombreMateria = limpiarNombreMateria(tituloMateriaRaw) || "Materia";
  const nombreComision =
    tituloComisionRaw ||
    extraerDetalleZonaCampo(document, /^comisi[oó]n\s*:?$/i) ||
    "Comisión";
  const turnoRaw = extraerDetalleZonaCampo(document, /^turno\s*:?$/i);
  const inscriptosRaw = extraerDetalleZonaCampo(document, /^inscriptos\s*:?$/i);
  const periodo = extraerPeriodoLectivo(document) || undefined;
  const horarios = extraerHorariosZona(document);

  const comision: ComisionGuarani = {
    id: crypto.randomUUID(),
    nombre: nombreComision,
    turno: detectarTurno(turnoRaw),
    inscriptos: extraerInscriptos(inscriptosRaw),
    periodo,
    horarios,
    url: window.location.href,
  };

  return {
    id: crypto.randomUUID(),
    nombre: nombreMateria,
    comisiones: [comision],
  };
}

function extraerMaterias(): MateriaGuarani[] {
  const contenido = document.getElementById("kernel_contenido");

  if (!contenido) {
    return [];
  }

  const tablas = Array.from(
    contenido.querySelectorAll<HTMLTableElement>(
      "table.table:not(.detalle-tabla)",
    ),
  );

  const periodoGlobal = extraerPeriodoLectivo(document) || undefined;
  const horariosGlobal = extraerHorariosZona(document);
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
      .map((fila): ComisionGuarani | null => {
        const celdas = Array.from(fila.querySelectorAll("td")).map(texto);

        const nombreComision = celdas[0] ?? "";
        const turno = celdas[4] ?? "";
        const inscriptos = extraerInscriptos(celdas[5] ?? "");
        const url = extraerUrlFila(fila);

        if (!nombreComision) {
          return null;
        }

        const id: string = crypto.randomUUID();

        return {
          id,
          nombre: nombreComision,
          turno: detectarTurno(turno),
          inscriptos,
          periodo: periodoGlobal,
          horarios: horariosGlobal,
          url,
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

  if (materias.length === 0) {
    const materiaHome = extraerMateriaDesdeHome();
    if (materiaHome) {
      materias.push(materiaHome);
    }
  }

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
    periodos: extraerPeriodos(document),
    materias: extraerMaterias(),
  };
}