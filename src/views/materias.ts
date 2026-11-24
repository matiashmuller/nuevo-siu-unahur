import { aplicarDatosZonaComisiones, state } from "../state";
import { irA } from "../router";
import {
  extraerDetalleComisionDesdeUrl,
  filtrarPorPeriodoEnGuarani,
} from "../guarani/extractor";
import type { Comision, Materia } from "../types";

export function iniciarMaterias(): void {
  renderMaterias();

  const periodo = document.getElementById(
    "periodo",
  ) as HTMLSelectElement | null;

  periodo?.addEventListener("change", async (evento) => {
    const selector = evento.target as HTMLSelectElement;
    const nuevoPeriodoId = selector.value;
    const nombrePeriodo =
      selector.selectedOptions[0]?.textContent?.trim() ?? nuevoPeriodoId;

    state.periodo = nuevoPeriodoId;

    const titulo = document.getElementById("tituloPeriodo");
    if (titulo) {
      titulo.textContent =
        nuevoPeriodoId === "vigentes"
          ? "Materias del período vigente"
          : `Materias · ${nombrePeriodo}`;
    }

    const grid = document.getElementById("gridMaterias");
    if (grid) {
      grid.innerHTML = '<p class="lead">Cargando materias del período...</p>';
    }

    const datos = await filtrarPorPeriodoEnGuarani(nuevoPeriodoId);
    aplicarDatosZonaComisiones(datos, nombrePeriodo);
    renderMaterias();
  });
}

export function renderMaterias(): void {
  const grid = document.getElementById("gridMaterias");
  if (!grid) return;

  grid.innerHTML = "";

  state.materias.forEach((materia) => {
    const card = document.createElement("article");
    card.className = "card course";

    const iniciales = materia.nombre
      .split(" ")
      .filter(Boolean)
      .map((palabra) => palabra[0])
      .slice(0, 2)
      .join("");

    card.innerHTML = `
      <div class="course-top">
        <div>
          <h2>${materia.nombre}</h2>
          <p class="meta">
            ${materia.comisiones.length}
            ${materia.comisiones.length === 1 ? "comisión" : "comisiones"}
          </p>
        </div>
        <span class="course-mark">${iniciales}</span>
      </div>
      <div class="commission-list"></div>
    `;

    const lista = card.querySelector<HTMLElement>(".commission-list");
    if (!lista) return;

    materia.comisiones.forEach((comision) => {
      lista.appendChild(crearBotonComision(materia, comision));
    });

    grid.appendChild(card);
  });
}

function crearBotonComision(
  materia: Materia,
  comision: Comision,
): HTMLButtonElement {
  const boton = document.createElement("button");
  boton.className = "commission";
  boton.innerHTML = `
    <span>
      <strong>${comision.nombre}</strong>
      <small>${comision.turno} · ${comision.inscriptos} inscriptos</small>
    </span>
    <span class="arrow">›</span>
  `;

  boton.addEventListener("click", () => {
    state.comisionSeleccionada = { materia, comision };
    const yaTieneHorarios = (comision.horarios?.length ?? 0) > 0;
    renderComision(Boolean(comision.url && !yaTieneHorarios));
    irA("comision");

    if (comision.url && !yaTieneHorarios) {
      void extraerDetalleComisionDesdeUrl(comision.url).then((detalle) => {
        if (detalle) {
          comision.horarios = detalle.horarios;
          if (detalle.periodo) {
            comision.periodo = detalle.periodo;
          }
          if (detalle.turno) {
            comision.turno = detalle.turno;
          }
          if (
            typeof detalle.inscriptos === "number" &&
            detalle.inscriptos > 0
          ) {
            comision.inscriptos = detalle.inscriptos;
          }
        }

        if (state.comisionSeleccionada?.comision.id === comision.id) {
          renderComision(false);
        }
      });
    }
  });

  return boton;
}

function renderComision(cargandoHorarios = false): void {
  const seleccion = state.comisionSeleccionada;
  if (!seleccion) return;

  const { materia, comision } = seleccion;
  const periodoTexto =
    comision.periodo && comision.periodo !== "vigentes"
      ? comision.periodo
      : "Período vigente";
  const listaHorarios = comision.horarios ?? [];

  setTexto("materiaComision", materia.nombre);
  setTexto("nombreComision", comision.nombre);
  setTexto("periodoComision", periodoTexto);
  setTexto("turnoComision", `Turno ${comision.turno.toLowerCase()}`);
  setTexto("inscriptosComision", `${comision.inscriptos} inscriptos`);
  setTexto("detallePeriodo", periodoTexto);
  setTexto("detalleInscriptos", `${comision.inscriptos} estudiantes`);

  const horarios = cargandoHorarios
    ? "Cargando horarios..."
    : listaHorarios.length
      ? listaHorarios.join("<br>")
      : "Sin horarios cargados";

  const detalleHorarios = document.getElementById("detalleHorarios");
  if (detalleHorarios) detalleHorarios.innerHTML = horarios;

  setTexto("contextoAlumnos", `${materia.nombre} · ${comision.nombre}`);

  setTexto(
    "subtituloAlumnos",
    `${comision.inscriptos} inscriptos en esta comisión`,
  );
}

function setTexto(id: string, texto: string): void {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto;
}
