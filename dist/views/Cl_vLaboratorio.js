export default class Cl_vLaboratorio {
    // --- Elementos del DOM (Formulario Registro de Pacientes) ---
    inCedula;
    inNombre;
    inApellido;
    inFechaNac;
    inSexo;
    inEsEmbarazada;
    inTelefono;
    inCorreo;
    inMetodoPago;
    contenedorEstudios;
    formPaciente;
    // --- Elementos del DOM (Configuración y Catálogo de Exámenes) ---
    inTasa;
    btTasa;
    inEstId;
    inEstNombre;
    inEstPrecio;
    inEstTiempo;
    inEstTipo;
    inEstSugerido;
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
    bloqueSubExamenes;
    listaSubCheckboxes;
    toastContainer;
    spinnerOverlay;
    manejadorEliminarEstudio;
    manejadorDespacharOrden;
    manejadorCambioChecks;
    cbCambioFiltro;
    manejadorEliminarOrdenEspera;
    manejadorEditarOrdenEspera;
    _ordenesEsperaCache = [];
    constructor() {
        this.inCedula = document.getElementById("pac_cedula");
        this.inNombre = document.getElementById("pac_nombre");
        this.inApellido = document.getElementById("pac_apellido");
        this.inFechaNac = document.getElementById("pac_fechaNac");
        this.inSexo = document.getElementById("pac_sexo");
        this.inEsEmbarazada = document.getElementById("pac_chkEmbarazada");
        this.inTelefono = document.getElementById("pac_telefono");
        this.inCorreo = document.getElementById("pac_correo");
        this.inMetodoPago = document.getElementById("pac_metodoPago");
        this.contenedorEstudios = document.getElementById("adm_contenedorEstudiosDisponibles");
        this.formPaciente = document.getElementById("form_registroPaciente");
        this.inTasa = document.getElementById("adm_inTasa");
        this.btTasa = document.getElementById("adm_btnActualizarTasa");
        this.inEstId = document.getElementById("est_id");
        this.inEstNombre = document.getElementById("est_nombre");
        this.inEstPrecio = document.getElementById("est_precio");
        this.inEstTiempo = document.getElementById("est_tiempo");
        this.inEstTipo = document.getElementById("est_tipo");
        this.inEstSugerido = document.getElementById("est_sugerido");
        this.inEstUnidad = document.getElementById("est_unidad");
        this.inEstRango = document.getElementById("est_rango");
        this.formEstudio = document.getElementById("form_nuevoEstudio");
        this.listaCatalogo = document.getElementById("adm_listaEstudiosCatalogo");
        this.tablaEspera = document.getElementById("adm_listaEspera");
        this.tablaListos = document.getElementById("adm_listaListos");
        this.lblTotalUSD = document.getElementById("adm_lblTotalUSD");
        this.lblTotalBs = document.getElementById("adm_lblTotalBs");
        this.lblHoraEntrega = document.getElementById("adm_lblHoraEntrega");
        this.bloqueSubExamenes = document.getElementById("adm_bloqueSubExamenes");
        this.listaSubCheckboxes = document.getElementById("adm_listaSubExamenesCheckboxes");
        this.toastContainer = document.getElementById("toast-container");
        this.spinnerOverlay = document.getElementById("spinner-overlay");
        this.inCedula.addEventListener("input", () => {
            this.inCedula.value = this.inCedula.value.replace(/\D/g, "");
        });
        // Mostrar sub-exámenes solo si se selecciona "Paquete"
        this.inEstTipo.addEventListener("change", () => {
            this.alternarVisibilidadSubExamenes(this.inEstTipo.value === "Paquete");
        });
        const btnToggleEstudio = document.getElementById("btnToggleFormEstudio");
        const seccionFormEstudio = document.getElementById("seccionFormEstudio");
        btnToggleEstudio.onclick = () => {
            seccionFormEstudio.classList.toggle("oculto");
            btnToggleEstudio.innerText = seccionFormEstudio.classList.contains("oculto")
                ? " Abrir Carga de Estudios"
                : " Cerrar Carga de Estudios";
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
            if (target.classList.contains("btn-despacho") && this.manejadorDespacharOrden) {
                const id = target.dataset.id;
                const metodo = target.dataset.metodo;
                this.manejadorDespacharOrden(id, metodo);
            }
        });
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
        this.contenedorEstudios.addEventListener("change", () => {
            if (this.manejadorCambioChecks)
                this.manejadorCambioChecks();
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
        if (inputBuscar) {
            inputBuscar.addEventListener("input", () => {
                const texto = inputBuscar.value.trim().toLowerCase();
                const tarjetas = this.contenedorEstudios.querySelectorAll(".chk-wrapper");
                tarjetas.forEach((tarjeta) => {
                    tarjeta.classList.toggle("oculto", !tarjeta.textContent.toLowerCase().includes(texto));
                });
            });
        }
        const inputBandeja = document.getElementById("input_buscarBandeja");
        if (inputBandeja) {
            inputBandeja.addEventListener("input", () => {
                const texto = inputBandeja.value.trim().toLowerCase();
                const filtradas = this._ordenesEsperaCache.filter(o => o.nombre.toLowerCase().includes(texto) ||
                    o.apellido.toLowerCase().includes(texto) ||
                    o.cedula.toLowerCase().includes(texto));
                this._renderizarTarjetasEspera(filtradas);
            });
        }
        const chkBloque = document.getElementById("adm_bloqueEmbarazada");
        this.inSexo.addEventListener("change", () => {
            if (this.inSexo.value === "Femenino") {
                if (chkBloque)
                    chkBloque.classList.remove("oculto");
            }
            else {
                if (chkBloque)
                    chkBloque.classList.add("oculto");
                const chk = document.getElementById("pac_chkEmbarazada");
                if (chk)
                    chk.checked = false;
            }
            if (this.manejadorCambioChecks)
                this.manejadorCambioChecks();
            if (this.cbCambioFiltro)
                this.cbCambioFiltro();
        });
        const btnExportar = document.getElementById("btn_exportarCaja");
        if (btnExportar) {
            btnExportar.addEventListener("click", () => {
                if (this._cbExportarCaja)
                    this._cbExportarCaja();
            });
        }
    }
    get pacCedula() { return this.inCedula.value.trim(); }
    get pacNombre() { return this.inNombre.value.trim(); }
    get pacApellido() { return this.inApellido.value.trim(); }
    get pacFechaNac() { return this.inFechaNac.value; }
    get pacSexo() { return this.inSexo.value; }
    get pacEmbarazada() {
        const chk = document.getElementById("pac_chkEmbarazada");
        return chk ? chk.checked : false;
    }
    get pacTelefono() { return this.inTelefono.value.trim(); }
    get pacCorreo() { return this.inCorreo.value.trim(); }
    get pacMetodoPago() { return this.inMetodoPago.value; }
    get nuevaTasa() { return parseFloat(this.inTasa.value.trim()) || 0; }
    get estId() { return this.inEstId.value.trim().toUpperCase(); }
    get estNombre() { return this.inEstNombre.value.trim(); }
    get estPrecio() { return parseFloat(this.inEstPrecio.value.trim()) || 0; }
    get estTiempo() { return parseInt(this.inEstTiempo.value.trim(), 10) || 0; }
    get estTipo() { return this.inEstTipo.value; }
    get estSugerido() { return this.inEstSugerido.value; }
    get estUnidad() { return this.inEstUnidad.value.trim(); }
    get estRango() { return this.inEstRango.value.trim(); }
    getEstudiosSeleccionados() {
        const checkboxes = this.contenedorEstudios.querySelectorAll(".chk-estudio:checked");
        return Array.from(checkboxes).map(chk => chk.value);
    }
    getSubExamenesSeleccionados() {
        const checkboxes = this.listaSubCheckboxes.querySelectorAll(".chk-sub-estudio:checked");
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
    onCambioFiltroSugerido(callback) {
        this.cbCambioFiltro = callback;
        this.inFechaNac.onchange = callback;
        this.inSexo.onchange = callback;
        const chkEmbarazada = document.getElementById("pac_chkEmbarazada");
        if (chkEmbarazada)
            chkEmbarazada.onchange = callback;
    }
    onCambioChecks(callback) {
        this.manejadorCambioChecks = callback;
    }
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
    }
    onEliminarOrdenEspera(callback) {
        this.manejadorEliminarOrdenEspera = callback;
    }
    onEditarOrdenEspera(callback) {
        this.manejadorEditarOrdenEspera = callback;
    }
    onExportarCaja(callback) {
        this._cbExportarCaja = callback;
    }
    setTasaActual(tasa) {
        if (this.inTasa)
            this.inTasa.value = tasa.toString();
        const lbl = document.getElementById("pedido_lblTasa");
        if (lbl)
            lbl.innerText = tasa.toFixed(2);
    }
    setTotalesFactura(totalUsd, totalBs, horaRetiro) {
        this.lblTotalUSD.innerText = totalUsd.toFixed(2);
        this.lblTotalBs.innerText = totalBs.toFixed(2);
        this.lblHoraEntrega.innerText = horaRetiro;
    }
    renderizarEstudiosDisponibles(estudios, sugerencia) {
        this.contenedorEstudios.innerHTML = estudios.length === 0 ? "<div>No hay estudios en catálogo.</div>" : "";
        const badge = document.getElementById("lblSugerenciaBadge");
        if (badge)
            badge.innerText = `Sugerencias: ${sugerencia}`;
        estudios.forEach(e => {
            const esSugerido = (e.sugeridoPara === sugerencia || e.sugeridoPara === "Todos");
            const div = document.createElement("div");
            div.className = `chk-wrapper ${esSugerido ? "sugerido-resaltado" : "estudio-atenuado"}`;
            div.innerHTML = `
        <label>
          <input type="checkbox" class="chk-estudio" value="${e.id}" data-precio="${e.precio}" data-tiempo="${e.tiempoProcesamiento}">
          <span><b>${e.codigo || e.id}</b> - ${e.nombre} (<span>${e.precio}$</span>)</span>
        </label>
      `;
            this.contenedorEstudios.appendChild(div);
        });
    }
    renderizarListaCatalogo(estudios) {
        this.listaCatalogo.innerHTML = estudios.length === 0 ? "<li>Catálogo vacío.</li>" : "";
        estudios.forEach(e => {
            const li = document.createElement("li");
            li.className = "prod-item";
            li.innerHTML = `
        <span>🔬 <b>${e.codigo || e.id}</b> - ${e.nombre} (${e.precio}$)</span>
        <button class="btn-del" data-id="${e.id}">X</button>
      `;
            this.listaCatalogo.appendChild(li);
            li.querySelector(".btn-del")?.addEventListener("click", () => this.manejadorEliminarEstudio(e.id));
        });
    }
    renderizarSubExamenesParaPaquete(estudios) {
        const individuales = estudios.filter(e => e.tipo === "Individual");
        this.listaSubCheckboxes.innerHTML = individuales.length === 0
            ? "<div>Debe registrar exámenes individuales en el catálogo primero.</div>"
            : "";
        individuales.forEach(e => {
            const div = document.createElement("div");
            div.innerHTML = `
        <label style="display:flex;gap:6px;align-items:center;font-size:0.85rem;cursor:pointer;padding:4px 0;">
          <input type="checkbox" class="chk-sub-estudio" value="${e.id}">
          <span><b>${e.id}</b> - ${e.nombre}</span>
        </label>
      `;
            this.listaSubCheckboxes.appendChild(div);
        });
    }
    renderizarOrdenesEspera(ordenes) {
        this._ordenesEsperaCache = ordenes;
        this._renderizarTarjetasEspera(ordenes);
    }
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
    }
    /**
     * Convierte el campo fechaRegistro ("d/m/yyyy, HH:MM:SS" o "dd/mm/yyyy HH:MM")
     * a minutos transcurridos desde ese momento hasta ahora.
     */
    _calcularMinutosEspera(fechaRegistro) {
        try {
            // toLocaleDateString() puede generar "1/6/2026, 10:30:00" (con coma) o "01/06/2026 10:30"
            // Normalizamos eliminando coma y tomando fecha + hora
            const normalizado = fechaRegistro.replace(",", "").trim();
            const partes = normalizado.split(" ");
            if (partes.length < 2)
                return -1;
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
    renderizarOrdenesListas(ordenes) {
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
        requestAnimationFrame(() => toast.classList.add("visible"));
        setTimeout(() => {
            toast.classList.remove("visible");
            toast.addEventListener("transitionend", () => toast.remove());
        }, 3500);
    }
    /** Muestra el overlay de carga con spinner animado. Llama antes de peticiones a la API. */
    mostrarSpinner() {
        this.spinnerOverlay.classList.remove("oculto");
    }
    /** Oculta el overlay de carga. Llama siempre después de que termine una petición a la API. */
    ocultarSpinner() {
        this.spinnerOverlay.classList.add("oculto");
    }
    autocompletarPaciente(orden) {
        this.inNombre.value = orden.nombre;
        this.inApellido.value = orden.apellido;
        this.inTelefono.value = orden.telefono;
        this.inCorreo.value = orden.correo;
        // Restauramos fecha de nacimiento calculando desde la edad (no ideal, pero funcional)
        // Si el sistema guardara fecha de nac., sería mejor usarla directamente.
        this.inSexo.value = orden.sexo;
        this.mostrarToast(`Paciente encontrado: ${orden.nombre} ${orden.apellido}. Datos autocargados.`, "info");
    }
    mostrarHistorialPaciente(ordenes) {
        const panel = document.getElementById("panel-historial-paciente");
        if (!panel)
            return;
        if (ordenes.length === 0) {
            panel.classList.add("oculto");
            return;
        }
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
    exportarCajaDelDia(datos) {
        const ventana = window.open("", "_blank");
        if (!ventana)
            return;
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        ventana.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
  <title>Cierre de Caja - ${fecha}</title>
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
      <tr><td>Pacientes Atendidos</td><td class="monto">${datos.totalPacientes}</td></tr>
      <tr><td>Examen Más Solicitado</td><td class="monto">${datos.estudioTop}</td></tr>
      <tr><td>Tasa del Día (Bs/$)</td><td class="monto">${datos.tasa.toFixed(2)} Bs</td></tr>
      <tr><td>Total Ingresos (USD)</td><td class="monto" style="color:#059669;">$ ${datos.totalUsd.toFixed(2)}</td></tr>
      <tr><td>Total Ingresos (Bs)</td><td class="monto" style="color:#0284c7;">${datos.totalBs.toFixed(2)} Bs</td></tr>
    </tbody>
  </table>
  <p class="pie">Generado por el Sistema de Laboratorio Git Force C.A. — © 2026 UCLA DCyT</p>
</body>
</html>`);
        ventana.document.close();
        ventana.focus();
        ventana.print();
        setTimeout(() => ventana.close(), 500);
    }
    alternarVisibilidadSubExamenes(mostrar) {
        this.bloqueSubExamenes.classList.toggle("oculto", !mostrar);
    }
    limpiarFormPaciente() {
        this.formPaciente.reset();
        this.setTotalesFactura(0, 0, "");
        const panel = document.getElementById("panel-historial-paciente");
        if (panel)
            panel.classList.add("oculto");
    }
    limpiarFormEstudio() {
        this.formEstudio.reset();
        this.alternarVisibilidadSubExamenes(false);
    }
    onFiltrarEstudiosBusqueda(callback) {
        const inputBuscar = document.getElementById("pac_buscarEstudioInput");
        if (inputBuscar)
            inputBuscar.oninput = () => callback(inputBuscar.value.trim());
    }
    imprimirReporteResultadosPDF(orden) {
        const ventanaImpresion = window.open("", "_blank");
        if (!ventanaImpresion)
            return;
        let cedulaFormateada = orden.cedula;
        if (cedulaFormateada !== "MENOR" && !cedulaFormateada.startsWith("V-")) {
            cedulaFormateada = "V-" + cedulaFormateada;
        }
        ventanaImpresion.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
<title>Reporte de Resultados - Orden #${orden.id}</title>
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
  <div>Edad: &nbsp; ${orden.edad} Año(s)</div>
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
</html>`);
        ventanaImpresion.document.close();
        ventanaImpresion.focus();
        ventanaImpresion.print();
        setTimeout(() => ventanaImpresion.close(), 300);
    }
}
// forzar recompilacion
//# sourceMappingURL=Cl_vLaboratorio.js.map