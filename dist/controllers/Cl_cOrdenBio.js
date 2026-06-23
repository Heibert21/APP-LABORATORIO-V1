import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";
import Cl_sOrdenBio from "../services/Cl_sOrdenBio.js";
export default class Cl_cOrdenBio {
    modeloColeccion;
    modeloOrden;
    vista;
    constructor({ modelo, vista }) {
        this.modeloColeccion = modelo;
        this.modeloOrden = new Cl_mOrdenBio({
            id: "", cedula: "", nombre: "", apellido: "", edad: "", sexo: "",
            fechaRegistro: "", examenesSolicitados: "", status: "En Espera"
        });
        this.vista = vista;
        this.vista.onSeleccionarPaciente((idOrden) => this.procesarSeleccionPaciente(idOrden));
        this.vista.onEnviarResultadosALaboratorio(() => this.procesarEnvioResultados());
        this.vista.onValidarRangoTexto((valor, rangoTexto) => Cl_mOrdenBio.validarRangoTexto(valor, rangoTexto));
        this.inicializarApp();
    }
    async inicializarApp() {
        try {
            const todasLasOrdenesPlanas = await Cl_sOrdenBio.obtenerOrdenes();
            const todasLasOrdenes = todasLasOrdenesPlanas.map((o) => new Cl_mOrdenBio(o));
            this.modeloColeccion.setOrdenes(todasLasOrdenesPlanas);
            const pendientes = this.modeloColeccion.obtenerOrdenesEnEsperaOrdenadas();
            const atendidos = todasLasOrdenes.filter((o) => o.status === "Listo para Despacho");
            this.vista.renderizarPacientesEnEspera(pendientes);
            this.vista.renderizarPacientesAtendidos(atendidos);
        }
        catch (error) {
            console.error("Error al inicializar la App del Bioanalista:", error);
        }
    }
    async procesarSeleccionPaciente(idOrden) {
        try {
            const datosPlanos = await Cl_sOrdenBio.buscarOrdenPorId(idOrden);
            if (datosPlanos) {
                const ordenInstancia = new Cl_mOrdenBio(datosPlanos);
                this.vista.mostrarFormularioCarga(ordenInstancia);
            }
            else {
                this.vista.mostrarToast("No se pudo cargar la información de la orden seleccionada.", "error");
            }
        }
        catch (error) {
            console.error("Error al seleccionar paciente:", error);
        }
    }
    async procesarEnvioResultados() {
        if (!this.vista.nombreLicenciado) {
            this.vista.mostrarToast("Introduzca el nombre del Lic. Bioanalista que valida los resultados.", "advertencia");
            return;
        }
        const idOrden = this.vista.idOrdenSeleccionada;
        const camposCargados = this.vista.getValoresCamposCargados();
        const algunoVacio = camposCargados.some(c => c.valor === "");
        if (algunoVacio) {
            const confirmar = await this.vista.confirmarAccion("Hay casillas de resultados vacías. ¿Desea enviar la orden de todas formas?");
            if (!confirmar)
                return;
        }
        try {
            const ordenOriginal = await Cl_sOrdenBio.buscarOrdenPorId(idOrden);
            if (!ordenOriginal) {
                this.vista.mostrarToast("Error: No se encontró la orden original en el servidor.", "error");
                return;
            }
            this.modeloOrden.hidratarDesde(ordenOriginal);
            camposCargados.forEach(campo => {
                this.modeloOrden.registrarValorResultado(campo.parametro, campo.valor);
            });
            this.modeloOrden.licBioanalista = this.vista.nombreLicenciado;
            this.modeloOrden.status = "Listo para Despacho";
            const exito = await Cl_sOrdenBio.despacharOCerrarOrden(idOrden, this.modeloOrden.toJSON());
            if (exito.ok) {
                this.vista.mostrarToast("¡Resultados cargados con éxito!", "exito");
                this.vista.limpiarFormularioCarga();
                this.inicializarApp();
            }
            else {
                this.vista.mostrarToast("Error al guardar los resultados. Intente nuevamente.", "error");
            }
        }
        catch (error) {
            console.error("Error al procesar el envío de resultados:", error);
            this.vista.mostrarToast("Error de red al conectar con el servidor.", "error");
        }
    }
}
//# sourceMappingURL=Cl_cOrdenBio.js.map