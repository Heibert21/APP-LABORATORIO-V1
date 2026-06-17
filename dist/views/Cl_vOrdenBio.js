export default class Cl_vBioanalista {
    listaEspera;
    listaAtendidos;
    panelFormulario;
    inLicenciado;
    btEnviar;
    idOrdenActual = "";
    examenesCargadosLocales = [];
    manejadorSeleccionarPaciente;
    // REFACTORIZACIÓN MVC: Handler para la validación de rango de texto inyectado por el controlador
    validadorRangoTexto;
    constructor() {
        this.listaEspera = document.getElementById("bio_listaEspera");
        this.listaAtendidos = document.getElementById("bio_listaAtendidos");
        this.panelFormulario = document.getElementById("bio_panelFormulario");
        this.inLicenciado = document.getElementById("bio_inLicenciado");
        this.btEnviar = document.getElementById("bio_btEnviar");
        // Listener para seleccionar y procesar un paciente de la lista de espera
        this.listaEspera.addEventListener("click", (e) => {
            const target = e.target;
            if (target.classList.contains("btn-atender") && this.manejadorSeleccionarPaciente) {
                const idOrden = target.dataset.id;
                this.manejadorSeleccionarPaciente(idOrden);
            }
        });
        // ALERTA VISUAL EN TIEMPO REAL (Resalta en rojo si el valor ingresado está fuera de los rangos de referencia)
        const panelInputs = document.getElementById("bio_tablaInputs");
        panelInputs.addEventListener("input", (e) => {
            const target = e.target;
            if (target.classList.contains("input-resultado")) {
                const valor = target.value.trim();
                const fila = target.closest(".fila-medica");
                const rangoTexto = fila.querySelector(".referencia-texto")?.textContent || "";
                // REFACTORIZACIÓN MVC: Delegación de la validación al handler provisto por el controlador
                const esInvalido = this.validadorRangoTexto ? this.validadorRangoTexto(valor, rangoTexto) : false;
                if (esInvalido) {
                    fila.classList.add("border-pago");
                    target.style.color = "red";
                    target.style.fontWeight = "bold";
                }
                else {
                    fila.classList.remove("border-pago");
                    target.style.color = "";
                    target.style.fontWeight = "";
                }
            }
        });
    }
    //obtener id de la orden seleccionada
    get idOrdenSeleccionada() {
        return this.idOrdenActual;
    }
    //obtener nombre del licenciado
    get nombreLicenciado() {
        return this.inLicenciado.value.trim();
    }
    //obtener valores de los campos cargados
    getValoresCamposCargados() {
        const inputs = this.panelFormulario.querySelectorAll(".input-resultado");
        const valores = [];
        inputs.forEach(input => {
            valores.push({ parametro: input.dataset.parametro, valor: input.value.trim() });
        });
        return valores;
    }
    //renderizar pacientes en espera
    renderizarPacientesEnEspera(ordenes) {
        this.listaEspera.innerHTML = "";
        if (ordenes.length === 0) {
            this.listaEspera.innerHTML = `<div class="vacio-texto">⏳ No hay muestras pendientes en este momento.</div>`;
            return;
        }
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
    }
    //renderizar pacientes atendidos
    renderizarPacientesAtendidos(ordenes) {
        this.listaAtendidos.innerHTML = "";
        if (ordenes.length === 0) {
            this.listaAtendidos.innerHTML = `<li class="vacio-texto">✅ No has procesado órdenes en este turno.</li>`;
            return;
        }
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
    }
    //mostrar formulario de carga de examenes
    mostrarFormularioCarga(orden) {
        this.idOrdenActual = orden.id;
        this.examenesCargadosLocales = orden.resultados;
        this.panelFormulario.classList.remove("oculto");
        document.getElementById("bio_panelVacio")?.classList.add("oculto");
        const contenedorCabecera = document.getElementById("bio_cabeceraPaciente");
        const contenedorTabla = document.getElementById("bio_tablaInputs");
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
        contenedorTabla.innerHTML = orden.resultados.map((res) => `
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
    limpiarFormularioCarga() {
        this.idOrdenActual = "";
        this.examenesCargadosLocales = [];
        this.inLicenciado.value = "";
        document.getElementById("bio_cabeceraPaciente").innerHTML = "";
        document.getElementById("bio_tablaInputs").innerHTML = "";
        this.panelFormulario.classList.add("oculto");
        document.getElementById("bio_panelVacio")?.classList.remove("oculto");
    }
    //callback para seleccionar paciente
    onSeleccionarPaciente(callback) {
        this.manejadorSeleccionarPaciente = callback;
    }
    //callback para enviar resultados
    onEnviarResultadosALaboratorio(callback) {
        this.btEnviar.onclick = callback;
    }
    //mostrar toast
    mostrarToast(mensaje, tipo) {
        const container = document.getElementById("toast-container");
        if (!container)
            return;
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
    }
    // REFACTORIZACIÓN MVC: Registro del callback de validación inyectado por el controlador
    onValidarRangoTexto(callback) {
        this.validadorRangoTexto = callback;
    }
}
//# sourceMappingURL=Cl_vOrdenBio.js.map