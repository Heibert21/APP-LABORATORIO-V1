export default class Cl_sMockApi {
  // Mapeo dinámico de tablas a URLs de MockAPI para mantener compatibilidad con la estructura actual
  protected static getUri(tabla: string): string {
    const urls: Record<string, string> = {
      ordenes: "https://6a1866f21878294b597d0b1b.mockapi.io/ordenes",
      estudios: "https://6a1866f21878294b597d0b1b.mockapi.io/estudios",
      config: "https://6a1b5c13bc2f944754931cff.mockapi.io/config"
    };
    return urls[tabla] || "";
  }
  protected static async fetchMockApi({
    method = "GET",
    uri,
    body,
    headers = {},
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    uri: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<{ ok: boolean; status: number; data?: any; message?: string }> {
    if (!uri) {
      return { ok: false, status: 0, message: "API URL no configurada para esta tabla" };
    }
    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json", ...headers },
      };
      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }
      const respuesta = await fetch(uri, options);
      const status = respuesta.status;
      if (status === 404) {
        return { ok: true, status, data: [] };
      }
      if (!respuesta.ok) {
        return { ok: false, status, data: [] };
      }
      let data: any = null;
      try {
        data = await respuesta.json();
      } catch {
        data = null;
      }

      return { ok: true, status, data };
    } catch (error: any) {
      return { ok: false, status: 0, message: error?.message };
    }
  }

  static async getTabla({ tabla }: { tabla: string }): Promise<{
    ok: boolean;
    tabla: any[];
  }> {
    const uri = this.getUri(tabla);
    const respuesta = await this.fetchMockApi({ method: "GET", uri });

    if (respuesta.status === 404) {
      return { ok: true, tabla: [] };
    }

    if (!respuesta.ok) {
      return { ok: false, tabla: [] };
    }

    return { ok: true, tabla: respuesta.data ?? [] };
  }

  static async getRegistro({ tabla, id }: { tabla: string; id: string | number }): Promise<{
    ok: boolean;
    data: any;
  }> {
    const uri = `${this.getUri(tabla)}/${id}`;
    const respuesta = await this.fetchMockApi({ method: "GET", uri });

    if (respuesta.status === 404) {
      return { ok: false, data: null };
    }

    if (!respuesta.ok) {
      return { ok: false, data: null };
    }

    return { ok: true, data: respuesta.data };
  }

  static async existeId({
    tabla,
    tablaId,
    tablaIdName,
  }: {
    tabla: string;
    tablaId: string | number;
    tablaIdName: string;
  }): Promise<{ ok: boolean; existe: boolean }> {
    const uri = `${this.getUri(tabla)}?${tablaIdName}=${tablaId}`;
    const respuesta = await this.fetchMockApi({ method: "GET", uri });

    if (respuesta.status === 404) {
      return { ok: true, existe: false };
    }

    if (!respuesta.ok) {
      return { ok: false, existe: false };
    }

    return {
      ok: true,
      existe: Array.isArray(respuesta.data) && respuesta.data.length > 0,
    };
  }

  static async agregar(
    registro: any,
    tabla: string
  ): Promise<{ ok: boolean; mensaje: string }> {
    const uri = this.getUri(tabla);
    const respuesta = await this.fetchMockApi({
      method: "POST",
      uri,
      body: registro,
    });

    if (!respuesta.ok) {
      return { ok: false, mensaje: "Error al guardar el registro." };
    }

    return {
      ok: true,
      mensaje: "Registro guardado con ID: " + (respuesta.data?.id ?? ""),
    };
  }

  protected static async obtenerIdMockApi({
    tabla,
    tablaId,
    tablaIdName,
  }: {
    tabla: string;
    tablaId: string | number;
    tablaIdName: string;
  }): Promise<string | undefined> {
    const uri = `${this.getUri(tabla)}?${tablaIdName}=${tablaId}`;
    return this.fetchMockApi({ method: "GET", uri }).then((respuesta) => {
      if (respuesta.status === 404 || !respuesta.ok) {
        return undefined;
      }

      if (!Array.isArray(respuesta.data) || respuesta.data.length === 0) {
        return undefined;
      }

      const registroExacto = respuesta.data.find(
        (item: any) => String(item[tablaIdName]) === String(tablaId)
      );

      return registroExacto?.id;
    });
  }

  static async modificar(
    tablaId: string | number,
    registro: any,
    tablaIdName: string,
    tabla: string
  ): Promise<{ ok: boolean; mensaje: string }> {
    const recursoId = await this.obtenerIdMockApi({ tabla, tablaId, tablaIdName });

    if (!recursoId) {
      return {
        ok: false,
        mensaje: "No se encontró el registro en MockAPI para modificar."
      };
    }

    const uri = `${this.getUri(tabla)}/${recursoId}`;
    const respuesta = await this.fetchMockApi({
      method: "PUT",
      uri,
      body: registro,
    });

    if (!respuesta.ok) {
      return { ok: false, mensaje: "Error al actualizar los datos." };
    }

    return { ok: true, mensaje: "Datos actualizados correctamente." };
  }

  static async eliminar(
    tablaId: string | number,
    tabla: string,
    tablaIdName: string
  ): Promise<{ ok: boolean; mensaje: string }> {
    const recursoId = await this.obtenerIdMockApi({
      tabla,
      tablaId,
      tablaIdName,
    });

    if (!recursoId) {
      return {
        ok: false,
        mensaje: "No se pudo eliminar el recurso."
      };
    }

    const uri = `${this.getUri(tabla)}/${recursoId}`;
    const respuesta = await this.fetchMockApi({ method: "DELETE", uri });

    if (!respuesta.ok) {
      return { ok: false, mensaje: "No se pudo eliminar el recurso." };
    }

    return { ok: true, mensaje: "Eliminado con éxito de la base de datos." };
  }
}