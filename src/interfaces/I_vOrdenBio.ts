import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";

export interface I_vOrdenBio {
  get idOrdenSeleccionada(): string; 
  get nombreLicenciado(): string; 
  
  getValoresCamposCargados(): { parametro: string; valor: string }[];  
  renderizarPacientesEnEspera(ordenes: Cl_mOrdenBio[]): void;  
  renderizarPacientesAtendidos(ordenes: Cl_mOrdenBio[]): void;
  mostrarFormularioCarga(orden: Cl_mOrdenBio): void;          
  limpiarFormularioCarga(): void; 
  onSeleccionarPaciente(callback: (idOrden: string) => void): void;
  onEnviarResultadosALaboratorio(callback: () => void): void;
  // Notificación flotante compartida con la pantalla del Laboratorio
  mostrarToast(mensaje: string, tipo: "exito" | "error" | "info" | "advertencia"): void;
  // Callback para delegar la validación del rango de texto al controlador/modelo sin acoplar la vista al modelo
  onValidarRangoTexto(callback: (valor: string, rangoTexto: string) => boolean): void;
}
