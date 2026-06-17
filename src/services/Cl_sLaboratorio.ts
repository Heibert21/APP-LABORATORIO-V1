import Cl_sMockApi from "./Cl_sMockApi.js";

export default class Cl_sLaboratorio extends Cl_sMockApi {
  private static urlOrdenes = "https://6a1866f21878294b597d0b1b.mockapi.io/ordenes";
  private static urlEstudios = "https://6a1866f21878294b597d0b1b.mockapi.io/estudios";
  private static urlConfig = "https://6a1b5c13bc2f944754931cff.mockapi.io/config/1";
  // --- Métodos del Catálogo ---
  static async obtenerEstudios(): Promise<any[]> {
    return await this.get(this.urlEstudios);
  }
  //registrar estudio en el catalogo
  static async registrarEstudioCatalogo(nuevoEstudio: any): Promise<{ ok: boolean; mensaje: string }> {
    return await this.post(this.urlEstudios, nuevoEstudio);
  }
  //eliminar estudio del catalogo
  static async eliminarEstudioCatalogo(id: string): Promise<{ ok: boolean; mensaje: string }> {
    return await this.delete(`${this.urlEstudios}/${id}`);
  }
  // --- Métodos de Configuración Financiera ---
  static async obtenerTasaDinamica(): Promise<number> {
    const data = await this.get(this.urlConfig);
    return data && data.tasaCambio ? parseFloat(data.tasaCambio) : 40.50;
  }
  //actualizar tasa dinamica
  static async actualizarTasaDinamica(nuevaTasa: number): Promise<{ ok: boolean; mensaje: string }> {
    return await this.put(this.urlConfig, { tasaCambio: nuevaTasa });
  }
  //obtener ordenes
  static async obtenerOrdenes(): Promise<any[]> {
    return await this.get(this.urlOrdenes);
  }
  //buscar orden por id
  static async buscarOrdenPorId(id: string): Promise<any> {
    return await this.get(`${this.urlOrdenes}/${id}`);
  }
  //registrar nueva orden
  static async registrarNuevaOrden(orden: any): Promise<{ ok: boolean; mensaje: string }> {
    return await this.post(this.urlOrdenes, orden);
  }
  //eliminar orden
  static async eliminarOrden(id: string): Promise<{ ok: boolean; mensaje: string }> {
    return await this.delete(`${this.urlOrdenes}/${id}`);
  }
  //actualizar orden
  static async actualizarOrden(id: string, datos: any): Promise<{ ok: boolean; mensaje: string }> {
    return await this.put(`${this.urlOrdenes}/${id}`, datos);
  }
}
