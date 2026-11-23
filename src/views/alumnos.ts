import { state } from '../state';

export function renderAlumnos(): void {
  const buscador = document.getElementById(
    'buscadorAlumnos'
  ) as HTMLInputElement | null;

  const consulta = buscador?.value.trim().toLocaleLowerCase('es') ?? '';

  const resultados = state.alumnos.filter(alumno =>
    `${alumno.nombre} ${alumno.legajo} ${alumno.estado}`
      .toLocaleLowerCase('es')
      .includes(consulta)
  );

  const tbody = document.getElementById('filasAlumnos');
  if (!tbody) return;

  tbody.innerHTML = '';

  resultados.forEach(alumno => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${alumno.nombre}</td>
      <td>${alumno.legajo}</td>
      <td><span class="status">${alumno.estado}</span></td>
    `;
    tbody.appendChild(fila);
  });

  const contador = document.getElementById('contadorAlumnos');
  if (contador) {
    contador.textContent =
      `${resultados.length} de ${state.alumnos.length} estudiantes`;
  }

  const vacio = document.getElementById('sinAlumnos');
  if (vacio) vacio.hidden = resultados.length > 0;

  const tabla = document.querySelector<HTMLTableElement>('.table-wrap table');
  if (tabla) tabla.hidden = resultados.length === 0;
}