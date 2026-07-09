import { IResultadoExamen } from "../interfaces/IResultadoExamen.js";

export default class Cl_mOrdenBio {
  private _id: string = "";
  private _cedula: string = "";
  private _cedulaRepresentante: string = "";
  private _nombreRepresentante: string = "";
  private _apellidoRepresentante: string = "";
  private _nombre: string = "";
  private _apellido: string = "";
  private _edad: string = "";
  private _sexo: string = "";
  private _telefono: string = "";
  private _correo: string = "";
  private _metodoPago: string = "";
  private _montoTotal$: number = 0;
  private _fechaRegistro: string = "";
  private _horaEntregaEstimada: string = "";
  private _examenesSolicitados: string = "";
  private _status: "En Espera" | "Listo para Despacho" = "En Espera";
  private _licBioanalista: string = "";
  private _resultados: IResultadoExamen[] = [];

  constructor(datos: any) {
    // Convertir edad numérica a formato string si es necesario antes de hidratar
    if (typeof datos.edad === "number") {
      datos.edad = `${datos.edad} Año(s)`;
    }
    // Hidratar masivamente todos los campos
    this.hidratarDesde(datos);
    // Manejo especial de cédula para menores
    const edadAnios = Cl_mOrdenBio.convertirEdadAAños(this._edad);
    const cedulaInput = String(datos.cedula || "").trim();
    this._cedula = (edadAnios <= 9 && cedulaInput === "") ? "MENOR" : cedulaInput;
  }
  // GETTERS Y SETTERS
  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }
  public get cedula(): string {
    return this._cedula;
  }
  public set cedula(value: string) {
    this._cedula = value;
  }
  public get cedulaRepresentante(): string {
    return this._cedulaRepresentante;
  }
  public set cedulaRepresentante(value: string) {
    this._cedulaRepresentante = value;
  }
  public get nombreRepresentante(): string {
    return this._nombreRepresentante;
  }
  public set nombreRepresentante(value: string) {
    this._nombreRepresentante = value;
  }
  public get apellidoRepresentante(): string {
    return this._apellidoRepresentante;
  }
  public set apellidoRepresentante(value: string) {
    this._apellidoRepresentante = value;
  }
  public get nombre(): string {
    return this._nombre;
  }
  public set nombre(value: string) {
    this._nombre = value;
  }
  public get apellido(): string {
    return this._apellido;
  }
  public set apellido(value: string) {
    this._apellido = value;
  }
  public get edad(): string {
    return this._edad;
  }
  public set edad(value: string) {
    this._edad = value;
  }
  public get sexo(): string {
    return this._sexo;
  }
  public set sexo(value: string) {
    this._sexo = value;
  }
  public get telefono(): string {
    return this._telefono;
  }
  public set telefono(value: string) {
    this._telefono = value;
  }
  public get correo(): string {
    return this._correo;
  }
  public set correo(value: string) {
    this._correo = value;
  }
  public get metodoPago(): string {
    return this._metodoPago;
  }
  public set metodoPago(value: string) {
    this._metodoPago = value;
  }
  public get montoTotal$(): number {
    return this._montoTotal$;
  }
  public set montoTotal$(value: number) {
    this._montoTotal$ = value;
  }
  public get fechaRegistro(): string {
    return this._fechaRegistro;
  }
  public set fechaRegistro(value: string) {
    this._fechaRegistro = value;
  }
  public get horaEntregaEstimada(): string {
    return this._horaEntregaEstimada;
  }
  public set horaEntregaEstimada(value: string) {
    this._horaEntregaEstimada = value;
  }
  public get examenesSolicitados(): string {
    return this._examenesSolicitados;
  }
  public set examenesSolicitados(value: string) {
    this._examenesSolicitados = value;
  }
  public get status(): "En Espera" | "Listo para Despacho" {
    return this._status;
  }
  public set status(value: "En Espera" | "Listo para Despacho") {
    this._status = value;
  }
  public get licBioanalista(): string {
    return this._licBioanalista;
  }
  public set licBioanalista(value: string) {
    this._licBioanalista = value;
  }
  public get resultados(): IResultadoExamen[] {
    return this._resultados;
  }
  public set resultados(value: IResultadoExamen[]) {
    this._resultados = value;
  }
  // --- LÓGICA Para Calcular la Edad de los Pacientes
  public static calcularEdad(fechaNacimientoStr: string): string {
    if (!fechaNacimientoStr) return "0 Años";
    const fechaNac = new Date(fechaNacimientoStr);
    const fechaActual = new Date();
    // SI LA FECHA DE NACIMIENTO ES MAYOR A LA FECHA ACTUAL, RETORNAR 0 AÑOS
    if (fechaNac > fechaActual) return "0 Años";
    let anos = fechaActual.getFullYear() - fechaNac.getFullYear();
    let meses = fechaActual.getMonth() - fechaNac.getMonth();
    let dias = fechaActual.getDate() - fechaNac.getDate();
    // Si los dias son negativos, se resta 1 mes y se suma el ultimo dia del mes anterior
    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate();
      dias += ultimoDiaMesAnterior;
    }
    // Si los meses son negativos, se resta 1 año y se suma 12 meses
    if (meses < 0) {
      anos--;
      meses += 12;
    }
    // SI TIENE 1 AÑO O MAS SE MOSTRARAN AÑOS Y MESES
    if (anos >= 1) {
      if (meses > 0) {
        return `${anos} Año${anos > 1 ? "s" : ""} y ${meses} Mes${meses > 1 ? "es" : ""}`;
      }
      return `${anos} Año${anos > 1 ? "s" : ""}`;
    }
    // Si tiene menos de 1 año pero al menos 1 mes
    if (meses >= 1) {
      const semanas = Math.floor(dias / 7);
      const diasRestantes = dias % 7;
      let resultado = `${meses} Mes${meses > 1 ? "es" : ""}`;
      if (semanas > 0) {
        resultado += ` y ${semanas} Semana${semanas > 1 ? "s" : ""}`;
      }
      return resultado;
    }
    // Si tiene menos de 1 mes (calculamos semanas y días)
    const totalDias = dias;
    const semanas = Math.floor(totalDias / 7);
    const diasRestantes = totalDias % 7;
    // SI TIENE 1 SEMANA O MAS SE MOSTRARAN SEMANAS Y DIAS
    if (semanas >= 1) {
      if (diasRestantes > 0) {
        return `${semanas} Semana${semanas > 1 ? "s" : ""} y ${diasRestantes} Día${diasRestantes > 1 ? "s" : ""}`;
      }
      return `${semanas} Semana${semanas > 1 ? "s" : ""}`;
    }
    // Si tiene menos de 1 semana se mostraran dias
    return `${totalDias} Día${totalDias !== 1 ? "s" : ""}`;
  }
  // metodo para calcular la edad en años
  public static convertirEdadAAños(edad: string | number): number {
    if (typeof edad === "number") return edad;
    if (!edad) return 0;
    // si la edad esta en años, meses, semanas o dias, se convierte a años
    const matchAnios = edad.match(/^(\d+(?:\.\d+)?)\s*Año/i);
    if (matchAnios) {
      return parseFloat(matchAnios[1]);
    }
    // si la edad esta en meses, se convierte a años
    const matchMeses = edad.match(/^(\d+(?:\.\d+)?)\s*Mes/i);
    if (matchMeses) {
      return parseFloat(matchMeses[1]) / 12;
    }
    // si la edad esta en semanas, se convierte a años
    const matchSemanas = edad.match(/^(\d+(?:\.\d+)?)\s*Semana/i);
    if (matchSemanas) {
      return parseFloat(matchSemanas[1]) / 52.1786;
    }
    // si la edad esta en dias, se convierte a años
    const matchDias = edad.match(/^(\d+(?:\.\d+)?)\s*Día/i);
    if (matchDias) {
      return parseFloat(matchDias[1]) / 365.25;
    }
    // si la edad no esta en años, meses, semanas o dias, se convierte a años
    const num = parseFloat(edad);
    return isNaN(num) ? 0 : num;
  }
  // Metodo que permite desglosar los examenes solicitados
  public desglosarExamenes(): { examen: string; cantidad: number }[] {
    const listado: { examen: string; cantidad: number }[] = [];
    if (!this._examenesSolicitados) {
      return listado;
    }
    const partes = this._examenesSolicitados.split(",");
    partes.forEach(parte => {
      const estudio = parte.trim();
      if (estudio) {
        listado.push({ examen: estudio, cantidad: 1 });
      }
    });
    return listado;
  }
  // Regla del Bioanalista integrada aquí
  public registrarValorResultado(parametro: string, valor: string): void {
    const item = this._resultados.find(r => r.parametro === parametro);
    if (item) {
      let valorLimpio = valor.trim();
      if (valorLimpio && !isNaN(Number(valorLimpio)) && item.rangoReferencia) {
        const fueraDeRango = Cl_mOrdenBio.validarRangoTexto(valorLimpio, item.rangoReferencia);
        if (fueraDeRango && !valorLimpio.includes("*")) {
          valorLimpio = `${valorLimpio}*`;
        }
      }
      item.resultado = valorLimpio;
    }
  }
  //Metodo que permite validar el rango de referencia de un parametro
  public static validarRangoTexto(valor: string, rangoTexto: string): boolean {
    const rangoLimpio = rangoTexto.replace("Ref:", "").trim();
    const partesRango = rangoLimpio.split("-");
    if (partesRango.length === 2 && valor && !isNaN(Number(valor))) {
      const min = parseFloat(partesRango[0].trim());
      const max = parseFloat(partesRango[1].trim());
      const numCargado = parseFloat(valor);
      return numCargado < min || numCargado > max;
    }
    return false;
  }
  //Metodo que permite convertir un objeto a JSON
  public toJSON() {
    return {
      id: this.id,
      cedula: this.cedula,
      cedulaRepresentante: this.cedulaRepresentante,
      nombreRepresentante: this.nombreRepresentante,
      apellidoRepresentante: this.apellidoRepresentante,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      sexo: this.sexo,
      telefono: this.telefono,
      correo: this.correo,
      metodoPago: this.metodoPago,
      montoTotal$: this.montoTotal$,
      fechaRegistro: this.fechaRegistro,
      horaEntregaEstimada: this.horaEntregaEstimada,
      examenesSolicitados: this.examenesSolicitados,
      status: this.status,
      licBioanalista: this.licBioanalista,
      resultados: this.resultados
    };
  }
  // Metodo que permite hidratar los datos del modelo
  public hidratarDesde(datos: any): void {
    this._id = String(datos.id ?? "");
    this._cedula = datos.cedula ?? "";
    this._cedulaRepresentante = datos.cedulaRepresentante ?? "";
    this._nombreRepresentante = datos.nombreRepresentante ?? "";
    this._apellidoRepresentante = datos.apellidoRepresentante ?? "";
    this._nombre = datos.nombre ?? "";
    this._apellido = datos.apellido ?? "";
    this._edad = datos.edad ?? "";
    this._sexo = datos.sexo ?? "";
    this._telefono = datos.telefono ?? "";
    this._correo = datos.correo ?? "";
    this._metodoPago = datos.metodoPago ?? "";
    this._montoTotal$ = Number(datos.montoTotal$ ?? 0);
    this._fechaRegistro = datos.fechaRegistro ?? "";
    this._horaEntregaEstimada = datos.horaEntregaEstimada ?? "";
    this._examenesSolicitados = datos.examenesSolicitados ?? "";
    this._status = datos.status ?? "En Espera";
    this._licBioanalista = datos.licBioanalista ?? "";
    this._resultados = datos.resultados ?? [];
  }
  // Metodo que permite generar la cedula de un paciente menor
  public static generarCedulaMenor(cedulaRep: string): string {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `CR${cedulaRep}-${randomNum}`;
  }
  // Metodo que permite filtrar los datos del modelo
  public coincideConFiltro(textoBusqueda: string): boolean {
    const textoFiltro = textoBusqueda.trim().toLowerCase();
    if (!textoFiltro) return true;
    //  Se convierte a texto y se busca el valor
    return Boolean(
      String(this._id).toLowerCase().includes(textoFiltro) ||
      this._nombre.toLowerCase().includes(textoFiltro) ||
      this._apellido.toLowerCase().includes(textoFiltro) ||
      this._cedula.toLowerCase().includes(textoFiltro) ||
      (this._cedulaRepresentante && this._cedulaRepresentante.toLowerCase().includes(textoFiltro)) ||
      (this._nombreRepresentante && this._nombreRepresentante.toLowerCase().includes(textoFiltro)) ||
      (this._apellidoRepresentante && this._apellidoRepresentante.toLowerCase().includes(textoFiltro))
    );
  }
  // Metodo que permite obtener los minutos de espera
  public obtenerMinutosEspera(): number {
    if (!this._fechaRegistro) return -1;
    try {
      const normalizado = this._fechaRegistro.replace(",", "").trim();
      const partes = normalizado.split(" ");
      if (partes.length < 2) return -1;
      const [fechaParte, horaParte] = partes;
      const segmentosFecha = fechaParte.split("/");
      if (segmentosFecha.length < 3) return -1;
      const dia = parseInt(segmentosFecha[0], 10);
      const mes = parseInt(segmentosFecha[1], 10) - 1;
      const anio = parseInt(segmentosFecha[2], 10);
      const [hh, mm] = horaParte.split(":").map(Number);
      const fechaOrden = new Date(anio, mes, dia, hh, mm);
      const ahora = new Date();
      const diffMs = ahora.getTime() - fechaOrden.getTime();
      return Math.max(0, Math.floor(diffMs / 60000));
    } catch {
      return -1;
    }
  }
  // Metodo que permite obtener la fecha de registro en formato ISO
  public get fechaRegistroISO(): string {
    if (!this._fechaRegistro) return "";
    try {
      const partes = this._fechaRegistro.replace(",", "").trim().split(" ");
      if (partes.length >= 1) {
        const segmentos = partes[0].split("/");
        if (segmentos.length === 3) {
          const dia = segmentos[0].padStart(2, "0");
          const mes = segmentos[1].padStart(2, "0");
          const anio = segmentos[2];
          return `${anio}-${mes}-${dia}`;
        }
      }
      // Se silencia el error y se retorna vacío si ocurre algún error de formato o parseo
    } catch { }
    return "";
  }

}