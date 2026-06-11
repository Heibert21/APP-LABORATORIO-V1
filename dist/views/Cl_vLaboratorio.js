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
    manejadorEliminarEstudio;
    manejadorDespacharOrden;
    manejadorCambioChecks;
    cbCambioFiltro;
    manejadorEliminarOrdenEspera;
    manejadorEditarOrdenEspera;
    _ordenesEsperaCache = [];
    _ordenesListasCache = [];
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
        // Set default date to today for the report
        if (this.inFechaReporteExamen) {
            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
            this.inFechaReporteExamen.value = localISOTime;
        }
        this.inCedula.addEventListener("input", () => {
            this.inCedula.value = this.inCedula.value.replace(/\D/g, "");
        });
        this.inCedulaRep.addEventListener("input", () => {
            // Remover caracteres que no sean letras V E o numeros
            this.inCedulaRep.value = this.inCedulaRep.value.replace(/[^vVeE0-9-]/g, "");
        });
        // --- Lógica del Checkbox de Menor de Edad ---
        this.chkEsMenor.addEventListener("change", () => {
            const bloqueRep = document.getElementById("adm_bloqueRepresentante");
            const bloqueCedula = document.getElementById("adm_bloqueCedulaPrincipal");
            if (this.chkEsMenor.checked) {
                bloqueRep.classList.remove("oculto");
                bloqueCedula.classList.add("oculto");
                this.inCedula.value = "";
            }
            else {
                bloqueRep.classList.add("oculto");
                bloqueCedula.classList.remove("oculto");
                this.inCedulaRep.value = "";
                this.inNombreRep.value = "";
                this.inApellidoRep.value = "";
            }
        });
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
            if (target.classList.contains("btn-despacho") && this.manejadorDespacharOrden) {
                const id = target.dataset.id;
                const metodo = target.dataset.metodo;
                this.manejadorDespacharOrden(id, metodo);
            }
        });
        //eliminar orden de espera y editar orden de espera
        this.tablaEspera.addEventListener("click", (e) => {
            const target = e.target.closest("button");
            if (!target)
                return;
            const id = target.dataset.id;
            if (!id)
                return;
            if (target.classList.contains("btn-eliminar-orden") && this.manejadorEliminarOrdenEspera) {
                this.manejadorEliminarOrdenEspera(id);
            }
            else if (target.classList.contains("btn-editar-orden") && this.manejadorEditarOrdenEspera) {
                this.manejadorEditarOrdenEspera(id);
            }
        });
        //cambio de checks en estudios disponibles
        this.contenedorEstudios.addEventListener("change", () => {
            if (this.manejadorCambioChecks)
                this.manejadorCambioChecks();
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
        //buscar estudio
        const inputBuscar = document.getElementById("pac_buscarEstudioInput");
        if (inputBuscar) {
            inputBuscar.addEventListener("input", () => {
                const texto = inputBuscar.value.trim().toLowerCase();
                const tarjetas = this.contenedorEstudios.querySelectorAll(".chk-wrapper");
                tarjetas.forEach((tarjeta) => {
                    tarjeta.classList.toggle("oculto", !tarjeta.textContent.toLowerCase().includes(texto));
                });
            });
        }
        //buscar ordenes en espera
        const inputBandeja = document.getElementById("input_buscarBandeja");
        if (inputBandeja) {
            inputBandeja.addEventListener("input", () => {
                const texto = inputBandeja.value.trim().toLowerCase();
                const filtro = (o) => String(o.id).toLowerCase().includes(texto) ||
                    o.nombre.toLowerCase().includes(texto) ||
                    o.apellido.toLowerCase().includes(texto) ||
                    o.cedula.toLowerCase().includes(texto) ||
                    (o.cedulaRepresentante && o.cedulaRepresentante.toLowerCase().includes(texto)) ||
                    (o.nombreRepresentante && o.nombreRepresentante.toLowerCase().includes(texto)) ||
                    (o.apellidoRepresentante && o.apellidoRepresentante.toLowerCase().includes(texto));
                const filtradasEspera = this._ordenesEsperaCache.filter(filtro);
                this._renderizarTarjetasEspera(filtradasEspera);
                const filtradasListos = this._ordenesListasCache.filter(filtro);
                this._renderizarTarjetasListas(filtradasListos);
            });
        }
        //cambio de sexo en pacientes
        this.inSexo.addEventListener("change", () => {
            if (this.manejadorCambioChecks)
                this.manejadorCambioChecks();
            if (this.cbCambioFiltro)
                this.cbCambioFiltro();
        });
        //exportar caja
        const btnExportar = document.getElementById("btn_exportarCaja");
        if (btnExportar) {
            btnExportar.addEventListener("click", () => {
                if (this._cbExportarCaja)
                    this._cbExportarCaja();
            });
        }
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
        this.inNombre.value = this.inNombre.value.trim();
        return this.inNombre.value;
    }
    get pacApellido() {
        this.inApellido.value = this.inApellido.value.trim();
        return this.inApellido.value;
    }
    get pacFechaNac() {
        this.inFechaNac.value = this.inFechaNac.value.trim();
        return this.inFechaNac.value;
    }
    get pacSexo() {
        this.inSexo.value = this.inSexo.value.trim();
        return this.inSexo.value;
    }
    get pacTelefono() {
        this.inTelefono.value = this.inTelefono.value.trim();
        return this.inTelefono.value;
    }
    get pacCorreo() {
        this.inCorreo.value = this.inCorreo.value.trim();
        return this.inCorreo.value;
    }
    get pacMetodoPago() {
        this.inMetodoPago.value = this.inMetodoPago.value.trim();
        return this.inMetodoPago.value;
    }
    get nuevaTasa() {
        this.inTasa.value = this.inTasa.value.trim();
        return parseFloat(this.inTasa.value) || 0;
    }
    get estId() {
        this.inEstId.value = this.inEstId.value.trim().toUpperCase();
        return this.inEstId.value;
    }
    get estNombre() {
        this.inEstNombre.value = this.inEstNombre.value.trim();
        return this.inEstNombre.value;
    }
    get estPrecio() {
        this.inEstPrecio.value = this.inEstPrecio.value.trim();
        return parseFloat(this.inEstPrecio.value) || 0;
    }
    get estTiempo() {
        this.inEstTiempo.value = this.inEstTiempo.value.trim();
        return parseInt(this.inEstTiempo.value, 10) || 0;
    }
    get estUnidad() {
        if (this.inEstUnidad.value.trim() !== "") {
            this.inEstUnidad.value = this.inEstUnidad.value.trim();
        }
        return this.inEstUnidad.value.trim();
    }
    get estRango() {
        if (this.inEstRango.value.trim() !== "") {
            this.inEstRango.value = this.inEstRango.value.trim();
        }
        return this.inEstRango.value.trim();
    }
    // --- Reportes Específicos ---
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
        if (this.inFechaReporteExamen) {
            this.inFechaReporteExamen.addEventListener("change", handler);
        }
        if (this.inNombreReporteExamen) {
            this.inNombreReporteExamen.addEventListener("input", handler);
        }
    }
    // Función para re-escribir el contador numérico en el cuadro estadístico
    setCantidadExamen(cantidad) {
        if (this.lblCantidadExamen) {
            this.lblCantidadExamen.innerText = cantidad.toString();
        }
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
        if (btn) {
            btn.onclick = () => {
                const cedula = this.inCedula.value.trim();
                if (!cedula) {
                    this.mostrarToast("Escriba una Cédula antes de buscar.", "advertencia");
                    return;
                }
                callback(cedula);
            };
        }
        const btnRep = document.getElementById("btn_buscarCedulaRep");
        if (btnRep) {
            btnRep.onclick = () => {
                const cedulaRep = this.inCedulaRep.value.trim();
                if (!cedulaRep) {
                    this.mostrarToast("Escriba la Cédula del representante antes de buscar.", "advertencia");
                    return;
                }
                callback(cedulaRep);
            };
        }
        // Permitir buscar con Enter
        this.inCedula.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const cedula = this.inCedula.value.trim();
                if (cedula)
                    callback(cedula);
            }
        });
        this.inCedulaRep.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const cedulaRep = this.inCedulaRep.value.trim();
                if (cedulaRep)
                    callback(cedulaRep);
            }
        });
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
        if (this.inTasa)
            this.inTasa.value = tasa.toString();
        const lbl = document.getElementById("pedido_lblTasa");
        if (lbl)
            lbl.innerText = tasa.toFixed(2);
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
        estudios.forEach(e => {
            const div = document.createElement("div");
            div.className = `chk-wrapper`;
            div.innerHTML = `
        <label>
          <input type="checkbox" class="chk-estudio" value="${e.id}" data-precio="${e.precio}" data-tiempo="${e.tiempoProcesamiento}">
          <span><b>${e.codigo || e.id}</b> - ${e.nombre} (<span>${e.precio}$</span>)</span>
        </label>
      `;
            this.contenedorEstudios.appendChild(div);
        });
    }
    //renderizar lista de catalogo
    renderizarListaCatalogo(estudios) {
        this.listaCatalogo.innerHTML = estudios.length === 0 ? "<li>Catálogo vacío.</li>" : "";
        estudios.forEach(e => {
            const li = document.createElement("li");
            li.className = "prod-item";
            li.innerHTML = `
        <span>🔬 <b>${e.codigo || e.id}</b> - ${e.nombre} (${e.precio}$)</span>
        <button class="btn-del" data-id="${e.id}">🗑️</button>
      `;
            this.listaCatalogo.appendChild(li);
            li.querySelector(".btn-del")?.addEventListener("click", () => this.manejadorEliminarEstudio(e.id));
        });
    }
    //renderizar ordenes en espera
    renderizarOrdenesEspera(ordenes) {
        this._ordenesEsperaCache = ordenes;
        this._renderizarTarjetasEspera(ordenes);
    }
    //renderizar tarjetas de espera
    _renderizarTarjetasEspera(ordenes) {
        this.tablaEspera.innerHTML = ordenes.length === 0 ? "No hay órdenes en espera." : "";
        ordenes.forEach(o => {
            const cedulaAPintar = (!o.cedula || o.cedula.trim() === "") ? "MENOR" : o.cedula;
            let badgeEspera = "";
            if (o.fechaRegistro) {
                const minutos = this._calcularMinutosEspera(o.fechaRegistro);
                if (minutos >= 0) {
                    const esUrgente = minutos >= 60;
                    const textoTiempo = minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
                    badgeEspera = `<span class="badge-espera ${esUrgente ? "urgente" : ""}">⏱️ ${textoTiempo}</span>`;
                }
            }
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
            this.tablaEspera.appendChild(div);
        });
        //eventos de botones de editar y eliminar orden en espera
        this.tablaEspera.querySelectorAll(".btn-editar-orden").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                this.manejadorEditarOrdenEspera(id);
            });
        });
        this.tablaEspera.querySelectorAll(".btn-eliminar-orden").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                this.manejadorEliminarOrdenEspera(id);
            });
        });
    }
    //Convierte el campo fechaRegistro ("d/m/yyyy, HH:MM:SS" o "dd/mm/yyyy HH:MM")
    //a minutos transcurridos desde ese momento hasta ahora.
    _calcularMinutosEspera(fechaRegistro) {
        try {
            // toLocaleDateString() puede generar "1/6/2026, 10:30:00" (con coma) o "01/06/2026 10:30"
            // Normalizamos eliminando coma y tomando fecha + hora
            const normalizado = fechaRegistro.replace(",", "").trim();
            const partes = normalizado.split(" ");
            if (partes.length < 2)
                return -1;
            //dividir fecha y hora
            const [fechaParte, horaParte] = partes;
            const segmentosFecha = fechaParte.split("/");
            if (segmentosFecha.length < 3)
                return -1;
            // Detectamos si el formato es d/m/yyyy (toLocaleDateString de ES) o dd/mm/yyyy
            const dia = parseInt(segmentosFecha[0], 10);
            const mes = parseInt(segmentosFecha[1], 10) - 1; // Meses son 0-indexed en JS
            const anio = parseInt(segmentosFecha[2], 10);
            const [hh, mm] = horaParte.split(":").map(Number);
            const fechaOrden = new Date(anio, mes, dia, hh, mm);
            const ahora = new Date();
            const diffMs = ahora.getTime() - fechaOrden.getTime();
            return Math.max(0, Math.floor(diffMs / 60000));
        }
        catch {
            return -1;
        }
    }
    //renderizar ordenes listas
    renderizarOrdenesListas(ordenes) {
        this._ordenesListasCache = ordenes;
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
                this.manejadorDespacharOrden(id, metodo);
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
        requestAnimationFrame(() => toast.classList.add("visible"));
        setTimeout(() => {
            toast.classList.remove("visible");
            toast.addEventListener("transitionend", () => toast.remove());
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
    autocompletarPaciente(orden) {
        // Si la orden viene de un representante (Cédula empieza por CR o es MENOR)
        if ((orden.cedula === "MENOR" || orden.cedula.startsWith("CR")) && orden.cedulaRepresentante) {
            this.chkEsMenor.checked = true;
            document.getElementById("adm_bloqueRepresentante")?.classList.remove("oculto");
            document.getElementById("adm_bloqueCedulaPrincipal")?.classList.add("oculto");
            this.inCedulaRep.value = orden.cedulaRepresentante;
            this.inNombreRep.value = orden.nombreRepresentante;
            this.inApellidoRep.value = orden.apellidoRepresentante;
            this.inCedula.value = "";
            this.inNombre.value = ""; // Dejar en blanco para el nuevo hijo
            this.inApellido.value = orden.apellido; // Asumir mismo apellido
            this.inFechaNac.value = ""; // Dejar en blanco para el nuevo hijo
        }
        else {
            this.chkEsMenor.checked = false;
            document.getElementById("adm_bloqueRepresentante")?.classList.add("oculto");
            document.getElementById("adm_bloqueCedulaPrincipal")?.classList.remove("oculto");
            this.inCedulaRep.value = "";
            this.inNombreRep.value = "";
            this.inApellidoRep.value = "";
            this.inCedula.value = orden.cedula;
            this.inNombre.value = orden.nombre;
            this.inApellido.value = orden.apellido;
            // Convertir formato de fecha si es necesario
            this.inFechaNac.value = orden.fechaRegistro ? orden.fechaRegistro.split(" ")[0].split("/").reverse().join("-") : "";
        }
        // Autocompletar datos de contacto compartidos
        this.inSexo.value = orden.sexo;
        this.inTelefono.value = orden.telefono;
        this.inCorreo.value = orden.correo;
        this.inMetodoPago.value = orden.metodoPago;
    }
    // --- Método privado para bloquear/desbloquear datos del paciente ---
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
        if (btnBuscar)
            btnBuscar.disabled = bloquear;
        const btnBuscarRep = document.getElementById("btn_buscarCedulaRep");
        if (btnBuscarRep)
            btnBuscarRep.disabled = bloquear;
    }
    // Preparar la orden para su edición exclusiva de exámenes
    prepararEdicionOrden(orden) {
        // 1. Llenar todos los datos personales usando el historial
        this.autocompletarPaciente(orden);
        // 2. Bloquear inputs para que solo se editen los exámenes
        this.bloquearInputsPaciente(true);
        // 3. Marcar los checkboxes correspondientes a los exámenes actuales
        const examenesSolicitadosArray = orden.examenesSolicitados.split(", ").map(e => e.trim().toLowerCase());
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio");
        checkboxes.forEach(chk => {
            const nombreExamenSpan = chk.nextElementSibling?.textContent?.toLowerCase() || "";
            // Verificamos si el nombre del examen está en el array de exámenes de la orden
            const debeEstarMarcado = examenesSolicitadosArray.some(ex => nombreExamenSpan.includes(ex));
            chk.checked = debeEstarMarcado;
        });
        // Forzamos el recalculo de totales simulando que se cambiaron los checks
        if (this.manejadorCambioChecks) {
            this.manejadorCambioChecks();
        }
        // 4. Cambiar botones al modo edición (azul)
        this.btnProcesarOrden.innerText = "💾 Guardar Cambios";
        this.btnProcesarOrden.classList.add("modo-edicion");
        this.btnCancelarEdicion.classList.remove("oculto");
        // 5. Hacer scroll hacia arriba al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.mostrarToast(`Modo edición activado para la Orden #${orden.id}`, "info");
    }
    //mostrar historial del paciente
    mostrarHistorialPaciente(ordenes) {
        const panel = document.getElementById("panel-historial-paciente");
        if (!panel)
            return;
        if (ordenes.length === 0) {
            panel.classList.add("oculto");
            return;
        }
        //mostrar historial
        panel.classList.remove("oculto");
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
    }
    //imprimir reporte polimorficamente
    imprimirReporte(reporte) {
        const ventana = window.open("", "_blank");
        if (!ventana)
            return;
        ventana.document.write(reporte.obtenerContenidoReporte());
        ventana.document.close();
        ventana.focus();
        ventana.print();
        setTimeout(() => ventana.close(), 500);
    }
    //limpiar formulario paciente
    limpiarFormPaciente() {
        this.formPaciente.reset();
        this.setTotalesFactura(0, 0, "");
        const panel = document.getElementById("panel-historial-paciente");
        if (panel)
            panel.classList.add("oculto");
        document.getElementById("adm_bloqueRepresentante")?.classList.add("oculto");
        document.getElementById("adm_bloqueCedulaPrincipal")?.classList.remove("oculto");
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio");
        checkboxes.forEach(chk => {
            chk.checked = false;
        });
        // Desbloquear inputs (por si veníamos de una edición)
        this.bloquearInputsPaciente(false);
        // Restaurar botones a modo creación
        if (this.btnProcesarOrden) {
            this.btnProcesarOrden.innerText = "💳 Confirmar Facturación y Procesar Orden";
            this.btnProcesarOrden.classList.remove("modo-edicion"); // Restaurar color verde
        }
        if (this.btnCancelarEdicion) {
            this.btnCancelarEdicion.classList.add("oculto");
        }
    }
    //limpiar formulario estudio
    limpiarFormEstudio() {
        this.formEstudio.reset();
    }
    //filtrar estudios busqueda
    onFiltrarEstudiosBusqueda(callback) {
        const inputBuscar = document.getElementById("pac_buscarEstudioInput");
        if (inputBuscar)
            inputBuscar.oninput = () => callback(inputBuscar.value.trim());
    }
}
// forzar recompilacion
//# sourceMappingURL=Cl_vLaboratorio.js.map