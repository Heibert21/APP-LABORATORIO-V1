import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";

export interface I_vLaboratorio {
  // --- Getters del formulario de paciente ---
  get isMenor(): boolean;
  get pacCedulaRep(): string;
  get pacNombreRep(): string;
  get pacApellidoRep(): string;
  get pacCedula(): string;
  get pacNombre(): string;
  get pacApellido(): string;
  get pacFechaNac(): string;
  get pacSexo(): string;
  get pacTelefono(): string;
  get pacCorreo(): string;
  get pacMetodoPago(): string;

  // --- Getters del formulario de estudios ---
  get nuevaTasa(): number;
  get estId(): string;
  get estNombre(): string;
  get estPrecio(): number;
  get estTiempo(): number;
  get estUnidad(): string;
  get estRango(): string;

  // --- Lectura de selecciones ---
  getEstudiosSeleccionados(): string[];

  // --- Reportes Específicos (Búsqueda Dinámica por Examen) ---
  // Obtiene la fecha (yyyy-mm-dd) y el texto de búsqueda del examen del UI
  get fechaReporteExamen(): string;
  get nombreReporteExamen(): string;
  // Registra el evento que se dispara al escribir un nombre o cambiar la fecha
  onCambioFiltrosReporteExamen(callback: (nombre: string, fecha: string) => void): void;
  // Actualiza el contador visual con la cantidad de estudios coincidentes
  setCantidadExamen(cantidad: number): void;

  // --- Nuevas Estadísticas (Porcentaje y Estudio) ---
  get nombreReporteEstudioStats(): string;
  onCambioReporteEstudioStats(callback: (nombre: string) => void): void;
  setEstadisticasEstudio(solicitudes: number, ingresoUsd: number, promediosHtml: string): void;
  setPorcentajeFinalizados(porcentaje: string): void;

  // --- Suscripción a eventos ---
  onActualizarTasa(callback: () => void): void;
  onAgregarEstudio(callback: () => void): void;
  onRegistrarOrden(callback: () => void): void;
  onEliminarEstudio(callback: (id: string) => void): void;
  onCambioChecks(callback: () => void): void;
  onDespacharOrden(callback: (id: string, metodo: "Impreso" | "WhatsApp" | "Correo") => void): void;
  onBuscarCedulaPaciente(callback: (cedula: string) => void): void;
  onEliminarOrdenEspera(callback: (id: string) => void): void;
  onEditarOrdenEspera(callback: (id: string) => void): void;
  onCancelarEdicion(callback: () => void): void;
  onExportarCaja(callback: () => void): void;
  // --- Búsqueda y Filtrado de Bandejas (MVC) ---
  get textoBusquedaBandeja(): string;
  onFiltrarBandeja(callback: (texto: string) => void): void;

  // --- Métodos de actualización de UI ---
  setTasaActual(tasa: number): void;
  setTotalesFactura(totalUsd: number, totalBs: number, horaRetiro: string): void;

  // --- Renderizado de listas y paneles ---
  renderizarEstudiosDisponibles(estudios: any[]): void;
  renderizarListaCatalogo(estudios: any[]): void;

  renderizarOrdenesEspera(ordenes: Cl_mOrdenBio[]): void;
  renderizarOrdenesListas(ordenes: Cl_mOrdenBio[]): void;
  renderizarEstadisticas(datos: { totalPacientes: number; totalUsd: number; totalBs: number; estudioMasSolicitado: string; }): void;

  // --- Limpieza de formularios ---
  limpiarFormPaciente(): void;
  limpiarFormEstudio(): void;

  // --- Impresión ---
  imprimirReporteResultados(orden: Cl_mOrdenBio): void;
  imprimirReporteCaja(laboratorio: any): void;
  onFiltrarEstudiosBusqueda(callback: (texto: string) => void): void;

  // --- Autocompletado, Historial y Edición ---
  autocompletarPaciente(orden: Cl_mOrdenBio): void;
  mostrarHistorialPaciente(ordenes: Cl_mOrdenBio[]): void;
  prepararEdicionOrden(orden: Cl_mOrdenBio): void;

  // --- Notificaciones y Feedback ---
  mostrarToast(mensaje: string, tipo: "exito" | "error" | "info" | "advertencia"): void;
  mostrarSpinner(): void;
  ocultarSpinner(): void;
  // REFACTORIZACIÓN MVC: confirm() es una función nativa del navegador (DOM) y no debe llamarse
  // desde el controlador. La vista es la única capa autorizada a interactuar con el entorno del navegador.
  confirmarAccion(mensaje: string): Promise<boolean>;
}
