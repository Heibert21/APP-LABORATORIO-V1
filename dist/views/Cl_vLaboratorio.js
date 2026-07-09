export default class Cl_vLaboratorio {
    // --- Elementos del DOM (Formulario Registro de Pacientes) ---
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
    // --- Elementos del DOM (Configuración y Catálogo de Exámenes) ---
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
    // --- Elementos del DOM (Bandejas de Monitoreo y Facturación) ---
    tablaEspera;
    tablaListos;
    lblTotalUSD;
    lblTotalBs;
    lblHoraEntrega;
    toastContainer;
    spinnerOverlay;
    // --- Elementos del DOM (Reportes Específicos Dinámicos) ---
    // Inputs para nombre y fecha del examen, y etiqueta de resultado numérico
    inFechaReporteExamen;
    inNombreReporteExamen;
    lblCantidadExamen;
    // --- Elementos del DOM (Reporte Histórico Dinámico de Exámenes) ---
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
    // Se usa para filtrar la bandeja
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
        // Inicialización Elementos Reporte Histórico
        this.repFiltroExamen = document.getElementById("rep_filtro_examen");
        this.repFiltroFechaDesde = document.getElementById("rep_filtro_fecha_desde");
        this.repFiltroFechaHasta = document.getElementById("rep_filtro_fecha_hasta");
        this.repFiltroPaciente = document.getElementById("rep_filtro_paciente");
        this.tbodyReporteExamenes = document.getElementById("tbody_reporte_examenes");
        // Se setea la fecha actual para el reporte
        this.inFechaReporteExamen && (() => {
            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
            this.inFechaReporteExamen.value = localISOTime;
        })();
        //mostrar formulario de estudios disponibles
        const btnToggleEstudio = document.getElementById("btnToggleFormEstudio");
        const seccionFormEstudio = document.getElementById("seccionFormEstudio");
        btnToggleEstudio.onclick = () => {
            seccionFormEstudio.classList.toggle("oculto");
            btnToggleEstudio.innerText = seccionFormEstudio.classList.contains("oculto")
                ? " Abrir Carga de Estudios"
                : " Cerrar Carga de Estudios";
        };
        //mostrar lista de estudios disponibles (catálogo)
        const btnToggleCatalogo = document.getElementById("btnToggleCatalogo");
        const seccionCatalogo = document.getElementById("seccionCatalogo");
        btnToggleCatalogo.onclick = () => {
            seccionCatalogo.classList.toggle("oculto");
            btnToggleCatalogo.innerText = seccionCatalogo.classList.contains("oculto")
                ? "➕ Abrir Estudios Disponibles"
                : "➖ Cerrar Estudios Disponibles";
        };
        //mostrar formulario de pacientes
        const btnTogglePaciente = document.getElementById("btnToggleFormPaciente");
        const seccionFormPaciente = document.getElementById("seccionFormPaciente");
        btnTogglePaciente.onclick = () => {
            seccionFormPaciente.classList.toggle("oculto");
            btnTogglePaciente.innerText = seccionFormPaciente.classList.contains("oculto")
                ? " Abrir Registro de Paciente"
                : " Cerrar Registro de Paciente";
        };
        //despachar ordenes
        this.tablaListos.addEventListener("click", (e) => {
            const target = e.target;
            (target.classList.contains("btn-despacho") && this.manejadorDespacharOrden) &&
                this.manejadorDespacharOrden(target.dataset.id, target.dataset.metodo);
        });
        //eliminar orden de espera y editar orden de espera
        this.tablaEspera.addEventListener("click", (e) => {
            const target = e.target.closest("button");
            target && target.dataset.id && (() => {
                const id = target.dataset.id;
                target.classList.contains("btn-eliminar-orden") && this.manejadorEliminarOrdenEspera && this.manejadorEliminarOrdenEspera(id);
                target.classList.contains("btn-editar-orden") && this.manejadorEditarOrdenEspera && this.manejadorEditarOrdenEspera(id);
            })();
        });
        //cambio de checks en estudios disponibles
        this.contenedorEstudios.addEventListener("change", () => {
            this.manejadorCambioChecks && this.manejadorCambioChecks();
        });
        //cambio de filtro en estudios disponibles
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
        //buscar ordenes en espera
        const inputBandeja = document.getElementById("input_buscarBandeja");
        inputBandeja && inputBandeja.addEventListener("input", () => {
            this.manejadorFiltrarBandeja && this.manejadorFiltrarBandeja(inputBandeja.value);
        });
        //cambio de sexo en pacientes
        this.inSexo.addEventListener("change", () => {
            this.manejadorCambioChecks && this.manejadorCambioChecks();
            this.cbCambioFiltro && this.cbCambioFiltro();
        });
        //exportar caja
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
    // Metodo que permite mostrar el bloque de representante
    mostrarBloqueRepresentante(esMenor) {
        const bloqueRep = document.getElementById("adm_bloqueRepresentante");
        const bloqueCedula = document.getElementById("adm_bloqueCedulaPrincipal");
        bloqueRep && bloqueRep.classList.toggle("oculto", !esMenor);
        bloqueCedula && bloqueCedula.classList.toggle("oculto", esMenor);
    }
    // Metodo que permite limpiar los campos de cedula
    limpiarCamposCedula() {
        this.inCedula.value = "";
        this.inCedulaRep.value = "";
        this.inNombreRep.value = "";
        this.inApellidoRep.value = "";
    }
    // Metodo que permite ocultar las tarjetas de estudio
    ocultarTarjetasEstudio(idsAocultar) {
        const tarjetas = this.contenedorEstudios.querySelectorAll(".chk-wrapper");
        tarjetas.forEach((tarjeta) => {
            const input = tarjeta.querySelector(".chk-estudio");
            tarjeta.classList.toggle("oculto", !!(input && idsAocultar.includes(input.value)));
        });
    }
    // Metodo que permite marcar los estudios por ID
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
    // Getters
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
    // Getters Reportes específicos
    // Getter de la fecha del selector (formato yyyy-mm-dd)
    get fechaReporteExamen() {
        return this.inFechaReporteExamen ? this.inFechaReporteExamen.value : "";
    }
    // Getter del texto ingresado para buscar el examen (insensible a mayúsculas/minúsculas en el modelo)
    get nombreReporteExamen() {
        return this.inNombreReporteExamen ? this.inNombreReporteExamen.value : "";
    }
    // Listener que se detona tanto si se tipea el nombre del examen ("input") como si se cambia la fecha ("change")
    onCambioFiltrosReporteExamen(callback) {
        const handler = () => callback(this.nombreReporteExamen, this.fechaReporteExamen);
        this.inFechaReporteExamen && this.inFechaReporteExamen.addEventListener("change", handler);
        this.inNombreReporteExamen && this.inNombreReporteExamen.addEventListener("input", handler);
    }
    // Función para re-escribir el contador numérico en el cuadro estadístico
    setCantidadExamen(cantidad) {
        this.lblCantidadExamen && (this.lblCantidadExamen.innerText = cantidad.toString());
    }
    //obtener estudios seleccionados
    getEstudiosSeleccionados() {
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio:checked");
        return Array.from(checkboxes).map(chk => chk.value);
    }
    //actualizar tasa
    onActualizarTasa(callback) {
        this.btTasa.onclick = callback;
    }
    //obtener url originales
    onOriginalesUrl(callback) { callback(); }
    //agregar estudio
    onAgregarEstudio(callback) {
        this.formEstudio.onsubmit = (e) => { e.preventDefault(); callback(); };
    }
    //registrar orden
    onRegistrarOrden(callback) {
        this.formPaciente.onsubmit = (e) => { e.preventDefault(); callback(); };
    }
    //eliminar estudio
    onEliminarEstudio(callback) {
        this.manejadorEliminarEstudio = callback;
    }
    //despachar orden
    onDespacharOrden(callback) {
        this.manejadorDespacharOrden = callback;
    }
    //cambio de checks
    onCambioChecks(callback) {
        this.manejadorCambioChecks = callback;
    }
    //buscar cedula paciente o representante
    onBuscarCedulaPaciente(callback) {
        const btn = document.getElementById("btn_buscarCedula");
        btn && (btn.onclick = () => callback(this.inCedula.value.trim()));
        const btnRep = document.getElementById("btn_buscarCedulaRep");
        btnRep && (btnRep.onclick = () => callback(this.inCedulaRep.value.trim()));
        // Permitir buscar con Enter
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
    //eliminar orden en espera
    onEliminarOrdenEspera(callback) {
        this.manejadorEliminarOrdenEspera = callback;
    }
    //editar orden en espera
    onEditarOrdenEspera(callback) {
        this.manejadorEditarOrdenEspera = callback;
    }
    onCancelarEdicion(callback) {
        this.btnCancelarEdicion.addEventListener("click", callback);
    }
    //exportar caja
    onExportarCaja(callback) {
        this._cbExportarCaja = callback;
    }
    //establecer tasa actual
    setTasaActual(tasa) {
        this.inTasa && (this.inTasa.value = tasa.toString());
        const lbl = document.getElementById("pedido_lblTasa");
        lbl && (lbl.innerText = tasa.toFixed(2));
    }
    //establecer totales de factura
    setTotalesFactura(totalUsd, totalBs, horaRetiro) {
        this.lblTotalUSD.innerText = totalUsd.toFixed(2);
        this.lblTotalBs.innerText = totalBs.toFixed(2);
        this.lblHoraEntrega.innerText = horaRetiro;
    }
    //renderizar estudios disponibles
    renderizarEstudiosDisponibles(estudios) {
        this.contenedorEstudios.innerHTML = estudios.length === 0 ? "<div>No hay estudios en catálogo.</div>" : "";
        //optimizar renderizado
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
    //renderizar lista de estudios
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
    //renderizar ordenes en espera (REFACTORIZACIÓN MVC: Ya no almacena datos en caché local)
    renderizarOrdenesEspera(ordenes) {
        this._renderizarTarjetasEspera(ordenes);
    }
    //renderizar tarjetas de espera
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
                //crear div para cada orden en espera
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
            //eventos de botones de editar y eliminar orden en espera
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
    //renderizar ordenes listas (REFACTORIZACIÓN MVC: Ya no almacena datos en caché local)
    renderizarOrdenesListas(ordenes) {
        this._renderizarTarjetasListas(ordenes);
    }
    //renderizar tarjetas listas
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
        //eventos de botones de despacho de orden
        this.tablaListos.querySelectorAll(".btn-despacho").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const metodo = btn.dataset.metodo;
                this.manejadorDespacharOrden?.(id, metodo);
            });
        });
    }
    //renderizar estadisticas
    renderizarEstadisticas(datos) {
        document.getElementById("rep_totalPacientes").innerText = datos.totalPacientes.toString();
        document.getElementById("rep_totalUSD").innerText = `${datos.totalUsd.toFixed(2)} $`;
        document.getElementById("rep_totalBs").innerText = `${datos.totalBs.toFixed(2)} Bs`;
        document.getElementById("rep_estudioTop").innerText = datos.estudioMasSolicitado;
    }
    //mostrar toast
    mostrarToast(mensaje, tipo) {
        const iconos = { exito: "✓", error: "✗", info: "i", advertencia: "!" };
        const toast = document.createElement("div");
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
        this.toastContainer.appendChild(toast);
        // Forzar reflow para que la animación CSS se ejecute desde el estado inicial
        void toast.offsetWidth;
        toast.classList.add("visible");
        setTimeout(() => {
            toast.classList.remove("visible");
            toast.addEventListener("transitionend", () => toast.remove());
            // Fallback por si falla transitionend (ej: pestaña inactiva)
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
    //mostrar spinner
    mostrarSpinner() {
        this.spinnerOverlay.classList.remove("oculto");
    }
    //ocultar spinner
    ocultarSpinner() {
        this.spinnerOverlay.classList.add("oculto");
    }
    //autocompletar paciente
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
        // Autocompletar datos de contacto compartidos
        this.inSexo.value = orden.sexo;
        this.inTelefono.value = orden.telefono;
        this.inCorreo.value = orden.correo;
        this.inMetodoPago.value = orden.metodoPago;
    }
    // Método privado para bloquear/desbloquear datos del paciente
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
    // Preparar la orden para su edición exclusiva de exámenes
    prepararEdicionOrden(orden) {
        // REFACTORIZACIÓN MVC: La marcación de los estudios específicos ahora es orquestada
        // por el controlador, llamando a autocompletarPaciente y marcarEstudiosPorId por separado.
        // Bloquear inputs para que solo se editen los exámenes
        this.bloquearInputsPaciente(true);
        // Forzamos el recalculo de totales simulando que se cambiaron los checks
        this.manejadorCambioChecks && this.manejadorCambioChecks();
        // Cambiar botones al modo edición (azul)
        this.btnProcesarOrden.innerText = "💾 Guardar Cambios";
        this.btnProcesarOrden.classList.add("modo-edicion");
        this.btnCancelarEdicion.classList.remove("oculto");
        // Hacer scroll hacia arriba al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.mostrarToast(`Modo edición activado para la Orden #${orden.id}`, "info");
    }
    //mostrar historial del paciente
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
    //imprimir resultados
    imprimirReporteResultados(orden) {
        const html = this.generarHtmlReporteResultados(orden);
        this.abrirVentanaEImprimir(html);
    }
    //imprimir reporte de caja
    imprimirReporteCaja(laboratorio) {
        const html = this.generarHtmlReporteCaja(laboratorio);
        this.abrirVentanaEImprimir(html);
    }
    //abrir ventana e imprimir
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
    //generar html reporte resultados
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
    //generar html reporte caja
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
    //limpiar formulario paciente
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
        // Desbloquear inputs (por si veníamos de una edición)
        this.bloquearInputsPaciente(false);
        // Restaurar botones a modo creación
        this.btnProcesarOrden && (() => {
            this.btnProcesarOrden.innerText = "💳 Confirmar Facturación y Procesar Orden";
            this.btnProcesarOrden.classList.remove("modo-edicion"); // Restaurar color verde
        })();
        this.btnCancelarEdicion && this.btnCancelarEdicion.classList.add("oculto");
    }
    //limpiar formulario estudio
    limpiarFormEstudio() {
        this.formEstudio.reset();
    }
    //filtrar estudios busqueda
    onFiltrarEstudiosBusqueda(callback) {
        const inputBuscar = document.getElementById("pac_buscarEstudioInput");
        inputBuscar && (inputBuscar.oninput = () => callback(inputBuscar.value.trim()));
    }
    //obtener texto busqueda bandeja
    get textoBusquedaBandeja() {
        const input = document.getElementById("input_buscarBandeja");
        return input ? input.value.trim() : "";
    }
    //filtrar bandeja
    onFiltrarBandeja(callback) {
        this.manejadorFiltrarBandeja = callback;
    }
    //confirmar accion
    confirmarAccion(mensaje) {
        return new Promise((resolve) => {
            // Prevención de doble clic: Si ya hay un modal abierto, no abrimos otro.
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
                    // Función interna para cerrar el modal y disparar la animación de salida
                    const cerrarModal = (resultado) => {
                        btnConfirm.disabled = true;
                        btnCancel.disabled = true;
                        modal.classList.add("modal-leave"); // Activa la animación de "achicarse" y desvanecerse
                        overlay.classList.add("modal-leave-overlay");
                        let transicionCompletada = false;
                        const finalizar = () => {
                            !transicionCompletada && (() => {
                                transicionCompletada = true;
                                document.body.contains(overlay) && document.body.removeChild(overlay); // Se limpia el DOM para no dejar basura
                                resolve(resultado); // Se resuelve la Promesa avisándole al Controlador la decisión
                            })();
                        };
                        // Esperamos a que la animación CSS de salida termine
                        modal.addEventListener("transitionend", finalizar);
                        // Fallback de seguridad por si falla el evento transitionend del navegador
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
    // --- MÉTODOS PARA EL REPORTE HISTÓRICO DINÁMICO ---
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
}
//# sourceMappingURL=Cl_vLaboratorio.js.map