export default class Cl_sMockApi {
    static getUri(tabla) {
        const urls = {
            ordenes: "https://6a1866f21878294b597d0b1b.mockapi.io/ordenes",
            estudios: "https://6a1866f21878294b597d0b1b.mockapi.io/estudios",
            config: "https://6a1b5c13bc2f944754931cff.mockapi.io/config"
        };
        return urls[tabla] || "";
    }
    static async fetchMockApi({ method = "GET", uri, body, headers = {}, }) {
        if (!uri) {
            return { ok: false, status: 0, message: "API URL no configurada para esta tabla" };
        }
        try {
            const options = {
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
            let data = null;
            try {
                data = await respuesta.json();
            }
            catch {
                data = null;
            }
            return { ok: true, status, data };
        }
        catch (error) {
            return { ok: false, status: 0, message: error?.message };
        }
    }
    static async getTabla({ tabla }) {
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
    static async getRegistro({ tabla, id }) {
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
    static async existeId({ tabla, tablaId, tablaIdName, }) {
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
    static async agregar(registro, tabla) {
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
    static async obtenerIdMockApi({ tabla, tablaId, tablaIdName, }) {
        const uri = `${this.getUri(tabla)}?${tablaIdName}=${tablaId}`;
        return this.fetchMockApi({ method: "GET", uri }).then((respuesta) => {
            if (respuesta.status === 404 || !respuesta.ok) {
                return undefined;
            }
            if (!Array.isArray(respuesta.data) || respuesta.data.length === 0) {
                return undefined;
            }
            const registroExacto = respuesta.data.find((item) => String(item[tablaIdName]) === String(tablaId));
            return registroExacto?.id;
        });
    }
    static async modificar(tablaId, registro, tablaIdName, tabla) {
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
    static async eliminar(tablaId, tabla, tablaIdName) {
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
//# sourceMappingURL=Cl_sMockApi.js.map