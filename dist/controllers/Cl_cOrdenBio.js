/*🔬5. Laboratorio Clínico
Gestión de pacientes y exámenes médicos.

* Configuración: El personal carga la lista de estudios de laboratorio.
* APP de Usuarios (Bioanalista): Visualizan el menú, seleccionan los pacientes
*  y carga los resultados de los exámenes y una vez cargado marca como finalizado
*  (listo para imprimir).
* APP del Personal (Administración): Toma los datos del paciente
*  e indica los estudios de laboratorio que se realizaran y la cobranza,
*  además puede ver en el panel los estudios finalizados para imprimir y reportar al paciente.
*/
import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";
import Cl_sOrdenBio from "../services/Cl_sOrdenBio.js";
export default class Cl_cOrdenBio {
    // modeloColeccion gestiona la lista completa de órdenes y sus reglas de ordenamiento
    modeloColeccion;
    // modeloOrden es una instancia de trabajo que se hidrata con los datos de la orden seleccionada
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
        // Se suscribe a la validación de rango de texto de la vista y la delega al modelo
        this.vista.onValidarRangoTexto((valor, rangoTexto) => Cl_mOrdenBio.validarRangoTexto(valor, rangoTexto));
        this.inicializarApp();
    }
    // Metodo que permite inicializar la app
    async inicializarApp() {
        try {
            const todasLasOrdenesPlanas = await Cl_sOrdenBio.obtenerOrdenes();
            // Rehidratamos todas las órdenes desde datos planos hacia instancias del modelo
            const todasLasOrdenes = todasLasOrdenesPlanas.map((o) => new Cl_mOrdenBio(o));
            // Cargamos las órdenes en el modelo de laboratorio para poder usar su lógica de ordenamiento
            this.modeloColeccion.setOrdenes(todasLasOrdenesPlanas);
            // Se obtiene las ordenes pendientes y atendidas
            const pendientes = this.modeloColeccion.obtenerOrdenesEnEsperaOrdenadas();
            const atendidos = todasLasOrdenes.filter((o) => o.status === "Listo para Despacho");
            this.vista.renderizarPacientesEnEspera(pendientes);
            this.vista.renderizarPacientesAtendidos(atendidos);
        }
        catch (error) {
            console.error("Error al inicializar la App del Bioanalista:", error);
        }
    }
    // Metodo que permite procesar la seleccion de un paciente
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
    // Metodo que permite procesar el envio de resultados
    async procesarEnvioResultados() {
        if (!this.vista.nombreLicenciado) {
            this.vista.mostrarToast("Introduzca el nombre del Lic. Bioanalista que valida los resultados.", "advertencia");
            return;
        }
        // Se obtiene datos de la orden
        const idOrden = this.vista.idOrdenSeleccionada;
        const camposCargados = this.vista.getValoresCamposCargados();
        const algunoVacio = camposCargados.some(c => c.valor === "");
        // Se confirma el envio de resultados
        if (algunoVacio && !confirm("Hay casillas de resultados vacías. ¿Desea enviar la orden de todas formas?")) {
            return;
        }
        // Se envian los resultados al laboratorio
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