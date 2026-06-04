export default class Cl_sMockApi {
  // Método universal para consultar datos (GET)
  protected static async get(url: string): Promise<any> {
    try {
      const respuesta = await fetch(url);
      return respuesta.ok ? await respuesta.json() : [];
    } catch {
      return [];
    }
  }
  // Método universal para registrar nuevos datos (POST)
  protected static async post(url: string, data: any): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!respuesta.ok) return { ok: false, mensaje: "Error al registrar en el servidor." };
      const resData = await respuesta.json();
      return { ok: true, mensaje: "¡Registro exitoso! ID: " + resData.id };
    } catch (error: any) {
      return { ok: false, mensaje: "Error de red: " + error.message };
    }
  }
  // Método universal para actualizar registros existentes (PUT)
  protected static async put(url: string, data: any): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const respuesta = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!respuesta.ok) return { ok: false, mensaje: "Error al actualizar los datos." };
      return { ok: true, mensaje: "Datos actualizados correctamente." };
    } catch (error: any) {
      return { ok: false, mensaje: "Error de red al actualizar: " + error.message };
    }
  }

  // Método universal para eliminar registros (DELETE)
  protected static async delete(url: string): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const respuesta = await fetch(url, {
        method: "DELETE"
      });
      if (!respuesta.ok) return { ok: false, mensaje: "No se pudo eliminar el recurso." };
      return { ok: true, mensaje: "Eliminado con éxito de la base de datos." };
    } catch (error: any) {
      return { ok: false, mensaje: "Error de red al eliminar: " + error.message };
    }
  }
}