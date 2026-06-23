export default class Cl_vBioanalista {
    listaEspera;
    listaAtendidos;
    panelFormulario;
    inLicenciado;
    btEnviar;
    idOrdenActual = "";
    examenesCargadosLocales = [];
    manejadorSeleccionarPaciente;
    validadorRangoTexto;
    constructor() {
        this.listaEspera = document.getElementById("bio_listaEspera");
        this.listaAtendidos = document.getElementById("bio_listaAtendidos");
        this.panelFormulario = document.getElementById("bio_panelFormulario");
        this.inLicenciado = document.getElementById("bio_inLicenciado");
        this.btEnviar = document.getElementById("bio_btEnviar");
        this.listaEspera.addEventListener("click", (e) => {
            const target = e.target;
            (target.classList.contains("btn-atender") && this.manejadorSeleccionarPaciente) &&
                this.manejadorSeleccionarPaciente(target.dataset.id);
        });
        const panelInputs = document.getElementById("bio_tablaInputs");
        panelInputs.addEventListener("input", (e) => {
            const target = e.target;
            target.classList.contains("input-resultado") && (() => {
                const valor = target.value.trim();
                const fila = target.closest(".fila-medica");
                const rangoTexto = fila.querySelector(".referencia-texto")?.textContent || "";
                const esInvalido = this.validadorRangoTexto ? this.validadorRangoTexto(valor, rangoTexto) : false;
                fila.classList.toggle("border-pago", esInvalido);
                target.style.color = esInvalido ? "red" : "";
                target.style.fontWeight = esInvalido ? "bold" : "";
            })();
        });
    }
    get idOrdenSeleccionada() {
        return this.idOrdenActual;
    }
    get nombreLicenciado() {
        return this.inLicenciado.value.trim();
    }
    getValoresCamposCargados() {
        const inputs = this.panelFormulario.querySelectorAll(".input-resultado");
        const valores = [];
        inputs.forEach(input => {
            valores.push({ parametro: input.dataset.parametro, valor: input.value.trim() });
        });
        return valores;
    }
    renderizarPacientesEnEspera(ordenes) {
        this.listaEspera.innerHTML = ordenes.length === 0 ? `<div class="vacio-texto">⏳ No hay muestras pendientes en este momento.</div>` : "";
        ordenes.length > 0 && (() => {
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
    renderizarPacientesAtendidos(ordenes) {
        this.listaAtendidos.innerHTML = ordenes.length === 0 ? `<li class="vacio-texto">✅ No has procesado órdenes en este turno.</li>` : "";
        ordenes.length > 0 && (() => {
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
    limpiarFormularioCarga() {
        this.idOrdenActual = "";
        this.examenesCargadosLocales = [];
        this.inLicenciado.value = "";
        document.getElementById("bio_cabeceraPaciente").innerHTML = "";
        document.getElementById("bio_tablaInputs").innerHTML = "";
        this.panelFormulario.classList.add("oculto");
        document.getElementById("bio_panelVacio")?.classList.remove("oculto");
    }
    onSeleccionarPaciente(callback) {
        this.manejadorSeleccionarPaciente = callback;
    }
    onEnviarResultadosALaboratorio(callback) {
        this.btEnviar.onclick = callback;
    }
    mostrarToast(mensaje, tipo) {
        const container = document.getElementById("toast-container");
        container && (() => {
            const iconos = { exito: "✅", error: "❌", info: "ℹ️", advertencia: "⚠️" };
            const toast = document.createElement("div");
            toast.className = `toast ${tipo}`;
            toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
            container.appendChild(toast);
            void toast.offsetWidth;
            toast.classList.add("visible");
            setTimeout(() => {
                toast.classList.remove("visible");
                toast.addEventListener("transitionend", () => toast.remove());
                setTimeout(() => toast.remove(), 400);
            }, 3500);
        })();
    }
    onValidarRangoTexto(callback) {
        this.validadorRangoTexto = callback;
    }
    confirmarAccion(mensaje) {
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
                    const cerrarModal = (resultado) => {
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
                    const btnConfirm = modal.querySelector(".btn-modal-confirm");
                    const btnCancel = modal.querySelector(".btn-modal-cancel");
                    btnConfirm.addEventListener("mousedown", () => cerrarModal(true));
                    btnCancel.addEventListener("mousedown", () => cerrarModal(false));
                    overlay.addEventListener("mousedown", (e) => {
                        (e.target === overlay) && cerrarModal(false);
                    });
                })();
        });
    }
}
//# sourceMappingURL=Cl_vOrdenBio.js.map