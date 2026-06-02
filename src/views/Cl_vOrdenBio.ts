import { I_vOrdenBio } from "../interfaces/I_vOrdenBio.js";
import { IResultadoExamen } from "../interfaces/IResultadoExamen.js";
import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";

export default class Cl_vBioanalista implements I_vOrdenBio {
  private listaEspera: HTMLElement;
  private listaAtendidos: HTMLElement;
  private panelFormulario: HTMLElement;
  private inLicenciado: HTMLInputElement;
  private btEnviar: HTMLButtonElement;
  private idOrdenActual: string = "";
  private examenesCargadosLocales: IResultadoExamen[] = [];
  private manejadorSeleccionarPaciente!: (idOrden: string) => void;

  constructor() {
    this.listaEspera = document.getElementById("bio_listaEspera") as HTMLElement;
    this.listaAtendidos = document.getElementById("bio_listaAtendidos") as HTMLElement;
    this.panelFormulario = document.getElementById("bio_panelFormulario") as HTMLElement;
    this.inLicenciado = document.getElementById("bio_inLicenciado") as HTMLInputElement;
    this.btEnviar = document.getElementById("bio_btEnviar") as HTMLButtonElement;

    // Listener para seleccionar y procesar un paciente de la lista de espera
    this.listaEspera.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("btn-atender") && this.manejadorSeleccionarPaciente) {
        const idOrden = target.dataset.id!;
        this.manejadorSeleccionarPaciente(idOrden);
      }
    });

    // ALERTA VISUAL EN TIEMPO REAL (Resalta en rojo si el valor ingresado está fuera de los rangos de referencia)
    const panelInputs = document.getElementById("bio_tablaInputs") as HTMLElement;
    panelInputs.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.classList.contains("input-resultado")) {
        const valor = target.value.trim();
        const fila = target.closest(".fila-medica") as HTMLElement;
        const rangoTexto = fila.querySelector(".referencia-texto")?.textContent || "";
        // REGLA DE NEGOCIO DELEGADA: Evaluada por la función estática del Modelo Unificado
        const esInvalido = Cl_mOrdenBio.validarRangoTexto(valor, rangoTexto);
        if (esInvalido) {
          fila.classList.add("border-pago");
          target.style.color = "red";
          target.style.fontWeight = "bold";
        } else {
          fila.classList.remove("border-pago");
          target.style.color = "";
          target.style.fontWeight = "";
        }
      }
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
    this.listaEspera.innerHTML = ordenes.length === 0
      ? `<div class="vacio-texto">⏳ No hay muestras pendientes en este momento.</div>`
      : "";
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
      this.listaEspera.appendChild(div);
    });
  }
  //renderizar pacientes atendidos
  public renderizarPacientesAtendidos(ordenes: Cl_mOrdenBio[]): void {
    this.listaAtendidos.innerHTML = ordenes.length === 0
      ? `<li class="vacio-texto">✅ No has procesado órdenes en este turno.</li>`
      : "";
    ordenes.forEach(o => {
      const li = document.createElement("li");
      li.className = "item-atendido";
      li.innerHTML = `
        <span>📋 <b>Orden #${o.id}</b> - 👤 ${o.cedula} ${o.apellido} (🔬 ${o.examenesSolicitados})</span>
        <span class="badge status-listo">✔ ENVIADO</span>
      `;
      this.listaAtendidos.appendChild(li);
    });
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
    if (!container) return;
    const iconos = { exito: "✅", error: "❌", info: "ℹ️", advertencia: "⚠️" };
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3500);
  }
}
