import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
export default class Cl_cLaboratorio {
    vista;
    modeloGlobal;
    catalogoEstudiosCoche = [];
    ordenEnEdicionId = null;
    constructor({ modelo, vista }) {
        this.vista = vista;
        this.modeloGlobal = modelo;
        this.cargarConfiguracionesYListas();
        this.vista.onActualizarTasa(() => this.procesarCambioTasa());
        this.vista.onAgregarEstudio(() => this.procesarRegistroNuevoEstudio());
        this.vista.onRegistrarOrden(() => this.procesarCierreYFacturacionOrden());
        this.vista.onEliminarEstudio((id) => this.procesarBajaEstudioCatálogo(id));
        this.vista.onDespacharOrden((id, metodo) => this.ejecutarDespachoFinalPaciente(id, metodo));
        this.vista.onCambioChecks(() => this.recalcularTotalesEnTiempoReal());
        this.vista.onBuscarCedulaPaciente((cedula) => this.buscarPacientePorCedula(cedula));
        this.vista.onInputCedula((valor) => {
            this.vista.setCedula(valor.replace(/\D/g, ""));
        });
        this.vista.onInputCedulaRep((valor) => {
            this.vista.setCedulaRep(valor.replace(/[^vVeE0-9-]/g, ""));
        });
        this.vista.onCambioEsMenor((esMenor) => {
            this.vista.mostrarBloqueRepresentante(esMenor);
            this.vista.limpiarCamposCedula();
        });
        this.vista.onFiltrarEstudiosBusqueda((texto) => {
            const idsAocultar = this.catalogoEstudiosCoche
                .filter(estudio => {
                const contenidoBuscable = `${estudio.codigo || estudio.id} ${estudio.nombre}`.toLowerCase();
                return !contenidoBuscable.includes(texto.toLowerCase());
            })
                .map(e => String(e.id));
            this.vista.ocultarTarjetasEstudio(idsAocultar);
        });
        this.vista.onExportarCaja(() => this.procesarExportarCaja());
        this.vista.onEliminarOrdenEspera((id) => this.procesarEliminarOrdenEspera(id));
        this.vista.onEditarOrdenEspera((id) => this.procesarEditarOrdenEspera(id));
        this.vista.onCancelarEdicion(() => this.cancelarEdicionActual());
        this.vista.onCambioFiltrosReporteExamen((nombre, fecha) => this.procesarCambioFiltrosExamen(nombre, fecha));
        this.vista.onFiltrarBandeja((texto) => this.procesarFiltradoBandeja(texto));
        if (this.vista.onFiltrosReporteGralCambio) {
            this.vista.onFiltrosReporteGralCambio((filtros) => this.procesarReporteGeneral(filtros));
        }
        if (this.vista.onExportarReporteSemana) {
            this.vista.onExportarReporteSemana(() => this.procesarExportarReporteSemana());
        }
    }
    cancelarEdicionActual() {
        this.ordenEnEdicionId = null;
        this.vista.limpiarFormPaciente();
        this.vista.mostrarToast("Edición de orden cancelada.", "info");
    }
    async cargarConfiguracionesYListas() {
        this.vista.mostrarSpinner();
        try {
            const tasa = await Cl_sLaboratorio.obtenerTasaDinamica();
            this.modeloGlobal.tasaCambio = tasa;
            this.vista.setTasaActual(tasa);
            this.catalogoEstudiosCoche = await Cl_sLaboratorio.obtenerEstudios();
            this.vista.renderizarListaCatalogo(this.catalogoEstudiosCoche);
            this.vista.renderizarEstudiosDisponibles(this.catalogoEstudiosCoche);
            await this.actualizarMonitorYEstadisticas();
        }
        catch (error) {
            console.error("Error crítico de inicialización asíncrona:", error);
            this.vista.mostrarToast("Error de conexión al cargar la configuración.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async actualizarMonitorYEstadisticas() {
        try {
            const ordenesPlanas = await Cl_sLaboratorio.obtenerOrdenes();
            this.modeloGlobal.setOrdenes(ordenesPlanas);
            const textoFiltro = this.vista.textoBusquedaBandeja;
            const pendientes = this.modeloGlobal.ordenes.filter((o) => o.status === "En Espera" && o.coincideConFiltro(textoFiltro));
            const listas = this.modeloGlobal.ordenes.filter((o) => o.status === "Listo para Despacho" && o.coincideConFiltro(textoFiltro));
            this.vista.renderizarOrdenesEspera(pendientes);
            this.vista.renderizarOrdenesListas(listas);
            this.vista.renderizarEstadisticas({
                totalPacientes: this.modeloGlobal.calcularTotalPacientesAtendidos(),
                totalUsd: this.modeloGlobal.calcularMontoTotalUsd(),
                totalBs: this.modeloGlobal.calcularMontoTotalBs(),
                estudioMasSolicitado: this.modeloGlobal.obtenerEstudioMasSolicitado(),
            });
            this.procesarCambioFiltrosExamen(this.vista.nombreReporteExamen, this.vista.fechaReporteExamen);
            this.procesarReporteGeneral({ examen: "", fechaDesde: "", fechaHasta: "", paciente: "" });
            const ordenesAntiguas = this.modeloGlobal.obtenerOrdenesAntiguasSemanaMas();
            if (this.vista.renderizarReporteSemana) {
                this.vista.renderizarReporteSemana(ordenesAntiguas);
            }
        }
        catch (error) {
            console.error("Error al actualizar monitores del laboratorio:", error);
        }
    }
    procesarCambioFiltrosExamen(nombre, fecha) {
        if (!fecha || !nombre) {
            this.vista.setCantidadExamen(0);
            return;
        }
        const cantidad = this.modeloGlobal.contarExamenesPorFecha(nombre, fecha);
        this.vista.setCantidadExamen(cantidad);
    }
    procesarFiltradoBandeja(texto) {
        const textoFiltro = texto.trim();
        const pendientes = this.modeloGlobal.ordenes.filter((o) => o.status === "En Espera" && o.coincideConFiltro(textoFiltro));
        const listas = this.modeloGlobal.ordenes.filter((o) => o.status === "Listo para Despacho" && o.coincideConFiltro(textoFiltro));
        this.vista.renderizarOrdenesEspera(pendientes);
        this.vista.renderizarOrdenesListas(listas);
    }
    procesarReporteGeneral(filtros) {
        const datosReporte = this.modeloGlobal.obtenerReporteExamenes(filtros);
        if (this.vista.renderizarReporteExamenes) {
            this.vista.renderizarReporteExamenes(datosReporte);
        }
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
        const id = this.vista.estId;
        const nombre = this.vista.estNombre;
        const precio = this.vista.estPrecio;
        const tiempo = this.vista.estTiempo;
        const sugerido = "Todos";
        const unidad = this.vista.estUnidad || "";
        const rango = this.vista.estRango || "";
        if (!id || !nombre || precio <= 0 || tiempo <= 0) {
            this.vista.mostrarToast("Rellene todos los campos obligatorios del estudio correctamente.", "advertencia");
            return;
        }
        let parametrosVaciosFinal = [];
        parametrosVaciosFinal = this.modeloGlobal.crearEstructuraResultadosVacios(nombre, unidad, rango);
        const nuevoEstudioPlano = {
            id: id,
            codigo: id,
            nombre,
            precio,
            tiempoProcesamiento: tiempo,
            sugeridoPara: sugerido,
            parametrosAsociados: parametrosVaciosFinal
        };
        this.vista.mostrarSpinner();
        try {
            const respuesta = await Cl_sLaboratorio.registrarEstudioCatalogo(nuevoEstudioPlano);
            if (respuesta.ok) {
                this.vista.mostrarToast(`Estudio [${id}] incorporado exitosamente.`, "exito");
                this.vista.limpiarFormEstudio();
                this.catalogoEstudiosCoche = await Cl_sLaboratorio.obtenerEstudios();
                this.vista.renderizarListaCatalogo(this.catalogoEstudiosCoche);
                this.vista.renderizarEstudiosDisponibles(this.catalogoEstudiosCoche);
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
        if (!(await this.vista.confirmarAccion(`¿Está seguro de que desea eliminar el estudio clínico [${id}] del catálogo?`)))
            return;
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
                this.vista.renderizarEstudiosDisponibles(this.catalogoEstudiosCoche);
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
            this.vista.mostrarToast("Seleccione al menos un estudio de laboratorio para el paciente.", "advertencia");
            return;
        }
        const estudiosElegidos = this.catalogoEstudiosCoche.filter(e => codigosSeleccionados.includes(e.id));
        const calculosFactura = this.modeloGlobal.calcularEstructuraFactura(estudiosElegidos);
        const tiemposEntrega = this.modeloGlobal.calcularTiemposEntrega(calculosFactura.tiempoMaxHoras);
        const listaNombresExamenes = estudiosElegidos.map(e => e.nombre).join(", ");
        const datosComunes = { calculosFactura, tiemposEntrega, listaNombresExamenes };
        if (this.ordenEnEdicionId) {
            await this._procesarEdicionOrden(this.ordenEnEdicionId, datosComunes);
        }
        else {
            await this._procesarCreacionOrden(datosComunes);
        }
    }
    async _procesarEdicionOrden(idOrden, datos) {
        this.vista.mostrarSpinner();
        try {
            await Cl_sLaboratorio.actualizarOrden(idOrden, {
                examenesSolicitados: datos.listaNombresExamenes,
                montoTotal$: datos.calculosFactura.totalUsd,
                resultados: datos.calculosFactura.matrizResultados,
                horaEntregaEstimada: datos.tiemposEntrega.entrega
            });
            this.vista.mostrarToast(`Exámenes de la Orden #${idOrden} actualizados exitosamente.`, "exito");
            this.cancelarEdicionActual();
            await this.actualizarMonitorYEstadisticas();
        }
        catch (error) {
            console.error("Error al actualizar la orden:", error);
            this.vista.mostrarToast("Error de red al actualizar los exámenes.", "error");
        }
        finally {
            this.vista.ocultarSpinner();
        }
    }
    async _procesarCreacionOrden(datos) {
        const edadCalculada = Cl_mOrdenBio.calcularEdad(this.vista.pacFechaNac);
        const edadAnios = Cl_mOrdenBio.convertirEdadAAños(edadCalculada);
        const cedulaEscrita = this.vista.pacCedula.trim();
        const esMenor = this.vista.isMenor;
        const cedulaRep = this.vista.pacCedulaRep.trim();
        const nombreRep = this.vista.pacNombreRep.trim();
        const apellidoRep = this.vista.pacApellidoRep.trim();
        if (esMenor) {
            if (!cedulaRep || !nombreRep) {
                this.vista.mostrarToast("Debe ingresar la cédula y nombre del representante legal para un menor.", "advertencia");
                return;
            }
        }
        else {
            if (!cedulaEscrita) {
                this.vista.mostrarToast("Debe ingresar la cédula del paciente.", "advertencia");
                return;
            }
        }
        const cedulaFinal = esMenor ? Cl_mOrdenBio.generarCedulaMenor(cedulaRep) : cedulaEscrita;
        const esDuplicado = this.modeloGlobal.validarDuplicadoPaciente(cedulaFinal, this.vista.pacNombre, this.vista.pacApellido, esMenor, cedulaRep, nombreRep, apellidoRep);
        if (esDuplicado) {
            this.vista.mostrarToast(`⚠️ La cédula "${cedulaFinal}" ya existe con otro nombre. Verifique los datos.`, "error");
            return;
        }
        const nuevaOrden = {
            cedula: cedulaFinal,
            cedulaRepresentante: esMenor ? cedulaRep : "",
            nombreRepresentante: esMenor ? nombreRep : "",
            apellidoRepresentante: esMenor ? apellidoRep : "",
            nombre: this.vista.pacNombre,
            apellido: this.vista.pacApellido,
            edad: edadCalculada,
            sexo: this.vista.pacSexo,
            telefono: this.vista.pacTelefono,
            correo: this.vista.pacCorreo,
            metodoPago: this.vista.pacMetodoPago,
            montoTotal$: datos.calculosFactura.totalUsd,
            fechaRegistro: datos.tiemposEntrega.registro,
            horaEntregaEstimada: datos.tiemposEntrega.entrega,
            examenesSolicitados: datos.listaNombresExamenes,
            status: "En Espera",
            licBioanalista: "",
            resultados: datos.calculosFactura.matrizResultados
        };
        this.vista.mostrarSpinner();
        try {
            const respuesta = await Cl_sLaboratorio.registrarNuevaOrden(nuevaOrden);
            if (respuesta.ok) {
                this.vista.mostrarToast(`¡Orden procesada! Retiro estimado: ${datos.tiemposEntrega.entrega}.`, "exito");
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
        if (await this.vista.confirmarAccion(`¿Estás seguro de que deseas eliminar la Orden #${id}? Se perderán todos los datos.`)) {
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
        this.ordenEnEdicionId = id;
        const esMenor = (ordenActual.cedula === "MENOR" || ordenActual.cedula.startsWith("CR")) && !!ordenActual.cedulaRepresentante;
        this.vista.autocompletarPaciente(ordenActual, esMenor);
        const examenesSolicitadosArray = ordenActual.examenesSolicitados.split(", ").map(e => e.trim().toLowerCase());
        const idsASeleccionar = this.catalogoEstudiosCoche
            .filter(e => examenesSolicitadosArray.some(ex => e.nombre.toLowerCase().includes(ex)))
            .map(e => String(e.id));
        this.vista.marcarEstudiosPorId(idsASeleccionar);
        this.vista.prepararEdicionOrden(ordenActual);
    }
    async ejecutarDespachoFinalPaciente(id, metodo) {
        try {
            const datosPlanos = await Cl_sLaboratorio.buscarOrdenPorId(id);
            if (!datosPlanos)
                return;
            const orden = new Cl_mOrdenBio(datosPlanos);
            if (metodo === "Impreso") {
                this.vista.imprimirReporteResultados(orden);
            }
            else if (metodo === "WhatsApp") {
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
    buscarPacientePorCedula(termino) {
        const terminoNorm = termino.trim().toLowerCase();
        if (!terminoNorm) {
            this.vista.mostrarToast("Por favor, ingrese una cédula o número de orden para buscar.", "advertencia");
            return;
        }
        if (terminoNorm === "menor") {
            this.vista.mostrarToast("No se puede autocompletar el historial con la cédula genérica 'MENOR'.", "advertencia");
            this.vista.mostrarHistorialPaciente([]);
            return;
        }
        const ordenPorId = this.modeloGlobal.ordenes.find(o => String(o.id).trim().toLowerCase() === terminoNorm);
        if (ordenPorId) {
            const esMenorPorId = (ordenPorId.cedula === "MENOR" || ordenPorId.cedula.startsWith("CR")) && !!ordenPorId.cedulaRepresentante;
            this.vista.autocompletarPaciente(ordenPorId, esMenorPorId);
            const cedulaDeLaOrden = ordenPorId.cedula.trim().toLowerCase();
            const historialDelPaciente = this.modeloGlobal.ordenes.filter(o => o.cedula.trim().toLowerCase() === cedulaDeLaOrden ||
                o.cedulaRepresentante.trim().toLowerCase() === cedulaDeLaOrden);
            this.vista.mostrarHistorialPaciente(historialDelPaciente);
            return;
        }
        const ordenesDelPaciente = this.modeloGlobal.ordenes.filter(o => o.cedula.trim().toLowerCase() === terminoNorm || o.cedulaRepresentante.trim().toLowerCase() === terminoNorm);
        if (ordenesDelPaciente.length === 0) {
            this.vista.mostrarToast("No se encontró ningún paciente con esa cédula o número de orden.", "info");
            this.vista.mostrarHistorialPaciente([]);
            return;
        }
        const ordenMasReciente = ordenesDelPaciente[ordenesDelPaciente.length - 1];
        const esMenor = (ordenMasReciente.cedula === "MENOR" || ordenMasReciente.cedula.startsWith("CR")) && !!ordenMasReciente.cedulaRepresentante;
        this.vista.autocompletarPaciente(ordenMasReciente, esMenor);
        this.vista.mostrarHistorialPaciente(ordenesDelPaciente);
    }
    procesarExportarCaja() {
        this.vista.imprimirReporteCaja(this.modeloGlobal);
    }
    procesarExportarReporteSemana() {
        const ordenesAntiguas = this.modeloGlobal.obtenerOrdenesAntiguasSemanaMas();
        if (this.vista.imprimirReporteSemana) {
            this.vista.imprimirReporteSemana(ordenesAntiguas);
        }
    }
}
//# sourceMappingURL=Cl_cLaboratorio.js.map