import Cl_sMockApi from "./Cl_sMockApi.js";
export default class Cl_sLaboratorio extends Cl_sMockApi {
    /**
     * Obtiene todos los estudios del catálogo
     */
    static async obtenerEstudios() {
        const resultado = await super.getTabla({ tabla: "estudios" });
        return resultado.tabla;
    }
    /**
     * Registra un nuevo estudio en el catálogo con validación básica
     */
    static async registrarEstudioCatalogo(nuevoEstudio) {
        // ✅ VALIDACIÓN: Datos básicos obligatorios
        if (!nuevoEstudio.nombre || String(nuevoEstudio.nombre).trim() === "") {
            return { ok: false, mensaje: "El nombre del estudio es obligatorio." };
        }
        return super.agregar(nuevoEstudio, "estudios");
    }
    /**
     * Elimina un estudio del catálogo por su ID de MockAPI
     */
    static async eliminarEstudioCatalogo(id) {
        // ✅ VALIDACIÓN: ID obligatorio
        if (!id || id.trim() === "") {
            return { ok: false, mensaje: "El ID del estudio es obligatorio para eliminarlo." };
        }
        const uri = `${super.getUri("estudios")}/${id}`;
        const respuesta = await super.fetchMockApi({ method: "DELETE", uri });
        return respuesta.ok
            ? { ok: true, mensaje: "Estudio eliminado del catálogo." }
            : { ok: false, mensaje: "No se pudo eliminar el estudio." };
    }
    // --- Métodos de Configuración Financiera ---
    /**
     * Obtiene la tasa de cambio dinámica desde la configuración remota
     */
    static async obtenerTasaDinamica() {
        const resultado = await super.getRegistro({ tabla: "config", id: 1 });
        if (resultado.ok && resultado.data && resultado.data.tasaCambio) {
            return parseFloat(resultado.data.tasaCambio);
        }
        return 40.50;
    }
    /**
     * Actualiza la tasa de cambio dinámica con validación
     */
    static async actualizarTasaDinamica(nuevaTasa) {
        // ✅ VALIDACIÓN: Tasa debe ser número positivo
        if (isNaN(nuevaTasa) || nuevaTasa <= 0) {
            return { ok: false, mensaje: "La tasa de cambio debe ser un número positivo." };
        }
        const uri = `${super.getUri("config")}/1`;
        const respuesta = await super.fetchMockApi({ method: "PUT", uri, body: { tasaCambio: nuevaTasa } });
        return respuesta.ok
            ? { ok: true, mensaje: "Tasa de cambio actualizada correctamente." }
            : { ok: false, mensaje: "Error al actualizar la tasa de cambio." };
    }
    // --- Métodos de Órdenes ---
    /**
     * Obtiene todas las órdenes registradas
     */
    static async obtenerOrdenes() {
        const resultado = await super.getTabla({ tabla: "ordenes" });
        return resultado.tabla;
    }
    /**
     * Busca una orden por su ID de MockAPI
     */
    static async buscarOrdenPorId(id) {
        if (!id || id.trim() === "")
            return null;
        const resultado = await super.getRegistro({ tabla: "ordenes", id });
        return resultado.ok ? resultado.data : null;
    }
    /**
     * Registra una nueva orden con validaciones
     */
    static async registrarNuevaOrden(orden) {
        // ✅ VALIDACIÓN: Datos básicos obligatorios
        if (!orden.nombre || String(orden.nombre).trim() === "") {
            return { ok: false, mensaje: "El nombre del paciente es obligatorio." };
        }
        if (!orden.apellido || String(orden.apellido).trim() === "") {
            return { ok: false, mensaje: "El apellido del paciente es obligatorio." };
        }
        if (!orden.examenesSolicitados || String(orden.examenesSolicitados).trim() === "") {
            return { ok: false, mensaje: "Se debe especificar al menos un examen." };
        }
        return super.agregar(orden, "ordenes");
    }
    /**
     * Elimina una orden por su ID de MockAPI
     */
    static async eliminarOrden(id) {
        if (!id || id.trim() === "") {
            return { ok: false, mensaje: "El ID de la orden es obligatorio para eliminarla." };
        }
        const uri = `${super.getUri("ordenes")}/${id}`;
        const respuesta = await super.fetchMockApi({ method: "DELETE", uri });
        return respuesta.ok
            ? { ok: true, mensaje: "Orden eliminada con éxito." }
            : { ok: false, mensaje: "No se pudo eliminar la orden." };
    }
    /**
     * Actualiza una orden existente por su ID de MockAPI
     */
    static async actualizarOrden(id, datos) {
        if (!id || id.trim() === "") {
            return { ok: false, mensaje: "El ID de la orden es obligatorio para actualizarla." };
        }
        const uri = `${super.getUri("ordenes")}/${id}`;
        const respuesta = await super.fetchMockApi({ method: "PUT", uri, body: datos });
        return respuesta.ok
            ? { ok: true, mensaje: "Orden actualizada correctamente." }
            : { ok: false, mensaje: "Error al actualizar la orden." };
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map