import Cl_mOrdenBio from "./Cl_mOrdenBio.js";
import { IResultadoExamen } from "../interfaces/IResultadoExamen.js";

export default class Cl_mLaboratorio {
  private _tasaCambio: number;
  private _ordenes: Cl_mOrdenBio[] = [];

  constructor(tasaInicial: number = 0) {
    this._tasaCambio = tasaInicial;
  }
  public get tasaCambio(): number {
    return this._tasaCambio;
  }
  public set tasaCambio(nuevaTasa: number) {
    this._tasaCambio = nuevaTasa;
  }
  public get ordenes(): Cl_mOrdenBio[] {
    return this._ordenes;
  }
  public setOrdenes(arrayPlanos: any[]) {
    this._ordenes = [];
    arrayPlanos.forEach((o) => {
      this._ordenes.push(new Cl_mOrdenBio(o)); // Rehidrata directamente usando el modelo único
    });
  }
  public determinarSugerenciaMedica(fechaNacimiento: string, sexo: string): "Todos" | "Hombre" | "Mujer" | "Niño" {
    if (!fechaNacimiento) return "Todos";
    const edad = Cl_mOrdenBio.calcularEdad(fechaNacimiento);
    const edadAnios = Cl_mOrdenBio.convertirEdadAAños(edad);
    if (edadAnios < 12) return "Niño";
    if (sexo === "Femenino") return "Mujer";
    if (sexo === "Masculino") return "Hombre";
    return "Todos";
  }
  // Metodo que permite crear una estructura vacia para los resultados de los examenes
  public crearEstructuraResultadosVacios(nombre: string, unidad: string, rango: string): IResultadoExamen[] {
    return [{
      parametro: nombre,
      resultado: "",
      unidad: unidad.trim() !== "" ? unidad.trim() : "U.",
      rangoReferencia: rango.trim() !== "" ? rango.trim() : "Normal"
    }];
  }
  /**
   *  - Misma cédula + DISTINTO nombre/apellido → BLOQUEADO (posible error o suplantación).
   *  - Misma cédula + MISMO nombre/apellido    → SIEMPRE PERMITIDO.
   *    El paciente puede hacerse exámenes las veces que quiera, el mismo día
   *    a distintas horas, semanalmente, mensualmente, etc.
   @param cedula   Cédula del paciente a registrar.
   @param nombre   Nombre del paciente a registrar.
   @param apellido Apellido del paciente a registrar.
   @returns `true` si la cédula ya está registrada con un nombre diferente (conflicto).
   */
  public validarDuplicadoPaciente(cedula: string, nombre: string, apellido: string, isMenor: boolean = false, cedulaRep: string = "", nombreRep: string = "", apellidoRep: string = ""): boolean {
    const cedulaNorm = cedula.trim().toLowerCase();
    const nombreNorm = nombre.trim().toLowerCase();
    const apellidoNorm = apellido.trim().toLowerCase();
    const cedulaRepNorm = cedulaRep.trim().toLowerCase();
    const nombreRepNorm = nombreRep.trim().toLowerCase();
    const apellidoRepNorm = apellidoRep.trim().toLowerCase();
    // Si es menor, la validación de identidad se hace sobre el representante
    if (isMenor && cedulaRepNorm !== "") {
      return this._ordenes.some(orden => {
        // Ignoramos órdenes viejas que no tengan cedulaRepresentante
        if (!orden.cedulaRepresentante) return false;
        const mismaCedulaRep = orden.cedulaRepresentante.trim().toLowerCase() === cedulaRepNorm;
        const mismoNombreRep = orden.nombreRepresentante.trim().toLowerCase() === nombreRepNorm;
        const mismoApellidoRep = orden.apellidoRepresentante.trim().toLowerCase() === apellidoRepNorm;
        // Conflicto: misma cédula de representante pero distinto nombre/apellido
        return mismaCedulaRep && !(mismoNombreRep && mismoApellidoRep);
      });
    }
    // Si no es menor pero tiene cédula "menor" o "cr" (legacy o generada), lo dejamos pasar
    if (cedulaNorm === "menor" || cedulaNorm.startsWith("cr")) return false;
    // Buscar si la cédula del paciente ya existe en el sistema con otro nombre
    return this._ordenes.some(orden => {
      // Ignoramos si la orden guardada es de un menor
      if (orden.cedula.trim().toLowerCase() === "menor" || orden.cedula.trim().toLowerCase().startsWith("cr")) return false;
      const mismaCedula = orden.cedula.trim().toLowerCase() === cedulaNorm;
      const mismoNombre = orden.nombre.trim().toLowerCase() === nombreNorm;
      const mismoApellido = orden.apellido.trim().toLowerCase() === apellidoNorm;
      // Conflicto: misma cédula pero nombre o apellido diferente
      return mismaCedula && !(mismoNombre && mismoApellido);
    });
  }
  // --- ACUMULADORES DE CAJA CORREGIDOS ---
  public calcularTotalPacientesAtendidos(): number {
    return this._ordenes.length;
  }
  public calcularMontoTotalUsd(): number {
    return this._ordenes.reduce((acum, o) => acum + o.montoTotal$, 0);
  }
  public calcularMontoTotalBs(): number {
    // Multiplica dinámicamente el total de dólares por la tasa del día
    return this.calcularMontoTotalUsd() * this._tasaCambio;
  }
  // Metodo que permite obtener el estudio mas solicitado
  public obtenerEstudioMasSolicitado(): string {
    const conteoGlobal: { [key: string]: number } = {};
    this._ordenes.forEach(orden => {
      const desgloses = orden.desglosarExamenes();
      desgloses.forEach(item => {
        conteoGlobal[item.examen] = (conteoGlobal[item.examen] || 0) + item.cantidad;
      });
    });
    let estudioMasVendido = "Ninguno";
    let maxCantidad = 0;
    for (const estudio in conteoGlobal) {
      if (conteoGlobal[estudio] > maxCantidad) {
        maxCantidad = conteoGlobal[estudio];
        estudioMasVendido = estudio;
      }
    }
    return maxCantidad > 0 ? `${estudioMasVendido} (${maxCantidad} sols)` : "Ninguno";
  }
  // Metodo que permite calcular la estructura de la factura
  public calcularEstructuraFactura(estudiosElegidos: any[]): {
    totalUsd: number,
    totalBs: number,
    tiempoMaxHoras: number,
    matrizResultados: any[]
  } {
    let totalUsd = 0;
    let tiempoMaxHoras = 0;
    let matrizResultados: any[] = [];
    estudiosElegidos.forEach(e => {
      totalUsd += Number(e.precio);
      if (Number(e.tiempoProcesamiento) > tiempoMaxHoras) {
        tiempoMaxHoras = Number(e.tiempoProcesamiento);
      }
      if (e.parametrosAsociados && Array.isArray(e.parametrosAsociados)) {
        e.parametrosAsociados.forEach((p: any) => {
          if (!matrizResultados.some(r => r.parametro === p.parametro)) {
            matrizResultados.push({ ...p, resultado: "" });
          }
        });
      }
    });
    const totalBs = totalUsd * this._tasaCambio;
    return { totalUsd, totalBs, tiempoMaxHoras, matrizResultados };
  }
  /**
   * Método que contabiliza la cantidad de veces que un examen específico fue solicitado
   * durante un día particular (utilizado para el Reporte Dinámico en UI).
   * @param nombreExamen Texto libre a buscar en la lista de exámenes (Ej: "Creatinina", "Glucosa")
   * @param fechaFiltroYMD Fecha seleccionada en el selector (formato "yyyy-mm-dd")
   * @returns El número total de incidencias encontradas
   */

  // Metodo que permite contar la cantidad de veces que un examen especifico fue solicitado durante un dia particular
  public contarExamenesPorFecha(nombreExamen: string, fechaFiltroYMD: string): number {
    if (!fechaFiltroYMD) return 0;
    let conteo = 0;
    const nombreNormalizado = nombreExamen.trim().toLowerCase();

    this._ordenes.forEach(orden => {
      if (!orden.fechaRegistro) return;
      const partesEspacio = orden.fechaRegistro.replace(",", "").trim().split(" ");
      if (partesEspacio.length < 1) return;

      const segmentosFecha = partesEspacio[0].split("/");
      if (segmentosFecha.length === 3) {
        const dia = segmentosFecha[0].padStart(2, "0");
        const mes = segmentosFecha[1].padStart(2, "0");
        const anio = segmentosFecha[2];
        const fechaOrdenYMD = `${anio}-${mes}-${dia}`;
        if (fechaOrdenYMD === fechaFiltroYMD) {
          const desgloses = orden.desglosarExamenes();
          const tieneExamen = desgloses.some(item => item.examen.trim().toLowerCase().includes(nombreNormalizado));
          if (tieneExamen) {
            conteo++;
          }
        }
      }
    });
    return conteo;
  }
  // Metodo que permite calcular los tiempos de entrega
  public calcularTiemposEntrega(horasProcesamiento: number): { registro: string, entrega: string } {
    const ahora = new Date();
    const horaPrometida = new Date(ahora.getTime() + horasProcesamiento * 60 * 60 * 1000);
    const registro = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entrega = horaPrometida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { registro, entrega };
  }
}