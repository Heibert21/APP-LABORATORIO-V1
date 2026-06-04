import Cl_sMockApi from "./Cl_sMockApi.js";

export default class Cl_sLaboratorio extends Cl_sMockApi {
  private static urlOrdenes = "https://6a1866f21878294b597d0b1b.mockapi.io/ordenes";
  private static urlEstudios = "https://6a1866f21878294b597d0b1b.mockapi.io/estudios";
  private static urlConfig = "https://6a1b5c13bc2f944754931cff.mockapi.io/config/1";
  // --- Métodos del Catálogo ---
  static async obtenerEstudios(): Promise<any[]> {
    return await this.get(this.urlEstudios);
  }
  static async registrarEstudioCatalogo(nuevoEstudio: any): Promise<{ ok: boolean; mensaje: string }> {
    return await this.post(this.urlEstudios, nuevoEstudio);
  }

  static async eliminarEstudioCatalogo(id: string): Promise<{ ok: boolean; mensaje: string }> {
    return await this.delete(`${this.urlEstudios}/${id}`);
  }

  // --- Métodos de Configuración Financiera ---
  static async obtenerTasaDinamica(): Promise<number> {
    const data = await this.get(this.urlConfig);
    return data && data.tasaCambio ? parseFloat(data.tasaCambio) : 40.50;
  }

  static async actualizarTasaDinamica(nuevaTasa: number): Promise<{ ok: boolean; mensaje: string }> {
    return await this.put(this.urlConfig, { tasaCambio: nuevaTasa });
  }

  // --- Métodos de Órdenes (Requeridos por Cl_cLaboratorio) ---
  static async obtenerOrdenes(): Promise<any[]> {
    return await this.get(this.urlOrdenes);
  }

  static async buscarOrdenPorId(id: string): Promise<any> {
    return await this.get(`${this.urlOrdenes}/${id}`);
  }

  static async registrarNuevaOrden(orden: any): Promise<{ ok: boolean; mensaje: string }> {
    return await this.post(this.urlOrdenes, orden);
  }

  static async eliminarOrden(id: string): Promise<{ ok: boolean; mensaje: string }> {
    return await this.delete(`${this.urlOrdenes}/${id}`);
  }

  static async actualizarOrden(id: string, datos: any): Promise<{ ok: boolean; mensaje: string }> {
    return await this.put(`${this.urlOrdenes}/${id}`, datos);
  }
}
