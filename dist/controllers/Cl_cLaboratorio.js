import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
export default class Cl_cLaboratorio {
    vista;
    modeloGlobal;
    catalogoEstudiosCoche = [];
    constructor({ modelo, vista }) {
        this.vista = vista;
        this.modeloGlobal = modelo;
        this.cargarConfiguracionesYListas();
        this.vista.onActualizarTasa(() => this.procesarCambioTasa());
        this.vista.onAgregarEstudio(() => this.procesarRegistroNuevoEstudio());
        this.vista.onRegistrarOrden(() => this.procesarCierreYFacturacionOrden());
        this.vista.onEliminarEstudio((id) => this.procesarBajaEstudioCatálogo(id));
        this.vista.onCambioFiltroSugerido(() => this.evaluarEdadYSexoParaSugerencias());
        this.vista.onDespacharOrden((id, metodo) => this.ejecutarDespachoFinalPaciente(id, metodo));
        this.vista.onCambioChecks(() => this.recalcularTotalesEnTiempoReal());
        // MEJORA #1: Cuando el recepcionista escribe una cédula y pulsa 🔍,
        // buscamos si ya existe en el historial para autocompletar el formulario.
        this.vista.onBuscarCedulaPaciente((cedula) => this.buscarPacientePorCedula(cedula));
        // MEJORA #6: El botón "Exportar Cierre" arma los datos y llama a exportarCajaDelDia().
        this.vista.onExportarCaja(() => this.procesarExportarCaja());
        this.vista.onEliminarOrdenEspera((id) => this.procesarEliminarOrdenEspera(id));
        this.vista.onEditarOrdenEspera((id) => this.procesarEditarOrdenEspera(id));
    }
    async cargarConfiguracionesYListas() {
        // MEJORA #8: Mostramos el spinner mientras cargamos la configuración inicial
        this.vista.mostrarSpinner();
        try {
            const tasa = await Cl_sLaboratorio.obtenerTasaDinamica();
            this.modeloGlobal.tasaCambio = tasa;
            this.vista.setTasaActual(tasa);
            this.catalogoEstudiosCoche = await Cl_sLaboratorio.obtenerEstudios();
            this.vista.renderizarListaCatalogo(this.catalogoEstudiosCoche);
            this.vista.renderizarSubExamenesParaPaquete(this.catalogoEstudiosCoche);
            this.evaluarEdadYSexoParaSugerencias();
            await this.actualizarMonitorYEstadisticas();
        }
        catch (error) {
            console.error("Error crítico de inicialización asíncrona:", error);
            this.vista.mostrarToast("Error de conexión al cargar la configuración.", "error");
        }
        finally {
            // MEJORA #8: El spinner siempre se oculta, aunque haya error
            this.vista.ocultarSpinner();
        }
    }
    async actualizarMonitorYEstadisticas() {
        try {
            const ordenesPlanas = await Cl_sLaboratorio.obtenerOrdenes();
            this.modeloGlobal.setOrdenes(ordenesPlanas);
            const pendientes = this.modeloGlobal.ordenes.filter((o) => o.status === "En Espera");
            const listas = this.modeloGlobal.ordenes.filter((o) => o.status === "Listo para Despacho");
            this.vista.renderizarOrdenesEspera(pendientes);
            this.vista.renderizarOrdenesListas(listas);
            this.vista.renderizarEstadisticas({
                totalPacientes: this.modeloGlobal.calcularTotalPacientesAtendidos(),
                totalUsd: this.modeloGlobal.calcularMontoTotalUsd(),
                totalBs: this.modeloGlobal.calcularMontoTotalBs(),
                estudioMasSolicitado: this.modeloGlobal.obtenerEstudioMasSolicitado(),
            });
        }
        catch (error) {
            console.error("Error al actualizar monitores del laboratorio:", error);
        }
    }
    evaluarEdadYSexoParaSugerencias() {
        const fechaNac = this.vista.pacFechaNac;
        const sexo = this.vista.pacSexo;
        const embarazada = this.vista.pacEmbarazada;
        const clasificacion = this.modeloGlobal.determinarSugerenciaMedica(fechaNac, sexo, embarazada);
        this.vista.renderizarEstudiosDisponibles(this.catalogoEstudiosCoche, clasificacion);
        this.recalcularTotalesEnTiempoReal();
    }
    recalcularTotalesEnTiempoReal() {
        const codigosSeleccionados = this.vista.getEstudiosSeleccionados();
        const estudiosElegidos = this.catalogoEstudiosCoche.filter(e => codigosSeleccionados.includes(e.id));
        const calculos = this.modeloGlobal.calcularEstructuraFactura(estudiosElegidos);
        const tiempos = this.modeloGlobal.calcularTiemposEntrega(calculos.tiempoMaxHoras);
        this.vista.setTotalesFactura(calculos.totalUsd, calculos.totalBs, tiempos.entrega);
        this.vista.setTasaActual(this.modeloGlobal.tasaCambio);
    }
    async procesarCambioTasa() {
        const valorTasa = this.vista.nuevaTasa;
        if (valorTasa <= 0) {
            // MEJORA #9: Toast en lugar de alert
            this.vista.mostrarToast("Introduzca una tasa válida mayor a cero.", "advertencia");
            return;
        }
        this.vista.mostrarSpinner();
        try {
            const respuesta = await Cl_sLaboratorio.actualizarTasaDinamica(valorTasa);
            if (respuesta.ok) {
                this.modeloGlobal.tasaCambio = valorTasa;
                this.vista.mostrarToast("Tasa del día actualizada con éxito en la nube.", "exito");
                await this.actualizarMonitorYEstadisticas();
            }
        }
        catch {
            this.vista.mostrarToast("Error de red al actualizar la tasa.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async procesarRegistroNuevoEstudio() {
        const id = this.getCleanEstId();
        const nombre = this.vista.estNombre;
        const precio = this.vista.estPrecio;
        const tiempo = this.vista.estTiempo;
        const tipo = this.vista.estTipo;
        const sugerido = this.vista.estSugerido;
        const unidad = this.vista.estUnidad || "";
        const rango = this.vista.estRango || "";
        if (!id || !nombre || precio <= 0 || tiempo <= 0) {
            // MEJORA #3: Validación robusta con toast en lugar de alert
            this.vista.mostrarToast("Rellene todos los campos obligatorios del estudio correctamente.", "advertencia");
            return;
        }
        let parametrosVaciosFinal = [];
        if (tipo === "Individual") {
            parametrosVaciosFinal = this.modeloGlobal.crearEstructuraResultadosVacios(nombre, unidad, rango);
        }
        else if (tipo === "Paquete") {
            const codigosMarcados = this.vista.getSubExamenesSeleccionados();
            if (codigosMarcados.length === 0) {
                this.vista.mostrarToast("Seleccione al menos un examen para armar el paquete.", "advertencia");
                return;
            }
            codigosMarcados.forEach((codigo) => {
                const examenEncontrado = this.catalogoEstudiosCoche.find(e => e.id === codigo);
                if (examenEncontrado && examenEncontrado.parametrosAsociados) {
                    examenEncontrado.parametrosAsociados.forEach((param) => {
                        if (!parametrosVaciosFinal.some(p => p.parametro === param.parametro)) {
                            parametrosVaciosFinal.push({ ...param, resultado: "" });
                        }
                    });
                }
            });
        }
        const nuevoEstudioPlano = {
            id: id,
            codigo: id,
            nombre,
            precio,
            tiempoProcesamiento: tiempo,
            tipo,
            sugeridoPara: sugerido,
            parametrosAsociados: parametrosVaciosFinal
        };
        this.vista.mostrarSpinner();
        try {
            const respuesta = await Cl_sLaboratorio.registrarEstudioCatalogo(nuevoEstudioPlano);
            if (respuesta.ok) {
                // MEJORA #9: Toast de éxito en lugar de alert
                this.vista.mostrarToast(`Estudio [${id}] incorporado exitosamente.`, "exito");
                this.vista.limpiarFormEstudio();
                this.catalogoEstudiosCoche = await Cl_sLaboratorio.obtenerEstudios();
                this.vista.renderizarListaCatalogo(this.catalogoEstudiosCoche);
                this.vista.renderizarSubExamenesParaPaquete(this.catalogoEstudiosCoche);
                this.evaluarEdadYSexoParaSugerencias();
            }
        }
        catch (error) {
            this.vista.mostrarToast("Error de red al registrar el nuevo estudio.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async procesarBajaEstudioCatálogo(id) {
        if (!confirm(`¿Está seguro de que desea eliminar el estudio clínico [${id}] del catálogo?`))
            return;
        // MEJORA #7: Verificar si el estudio tiene órdenes activas antes de eliminar
        const tieneOrdenesActivas = this.modeloGlobal.ordenes.some(o => o.status === "En Espera" && o.examenesSolicitados.toLowerCase().includes(id.toLowerCase()));
        if (tieneOrdenesActivas) {
            this.vista.mostrarToast(`No se puede eliminar [${id}]: tiene órdenes activas en espera.`, "error");
            return;
        }
        this.vista.mostrarSpinner();
        try {
            const respuesta = await Cl_sLaboratorio.eliminarEstudioCatalogo(id);
            if (respuesta.ok) {
                this.vista.mostrarToast("Estudio removido del catálogo correctamente.", "exito");
                this.catalogoEstudiosCoche = await Cl_sLaboratorio.obtenerEstudios();
                this.vista.renderizarListaCatalogo(this.catalogoEstudiosCoche);
                this.vista.renderizarSubExamenesParaPaquete(this.catalogoEstudiosCoche);
                this.evaluarEdadYSexoParaSugerencias();
            }
        }
        catch {
            this.vista.mostrarToast("Error de red al intentar dar de baja el estudio.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async procesarCierreYFacturacionOrden() {
        const codigosSeleccionados = this.vista.getEstudiosSeleccionados();
        if (codigosSeleccionados.length === 0) {
            // MEJORA #3: Validación con toast en lugar de alert bloqueante
            this.vista.mostrarToast("Seleccione al menos un estudio de laboratorio para el paciente.", "advertencia");
            return;
        }
        const estudiosElegidos = this.catalogoEstudiosCoche.filter(e => codigosSeleccionados.includes(e.id));
        const calculosFactura = this.modeloGlobal.calcularEstructuraFactura(estudiosElegidos);
        const tiemposEntrega = this.modeloGlobal.calcularTiemposEntrega(calculosFactura.tiempoMaxHoras);
        const listaNombresExamenes = estudiosElegidos.map(e => e.nombre).join(", ");
        const edadCalculada = Cl_mOrdenBio.calcularEdadDesdeFecha(this.vista.pacFechaNac);
        const cedulaEscrita = this.vista.pacCedula.trim();
        // --- VALIDACIÓN DE CÉDULA SEGÚN EDAD ---
        if (edadCalculada < 9 && cedulaEscrita !== "") {
            this.vista.mostrarToast("Un paciente menor de 9 años no puede tener cédula.", "advertencia");
            return;
        }
        if (edadCalculada >= 9 && cedulaEscrita === "") {
            this.vista.mostrarToast("Debe ingresar la cédula para pacientes mayores o iguales a 9 años.", "advertencia");
            return;
        }
        const cedulaFinal = (edadCalculada < 9) ? "MENOR" : cedulaEscrita;
        // --- VALIDACIÓN: cédula + nombre únicos por paciente ---
        // Un paciente puede hacerse exámenes múltiples veces, pero NO se permite
        // registrar una orden con exactamente la misma cédula Y el mismo nombre completo.
        const esDuplicado = this.modeloGlobal.validarDuplicadoPaciente(cedulaFinal, this.vista.pacNombre, this.vista.pacApellido);
        if (esDuplicado) {
            // MEJORA #9: Toast de error en lugar de alert bloqueante para conflicto de identidad
            this.vista.mostrarToast(`⚠️ La cédula "${cedulaFinal}" ya existe con otro nombre. Verifique los datos.`, "error");
            return;
        }
        const nuevaOrden = {
            cedula: cedulaFinal,
            nombre: this.vista.pacNombre,
            apellido: this.vista.pacApellido,
            edad: edadCalculada,
            sexo: this.vista.pacSexo,
            esEmbarazada: this.vista.pacEmbarazada,
            telefono: this.vista.pacTelefono,
            correo: this.vista.pacCorreo,
            metodoPago: this.vista.pacMetodoPago,
            montoTotal$: calculosFactura.totalUsd,
            fechaRegistro: tiemposEntrega.registro,
            horaEntregaEstimada: tiemposEntrega.entrega,
            examenesSolicitados: listaNombresExamenes,
            status: "En Espera",
            licBioanalista: "",
            resultados: calculosFactura.matrizResultados
        };
        this.vista.mostrarSpinner();
        try {
            const respuesta = await Cl_sLaboratorio.registrarNuevaOrden(nuevaOrden);
            if (respuesta.ok) {
                // MEJORA #9: Toast de éxito con la hora de retiro
                this.vista.mostrarToast(`¡Orden procesada! Retiro estimado: ${tiemposEntrega.entrega}.`, "exito");
                this.vista.limpiarFormPaciente();
                await this.actualizarMonitorYEstadisticas();
            }
        }
        catch (error) {
            console.error("Error al registrar la orden:", error);
            this.vista.mostrarToast("Error de red al registrar la orden del paciente.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async procesarEliminarOrdenEspera(id) {
        if (confirm(`¿Estás seguro de que deseas eliminar la Orden #${id}? Se perderán todos los datos.`)) {
            this.vista.mostrarSpinner();
            try {
                await Cl_sLaboratorio.eliminarOrden(id);
                this.vista.mostrarToast(`Orden #${id} eliminada correctamente.`, "exito");
                await this.actualizarMonitorYEstadisticas();
            }
            catch (error) {
                console.error("Error al eliminar la orden:", error);
                this.vista.mostrarToast("Error de red al intentar eliminar la orden.", "error");
            }
            finally {
                this.vista.ocultarSpinner();
            }
        }
    }
    async procesarEditarOrdenEspera(id) {
        const ordenActual = this.modeloGlobal.ordenes.find(o => o.id === id);
        if (!ordenActual)
            return;
        const nuevoTelefono = prompt("Ingrese el nuevo número de teléfono:", ordenActual.telefono);
        if (nuevoTelefono === null)
            return; // Cancelado
        const nuevoCorreo = prompt("Ingrese el nuevo correo electrónico:", ordenActual.correo);
        if (nuevoCorreo === null)
            return; // Cancelado
        this.vista.mostrarSpinner();
        try {
            await Cl_sLaboratorio.actualizarOrden(id, { telefono: nuevoTelefono, correo: nuevoCorreo });
            this.vista.mostrarToast(`Datos de la Orden #${id} actualizados.`, "exito");
            await this.actualizarMonitorYEstadisticas();
        }
        catch (error) {
            console.error("Error al editar la orden:", error);
            this.vista.mostrarToast("Error de red al intentar actualizar la orden.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async ejecutarDespachoFinalPaciente(id, metodo) {
        try {
            const datosPlanos = await Cl_sLaboratorio.buscarOrdenPorId(id);
            if (!datosPlanos)
                return;
            const orden = new Cl_mOrdenBio(datosPlanos);
            if (metodo === "Impreso") {
                this.vista.imprimirReporteResultadosPDF(orden);
            }
            else if (metodo === "WhatsApp") {
                // MEJORA #9: Toast informativo en lugar de alert
                this.vista.mostrarToast(`📱 PDF enviado al número ${orden.telefono}`, "exito");
            }
            else if (metodo === "Correo") {
                this.vista.mostrarToast(`📧 Resultados enviados a ${orden.correo}`, "exito");
            }
            await this.actualizarMonitorYEstadisticas();
        }
        catch (error) {
            console.error("Error al procesar la salida del despacho:", error);
        }
    }
    getCleanEstId() {
        return this.vista.estId;
    }
    // =================================================================
    // MEJORA #1: Buscar paciente existente por cédula para autocompletar
    // =================================================================
    /**
     * Busca en el historial de órdenes si ya existe algún registro con la cédula dada.
     * Si lo encuentra: autocompleta el formulario y muestra el historial de visitas.
     * Si no existe: avisa al recepcionista con un toast informativo.
     */
    buscarPacientePorCedula(cedula) {
        const cedulaNorm = cedula.trim().toLowerCase();
        // Filtramos todas las órdenes que coincidan con esa cédula
        const ordenesDelPaciente = this.modeloGlobal.ordenes.filter(o => o.cedula.trim().toLowerCase() === cedulaNorm);
        if (ordenesDelPaciente.length === 0) {
            this.vista.mostrarToast("Cédula no encontrada. Ingrese los datos del paciente manualmente.", "info");
            this.vista.mostrarHistorialPaciente([]);
            return;
        }
        // Tomamos la orden más reciente para autocompletar (la última del array)
        const ordenMasReciente = ordenesDelPaciente[ordenesDelPaciente.length - 1];
        this.vista.autocompletarPaciente(ordenMasReciente);
        // MEJORA #2: Mostramos todo el historial de visitas del paciente
        this.vista.mostrarHistorialPaciente(ordenesDelPaciente);
    }
    // =================================================================
    // MEJORA #6: Exportar cierre de caja del día
    // =================================================================
    /**
     * Recopila los datos del modelo (totales, tasa, examen top) y los pasa
     * a la vista para que genere el PDF del cierre de caja del día.
     */
    procesarExportarCaja() {
        this.vista.exportarCajaDelDia({
            totalPacientes: this.modeloGlobal.calcularTotalPacientesAtendidos(),
            totalUsd: this.modeloGlobal.calcularMontoTotalUsd(),
            totalBs: this.modeloGlobal.calcularMontoTotalBs(),
            tasa: this.modeloGlobal.tasaCambio,
            estudioTop: this.modeloGlobal.obtenerEstudioMasSolicitado()
        });
    }
}
//# sourceMappingURL=Cl_cLaboratorio.js.map