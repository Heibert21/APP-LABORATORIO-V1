import Cl_sMockApi from "./Cl_sMockApi.js";
export default class Cl_sLaboratorio extends Cl_sMockApi {
    static urlOrdenes = "https://6a1866f21878294b597d0b1b.mockapi.io/ordenes";
    static urlEstudios = "https://6a1866f21878294b597d0b1b.mockapi.io/estudios";
    static urlConfig = "https://6a1b5c13bc2f944754931cff.mockapi.io/config/1";
    // --- Métodos del Catálogo ---
    static async obtenerEstudios() {
        return await this.get(this.urlEstudios);
    }
    static async registrarEstudioCatalogo(nuevoEstudio) {
        return await this.post(this.urlEstudios, nuevoEstudio);
    }
    static async eliminarEstudioCatalogo(id) {
        return await this.delete(`${this.urlEstudios}/${id}`);
    }
    // --- Métodos de Configuración Financiera ---
    static async obtenerTasaDinamica() {
        const data = await this.get(this.urlConfig);
        return data && data.tasaCambio ? parseFloat(data.tasaCambio) : 40.50;
    }
    static async actualizarTasaDinamica(nuevaTasa) {
        return await this.put(this.urlConfig, { tasaCambio: nuevaTasa });
    }
    // --- Métodos de Órdenes (Requeridos por Cl_cLaboratorio) ---
    static async obtenerOrdenes() {
        return await this.get(this.urlOrdenes);
    }
    static async buscarOrdenPorId(id) {
        return await this.get(`${this.urlOrdenes}/${id}`);
    }
    static async registrarNuevaOrden(orden) {
        return await this.post(this.urlOrdenes, orden);
    }
    static async eliminarOrden(id) {
        return await this.delete(`${this.urlOrdenes}/${id}`);
    }
    static async actualizarOrden(id, datos) {
        return await this.put(`${this.urlOrdenes}/${id}`, datos);
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map