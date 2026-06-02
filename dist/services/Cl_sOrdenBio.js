import Cl_sMockApi from "./Cl_sMockApi.js";
export default class Cl_sOrdenBio extends Cl_sMockApi {
    static urlOrdenes = "https://6a1866f21878294b597d0b1b.mockapi.io/ordenes";
    // --- Métodos Requeridos exactamente por Cl_cOrdenBio ---
    static async obtenerOrdenes() {
        return await this.get(this.urlOrdenes);
    }
    static async buscarOrdenPorId(id) {
        return await this.get(`${this.urlOrdenes}/${id}`);
    }
    static async despacharOCerrarOrden(id, ordenActualizada) {
        return await this.put(`${this.urlOrdenes}/${id}`, ordenActualizada);
    }
}
//# sourceMappingURL=Cl_sOrdenBio.js.map