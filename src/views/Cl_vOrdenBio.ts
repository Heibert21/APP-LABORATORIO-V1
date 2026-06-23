import { I_vOrdenBio } from "../interfaces/I_vOrdenBio.js";
import { IResultadoExamen } from "../interfaces/IResultadoExamen.js";
import type Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";

export default class Cl_vBioanalista implements I_vOrdenBio {
  private listaEspera: HTMLElement;
  private listaAtendidos: HTMLElement;
  private panelFormulario: HTMLElement;
  private inLicenciado: HTMLInputElement;
  private btEnviar: HTMLButtonElement;
  private idOrdenActual: string = "";
  private examenesCargadosLocales: IResultadoExamen[] = [];
  private manejadorSeleccionarPaciente?: (idOrden: string) => void;
  // REFACTORIZACIÓN MVC: Handler para la validación de rango de texto inyectado por el controlador
  private validadorRangoTexto?: (valor: string, rangoTexto: string) => boolean;

  constructor() {
    this.listaEspera = document.getElementById("bio_listaEspera") as HTMLElement;
    this.listaAtendidos = document.getElementById("bio_listaAtendidos") as HTMLElement;
    this.panelFormulario = document.getElementById("bio_panelFormulario") as HTMLElement;
    this.inLicenciado = document.getElementById("bio_inLicenciado") as HTMLInputElement;
    this.btEnviar = document.getElementById("bio_btEnviar") as HTMLButtonElement;

    // Listener para seleccionar y procesar un paciente de la lista de espera
    this.listaEspera.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      (target.classList.contains("btn-atender") && this.manejadorSeleccionarPaciente) &&
        this.manejadorSeleccionarPaciente(target.dataset.id!);
    });

    // ALERTA VISUAL EN TIEMPO REAL (Resalta en rojo si el valor ingresado está fuera de los rangos de referencia)
    const panelInputs = document.getElementById("bio_tablaInputs") as HTMLElement;
    panelInputs.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      target.classList.contains("input-resultado") && (() => {
        const valor = target.value.trim();
        const fila = target.closest(".fila-medica") as HTMLElement;
        const rangoTexto = fila.querySelector(".referencia-texto")?.textContent || "";
        // REFACTORIZACIÓN MVC: Delegación de la validación al handler provisto por el controlador
        const esInvalido = this.validadorRangoTexto ? this.validadorRangoTexto(valor, rangoTexto) : false;
        fila.classList.toggle("border-pago", esInvalido);
        target.style.color = esInvalido ? "red" : "";
        target.style.fontWeight = esInvalido ? "bold" : "";
      })();
    });
  }
  //obtener id de la orden seleccionada
  public get idOrdenSeleccionada(): string {
    return this.idOrdenActual;
  }
  //obtener nombre del licenciado
  public get nombreLicenciado(): string {
    return this.inLicenciado.value.trim();
  }
  //obtener valores de los campos cargados
  public getValoresCamposCargados(): { parametro: string; valor: string }[] {
    const inputs = this.panelFormulario.querySelectorAll(".input-resultado") as NodeListOf<HTMLInputElement>;
    const valores: { parametro: string; valor: string }[] = [];
    inputs.forEach(input => {
      valores.push({ parametro: input.dataset.parametro!, valor: input.value.trim() });
    });
    return valores;
  }
  //renderizar pacientes en espera
  public renderizarPacientesEnEspera(ordenes: Cl_mOrdenBio[]): void {
    this.listaEspera.innerHTML = ordenes.length === 0 ? `<div class="vacio-texto">⏳ No hay muestras pendientes en este momento.</div>` : "";
    ordenes.length > 0 && (() => {
      // REFACTORIZACIÓN CLEAN CODE: Optimización de Renderizado DOM (Evita Reflows)
      const fragmento = document.createDocumentFragment();
      ordenes.forEach(o => {
        const div = document.createElement("div");
        div.className = "paciente-tarjeta espera";
        div.innerHTML = `
          <div>
            <strong>📋 Orden #${o.id} - 👤 ${o.apellido} ${o.nombre}</strong><br>
            <small>⏱️ Registro: ${o.fechaRegistro}</small><br>
            <small>🔬 Estudios: ${o.examenesSolicitados}</small>
          </div>
          <button type="button" class="btn-atender" data-id="${o.id}">Procesar</button>
        `;
        fragmento.appendChild(div);
      });
      this.listaEspera.appendChild(fragmento);
    })();
  }
  //renderizar pacientes atendidos
  public renderizarPacientesAtendidos(ordenes: Cl_mOrdenBio[]): void {
    this.listaAtendidos.innerHTML = ordenes.length === 0 ? `<li class="vacio-texto">✅ No has procesado órdenes en este turno.</li>` : "";
    ordenes.length > 0 && (() => {
      // REFACTORIZACIÓN CLEAN CODE: Optimización de Renderizado DOM
      const fragmento = document.createDocumentFragment();
      ordenes.forEach(o => {
        const li = document.createElement("li");
        li.className = "item-atendido";
        li.innerHTML = `
          <span>📋 <b>Orden #${o.id}</b> - 👤 ${o.cedula} ${o.apellido} (🔬 ${o.examenesSolicitados})</span>
          <span class="badge status-listo">✔ ENVIADO</span>
        `;
        fragmento.appendChild(li);
      });
      this.listaAtendidos.appendChild(fragmento);
    })();
  }
  //mostrar formulario de carga de examenes
  public mostrarFormularioCarga(orden: Cl_mOrdenBio): void {
    this.idOrdenActual = orden.id;
    this.examenesCargadosLocales = orden.resultados;
    this.panelFormulario.classList.remove("oculto");
    document.getElementById("bio_panelVacio")?.classList.add("oculto");
    const contenedorCabecera = document.getElementById("bio_cabeceraPaciente") as HTMLElement;
    const contenedorTabla = document.getElementById("bio_tablaInputs") as HTMLElement;
    contenedorCabecera.innerHTML = `
      <div class="grid-form" style="margin-bottom: 17px;">
        <p><b>📋 Nro. Orden:</b> #${orden.id}</p>
        <p><b>⏱️ Fecha/Hora Registro:</b> ${orden.fechaRegistro}</p>
        <p><b>👤 Paciente:</b> ${orden.apellido} ${orden.nombre}</p>
        <p><b>💳 Cédula:</b> ${orden.cedula}</p>
        <p><b>🎂 Edad:</b> ${orden.edad}</p>
        <p><b>⚧ Género:</b> ${orden.sexo}</p>
      </div>
      <p class="resultado-busqueda" style="background: #ebf8ff; color: #2b6cb0; font-weight: bold;">
        🔬 Estudios a Procesar: ${orden.examenesSolicitados}
      </p>
    `;
    contenedorTabla.innerHTML = orden.resultados.map((res: IResultadoExamen) => `
      <div class="fila-medica">
        <span class="label-medico"><b>${res.parametro}</b></span>
        <div class="input-unificado">
          <input type="text" class="input-resultado" placeholder="0.00" data-parametro="${res.parametro}" value="${res.resultado}">
          <span class="unidad-texto">${res.unidad || 'mg/dL'}</span>
        </div>
        <span class="referencia-texto">Ref: ${res.rangoReferencia || '70 - 100'}</span>
      </div>
    `).join("");
  }
  //limpiar formulario de carga
  public limpiarFormularioCarga(): void {
    this.idOrdenActual = "";
    this.examenesCargadosLocales = [];
    this.inLicenciado.value = "";
    (document.getElementById("bio_cabeceraPaciente") as HTMLElement).innerHTML = "";
    (document.getElementById("bio_tablaInputs") as HTMLElement).innerHTML = "";
    this.panelFormulario.classList.add("oculto");
    document.getElementById("bio_panelVacio")?.classList.remove("oculto");
  }
  //callback para seleccionar paciente
  public onSeleccionarPaciente(callback: (idOrden: string) => void): void {
    this.manejadorSeleccionarPaciente = callback;
  }
  //callback para enviar resultados
  public onEnviarResultadosALaboratorio(callback: () => void): void {
    this.btEnviar.onclick = callback;
  }
  //mostrar toast
  public mostrarToast(mensaje: string, tipo: "exito" | "error" | "info" | "advertencia"): void {
    const container = document.getElementById("toast-container");
    container && (() => {
      const iconos = { exito: "✅", error: "❌", info: "ℹ️", advertencia: "⚠️" };
      const toast = document.createElement("div");
      toast.className = `toast ${tipo}`;
      toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
      container.appendChild(toast);
      // Forzar reflow para asegurar la animación
      void toast.offsetWidth;
      toast.classList.add("visible");
      setTimeout(() => {
        toast.classList.remove("visible");
        toast.addEventListener("transitionend", () => toast.remove());
        // Fallback por si falla transitionend (ej: pestaña inactiva)
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    })();
  }
  // REFACTORIZACIÓN MVC: Registro del callback de validación inyectado por el controlador
  public onValidarRangoTexto(callback: (valor: string, rangoTexto: string) => boolean): void {
    this.validadorRangoTexto = callback;
  }
  public confirmarAccion(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
      document.querySelector(".modal-overlay")
        ? resolve(false)
        : (() => {
            const overlay = document.createElement("div");
            overlay.className = "modal-overlay";

            const modal = document.createElement("div");
            modal.className = "modal-confirm modal-enter";

            modal.innerHTML = `
              <div class="modal-icon">⚠️</div>
              <div class="modal-body">
                <p class="modal-text">${mensaje}</p>
              </div>
              <div class="modal-actions">
                <button class="btn-modal-cancel">Cancelar</button>
                <button class="btn-modal-confirm">Aceptar</button>
              </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            void modal.offsetWidth;
            modal.classList.remove("modal-enter");

            const cerrarModal = (resultado: boolean) => {
              btnConfirm.disabled = true;
              btnCancel.disabled = true;

              modal.classList.add("modal-leave");
              overlay.classList.add("modal-leave-overlay");

              let transicionCompletada = false;
              const finalizar = () => {
                !transicionCompletada && (() => {
                  transicionCompletada = true;
                  document.body.contains(overlay) && document.body.removeChild(overlay);
                  resolve(resultado);
                })();
              };

              modal.addEventListener("transitionend", finalizar);
              setTimeout(finalizar, 300);
            };

            const btnConfirm = modal.querySelector(".btn-modal-confirm") as HTMLButtonElement;
            const btnCancel = modal.querySelector(".btn-modal-cancel") as HTMLButtonElement;
            btnConfirm.addEventListener("mousedown", () => cerrarModal(true));
            btnCancel.addEventListener("mousedown", () => cerrarModal(false));
            overlay.addEventListener("mousedown", (e) => {
              (e.target === overlay) && cerrarModal(false);
            });
          })();
    });
  }
}