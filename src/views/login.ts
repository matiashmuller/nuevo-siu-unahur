import { irA } from '../router';

export function iniciarLogin(): void {
  const form = document.getElementById('formLogin') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    irA('materias');
  });

  const recuperar = document.getElementById('recuperar');

  recuperar?.addEventListener('click', evento => {
    evento.preventDefault();
    alert('Contactá a soporte institucional para recuperar el acceso.');
  });
}