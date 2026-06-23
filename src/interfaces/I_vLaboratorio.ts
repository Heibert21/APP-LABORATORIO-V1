import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";

export interface I_vLaboratorio {

  get isMenor(): boolean;
  get pacCedulaRep(): string;
  setCedulaRep(valor: string): void;
  get pacNombreRep(): string;
  get pacApellidoRep(): string;
  get pacCedula(): string;
  setCedula(valor: string): void;
  get pacNombre(): string;
  get pacApellido(): string;
  get pacFechaNac(): string;
  get pacSexo(): string;
  get pacTelefono(): string;
  get pacCorreo(): string;
  get pacMetodoPago(): string;

  get nuevaTasa(): number;
  get estId(): string;
  get estNombre(): string;
  get estPrecio(): number;
  get estTiempo(): number;
  get estUnidad(): string;
  get estRango(): string;

  getEstudiosSeleccionados(): string[];

  get fechaReporteExamen(): string;
  get nombreReporteExamen(): string;

  onCambioFiltrosReporteExamen(callback: (nombre: string, fecha: string) => void): void;

  setCantidadExamen(cantidad: number): void;

  onActualizarTasa(callback: () => void): void;
  onAgregarEstudio(callback: () => void): void;
  onRegistrarOrden(callback: () => void): void;
  onEliminarEstudio(callback: (id: string) => void): void;
  onCambioChecks(callback: () => void): void;
  onDespacharOrden(callback: (id: string, metodo: "Impreso" | "WhatsApp" | "Correo") => void): void;
  onBuscarCedulaPaciente(callback: (cedula: string) => void): void;
  onInputCedula(callback: (valor: string) => void): void;
  onInputCedulaRep(callback: (valor: string) => void): void;
  onEliminarOrdenEspera(callback: (id: string) => void): void;
  onEditarOrdenEspera(callback: (id: string) => void): void;
  onCancelarEdicion(callback: () => void): void;
  onExportarCaja(callback: () => void): void;

  get textoBusquedaBandeja(): string;
  onFiltrarBandeja(callback: (texto: string) => void): void;

  setTasaActual(tasa: number): void;
  setTotalesFactura(totalUsd: number, totalBs: number, horaRetiro: string): void;

  renderizarEstudiosDisponibles(estudios: any[]): void;
  renderizarListaCatalogo(estudios: any[]): void;

  renderizarOrdenesEspera(ordenes: Cl_mOrdenBio[]): void;
  renderizarOrdenesListas(ordenes: Cl_mOrdenBio[]): void;
  renderizarEstadisticas(datos: { totalPacientes: number; totalUsd: number; totalBs: number; estudioMasSolicitado: string; }): void;

  limpiarFormPaciente(): void;
  limpiarFormEstudio(): void;

  imprimirReporteResultados(orden: Cl_mOrdenBio): void;
  imprimirReporteCaja(laboratorio: any): void;
  onFiltrarEstudiosBusqueda(callback: (texto: string) => void): void;

  onCambioEsMenor(callback: (esMenor: boolean) => void): void;
  mostrarBloqueRepresentante(esMenor: boolean): void;
  limpiarCamposCedula(): void;
  ocultarTarjetasEstudio(idsAocultar: string[]): void;
  marcarEstudiosPorId(ids: string[]): void;

  autocompletarPaciente(orden: Cl_mOrdenBio, esMenor: boolean): void;
  mostrarHistorialPaciente(ordenes: Cl_mOrdenBio[]): void;
  prepararEdicionOrden(orden: Cl_mOrdenBio): void;

  mostrarToast(mensaje: string, tipo: "exito" | "error" | "info" | "advertencia"): void;
  mostrarSpinner(): void;
  ocultarSpinner(): void;

  confirmarAccion(mensaje: string): Promise<boolean>;
}
