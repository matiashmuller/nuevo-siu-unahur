export type Vista = 'login' | 'materias' | 'comision' | 'alumnos';

export function irA(vista: Vista): void {
  const destino = document.getElementById(vista);
  if (!destino) return;

  const root = document.querySelector('.shell');
  root?.classList.toggle('logged-out', vista === 'login');

  document.querySelectorAll<HTMLElement>('.view').forEach(elemento => {
    elemento.classList.toggle('active', elemento === destino);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-vista]').forEach(boton => {
    const activo = boton.dataset.vista === vista;

    boton.classList.toggle('active', activo);

    if (boton.getAttribute('role') === 'tab') {
      boton.setAttribute('aria-selected', String(activo));
    }
  });

  const menu = document.getElementById('menuPerfil');
  const botonPerfil = document.getElementById('botonPerfil');

  if (menu) menu.hidden = true;
  if (botonPerfil) botonPerfil.setAttribute('aria-expanded', 'false');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}