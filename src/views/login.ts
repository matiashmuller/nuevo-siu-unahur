import { irA } from '../router';

export function iniciarLogin(): void {
  const form = document.getElementById('formLogin') as HTMLFormElement | null;
  if (!form) return;

  const usuarioInput = document.getElementById('usuario') as HTMLInputElement | null;
  const passwordInput = document.getElementById('password') as HTMLInputElement | null;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const usuario = usuarioInput?.value.trim() ?? '';
    const password = passwordInput?.value ?? '';
    if (!usuario || !password) return;

    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.removeAttribute('name');
    }

    const body = new URLSearchParams();
    body.set('usuario', usuario);
    body.set('password', password);
    body.set('login', 'Ingresar');

    const urlLogin = 'https://servicios.unahur.edu.ar/unahur3w/acceso?auth=form';

    try {
      const respuesta = await fetch(urlLogin, {
        method: 'POST',
        body,
        credentials: 'include',
        redirect: 'follow',
      });

      const html = await respuesta.text();
      const loginFallido =
        respuesta.url.includes('/acceso') &&
        /usuario o contrase[ñn]a incorrect|ingres[aá] tus datos/i.test(html);

      if (loginFallido) {
        alert('Usuario o contraseña incorrectos.');
        return;
      }

      const urlDestino = new URL('https://servicios.unahur.edu.ar/unahur3w/zona_comisiones');
      if (respuesta.url && !respuesta.url.includes('/acceso')) {
        const candidata = new URL(respuesta.url, window.location.origin);
        candidata.searchParams.delete('usuario');
        candidata.searchParams.delete('password');
        urlDestino.href = candidata.toString();
      }

      window.location.assign(urlDestino.toString());
    } catch {
      irA('materias');
    }
  });

  const recuperar = document.getElementById('recuperar');

  recuperar?.addEventListener('click', (evento) => {
    evento.preventDefault();
    alert('Contactá a soporte institucional para recuperar el acceso.');
  });
}