import Cl_mOrdenBio from "./Cl_mOrdenBio.js";
import { IResultadoExamen } from "../interfaces/IResultadoExamen.js";

export default class Cl_mLaboratorio {
  private _tasaCambio: number;
  private _ordenes: Cl_mOrdenBio[] = [];

  constructor(tasaInicial: number = 0) {
    this._tasaCambio = tasaInicial;
  }

  public get tasaCambio(): number { return this._tasaCambio; }
  public set tasaCambio(nuevaTasa: number) { this._tasaCambio = nuevaTasa; }
  public get ordenes(): Cl_mOrdenBio[] { return this._ordenes; }

  public setOrdenes(arrayPlanos: any[]) {
    this._ordenes = [];
    arrayPlanos.forEach((o) => {
      this._ordenes.push(new Cl_mOrdenBio(o)); // Rehidrata directamente usando el modelo único
    });
  }

  public determinarSugerenciaMedica(fechaNacimiento: string, sexo: string, esEmbarazada: boolean): "Todos" | "Hombre" | "Mujer" | "Niño" | "Embarazada" {
    if (!fechaNacimiento) return "Todos";
    const edad = Cl_mOrdenBio.calcularEdadDesdeFecha(fechaNacimiento);
    if (edad < 12) return "Niño";
    if (sexo === "Femenino" && esEmbarazada) return "Embarazada";
    if (sexo === "Femenino") return "Mujer";
    if (sexo === "Masculino") return "Hombre";

    return "Todos";
  }

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
  public validarDuplicadoPaciente(cedula: string, nombre: string, apellido: string): boolean {
    const cedulaNorm = cedula.trim().toLowerCase();
    
    // Si la cédula es MENOR, no aplicamos validación de identidad 
    // (pueden haber muchos niños distintos sin cédula)
    if (cedulaNorm === "menor") return false;

    const nombreNorm = nombre.trim().toLowerCase();
    const apellidoNorm = apellido.trim().toLowerCase();

    // Buscar si la cédula ya existe en el sistema con otro nombre
    return this._ordenes.some(orden => {
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

  public calcularEstructuraFactura(estudiosElegidos: any[]): { totalUsd: number, totalBs: number, tiempoMaxHoras: number, matrizResultados: any[] } {
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

  public calcularTiemposEntrega(horasProcesamiento: number): { registro: string, entrega: string } {
    const ahora = new Date();
    const horaPrometida = new Date(ahora.getTime() + horasProcesamiento * 60 * 60 * 1000);
    const registro = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entrega = horaPrometida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { registro, entrega };
  }
}
