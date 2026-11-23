import { state } from '../state';
import { irA } from '../router';
import type { Comision, Materia } from '../types';

export function iniciarMaterias(): void {
  renderMaterias();

  const periodo = document.getElementById('periodo') as HTMLSelectElement | null;

  periodo?.addEventListener('change', evento => {
    const selector = evento.target as HTMLSelectElement;
    state.periodo = selector.value;

    const titulo = document.getElementById('tituloPeriodo');

    if (titulo) {
      titulo.textContent =
        selector.value === 'vigentes'
          ? 'Materias del período vigente'
          : `Materias · ${selector.selectedOptions[0].textContent}`;
    }
  });
}

function renderMaterias(): void {
  const grid = document.getElementById('gridMaterias');
  if (!grid) return;

  grid.innerHTML = '';

  state.materias.forEach(materia => {
    const card = document.createElement('article');
    card.className = 'card course';

    const iniciales = materia.nombre
      .split(' ')
      .map(palabra => palabra[0])
      .slice(0, 2)
      .join('');

    card.innerHTML = `
      <div class="course-top">
        <div>
          <h2>${materia.nombre}</h2>
          <p class="meta">
            ${materia.comisiones.length}
            ${materia.comisiones.length === 1 ? 'comisión' : 'comisiones'}
          </p>
        </div>
        <span class="course-mark">${iniciales}</span>
      </div>
      <div class="commission-list"></div>
    `;

    const lista = card.querySelector<HTMLElement>('.commission-list');
    if (!lista) return;

    materia.comisiones.forEach(comision => {
      lista.appendChild(crearBotonComision(materia, comision));
    });

    grid.appendChild(card);
  });
}

function crearBotonComision(
  materia: Materia,
  comision: Comision
): HTMLButtonElement {
  const boton = document.createElement('button');
  boton.className = 'commission';
  boton.innerHTML = `
    <span>
      <strong>${comision.nombre}</strong>
      <small>${comision.turno} · ${comision.inscriptos} inscriptos</small>
    </span>
    <span class="arrow">›</span>
  `;

  boton.addEventListener('click', () => {
    state.comisionSeleccionada = { materia, comision };
    renderComision();
    irA('comision');
  });

  return boton;
}

function renderComision(): void {
  const seleccion = state.comisionSeleccionada;
  if (!seleccion) return;

  const { materia, comision } = seleccion;

  setTexto('materiaComision', materia.nombre);
  setTexto('nombreComision', comision.nombre);
  setTexto('periodoComision', comision.periodo);
  setTexto('turnoComision', `Turno ${comision.turno.toLowerCase()}`);
  setTexto('inscriptosComision', `${comision.inscriptos} inscriptos`);
  setTexto('detallePeriodo', comision.periodo);
  setTexto('detalleInscriptos', `${comision.inscriptos} estudiantes`);

  const horarios = comision.horarios.length
    ? comision.horarios.join('<br>')
    : 'Sin horarios cargados';

  const detalleHorarios = document.getElementById('detalleHorarios');
  if (detalleHorarios) detalleHorarios.innerHTML = horarios;

  setTexto(
    'contextoAlumnos',
    `${materia.nombre} · ${comision.nombre}`
  );

  setTexto(
    'subtituloAlumnos',
    `${comision.inscriptos} inscriptos en esta comisión`
  );
}

function setTexto(id: string, texto: string): void {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto;
}