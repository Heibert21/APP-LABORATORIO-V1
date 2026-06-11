import { I_vLaboratorio } from "../interfaces/I_vLaboratorio.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";

export default class Cl_cLaboratorio {
  private vista: I_vLaboratorio;
  private modeloGlobal: Cl_mLaboratorio;
  private catalogoEstudiosCoche: any[] = [];
  private ordenEnEdicionId: string | null = null;

  constructor({ modelo, vista }: { modelo: Cl_mLaboratorio; vista: I_vLaboratorio }) {
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

    this.vista.onExportarCaja(() => this.procesarExportarCaja());

    this.vista.onEliminarOrdenEspera((id) => this.procesarEliminarOrdenEspera(id));
    this.vista.onEditarOrdenEspera((id) => this.procesarEditarOrdenEspera(id));
    this.vista.onCancelarEdicion(() => this.cancelarEdicionActual());
    this.vista.onCambioFiltrosReporteExamen((nombre, fecha) => this.procesarCambioFiltrosExamen(nombre, fecha));
  }

  private cancelarEdicionActual() {
    this.ordenEnEdicionId = null;
    this.vista.limpiarFormPaciente();
    this.vista.mostrarToast("Edición de orden cancelada.", "info");
  }

  private async cargarConfiguracionesYListas() {
    this.vista.mostrarSpinner();
    try {
      const tasa = await Cl_sLaboratorio.obtenerTasaDinamica();
      this.modeloGlobal.tasaCambio = tasa;
      this.vista.setTasaActual(tasa);

      this.catalogoEstudiosCoche = await Cl_sLaboratorio.obtenerEstudios();

      this.vista.renderizarListaCatalogo(this.catalogoEstudiosCoche);

      this.vista.renderizarEstudiosDisponibles(this.catalogoEstudiosCoche);

      await this.actualizarMonitorYEstadisticas();
    } catch (error) {
      console.error("Error crítico de inicialización asíncrona:", error);
      this.vista.mostrarToast("Error de conexión al cargar la configuración.", "error");
    } finally {
      this.vista.ocultarSpinner();
    }
  }
  private async actualizarMonitorYEstadisticas() {
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
      this.procesarCambioFiltrosExamen(this.vista.nombreReporteExamen, this.vista.fechaReporteExamen);
    } catch (error) {
      console.error("Error al actualizar monitores del laboratorio:", error);
    }
  }

  /**
   * Método que captura el cambio de filtros (nombre de examen o fecha),
   * consulta el modelo con ambos datos y actualiza la cantidad en la interfaz.
   * Pertenece a la funcionalidad de Reporte Dinámico de Exámenes.
   */
  private procesarCambioFiltrosExamen(nombre: string, fecha: string) {
    if (!fecha || !nombre) {
      this.vista.setCantidadExamen(0);
      return;
    }
    const cantidad = this.modeloGlobal.contarExamenesPorFecha(nombre, fecha);
    this.vista.setCantidadExamen(cantidad);
  }



  private recalcularTotalesEnTiempoReal() {
    const codigosSeleccionados = this.vista.getEstudiosSeleccionados();
    const estudiosElegidos = this.catalogoEstudiosCoche.filter(e => codigosSeleccionados.includes(e.id));

    const calculos = this.modeloGlobal.calcularEstructuraFactura(estudiosElegidos);
    const tiempos = this.modeloGlobal.calcularTiemposEntrega(calculos.tiempoMaxHoras);

    this.vista.setTotalesFactura(calculos.totalUsd, calculos.totalBs, tiempos.entrega);
    this.vista.setTasaActual(this.modeloGlobal.tasaCambio);
  }

  private async procesarCambioTasa() {
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
    } catch {
      this.vista.mostrarToast("Error de red al actualizar la tasa.", "error");
    } finally {
      this.vista.ocultarSpinner();
    }
  }

  private async procesarRegistroNuevoEstudio() {
    const id = this.getCleanEstId();
    const nombre = this.vista.estNombre;
    const precio = this.vista.estPrecio;
    const tiempo = this.vista.estTiempo;
    const sugerido = "Todos"; // Ya no se usa la sugerencia desde UI
    const unidad = this.vista.estUnidad || "";
    const rango = this.vista.estRango || "";

    if (!id || !nombre || precio <= 0 || tiempo <= 0) {
      this.vista.mostrarToast("Rellene todos los campos obligatorios del estudio correctamente.", "advertencia");
      return;
    }

    let parametrosVaciosFinal: any[] = [];

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
    } catch (error) {
      this.vista.mostrarToast("Error de red al registrar el nuevo estudio.", "error");
    } finally {
      this.vista.ocultarSpinner();
    }
  }
  private async procesarBajaEstudioCatálogo(id: string) {
    if (!confirm(`¿Está seguro de que desea eliminar el estudio clínico [${id}] del catálogo?`)) return;

    const tieneOrdenesActivas = this.modeloGlobal.ordenes.some(
      o => o.status === "En Espera" && o.examenesSolicitados.toLowerCase().includes(id.toLowerCase())
    );
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
    } catch {
      this.vista.mostrarToast("Error de red al intentar dar de baja el estudio.", "error");
    } finally {
      this.vista.ocultarSpinner();
    }
  }

  private async procesarCierreYFacturacionOrden() {
    const codigosSeleccionados = this.vista.getEstudiosSeleccionados();
    if (codigosSeleccionados.length === 0) {
      this.vista.mostrarToast("Seleccione al menos un estudio de laboratorio para el paciente.", "advertencia");
      return;
    }

    const estudiosElegidos = this.catalogoEstudiosCoche.filter(e => codigosSeleccionados.includes(e.id));
    const calculosFactura = this.modeloGlobal.calcularEstructuraFactura(estudiosElegidos);
    const tiemposEntrega = this.modeloGlobal.calcularTiemposEntrega(calculosFactura.tiempoMaxHoras);
    const listaNombresExamenes = estudiosElegidos.map(e => e.nombre).join(", ");

    // --- FLUJO DE EDICIÓN ---
    if (this.ordenEnEdicionId) {
      this.vista.mostrarSpinner();
      try {
        await Cl_sLaboratorio.actualizarOrden(this.ordenEnEdicionId, {
          examenesSolicitados: listaNombresExamenes,
          montoTotal$: calculosFactura.totalUsd,
          resultados: calculosFactura.matrizResultados,
          horaEntregaEstimada: tiemposEntrega.entrega
        });
        this.vista.mostrarToast(`Exámenes de la Orden #${this.ordenEnEdicionId} actualizados exitosamente.`, "exito");
        this.cancelarEdicionActual(); // Limpia formulario y resetea id
        await this.actualizarMonitorYEstadisticas();
      } catch (error) {
        console.error("Error al actualizar la orden:", error);
        this.vista.mostrarToast("Error de red al actualizar los exámenes.", "error");
      } finally {
        this.vista.ocultarSpinner();
      }
      return;
    }

    // --- FLUJO DE CREACIÓN NORMAL ---
    const edadCalculada = Cl_mOrdenBio.calcularEdad(this.vista.pacFechaNac);
    const edadAnios = Cl_mOrdenBio.convertirEdadAAños(edadCalculada);
    const cedulaEscrita = this.vista.pacCedula.trim();

    const esMenor = this.vista.isMenor;
    const cedulaRep = this.vista.pacCedulaRep.trim();
    const nombreRep = this.vista.pacNombreRep.trim();
    const apellidoRep = this.vista.pacApellidoRep.trim();
    
    // --- VALIDACIÓN DE CÉDULA SEGÚN SI ES MENOR O NO ---
    if (esMenor) {
      if (!cedulaRep || !nombreRep) {
        this.vista.mostrarToast("Debe ingresar la cédula y nombre del representante legal para un menor.", "advertencia");
        return;
      }
    } else {
      if (!cedulaEscrita) {
        this.vista.mostrarToast("Debe ingresar la cédula del paciente.", "advertencia");
        return;
      }
    }
    
    // Generar CR + cédula del representante + número aleatorio de 3 dígitos si es menor
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const cedulaFinal = esMenor ? `CR${cedulaRep}-${randomNum}` : cedulaEscrita;

    // --- VALIDACIÓN: cédula + nombre únicos por paciente ---
    const esDuplicado = this.modeloGlobal.validarDuplicadoPaciente(
      cedulaFinal,
      this.vista.pacNombre,
      this.vista.pacApellido,
      esMenor,
      cedulaRep,
      nombreRep,
      apellidoRep
    );
    if (esDuplicado) {
      this.vista.mostrarToast(
        `⚠️ La cédula "${cedulaFinal}" ya existe con otro nombre. Verifique los datos.`,
        "error"
      );
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
        this.vista.mostrarToast(`¡Orden procesada! Retiro estimado: ${tiemposEntrega.entrega}.`, "exito");
        this.vista.limpiarFormPaciente();
        await this.actualizarMonitorYEstadisticas();
      }
    } catch (error) {
      console.error("Error al registrar la orden:", error);
      this.vista.mostrarToast("Error de red al registrar la orden del paciente.", "error");
    } finally {
      this.vista.ocultarSpinner();
    }
  }

  private async procesarEliminarOrdenEspera(id: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar la Orden #${id}? Se perderán todos los datos.`)) {
      this.vista.mostrarSpinner();
      try {
        await Cl_sLaboratorio.eliminarOrden(id);
        this.vista.mostrarToast(`Orden #${id} eliminada correctamente.`, "exito");
        await this.actualizarMonitorYEstadisticas();
      } catch (error) {
        console.error("Error al eliminar la orden:", error);
        this.vista.mostrarToast("Error de red al intentar eliminar la orden.", "error");
      } finally {
        this.vista.ocultarSpinner();
      }
    }
  }

  private async procesarEditarOrdenEspera(id: string) {
    const ordenActual = this.modeloGlobal.ordenes.find(o => o.id === id);
    if (!ordenActual) return;
    
    this.ordenEnEdicionId = id;
    this.vista.prepararEdicionOrden(ordenActual);
  }

  private async ejecutarDespachoFinalPaciente(id: string, metodo: "Impreso" | "WhatsApp" | "Correo") {
    try {
      const datosPlanos = await Cl_sLaboratorio.buscarOrdenPorId(id);
      if (!datosPlanos) return;

      const orden = new Cl_mOrdenBio(datosPlanos);

      if (metodo === "Impreso") {
        this.vista.imprimirReporte(orden);
      } else if (metodo === "WhatsApp") {
        this.vista.mostrarToast(`📱 PDF enviado al número ${orden.telefono}`, "exito");
      } else if (metodo === "Correo") {
        this.vista.mostrarToast(`📧 Resultados enviados a ${orden.correo}`, "exito");
      }

      await this.actualizarMonitorYEstadisticas();
    } catch (error) {
      console.error("Error al procesar la salida del despacho:", error);
    }
  }

  private getCleanEstId(): string {
    return this.vista.estId;
  }
  /**
   * Busca en el historial de órdenes por cédula del paciente O por número de orden.
   * Si lo encuentra: autocompleta el formulario y muestra el historial de visitas.
   * Si no existe: avisa al recepcionista con un toast informativo.
   */
  private buscarPacientePorCedula(termino: string): void {
    const terminoNorm = termino.trim().toLowerCase();

    // Validación Evitar búsquedas vacías
    if (!terminoNorm) {
      this.vista.mostrarToast("Por favor, ingrese una cédula o número de orden para buscar.", "advertencia");
      return;
    }
    // Validación Evitar buscar pacientes con la cédula genérica "MENOR"
    if (terminoNorm === "menor") {
      this.vista.mostrarToast("No se puede autocompletar el historial con la cédula genérica 'MENOR'.", "advertencia");
      this.vista.mostrarHistorialPaciente([]);
      return;
    }

    // 1. Intentar buscar por número de orden exacto (id)
    const ordenPorId = this.modeloGlobal.ordenes.find(
      o => String(o.id).trim().toLowerCase() === terminoNorm
    );
    if (ordenPorId) {
      this.vista.autocompletarPaciente(ordenPorId);
      // Si se buscó por orden, mostramos el historial completo de ese paciente (por cédula)
      const cedulaDeLaOrden = ordenPorId.cedula.trim().toLowerCase();
      const historialDelPaciente = this.modeloGlobal.ordenes.filter(
        o => o.cedula.trim().toLowerCase() === cedulaDeLaOrden ||
             o.cedulaRepresentante.trim().toLowerCase() === cedulaDeLaOrden
      );
      this.vista.mostrarHistorialPaciente(historialDelPaciente);
      return;
    }

    // 2. Si no se encontró por orden, buscar por cédula del paciente o representante
    const ordenesDelPaciente = this.modeloGlobal.ordenes.filter(
      o => o.cedula.trim().toLowerCase() === terminoNorm || o.cedulaRepresentante.trim().toLowerCase() === terminoNorm
    );

    if (ordenesDelPaciente.length === 0) {
      this.vista.mostrarToast("No se encontró ningún paciente con esa cédula o número de orden.", "info");
      this.vista.mostrarHistorialPaciente([]);
      return;
    }
    // Tomamos la orden más reciente para autocompletar (la última del array)
    const ordenMasReciente = ordenesDelPaciente[ordenesDelPaciente.length - 1];
    this.vista.autocompletarPaciente(ordenMasReciente);
    // Mostramos todo el historial de visitas del paciente
    this.vista.mostrarHistorialPaciente(ordenesDelPaciente);
  }
  /**
   * Recopila los datos del modelo (totales, tasa, examen top) y los pasa
   * a la vista para que genere el PDF del cierre de caja del día.
   */
  private procesarExportarCaja(): void {
    this.vista.imprimirReporte(this.modeloGlobal);
  }
}