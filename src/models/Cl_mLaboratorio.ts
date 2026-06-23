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
      this._ordenes.push(new Cl_mOrdenBio(o)); 
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

  public crearEstructuraResultadosVacios(nombre: string, unidad: string, rango: string): IResultadoExamen[] {
    return [{
      parametro: nombre,
      resultado: "",
      unidad: unidad.trim() !== "" ? unidad.trim() : "U.",
      rangoReferencia: rango.trim() !== "" ? rango.trim() : "Normal"
    }];
  }
  
  public validarDuplicadoPaciente(cedula: string, nombre: string, apellido: string, isMenor: boolean = false, cedulaRep: string = "", nombreRep: string = "", apellidoRep: string = ""): boolean {
    if (isMenor && cedulaRep.trim() !== "") {
      return this._validarDuplicadoMenor(cedulaRep, nombreRep, apellidoRep);
    }
    return this._validarDuplicadoAdulto(cedula, nombre, apellido);
  }
  private _validarDuplicadoMenor(cedulaRep: string, nombreRep: string, apellidoRep: string): boolean {
    const cedulaRepNorm = cedulaRep.trim().toLowerCase();
    const nombreRepNorm = nombreRep.trim().toLowerCase();
    const apellidoRepNorm = apellidoRep.trim().toLowerCase();
    return this._ordenes.some(orden => {
      if (!orden.cedulaRepresentante) return false;
      const mismaCedulaRep = orden.cedulaRepresentante.trim().toLowerCase() === cedulaRepNorm;
      const mismoNombreRep = orden.nombreRepresentante.trim().toLowerCase() === nombreRepNorm;
      const mismoApellidoRep = orden.apellidoRepresentante.trim().toLowerCase() === apellidoRepNorm;
      return mismaCedulaRep && !(mismoNombreRep && mismoApellidoRep);
    });
  }

  private _validarDuplicadoAdulto(cedula: string, nombre: string, apellido: string): boolean {
    const cedulaNorm = cedula.trim().toLowerCase();
    const nombreNorm = nombre.trim().toLowerCase();
    const apellidoNorm = apellido.trim().toLowerCase();

    if (cedulaNorm === "menor" || cedulaNorm.startsWith("cr")) return false;

    return this._ordenes.some(orden => {
      if (orden.cedula.trim().toLowerCase() === "menor" || orden.cedula.trim().toLowerCase().startsWith("cr")) return false;
      const mismaCedula = orden.cedula.trim().toLowerCase() === cedulaNorm;
      const mismoNombre = orden.nombre.trim().toLowerCase() === nombreNorm;
      const mismoApellido = orden.apellido.trim().toLowerCase() === apellidoNorm;
      return mismaCedula && !(mismoNombre && mismoApellido);
    });
  }

  public obtenerOrdenesEnEsperaOrdenadas(): Cl_mOrdenBio[] {
    return this._ordenes
      .filter(o => o.status === "En Espera")
      .sort((a, b) => {

        const minsA = a.obtenerMinutosEspera();
        const minsB = b.obtenerMinutosEspera();
        if (minsA === -1) return 1;
        if (minsB === -1) return -1;
        return minsB - minsA; 
      });
  }

  public calcularTotalPacientesAtendidos(): number {
    return this._ordenes.length;
  }

  public calcularMontoTotalUsd(): number {
    return this._ordenes.reduce((acum, o) => acum + o.montoTotal$, 0);
  }
  public calcularMontoTotalBs(): number {
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

  public calcularTiemposEntrega(horasProcesamiento: number): { registro: string, entrega: string } {
    const ahora = new Date();
    const horaPrometida = new Date(ahora.getTime() + horasProcesamiento * 60 * 60 * 1000);
    const registro = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entrega = horaPrometida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { registro, entrega };
  }

  public obtenerOrdenesAntiguasSemanaMas(): Cl_mOrdenBio[] {
    const ahora = new Date();
    const limiteMs = 7 * 24 * 60 * 60 * 1000; 
    return this._ordenes.filter(orden => {
      if (!orden.fechaRegistro) return false;
      try {
        const normalizado = orden.fechaRegistro.replace(",", "").trim();
        const partes = normalizado.split(" ");
        if (partes.length < 1) return false;
        const segmentosFecha = partes[0].split("/");
        if (segmentosFecha.length !== 3) return false;
        const dia = parseInt(segmentosFecha[0], 10);
        const mes = parseInt(segmentosFecha[1], 10) - 1;
        const anio = parseInt(segmentosFecha[2], 10);
        let hh = 0, mm = 0;
        if (partes.length >= 2) {
          const horaParts = partes[1].split(":");
          hh = parseInt(horaParts[0], 10) || 0;
          mm = parseInt(horaParts[1], 10) || 0;
        }
        const fechaOrden = new Date(anio, mes, dia, hh, mm);
        const diffMs = ahora.getTime() - fechaOrden.getTime();
        return diffMs > limiteMs;
      } catch {
        return false;
      }
    });
  }

  public obtenerReporteExamenes(filtros: { examen: string, fechaDesde: string, fechaHasta: string, paciente: string }): any[] {
    let filtradas = this._ordenes;

    const nombreNormalizado = filtros.examen.trim().toLowerCase();
    

    
    const conteoExamenes: { [key: string]: number } = {};

    filtradas.forEach(orden => {
      const desgloses = orden.desglosarExamenes();
      desgloses.forEach(item => {

        if (!nombreNormalizado || item.examen.toLowerCase().includes(nombreNormalizado)) {
          conteoExamenes[item.examen] = (conteoExamenes[item.examen] || 0) + item.cantidad;
        }
      });
    });

    return Object.keys(conteoExamenes).map(examen => ({
      examen: examen,
      cantidad: conteoExamenes[examen]
    })).sort((a, b) => b.cantidad - a.cantidad); 
  }

}