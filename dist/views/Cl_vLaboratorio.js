export default class Cl_vLaboratorio {
    chkEsMenor;
    inCedulaRep;
    inNombreRep;
    inApellidoRep;
    inCedula;
    inNombre;
    inApellido;
    inFechaNac;
    inSexo;
    inTelefono;
    inCorreo;
    inMetodoPago;
    contenedorEstudios;
    formPaciente;
    btnProcesarOrden;
    btnCancelarEdicion;
    inTasa;
    btTasa;
    inEstId;
    inEstNombre;
    inEstPrecio;
    inEstTiempo;
    inEstUnidad;
    inEstRango;
    formEstudio;
    listaCatalogo;
    tablaEspera;
    tablaListos;
    lblTotalUSD;
    lblTotalBs;
    lblHoraEntrega;
    toastContainer;
    spinnerOverlay;
    inFechaReporteExamen;
    inNombreReporteExamen;
    lblCantidadExamen;
    repFiltroExamen;
    repFiltroFechaDesde;
    repFiltroFechaHasta;
    repFiltroPaciente;
    tbodyReporteExamenes;
    manejadorEliminarEstudio;
    manejadorDespacharOrden;
    manejadorCambioChecks;
    cbCambioFiltro;
    manejadorEliminarOrdenEspera;
    manejadorEditarOrdenEspera;
    manejadorFiltrarBandeja;
    constructor() {
        this.chkEsMenor = document.getElementById("pac_chkEsMenor");
        this.inCedulaRep = document.getElementById("pac_cedulaRep");
        this.inNombreRep = document.getElementById("pac_nombreRep");
        this.inApellidoRep = document.getElementById("pac_apellidoRep");
        this.inCedula = document.getElementById("pac_cedula");
        this.inNombre = document.getElementById("pac_nombre");
        this.inApellido = document.getElementById("pac_apellido");
        this.inFechaNac = document.getElementById("pac_fechaNac");
        this.inSexo = document.getElementById("pac_sexo");
        this.inTelefono = document.getElementById("pac_telefono");
        this.inCorreo = document.getElementById("pac_correo");
        this.inMetodoPago = document.getElementById("pac_metodoPago");
        this.contenedorEstudios = document.getElementById("adm_contenedorEstudiosDisponibles");
        this.formPaciente = document.getElementById("form_registroPaciente");
        this.btnProcesarOrden = document.getElementById("btn_procesarOrden");
        this.btnCancelarEdicion = document.getElementById("btn_cancelarEdicion");
        this.inTasa = document.getElementById("adm_inTasa");
        this.btTasa = document.getElementById("adm_btnActualizarTasa");
        this.inEstId = document.getElementById("est_id");
        this.inEstNombre = document.getElementById("est_nombre");
        this.inEstPrecio = document.getElementById("est_precio");
        this.inEstTiempo = document.getElementById("est_tiempo");
        this.inEstUnidad = document.getElementById("est_unidad");
        this.inEstRango = document.getElementById("est_rango");
        this.formEstudio = document.getElementById("form_nuevoEstudio");
        this.listaCatalogo = document.getElementById("adm_listaEstudiosCatalogo");
        this.tablaEspera = document.getElementById("adm_listaEspera");
        this.tablaListos = document.getElementById("adm_listaListos");
        this.lblTotalUSD = document.getElementById("adm_lblTotalUSD");
        this.lblTotalBs = document.getElementById("adm_lblTotalBs");
        this.lblHoraEntrega = document.getElementById("adm_lblHoraEntrega");
        this.toastContainer = document.getElementById("toast-container");
        this.spinnerOverlay = document.getElementById("spinner-overlay");
        this.inFechaReporteExamen = document.getElementById("rep_fecha_examen");
        this.inNombreReporteExamen = document.getElementById("rep_nombre_examen");
        this.lblCantidadExamen = document.getElementById("rep_cantidad_examen");
        this.repFiltroExamen = document.getElementById("rep_filtro_examen");
        this.repFiltroFechaDesde = document.getElementById("rep_filtro_fecha_desde");
        this.repFiltroFechaHasta = document.getElementById("rep_filtro_fecha_hasta");
        this.repFiltroPaciente = document.getElementById("rep_filtro_paciente");
        this.tbodyReporteExamenes = document.getElementById("tbody_reporte_examenes");
        this.inFechaReporteExamen && (() => {
            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
            this.inFechaReporteExamen.value = localISOTime;
        })();
        const btnToggleEstudio = document.getElementById("btnToggleFormEstudio");
        const seccionFormEstudio = document.getElementById("seccionFormEstudio");
        btnToggleEstudio.onclick = () => {
            seccionFormEstudio.classList.toggle("oculto");
            btnToggleEstudio.innerText = seccionFormEstudio.classList.contains("oculto")
                ? " Abrir Carga de Estudios"
                : " Cerrar Carga de Estudios";
        };
        const btnToggleCatalogo = document.getElementById("btnToggleCatalogo");
        const seccionCatalogo = document.getElementById("seccionCatalogo");
        btnToggleCatalogo.onclick = () => {
            seccionCatalogo.classList.toggle("oculto");
            btnToggleCatalogo.innerText = seccionCatalogo.classList.contains("oculto")
                ? "➕ Abrir Estudios Disponibles"
                : "➖ Cerrar Estudios Disponibles";
        };
        const btnTogglePaciente = document.getElementById("btnToggleFormPaciente");
        const seccionFormPaciente = document.getElementById("seccionFormPaciente");
        btnTogglePaciente.onclick = () => {
            seccionFormPaciente.classList.toggle("oculto");
            btnTogglePaciente.innerText = seccionFormPaciente.classList.contains("oculto")
                ? " Abrir Registro de Paciente"
                : " Cerrar Registro de Paciente";
        };
        this.tablaListos.addEventListener("click", (e) => {
            const target = e.target;
            (target.classList.contains("btn-despacho") && this.manejadorDespacharOrden) &&
                this.manejadorDespacharOrden(target.dataset.id, target.dataset.metodo);
        });
        this.tablaEspera.addEventListener("click", (e) => {
            const target = e.target.closest("button");
            target && target.dataset.id && (() => {
                const id = target.dataset.id;
                target.classList.contains("btn-eliminar-orden") && this.manejadorEliminarOrdenEspera && this.manejadorEliminarOrdenEspera(id);
                target.classList.contains("btn-editar-orden") && this.manejadorEditarOrdenEspera && this.manejadorEditarOrdenEspera(id);
            })();
        });
        this.contenedorEstudios.addEventListener("change", () => {
            this.manejadorCambioChecks && this.manejadorCambioChecks();
        });
        const btnEspera = document.getElementById("btnVerEspera");
        const btnListos = document.getElementById("btnVerListos");
        btnEspera.onclick = () => {
            btnEspera.classList.add("active");
            btnListos.classList.remove("active");
            this.tablaEspera.classList.remove("oculto");
            this.tablaListos.classList.add("oculto");
        };
        btnListos.onclick = () => {
            btnListos.classList.add("active");
            btnEspera.classList.remove("active");
            this.tablaListos.classList.remove("oculto");
            this.tablaEspera.classList.add("oculto");
        };
        const inputBuscar = document.getElementById("pac_buscarEstudioInput");
        inputBuscar && inputBuscar.addEventListener("input", () => {
            const texto = inputBuscar.value.trim().toLowerCase();
            const tarjetas = this.contenedorEstudios.querySelectorAll(".chk-wrapper");
            tarjetas.forEach((tarjeta) => {
                tarjeta.classList.toggle("oculto", !tarjeta.textContent.toLowerCase().includes(texto));
            });
        });
        const inputBandeja = document.getElementById("input_buscarBandeja");
        inputBandeja && inputBandeja.addEventListener("input", () => {
            this.manejadorFiltrarBandeja && this.manejadorFiltrarBandeja(inputBandeja.value);
        });
        this.inSexo.addEventListener("change", () => {
            this.manejadorCambioChecks && this.manejadorCambioChecks();
            this.cbCambioFiltro && this.cbCambioFiltro();
        });
        const btnExportar = document.getElementById("btn_exportarCaja");
        btnExportar && btnExportar.addEventListener("click", () => {
            this._cbExportarCaja && this._cbExportarCaja();
        });
    }
    setCedula(valor) {
        this.inCedula && (this.inCedula.value = valor);
    }
    setCedulaRep(valor) {
        this.inCedulaRep && (this.inCedulaRep.value = valor);
    }
    onCambioEsMenor(callback) {
        this.chkEsMenor.addEventListener("change", () => callback(this.chkEsMenor.checked));
    }
    mostrarBloqueRepresentante(esMenor) {
        const bloqueRep = document.getElementById("adm_bloqueRepresentante");
        const bloqueCedula = document.getElementById("adm_bloqueCedulaPrincipal");
        bloqueRep && bloqueRep.classList.toggle("oculto", !esMenor);
        bloqueCedula && bloqueCedula.classList.toggle("oculto", esMenor);
    }
    limpiarCamposCedula() {
        this.inCedula.value = "";
        this.inCedulaRep.value = "";
        this.inNombreRep.value = "";
        this.inApellidoRep.value = "";
    }
    ocultarTarjetasEstudio(idsAocultar) {
        const tarjetas = this.contenedorEstudios.querySelectorAll(".chk-wrapper");
        tarjetas.forEach((tarjeta) => {
            const input = tarjeta.querySelector(".chk-estudio");
            tarjeta.classList.toggle("oculto", !!(input && idsAocultar.includes(input.value)));
        });
    }
    marcarEstudiosPorId(ids) {
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio");
        checkboxes.forEach(chk => {
            chk.checked = ids.includes(chk.value);
        });
    }
    get isMenor() {
        return this.chkEsMenor.checked;
    }
    get pacCedulaRep() {
        this.inCedulaRep.value = this.inCedulaRep.value.trim().toUpperCase();
        return this.inCedulaRep.value;
    }
    get pacNombreRep() {
        this.inNombreRep.value = this.inNombreRep.value.trim();
        return this.inNombreRep.value;
    }
    get pacApellidoRep() {
        this.inApellidoRep.value = this.inApellidoRep.value.trim();
        return this.inApellidoRep.value;
    }
    get pacCedula() {
        this.inCedula.value = this.inCedula.value.trim();
        return this.inCedula.value;
    }
    get pacNombre() {
        return this.inNombre.value.trim();
    }
    get pacApellido() {
        return this.inApellido.value.trim();
    }
    get pacFechaNac() {
        return this.inFechaNac.value.trim();
    }
    get pacSexo() {
        return this.inSexo.value.trim();
    }
    get pacTelefono() {
        return this.inTelefono.value.trim();
    }
    get pacCorreo() {
        return this.inCorreo.value.trim();
    }
    get pacMetodoPago() {
        return this.inMetodoPago.value.trim();
    }
    get nuevaTasa() {
        return parseFloat(this.inTasa.value.trim()) || 0;
    }
    get estId() {
        return this.inEstId.value.trim().toUpperCase();
    }
    get estNombre() {
        return this.inEstNombre.value.trim();
    }
    get estPrecio() {
        return parseFloat(this.inEstPrecio.value.trim()) || 0;
    }
    get estTiempo() {
        return parseInt(this.inEstTiempo.value.trim(), 10) || 0;
    }
    get estUnidad() {
        return this.inEstUnidad.value.trim();
    }
    get estRango() {
        return this.inEstRango.value.trim();
    }
    get fechaReporteExamen() {
        return this.inFechaReporteExamen ? this.inFechaReporteExamen.value : "";
    }
    get nombreReporteExamen() {
        return this.inNombreReporteExamen ? this.inNombreReporteExamen.value : "";
    }
    onCambioFiltrosReporteExamen(callback) {
        const handler = () => callback(this.nombreReporteExamen, this.fechaReporteExamen);
        this.inFechaReporteExamen && this.inFechaReporteExamen.addEventListener("change", handler);
        this.inNombreReporteExamen && this.inNombreReporteExamen.addEventListener("input", handler);
    }
    setCantidadExamen(cantidad) {
        this.lblCantidadExamen && (this.lblCantidadExamen.innerText = cantidad.toString());
    }
    getEstudiosSeleccionados() {
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio:checked");
        return Array.from(checkboxes).map(chk => chk.value);
    }
    onActualizarTasa(callback) {
        this.btTasa.onclick = callback;
    }
    onOriginalesUrl(callback) { callback(); }
    onAgregarEstudio(callback) {
        this.formEstudio.onsubmit = (e) => { e.preventDefault(); callback(); };
    }
    onRegistrarOrden(callback) {
        this.formPaciente.onsubmit = (e) => { e.preventDefault(); callback(); };
    }
    onEliminarEstudio(callback) {
        this.manejadorEliminarEstudio = callback;
    }
    onDespacharOrden(callback) {
        this.manejadorDespacharOrden = callback;
    }
    onCambioChecks(callback) {
        this.manejadorCambioChecks = callback;
    }
    onBuscarCedulaPaciente(callback) {
        const btn = document.getElementById("btn_buscarCedula");
        btn && (btn.onclick = () => callback(this.inCedula.value.trim()));
        const btnRep = document.getElementById("btn_buscarCedulaRep");
        btnRep && (btnRep.onclick = () => callback(this.inCedulaRep.value.trim()));
        this.inCedula.addEventListener("keydown", (e) => {
            (e.key === "Enter") && (() => {
                e.preventDefault();
                callback(this.inCedula.value.trim());
            })();
        });
        this.inCedulaRep.addEventListener("keydown", (e) => {
            (e.key === "Enter") && (() => {
                e.preventDefault();
                callback(this.inCedulaRep.value.trim());
            })();
        });
    }
    onInputCedula(callback) {
        this.inCedula.addEventListener("input", () => callback(this.inCedula.value));
    }
    onInputCedulaRep(callback) {
        this.inCedulaRep.addEventListener("input", () => callback(this.inCedulaRep.value));
    }
    onEliminarOrdenEspera(callback) {
        this.manejadorEliminarOrdenEspera = callback;
    }
    onEditarOrdenEspera(callback) {
        this.manejadorEditarOrdenEspera = callback;
    }
    onCancelarEdicion(callback) {
        this.btnCancelarEdicion.addEventListener("click", callback);
    }
    onExportarCaja(callback) {
        this._cbExportarCaja = callback;
    }
    setTasaActual(tasa) {
        this.inTasa && (this.inTasa.value = tasa.toString());
        const lbl = document.getElementById("pedido_lblTasa");
        lbl && (lbl.innerText = tasa.toFixed(2));
    }
    setTotalesFactura(totalUsd, totalBs, horaRetiro) {
        this.lblTotalUSD.innerText = totalUsd.toFixed(2);
        this.lblTotalBs.innerText = totalBs.toFixed(2);
        this.lblHoraEntrega.innerText = horaRetiro;
    }
    renderizarEstudiosDisponibles(estudios) {
        this.contenedorEstudios.innerHTML = estudios.length === 0 ? "<div>No hay estudios en catálogo.</div>" : "";
        const fragmento = document.createDocumentFragment();
        estudios.forEach(e => {
            const div = document.createElement("div");
            div.className = `chk-wrapper`;
            div.innerHTML = `
        <label>
          <input type="checkbox" class="chk-estudio" value="${e.id}" data-precio="${e.precio}" data-tiempo="${e.tiempoProcesamiento}">
          <span><b>${e.codigo || e.id}</b> - ${e.nombre} (<span>${e.precio}$</span>)</span>
        </label>
      `;
            fragmento.appendChild(div);
        });
        this.contenedorEstudios.appendChild(fragmento);
    }
    renderizarListaCatalogo(estudios) {
        this.listaCatalogo.innerHTML = estudios.length === 0 ? "<li>Catálogo vacío.</li>" : "";
        const fragmento = document.createDocumentFragment();
        estudios.forEach(e => {
            const li = document.createElement("li");
            li.className = "prod-item";
            li.innerHTML = `
        <span>🔬 <b>${e.codigo || e.id}</b> - ${e.nombre} (${e.precio}$)</span>
        <button class="btn-del" data-id="${e.id}">🗑️</button>
      `;
            fragmento.appendChild(li);
            li.querySelector(".btn-del")?.addEventListener("click", () => this.manejadorEliminarEstudio?.(e.id));
        });
        this.listaCatalogo.appendChild(fragmento);
    }
    renderizarOrdenesEspera(ordenes) {
        this._renderizarTarjetasEspera(ordenes);
    }
    _renderizarTarjetasEspera(ordenes) {
        this.tablaEspera.innerHTML = ordenes.length === 0 ? "No hay órdenes en espera." : "";
        ordenes.length > 0 && (() => {
            const fragmento = document.createDocumentFragment();
            ordenes.forEach(o => {
                const cedulaAPintar = (!o.cedula || o.cedula.trim() === "") ? "MENOR" : o.cedula;
                let badgeEspera = "";
                o.fechaRegistro && (() => {
                    const minutos = o.obtenerMinutosEspera();
                    (minutos >= 0) && (() => {
                        const esUrgente = minutos >= 60;
                        const textoTiempo = minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
                        badgeEspera = `<span class="badge-espera ${esUrgente ? "urgente" : ""}">⏱️ ${textoTiempo}</span>`;
                    })();
                })();
                const div = document.createElement("div");
                div.className = "resultado-busqueda";
                div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <b>Orden ${o.id}</b> - C.I: ${cedulaAPintar} ${badgeEspera}
              <br><small>${o.apellido} ${o.nombre} [${o.examenesSolicitados}]</small>
              <br><span class="badge">EN ESPERA</span>
            </div>
            <div style="display:flex; gap:5px;">
              <button class="btn-editar-orden" data-id="${o.id}" style="cursor:pointer; background:none; border:none; font-size:16px;" title="Editar Teléfono y Correo">✏️</button>
              <button class="btn-eliminar-orden" data-id="${o.id}" style="cursor:pointer; background:none; border:none; font-size:16px;" title="Eliminar Orden">🗑️</button>
            </div>
          </div>
        `;
                fragmento.appendChild(div);
            });
            this.tablaEspera.appendChild(fragmento);
            this.tablaEspera.querySelectorAll(".btn-editar-orden").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.dataset.id;
                    this.manejadorEditarOrdenEspera?.(id);
                });
            });
            this.tablaEspera.querySelectorAll(".btn-eliminar-orden").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.dataset.id;
                    this.manejadorEliminarOrdenEspera?.(id);
                });
            });
        })();
    }
    renderizarOrdenesListas(ordenes) {
        this._renderizarTarjetasListas(ordenes);
    }
    _renderizarTarjetasListas(ordenes) {
        this.tablaListos.innerHTML = ordenes.length === 0 ? "<p class='vacio-texto'>No hay resultados listos.</p>" : "";
        ordenes.forEach(o => {
            const cedulaAPintar = (!o.cedula || o.cedula.trim() === "") ? "MENOR" : o.cedula;
            const div = document.createElement("div");
            div.className = "tarjeta-paciente-lista";
            div.innerHTML = `
        <div class="paciente-info-bloque">
          <div class="paciente-cabecera-linea">
            <span class="orden-check"></span>
            <span class="orden-numero">Orden ${o.id}</span>
            <span class="paciente-nombre">${o.apellido} ${o.nombre} C.I: ${cedulaAPintar}</span>
          </div>
          <div class="paciente-estudios-linea">
            <span>${o.examenesSolicitados}</span>
          </div>
        </div>
        <div class="grupo-botones-despacho-rediseñado">
          <button class="btn-despacho btn-pdf-medico"   data-id="${o.id}" data-metodo="Impreso" >Imprimir</button>
          <button class="btn-despacho btn-ws-medico"    data-id="${o.id}" data-metodo="WhatsApp">WhatsApp</button>
          <button class="btn-despacho btn-email-medico" data-id="${o.id}" data-metodo="Correo"  >Correo</button>
        </div>
      `;
            this.tablaListos.appendChild(div);
        });
        this.tablaListos.querySelectorAll(".btn-despacho").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const metodo = btn.dataset.metodo;
                this.manejadorDespacharOrden?.(id, metodo);
            });
        });
    }
    renderizarEstadisticas(datos) {
        document.getElementById("rep_totalPacientes").innerText = datos.totalPacientes.toString();
        document.getElementById("rep_totalUSD").innerText = `${datos.totalUsd.toFixed(2)} $`;
        document.getElementById("rep_totalBs").innerText = `${datos.totalBs.toFixed(2)} Bs`;
        document.getElementById("rep_estudioTop").innerText = datos.estudioMasSolicitado;
    }
    mostrarToast(mensaje, tipo) {
        const iconos = { exito: "✓", error: "✗", info: "i", advertencia: "!" };
        const toast = document.createElement("div");
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
        this.toastContainer.appendChild(toast);
        void toast.offsetWidth;
        toast.classList.add("visible");
        setTimeout(() => {
            toast.classList.remove("visible");
            toast.addEventListener("transitionend", () => toast.remove());
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
    mostrarSpinner() {
        this.spinnerOverlay.classList.remove("oculto");
    }
    ocultarSpinner() {
        this.spinnerOverlay.classList.add("oculto");
    }
    autocompletarPaciente(orden, esMenor) {
        this.chkEsMenor.checked = esMenor;
        this.mostrarBloqueRepresentante(esMenor);
        this.inCedulaRep.value = esMenor ? orden.cedulaRepresentante : "";
        this.inNombreRep.value = esMenor ? orden.nombreRepresentante : "";
        this.inApellidoRep.value = esMenor ? orden.apellidoRepresentante : "";
        this.inCedula.value = esMenor ? "" : orden.cedula;
        this.inNombre.value = esMenor ? "" : orden.nombre;
        this.inApellido.value = orden.apellido;
        this.inFechaNac.value = esMenor ? "" : orden.fechaRegistroISO;
        this.inSexo.value = orden.sexo;
        this.inTelefono.value = orden.telefono;
        this.inCorreo.value = orden.correo;
        this.inMetodoPago.value = orden.metodoPago;
    }
    bloquearInputsPaciente(bloquear) {
        this.chkEsMenor.disabled = bloquear;
        this.inCedula.disabled = bloquear;
        this.inCedulaRep.disabled = bloquear;
        this.inNombre.disabled = bloquear;
        this.inNombreRep.disabled = bloquear;
        this.inApellido.disabled = bloquear;
        this.inApellidoRep.disabled = bloquear;
        this.inFechaNac.disabled = bloquear;
        this.inSexo.disabled = bloquear;
        this.inTelefono.disabled = bloquear;
        this.inCorreo.disabled = bloquear;
        this.inMetodoPago.disabled = bloquear;
        const btnBuscar = document.getElementById("btn_buscarCedula");
        btnBuscar && (btnBuscar.disabled = bloquear);
        const btnBuscarRep = document.getElementById("btn_buscarCedulaRep");
        btnBuscarRep && (btnBuscarRep.disabled = bloquear);
    }
    prepararEdicionOrden(orden) {
        this.bloquearInputsPaciente(true);
        this.manejadorCambioChecks && this.manejadorCambioChecks();
        this.btnProcesarOrden.innerText = "💾 Guardar Cambios";
        this.btnProcesarOrden.classList.add("modo-edicion");
        this.btnCancelarEdicion.classList.remove("oculto");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.mostrarToast(`Modo edición activado para la Orden #${orden.id}`, "info");
    }
    mostrarHistorialPaciente(ordenes) {
        const panel = document.getElementById("panel-historial-paciente");
        panel && (() => {
            panel.classList.toggle("oculto", ordenes.length === 0);
            ordenes.length > 0 && (() => {
                panel.innerHTML = `<h4>📋 Historial del paciente (${ordenes.length} visita${ordenes.length > 1 ? "s" : ""})</h4>`;
                ordenes.forEach(o => {
                    const item = document.createElement("div");
                    item.className = "historial-item";
                    item.innerHTML = `
            <span class="historial-fecha">${o.fechaRegistro ? o.fechaRegistro.split(" ")[0] : "-"}</span>
            <span>🔬 ${o.examenesSolicitados}</span>
            <span style="margin-left:auto; font-weight:700;">$${o.montoTotal$.toFixed(2)}</span>
          `;
                    panel.appendChild(item);
                });
            })();
        })();
    }
    imprimirReporteResultados(orden) {
        const html = this.generarHtmlReporteResultados(orden);
        this.abrirVentanaEImprimir(html);
    }
    imprimirReporteCaja(laboratorio) {
        const html = this.generarHtmlReporteCaja(laboratorio);
        this.abrirVentanaEImprimir(html);
    }
    abrirVentanaEImprimir(html) {
        const ventana = window.open("", "_blank");
        ventana && (() => {
            ventana.document.write(html);
            ventana.document.close();
            ventana.focus();
            ventana.print();
            setTimeout(() => ventana.close(), 500);
        })();
    }
    generarHtmlReporteResultados(orden) {
        const titulo = `Reporte de Resultados - Orden #${orden.id}`;
        const cedulaFormateada = (orden.cedula !== "MENOR" && !orden.cedula.startsWith("V-") && !orden.cedula.startsWith("CR"))
            ? "V-" + orden.cedula
            : orden.cedula;
        return `
<!DOCTYPE html>
<html lang="es">
<head>
<title>${titulo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Arial', sans-serif; }
  body { padding: 40px 50px; color: #000; background: #fff; font-size: 13px; line-height: 1.4; }
  .cabecera-logo-seccion { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
  .logo-texto { font-size: 38px; font-weight: 900; font-style: italic; font-family: 'Arial Black', sans-serif; color: #000; line-height: 1; }
  .fecha-bloque { font-size: 14px; text-align: right; font-weight: bold; margin-top: 15px; }
  .datos-paciente-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; font-size: 13px; font-weight: bold; margin-top: 25px; margin-bottom: 5px; }
  .linea-separadora-principal { border-bottom: 2px solid #000; margin-bottom: 25px; margin-top: 5px; }
  .bloque-examen-contenedor { margin-bottom: 30px; }
  .titulo-examen-categoria { font-size: 13px; font-weight: bold; padding-bottom: 3px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.3px; }
  .tabla-medica-interna { width: 100%; border-collapse: collapse; margin-bottom: 5px; table-layout: fixed; }
  .tabla-medica-interna th { font-weight: normal; font-size: 12px; text-align: left; padding-bottom: 8px; }
  .tabla-medica-interna td { padding: 5px 0; vertical-align: top; }
  .col-parametro { width: 45%; padding-left: 10px; }
  .col-resultado { width: 15%; text-align: left; }
  .col-unidad-ref { width: 40%; text-align: left; color: #000; }
  .texto-alterado-alerta { color: #dc2626 !important; font-weight: bold !important; }
  .nota-verificacion { font-size: 11px; font-weight: bold; margin-top: 12px; padding-left: 10px; text-transform: uppercase; }
  .nota-sociedad-medica { font-size: 11px; font-weight: bold; color: #000; margin-top: 25px; text-align: justify; max-width: 95%; line-height: 1.3; }
  .pie-pagina-fijo { position: fixed; bottom: 40px; left: 50px; right: 50px; }
  .hora-sistema { text-align: right; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
  .tabla-firmas-estructura { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; font-weight: bold; border-top: 1px solid #000; }
  .tabla-firmas-estructura td { width: 33.33%; padding-top: 6px; vertical-align: top; border-right: 1px solid #000; }
  .tabla-firmas-estructura td:last-child { border-right: none; }
  .cargo-sub { font-size: 10px; color: #475569; font-weight: normal; margin-top: 2px; text-transform: uppercase; }
</style>
</head>
<body>
<div class="cabecera-logo-seccion">
  <div><div class="logo-texto">Git Force<span style="font-size:16px;font-style:normal;font-weight:bold;margin-left:2px;">C.A.</span></div></div>
  <div class="fecha-bloque">Fecha: &nbsp; ${orden.fechaRegistro ? orden.fechaRegistro.split(" ")[0] : new Date().toLocaleDateString()}</div>
</div>
<div class="datos-paciente-grid">
  <div>Paciente: &nbsp; ${orden.apellido.toUpperCase()} ${orden.nombre.toUpperCase()}</div>
  <div>Edad: &nbsp; ${orden.edad}</div>
  <div>C.I: &nbsp; ${cedulaFormateada}</div>
</div>
<div class="datos-paciente-grid" style="margin-top:0px;margin-bottom:10px;">
  <div>Orden: &nbsp; ${orden.id}</div>
</div>
<div class="linea-separadora-principal"></div>
<div class="cuerpo-reporte-estudios">
  <div class="bloque-examen-contenedor">
    <div class="titulo-examen-categoria">${orden.examenesSolicitados.toUpperCase()}</div>
    <table class="tabla-medica-interna">
      <thead>
        <tr>
          <th class="col-parametro"></th>
          <th class="col-resultado"></th>
          <th class="col-unidad-ref" style="font-weight:bold;color:#000;">Intervalos de Referencia</th>
        </tr>
      </thead>
      <tbody>
        ${orden.resultados.map((r) => {
            const esAlterado = r.resultado && r.resultado.includes("*");
            return `
            <tr>
              <td class="col-parametro">${r.parametro}</td>
              <td class="col-resultado ${esAlterado ? "texto-alterado-alerta" : ""}">${r.resultado}</td>
              <td class="col-unidad-ref">${r.unidad} I.R. ${r.rangoReferencia} ${r.unidad}</td>
            </tr>`;
        }).join("")}
      </tbody>
    </table>
    <div class="nota-verificacion">*RESULTADOS VERIFICADOS.</div>
  </div>
  <div class="bloque-examen-contenedor">
    <p class="nota-sociedad-medica">
      Los valores de referencia sugeridos para las pruebas analíticas han sido propuestos en concordancia con los lineamientos internacionales de la IFCC y la Sociedad Venezolana de Bioanalistas Especialistas, conforme a los últimos estudios clínicos automatizados. Para una correcta interpretación clínica consulte a su médico especialista.
    </p>
  </div>
</div>
<div class="pie-pagina-fijo">
  <div class="hora-sistema">Hora Entrada al Sistema: &nbsp; ${orden.fechaRegistro ? orden.fechaRegistro.split(" ")[1] || "08:00 AM" : "08:00 AM"}</div>
  <table class="tabla-firmas-estructura">
    <tbody>
      <tr>
        <td>${orden.licBioanalista ? orden.licBioanalista.toUpperCase() : "MIRNA MAHMUD"}<br><span class="cargo-sub">Lcda. en Bioanálisis</span></td>
        <td>JOSEFINA PEREZ<br><span class="cargo-sub">Transcrito por</span></td>
        <td>JOSEFINA PEREZ<br><span class="cargo-sub">Revisado por</span></td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>`;
    }
    generarHtmlReporteCaja(laboratorio) {
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const totalPacientes = laboratorio.calcularTotalPacientesAtendidos();
        const estudioTop = laboratorio.obtenerEstudioMasSolicitado();
        const tasa = laboratorio.tasaCambio;
        const totalUsd = laboratorio.calcularMontoTotalUsd();
        const totalBs = laboratorio.calcularMontoTotalBs();
        const titulo = `Cierre de Caja - ${fecha}`;
        return `
<!DOCTYPE html>
<html lang="es">
<head>
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
    body { padding: 50px; color: #000; font-size: 14px; }
    h1 { font-size: 26px; font-weight: 900; font-style: italic; margin-bottom: 4px; }
    .subtitulo { font-size: 13px; color: #64748b; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #0f172a; color: white; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .monto { font-weight: 700; font-size: 15px; }
    .pie { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <h1>Git Force <span style="font-size:14px;font-style:normal;">C.A.</span></h1>
  <p class="subtitulo">Cierre de Caja — ${fecha} a las ${hora}</p>
  <table>
    <thead>
      <tr>
        <th>Concepto</th>
        <th>Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Pacientes Atendidos</td><td class="monto">${totalPacientes}</td></tr>
      <tr><td>Examen Más Solicitado</td><td class="monto">${estudioTop}</td></tr>
      <tr><td>Tasa del Día (Bs/$)</td><td class="monto">${tasa.toFixed(2)} Bs</td></tr>
      <tr><td>Total Ingresos (USD)</td><td class="monto" style="color:#059669;">$ ${totalUsd.toFixed(2)}</td></tr>
      <tr><td>Total Ingresos (Bs)</td><td class="monto" style="color:#0284c7;">${totalBs.toFixed(2)} Bs</td></tr>
    </tbody>
  </table>
  <p class="pie">Generado por el Sistema de Laboratorio Git Force C.A. — © 2026 UCLA DCyT</p>
</body>
</html>`;
    }
    limpiarFormPaciente() {
        this.formPaciente.reset();
        this.setTotalesFactura(0, 0, "");
        const panel = document.getElementById("panel-historial-paciente");
        panel && panel.classList.add("oculto");
        document.getElementById("adm_bloqueRepresentante")?.classList.add("oculto");
        document.getElementById("adm_bloqueCedulaPrincipal")?.classList.remove("oculto");
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio");
        checkboxes.forEach(chk => {
            chk.checked = false;
        });
        this.bloquearInputsPaciente(false);
        this.btnProcesarOrden && (() => {
            this.btnProcesarOrden.innerText = "💳 Confirmar Facturación y Procesar Orden";
            this.btnProcesarOrden.classList.remove("modo-edicion");
        })();
        this.btnCancelarEdicion && this.btnCancelarEdicion.classList.add("oculto");
    }
    limpiarFormEstudio() {
        this.formEstudio.reset();
    }
    onFiltrarEstudiosBusqueda(callback) {
        const inputBuscar = document.getElementById("pac_buscarEstudioInput");
        inputBuscar && (inputBuscar.oninput = () => callback(inputBuscar.value.trim()));
    }
    get textoBusquedaBandeja() {
        const input = document.getElementById("input_buscarBandeja");
        return input ? input.value.trim() : "";
    }
    onFiltrarBandeja(callback) {
        this.manejadorFiltrarBandeja = callback;
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
    onFiltrosReporteGralCambio(callback) {
        const handler = () => {
            callback({
                examen: this.repFiltroExamen?.value || "",
                fechaDesde: this.repFiltroFechaDesde?.value || "",
                fechaHasta: this.repFiltroFechaHasta?.value || "",
                paciente: this.repFiltroPaciente?.value || ""
            });
        };
        this.repFiltroExamen && this.repFiltroExamen.addEventListener("input", handler);
        this.repFiltroFechaDesde && this.repFiltroFechaDesde.addEventListener("change", handler);
        this.repFiltroFechaHasta && this.repFiltroFechaHasta.addEventListener("change", handler);
        this.repFiltroPaciente && this.repFiltroPaciente.addEventListener("input", handler);
    }
    renderizarReporteExamenes(datos) {
        this.tbodyReporteExamenes && (() => {
            this.tbodyReporteExamenes.innerHTML = datos.length === 0
                ? `<tr><td colspan="2" style="text-align:center; padding:15px;">No se encontraron exámenes.</td></tr>`
                : "";
            datos.length > 0 && (() => {
                const fragmento = document.createDocumentFragment();
                datos.forEach(row => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
            <td>${row.examen}</td>
            <td style="text-align:center;"><strong>${row.cantidad}</strong></td>
          `;
                    fragmento.appendChild(tr);
                });
                this.tbodyReporteExamenes.appendChild(fragmento);
            })();
        })();
    }
    renderizarReporteSemana(ordenes) {
        const tbody = document.getElementById("tbody_reporte_semana");
        const lblTotal = document.getElementById("rep_semana_total");
        if (!tbody)
            return;
        if (lblTotal)
            lblTotal.innerText = ordenes.length.toString();
        if (ordenes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">✅ No hay órdenes con más de una semana en el sistema.</td></tr>`;
            return;
        }
        const ahora = new Date();
        const fragmento = document.createDocumentFragment();
        ordenes.forEach((o) => {
            const cedulaAPintar = (!o.cedula || o.cedula.trim() === "") ? "MENOR" : o.cedula;
            let diasTexto = "-";
            try {
                const normalizado = o.fechaRegistro.replace(",", "").trim();
                const partes = normalizado.split(" ");
                const seg = partes[0].split("/");
                const dia = parseInt(seg[0], 10);
                const mes = parseInt(seg[1], 10) - 1;
                const anio = parseInt(seg[2], 10);
                const fechaOrden = new Date(anio, mes, dia);
                const diffMs = ahora.getTime() - fechaOrden.getTime();
                const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                diasTexto = `${dias} día${dias !== 1 ? "s" : ""}`;
            }
            catch { }
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td><strong>#${o.id}</strong></td>
        <td>${o.apellido} ${o.nombre}</td>
        <td>${cedulaAPintar}</td>
        <td>${o.fechaRegistro ? o.fechaRegistro.split(" ")[0] : "-"}</td>
        <td style="color:#ef4444; font-weight:700;">${diasTexto}</td>
        <td style="font-size:0.82rem;">${o.examenesSolicitados}</td>
        <td><span class="badge" style="${o.status === 'Listo para Despacho' ? 'background:#059669;color:#fff;' : ''}">${o.status}</span></td>
      `;
            fragmento.appendChild(tr);
        });
        tbody.innerHTML = "";
        tbody.appendChild(fragmento);
    }
    onExportarReporteSemana(callback) {
        const btn = document.getElementById("btn_reporte_semana_imprimir");
        btn && (btn.onclick = callback);
    }
    imprimirReporteSemana(ordenes) {
        const html = this.generarHtmlReporteSemana(ordenes);
        this.abrirVentanaEImprimir(html);
    }
    generarHtmlReporteSemana(ordenes) {
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const ahora = new Date();
        const filas = ordenes.map((o) => {
            const cedulaAPintar = (!o.cedula || o.cedula.trim() === "") ? "MENOR" : o.cedula;
            let diasTexto = "-";
            try {
                const normalizado = o.fechaRegistro.replace(",", "").trim();
                const partes = normalizado.split(" ");
                const seg = partes[0].split("/");
                const dia = parseInt(seg[0], 10);
                const mes = parseInt(seg[1], 10) - 1;
                const anio = parseInt(seg[2], 10);
                const fechaOrden = new Date(anio, mes, dia);
                const dias = Math.floor((ahora.getTime() - fechaOrden.getTime()) / (1000 * 60 * 60 * 24));
                diasTexto = `${dias} día${dias !== 1 ? "s" : ""}`;
            }
            catch { }
            return `
        <tr>
          <td>#${o.id}</td>
          <td>${o.apellido} ${o.nombre}</td>
          <td>${cedulaAPintar}</td>
          <td>${o.fechaRegistro ? o.fechaRegistro.split(" ")[0] : "-"}</td>
          <td style="color:#dc2626; font-weight:700;">${diasTexto}</td>
          <td>${o.examenesSolicitados}</td>
          <td>${o.status}</td>
        </tr>`;
        }).join("");
        return `
<!DOCTYPE html>
<html lang="es">
<head>
  <title>Reporte - Órdenes con más de una semana</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
    body { padding: 50px; color: #000; font-size: 13px; }
    h1 { font-size: 24px; font-weight: 900; font-style: italic; }
    .subtitulo { font-size: 12px; color: #64748b; margin-bottom: 6px; }
    .alerta-criterio { font-size: 12px; background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:8px 12px; border-radius:6px; margin-bottom:20px; display:inline-block; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #0f172a; color: white; padding: 9px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .pie { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>Git Force <span style="font-size:13px;font-style:normal;">C.A.</span></h1>
  <p class="subtitulo">Reporte de Órdenes con más de una semana en el sistema — ${fecha} a las ${hora}</p>
  <p class="alerta-criterio">⚠️ Criterio: fecha de registro anterior a hace 7 días (> ${fecha})</p>
  <p style="margin-bottom:10px; font-size:13px;"><strong>Total de registros: ${ordenes.length}</strong></p>
  <table>
    <thead>
      <tr>
        <th>N° Orden</th>
        <th>Paciente</th>
        <th>C.I.</th>
        <th>Fecha Registro</th>
        <th>Días en Sistema</th>
        <th>Exámenes Solicitados</th>
        <th>Estatus</th>
      </tr>
    </thead>
    <tbody>
      ${filas}
    </tbody>
  </table>
  <p class="pie">Generado por el Sistema de Laboratorio Git Force C.A. — © 2026 UCLA DCyT</p>
</body>
</html>`;
    }
}
//# sourceMappingURL=Cl_vLaboratorio.js.map