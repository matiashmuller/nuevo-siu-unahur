export type Vista = 'login' | 'materias' | 'comision' | 'alumnos';

export interface ResolucionRuta {
  habilitada: boolean;
  esAlumno: boolean;
  vista: Vista;
  subruta: string;
}

export function resolverRuta(pathname: string = window.location.pathname): ResolucionRuta {
  const limpia = pathname.replace(/\/+$/, '') || '/';

  if (limpia.includes('/inicio_alumno') || limpia.endsWith('/alumno')) {
    return {
      habilitada: false,
      esAlumno: true,
      vista: 'materias',
      subruta: 'alumno',
    };
  }

  if (limpia === '/unahur3w' || limpia === '/acceso' || limpia.endsWith('/acceso')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'login',
      subruta: 'login',
    };
  }

  if (limpia.includes('/inscriptos_cursadas/info_comision')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'alumnos',
      subruta: 'alumnos',
    };
  }

  if (limpia.includes('/zona_comisiones/home')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'comision',
      subruta: 'comision_inicio',
    };
  }

  if (limpia.includes('/zona_comisiones')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'materias',
      subruta: 'cursadas',
    };
  }

  if (limpia.includes('/evaluaciones/ver_comision')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'comision',
      subruta: 'evaluaciones',
    };
  }

  if (limpia.includes('/cierre_cursadas')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'comision',
      subruta: 'actas',
    };
  }

  if (limpia.includes('/zona_clases/home')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'comision',
      subruta: 'clases_detalle',
    };
  }

  if (limpia.includes('/zona_clases')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'materias',
      subruta: 'clases',
    };
  }

  if (limpia.includes('/asistencias_planilla')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'comision',
      subruta: 'asistencias_planilla',
    };
  }

  if (limpia.includes('/asistencias')) {
    return {
      habilitada: true,
      esAlumno: false,
      vista: 'comision',
      subruta: 'asistencias',
    };
  }

  return {
    habilitada: false,
    esAlumno: false,
    vista: 'materias',
    subruta: 'otra',
  };
}

export function irA(vista: Vista): void {
  const root =
    document.getElementById('nuevo-siu-root') ??
    document.querySelector<HTMLElement>('.shell');
  if (!root) return;

  const destino = root.querySelector<HTMLElement>(`#${vista}`);
  if (!destino) return;

  document.documentElement.classList.add('nuevo-siu-activo');
  root.classList.toggle('logged-out', vista === 'login');

  root.querySelectorAll<HTMLElement>('.view').forEach((elemento) => {
    elemento.classList.toggle('active', elemento === destino);
  });

  root.querySelectorAll<HTMLButtonElement>('[data-vista]').forEach((boton) => {
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