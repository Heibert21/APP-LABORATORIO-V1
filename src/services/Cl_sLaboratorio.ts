import Cl_sMockApi from "./Cl_sMockApi.js";

export default class Cl_sLaboratorio extends Cl_sMockApi {

  
  static async obtenerEstudios(): Promise<any[]> {
    const resultado = await super.getTabla({ tabla: "estudios" });
    return resultado.tabla;
  }

  
  static async registrarEstudioCatalogo(nuevoEstudio: any): Promise<{ ok: boolean; mensaje: string }> {

    if (!nuevoEstudio.nombre || String(nuevoEstudio.nombre).trim() === "") {
      return { ok: false, mensaje: "El nombre del estudio es obligatorio." };
    }
    return super.agregar(nuevoEstudio, "estudios");
  }

  
  static async eliminarEstudioCatalogo(id: string): Promise<{ ok: boolean; mensaje: string }> {

    if (!id || id.trim() === "") {
      return { ok: false, mensaje: "El ID del estudio es obligatorio para eliminarlo." };
    }
    const uri = `${super.getUri("estudios")}/${id}`;
    const respuesta = await super.fetchMockApi({ method: "DELETE", uri });
    return respuesta.ok
      ? { ok: true, mensaje: "Estudio eliminado del catálogo." }
      : { ok: false, mensaje: "No se pudo eliminar el estudio." };
  }

  
  static async obtenerTasaDinamica(): Promise<number> {
    const resultado = await super.getRegistro({ tabla: "config", id: 1 });
    if (resultado.ok && resultado.data && resultado.data.tasaCambio) {
      return parseFloat(resultado.data.tasaCambio);
    }
    return 40.50;
  }

  
  static async actualizarTasaDinamica(nuevaTasa: number): Promise<{ ok: boolean; mensaje: string }> {

    if (isNaN(nuevaTasa) || nuevaTasa <= 0) {
      return { ok: false, mensaje: "La tasa de cambio debe ser un número positivo." };
    }
    const uri = `${super.getUri("config")}/1`;
    const respuesta = await super.fetchMockApi({ method: "PUT", uri, body: { tasaCambio: nuevaTasa } });
    return respuesta.ok
      ? { ok: true, mensaje: "Tasa de cambio actualizada correctamente." }
      : { ok: false, mensaje: "Error al actualizar la tasa de cambio." };
  }

  
  static async obtenerOrdenes(): Promise<any[]> {
    const resultado = await super.getTabla({ tabla: "ordenes" });
    return resultado.tabla;
  }

  
  static async buscarOrdenPorId(id: string): Promise<any> {
    if (!id || id.trim() === "") return null;
    const resultado = await super.getRegistro({ tabla: "ordenes", id });
    return resultado.ok ? resultado.data : null;
  }

  
  static async registrarNuevaOrden(orden: any): Promise<{ ok: boolean; mensaje: string }> {

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

  
  static async eliminarOrden(id: string): Promise<{ ok: boolean; mensaje: string }> {
    if (!id || id.trim() === "") {
      return { ok: false, mensaje: "El ID de la orden es obligatorio para eliminarla." };
    }
    const uri = `${super.getUri("ordenes")}/${id}`;
    const respuesta = await super.fetchMockApi({ method: "DELETE", uri });
    return respuesta.ok
      ? { ok: true, mensaje: "Orden eliminada con éxito." }
      : { ok: false, mensaje: "No se pudo eliminar la orden." };
  }

  
  static async actualizarOrden(id: string, datos: any): Promise<{ ok: boolean; mensaje: string }> {
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

