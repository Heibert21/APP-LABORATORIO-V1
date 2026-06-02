import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";

export interface I_vLaboratorio {
  // --- Getters del formulario de paciente ---
  get pacCedula(): string;
  get pacNombre(): string;
  get pacApellido(): string;
  get pacFechaNac(): string;
  get pacSexo(): string;
  get pacEmbarazada(): boolean;
  get pacTelefono(): string;
  get pacCorreo(): string;
  get pacMetodoPago(): string;

  // --- Getters del formulario de estudios ---
  get nuevaTasa(): number;
  get estId(): string;
  get estNombre(): string;
  get estPrecio(): number;
  get estTiempo(): number;
  get estTipo(): string;
  get estSugerido(): string;
  get estUnidad(): string;
  get estRango(): string;

  // --- Lectura de selecciones ---
  getEstudiosSeleccionados(): string[];
  getSubExamenesSeleccionados(): string[];

  // --- Suscripción a eventos ---
  onActualizarTasa(callback: () => void): void;
  onAgregarEstudio(callback: () => void): void;
  onRegistrarOrden(callback: () => void): void;
  onEliminarEstudio(callback: (id: string) => void): void;
  onCambioFiltroSugerido(callback: () => void): void;
  onCambioChecks(callback: () => void): void;
  onDespacharOrden(callback: (id: string, metodo: "Impreso" | "WhatsApp" | "Correo") => void): void;
  onBuscarCedulaPaciente(callback: (cedula: string) => void): void;  // NUEVO: autocomplete por cédula
  onEliminarOrdenEspera(callback: (id: string) => void): void;
  onEditarOrdenEspera(callback: (id: string) => void): void;

  // --- Métodos de actualización de UI ---
  setTasaActual(tasa: number): void;
  setTotalesFactura(totalUsd: number, totalBs: number, horaRetiro: string): void;

  // --- Renderizado de listas y paneles ---
  renderizarEstudiosDisponibles(estudios: any[], sugerencia: string): void;
  renderizarListaCatalogo(estudios: any[]): void;
  renderizarSubExamenesParaPaquete(estudios: any[]): void;
  renderizarOrdenesEspera(ordenes: Cl_mOrdenBio[]): void;
  renderizarOrdenesListas(ordenes: Cl_mOrdenBio[]): void;
  renderizarEstadisticas(datos: { totalPacientes: number; totalUsd: number; totalBs: number; estudioMasSolicitado: string; }): void;

  // --- Limpieza de formularios ---
  limpiarFormPaciente(): void;
  limpiarFormEstudio(): void;
  alternarVisibilidadSubExamenes(mostrar: boolean): void;

  // --- Impresión ---
  imprimirReporteResultadosPDF(orden: Cl_mOrdenBio): void;
  onFiltrarEstudiosBusqueda(callback: (texto: string) => void): void;

  // NUEVO: Rellena automáticamente el formulario con datos de un paciente ya conocido
  autocompletarPaciente(orden: Cl_mOrdenBio): void;

  // NUEVO: Muestra el historial de visitas del paciente debajo del formulario
  mostrarHistorialPaciente(ordenes: Cl_mOrdenBio[]): void;

  // NUEVO: Notificación flotante tipo toast (reemplaza alert/confirm en algunos casos)
  mostrarToast(mensaje: string, tipo: "exito" | "error" | "info" | "advertencia"): void;

  // NUEVO: Mostrar y ocultar spinner de carga global
  mostrarSpinner(): void;
  ocultarSpinner(): void;

  // NUEVO: Genera e imprime el reporte de caja del día
  exportarCajaDelDia(datos: { totalPacientes: number; totalUsd: number; totalBs: number; tasa: number; estudioTop: string; }): void;
}
