import Cl_sMockApi from "./Cl_sMockApi.js";
export default class Cl_sOrdenBio extends Cl_sMockApi {
    static async obtenerOrdenes() {
        const resultado = await super.getTabla({ tabla: "ordenes" });
        return resultado.tabla;
    }
    static async buscarOrdenPorId(id) {
        if (!id || id.trim() === "")
            return null;
        const resultado = await super.getRegistro({ tabla: "ordenes", id });
        return resultado.ok ? resultado.data : null;
    }
    static async despacharOCerrarOrden(id, ordenActualizada) {
        if (!id || id.trim() === "") {
            return { ok: false, mensaje: "El ID de la orden es obligatorio." };
        }
        const estadosValidos = ["En Espera", "Listo para Despacho"];
        if (ordenActualizada.status && !estadosValidos.includes(ordenActualizada.status)) {
            return { ok: false, mensaje: "Estado de orden no válido." };
        }
        const uri = `${super.getUri("ordenes")}/${id}`;
        const respuesta = await super.fetchMockApi({ method: "PUT", uri, body: ordenActualizada });
        if (!respuesta.ok) {
            return { ok: false, mensaje: "Error al actualizar el estado de la orden." };
        }
        return { ok: true, mensaje: "Orden actualizada correctamente." };
    }
}
//# sourceMappingURL=Cl_sOrdenBio.js.map