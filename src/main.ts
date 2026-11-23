import "./styles/base.css";
import { state } from "./state";
import { iniciarLogin } from "./views/login";
import { iniciarMaterias } from "./views/materias";
import { iniciarComision } from "./views/comision";
import { renderAlumnos } from "./views/alumnos";
import { irA, type Vista } from './router';

function crearLayout(): void {
  if (document.getElementById("nuevo-siu-root")) return;

  const root = document.createElement("div");
  root.className = "shell logged-out";
  root.id = "nuevo-siu-root";

  root.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" data-vista="materias">
        SIU
        <span>Portal docente</span>
      </a>

      <nav class="nav">
        <button data-vista="materias" class="active">Mis materias</button>
      </nav>

      <div class="profile-wrap">
        <button id="botonPerfil" class="profile-btn">
          <span class="avatar">${state.usuario.iniciales}</span>
          <span class="profile-name">${state.usuario.nombre}</span>
          <span class="chevron">⌄</span>
        </button>

        <div class="profile-menu" id="menuPerfil" hidden>
          <button>Configuración</button>
          <button data-vista="login">Cerrar sesión</button>
        </div>
      </div>
    </header>

    <main>
      <section id="login" class="view active">
        <div class="card login-layout">
          <p class="eyebrow">Portal docente</p>
          <h1>Ingresá a tu cuenta</h1>
          <p class="lead">Accedé con tu usuario institucional UNAHUR.</p>

          <form id="formLogin">
            <div class="field">
              <label for="usuario">Usuario</label>
              <input id="usuario" type="email" autocomplete="username"
                placeholder="usuario@unahur.edu.ar" required>
            </div>

            <div class="field">
              <label for="password">Contraseña</label>
              <input id="password" type="password"
                autocomplete="current-password"
                placeholder="Tu contraseña" required>
            </div>

            <button class="primary" type="submit">Ingresar</button>
          </form>

          <a class="forgot" href="#" id="recuperar">
            ¿Olvidaste tu contraseña?
          </a>

          <p class="notice">
            El acceso es exclusivo para personal docente UNAHUR.
          </p>
        </div>
      </section>

      <section id="materias" class="view">
        <div class="title-row">
          <div>
            <p class="eyebrow">Espacio docente</p>
            <h1>Mis materias</h1>
            <p class="lead">Elegí una comisión para consultar su actividad.</p>
          </div>

          <label class="term">
            Período
            <select id="periodo">
              <option value="vigentes">Vigentes</option>
              <option value="2026-2">2026 — Segundo cuatrimestre</option>
              <option value="2026-1">2026 — Primer cuatrimestre</option>
            </select>
          </label>
        </div>

        <p class="section-label" id="tituloPeriodo">
          Materias del período vigente
        </p>

        <div class="course-grid" id="gridMaterias"></div>
      </section>

      <section id="comision" class="view">
        <button class="crumb" data-vista="materias">
          ← Volver a mis materias
        </button>

        <div class="card panel">
          <div class="commission-heading">
            <div>
              <p class="eyebrow" id="materiaComision"></p>
              <h1 id="nombreComision"></h1>
              <p class="lead" id="periodoComision"></p>
            </div>

            <div class="badges">
              <span class="badge" id="turnoComision"></span>
              <span class="badge" id="inscriptosComision"></span>
              <span class="badge">Presencial / virtual</span>
            </div>
          </div>

          <div class="tabs">
            <button class="active" data-vista="comision">Inicio</button>
            <button data-vista="alumnos">Alumnos</button>
            <button disabled>Evaluaciones</button>
            <button disabled>Actas</button>
          </div>

          <h2>Información de cursada</h2>

          <div class="details">
            <div class="detail">
              <small>Horarios</small>
              <strong id="detalleHorarios"></strong>
            </div>

            <div class="detail">
              <small>Estado</small>
              <strong>En curso</strong>
            </div>

            <div class="detail">
              <small>Período</small>
              <strong id="detallePeriodo"></strong>
            </div>

            <div class="detail">
              <small>Inscriptos</small>
              <strong id="detalleInscriptos"></strong>
            </div>
          </div>
        </div>
      </section>

      <section id="alumnos" class="view">
        <button class="crumb" data-vista="comision">
          ← Volver a la comisión
        </button>

        <div class="card panel">
          <p class="eyebrow" id="contextoAlumnos"></p>
          <h1>Alumnos</h1>
          <p class="lead" id="subtituloAlumnos"></p>

          <div class="tabs">
            <button data-vista="comision">Inicio</button>
            <button class="active" data-vista="alumnos">Alumnos</button>
            <button disabled>Evaluaciones</button>
            <button disabled>Actas</button>
          </div>

          <div class="table-tools">
            <input class="search" id="buscadorAlumnos"
              type="search" placeholder="Buscar por nombre o legajo">
            <span class="count" id="contadorAlumnos"></span>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Alumno/a</th>
                  <th>Legajo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="filasAlumnos"></tbody>
            </table>

            <p class="empty" id="sinAlumnos" hidden>
              No encontramos alumnos con esa búsqueda.
            </p>
          </div>
        </div>
      </section>
    </main>

    <nav class="mobile-nav">
      <button data-vista="materias" class="active">Materias</button>
      <button data-vista="comision">Comisión</button>
      <button data-vista="alumnos">Alumnos</button>
    </nav>
  `;

  document.body.appendChild(root);

  document.addEventListener("click", (evento) => {
    const boton =
      evento.target instanceof Element
        ? evento.target.closest<HTMLButtonElement>("[data-vista]")
        : null;

    if (boton) {
      evento.preventDefault();

      const vista = boton.dataset.vista as Vista | undefined;

      if (vista === "comision" && !state.comisionSeleccionada) {
        return;
      }

      if (vista) {
        irA(vista);
      }
    }

    if (
      !(evento.target instanceof Element) ||
      !evento.target.closest(".profile-wrap")
    ) {
      const menu = document.getElementById("menuPerfil");
      const botonPerfil = document.getElementById("botonPerfil");

      if (menu) menu.hidden = true;
      if (botonPerfil) {
        botonPerfil.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.getElementById("botonPerfil")?.addEventListener("click", () => {
    const menu = document.getElementById("menuPerfil");
    if (menu) menu.hidden = !menu.hidden;
  });

  iniciarLogin();
  iniciarMaterias();
  iniciarComision();
  renderAlumnos();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", crearLayout);
} else {
  crearLayout();
}
