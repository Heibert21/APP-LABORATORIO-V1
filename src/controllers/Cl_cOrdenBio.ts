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

import { I_vOrdenBio } from "../interfaces/I_vOrdenBio.js";
import Cl_mOrdenBio from "../models/Cl_mOrdenBio.js";
import Cl_sOrdenBio from "../services/Cl_sOrdenBio.js";

export default class Cl_cOrdenBio {
  private modelo: Cl_mOrdenBio;
  private vista: I_vOrdenBio;

  constructor({ modelo, vista }: { modelo: Cl_mOrdenBio; vista: I_vOrdenBio }) {
    this.modelo = modelo;
    this.vista = vista;
    this.vista.onSeleccionarPaciente((idOrden) => this.procesarSeleccionPaciente(idOrden));
    this.vista.onEnviarResultadosALaboratorio(() => this.procesarEnvioResultados());
    this.inicializarApp();
  }
  async inicializarApp() {
    try {
      const todasLasOrdenesPlanas = await Cl_sOrdenBio.obtenerOrdenes();
      const todasLasOrdenes = todasLasOrdenesPlanas.map((o: any) => new Cl_mOrdenBio(o));

      const pendientes = todasLasOrdenes
        .filter((o: Cl_mOrdenBio) => o.status === "En Espera")
        .sort((a: Cl_mOrdenBio, b: Cl_mOrdenBio) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
      const atendidos = todasLasOrdenes.filter((o: Cl_mOrdenBio) => o.status === "Listo para Despacho");
      this.vista.renderizarPacientesEnEspera(pendientes);
      this.vista.renderizarPacientesAtendidos(atendidos);
    } catch (error) {
      console.error("Error al inicializar la App del Bioanalista:", error);
    }
  }
  async procesarSeleccionPaciente(idOrden: string) {
    try {
      const datosPlanos = await Cl_sOrdenBio.buscarOrdenPorId(idOrden);
      if (datosPlanos) {
        const ordenInstancia = new Cl_mOrdenBio(datosPlanos);
        this.vista.mostrarFormularioCarga(ordenInstancia);
      } else {
        // MEJORA #9: Toast de error en lugar de alert
        this.vista.mostrarToast("No se pudo cargar la información de la orden seleccionada.", "error");
      }
    } catch (error) {
      console.error("Error al seleccionar paciente:", error);
    }
  }
  async procesarEnvioResultados() {
    if (!this.vista.nombreLicenciado) {
      // MEJORA #3: Validación con toast en lugar de alert bloqueante
      this.vista.mostrarToast("Introduzca el nombre del Lic. Bioanalista que valida los resultados.", "advertencia");
      return;
    }
    // obtener datos de la orden
    const idOrden = this.vista.idOrdenSeleccionada;
    const camposCargados = this.vista.getValoresCamposCargados();
    const algunoVacio = camposCargados.some(c => c.valor === "");
    // confirmar envio de resultados
    if (algunoVacio && !confirm("Hay casillas de resultados vacías. ¿Desea enviar la orden de todas formas?")) {
      return;
    }
    // enviar resultados al laboratorio
    try {
      const ordenOriginal = await Cl_sOrdenBio.buscarOrdenPorId(idOrden);
      if (!ordenOriginal) {
        this.vista.mostrarToast("Error: No se encontró la orden original en el servidor.", "error");
        return;
      }
      // obtener datos de la orden
      this.modelo.id = ordenOriginal.id;
      this.modelo.cedula = ordenOriginal.cedula;
      this.modelo.nombre = ordenOriginal.nombre;
      this.modelo.apellido = ordenOriginal.apellido;
      this.modelo.edad = ordenOriginal.edad;
      this.modelo.sexo = ordenOriginal.sexo;
      this.modelo.telefono = ordenOriginal.telefono || "";
      this.modelo.correo = ordenOriginal.correo || "";
      this.modelo.metodoPago = ordenOriginal.metodoPago || "";
      this.modelo.montoTotal$ = ordenOriginal.montoTotal$ || 0;
      this.modelo.fechaRegistro = ordenOriginal.fechaRegistro;
      this.modelo.horaEntregaEstimada = ordenOriginal.horaEntregaEstimada || "";
      this.modelo.examenesSolicitados = ordenOriginal.examenesSolicitados;
      this.modelo.resultados = ordenOriginal.resultados;
      camposCargados.forEach(campo => {
        this.modelo.registrarValorResultado(campo.parametro, campo.valor);
      });
      this.modelo.licBioanalista = this.vista.nombreLicenciado;
      this.modelo.status = "Listo para Despacho";
      const exito = await Cl_sOrdenBio.despacharOCerrarOrden(idOrden, this.modelo.toJSON());
      if (exito.ok) {
        this.vista.mostrarToast("¡Resultados cargados con éxito!", "exito");
        this.vista.limpiarFormularioCarga();
        this.inicializarApp();
      } else {
        this.vista.mostrarToast("Error al guardar los resultados. Intente nuevamente.", "error");
      }
    } catch (error) {
      console.error("Error al procesar el envío de resultados:", error);
      this.vista.mostrarToast("Error de red al conectar con el servidor.", "error");
    }
  }
}