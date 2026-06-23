import Cl_sMockApi from "./Cl_sMockApi.js";

export default class Cl_sOrdenBio extends Cl_sMockApi {

  /**
   * Obtiene todas las órdenes registradas
   */
  static async obtenerOrdenes(): Promise<any[]> {
    const resultado = await super.getTabla({ tabla: "ordenes" });
    return resultado.tabla;
  }

  /**
   * Busca una orden por su ID de MockAPI
   */
  static async buscarOrdenPorId(id: string): Promise<any> {
    // ✅ VALIDACIÓN: ID obligatorio
    if (!id || id.trim() === "") return null;
    const resultado = await super.getRegistro({ tabla: "ordenes", id });
    return resultado.ok ? resultado.data : null;
  }

  /**
   * Actualiza el estado de una orden (despachar o cerrar)
   * con validaciones de estado previas al envío
   */
  static async despacharOCerrarOrden(id: string, ordenActualizada: any): Promise<{ ok: boolean; mensaje: string }> {
    // ✅ VALIDACIÓN 1: ID válido
    if (!id || id.trim() === "") {
      return { ok: false, mensaje: "El ID de la orden es obligatorio." };
    }

    // ✅ VALIDACIÓN 2: El estado debe ser válido
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