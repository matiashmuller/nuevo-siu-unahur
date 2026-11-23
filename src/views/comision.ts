import { state } from '../state';
import { irA } from '../router';
import { renderAlumnos } from './alumnos';

export function iniciarComision(): void {
  document
    .getElementById('buscadorAlumnos')
    ?.addEventListener('input', renderAlumnos);
}