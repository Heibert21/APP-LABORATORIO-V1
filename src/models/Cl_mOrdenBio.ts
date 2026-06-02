import { IResultadoExamen } from "../interfaces/IResultadoExamen.js";

export default class Cl_mOrdenBio {
  private _id: string = "";
  private _cedula: string = "";
  private _nombre: string = "";
  private _apellido: string = "";
  private _edad: number = 0;
  private _sexo: string = "";
  private _esEmbarazada: boolean = false;
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

  constructor({
    id, cedula, nombre, apellido, edad,esEmbarazada, sexo, telefono = "", correo = "",
    metodoPago = "", montoTotal$ = 0, fechaRegistro, horaEntregaEstimada = "",
    examenesSolicitados, status = "En Espera", licBioanalista = "", resultados = []
  }: any) {
    this._id = id;
    this._nombre = nombre;
    this._apellido = apellido;
    this._edad = Number(edad);
    this._sexo = sexo;
    this._esEmbarazada = esEmbarazada;
    this._telefono = telefono;
    this._correo = correo;
    this._metodoPago = metodoPago;
    this._montoTotal$ = Number(montoTotal$);
    this._fechaRegistro = fechaRegistro;
    this._horaEntregaEstimada = horaEntregaEstimada;
    this._examenesSolicitados = examenesSolicitados;
    this._status = status;
    this._licBioanalista = licBioanalista;
    this._resultados = resultados;

    // Regla de interfaz/modelo compartida
    this._cedula = (this._edad <= 9 && (!cedula || cedula.trim() === "")) ? "MENOR" : cedula.trim();
  }

  // --- GETTERS Y SETTERS UNIFICADOS ---
  public get id(): string { return this._id; }
  public set id(value: string) { this._id = value; }

  public get cedula(): string { return this._cedula; }
  public set cedula(value: string) { this._cedula = value; }

  public get nombre(): string { return this._nombre; }
  public set nombre(value: string) { this._nombre = value; }

  public get apellido(): string { return this._apellido; }
  public set apellido(value: string) { this._apellido = value; }

  public get edad(): number { return this._edad; }
  public set edad(value: number) { this._edad = value; }

  public get sexo(): string { return this._sexo; }
  public set sexo(value: string) { this._sexo = value; }

  public get esEmbarazada(): boolean { return this._esEmbarazada; }
  public set esEmbarazada(value: boolean) { this._esEmbarazada = value; }

  public get telefono(): string { return this._telefono; }
  public set telefono(value: string) { this._telefono = value; }

  public get correo(): string { return this._correo; }
  public set correo(value: string) { this._correo = value; }

  public get metodoPago(): string { return this._metodoPago; }
  public set metodoPago(value: string) { this._metodoPago = value; }

  public get montoTotal$(): number { return this._montoTotal$; }
  public set montoTotal$(value: number) { this._montoTotal$ = value; }

  public get fechaRegistro(): string { return this._fechaRegistro; }
  public set fechaRegistro(value: string) { this._fechaRegistro = value; }

  public get horaEntregaEstimada(): string { return this._horaEntregaEstimada; }
  public set horaEntregaEstimada(value: string) { this._horaEntregaEstimada = value; }

  public get examenesSolicitados(): string { return this._examenesSolicitados; }
  public set examenesSolicitados(value: string) { this._examenesSolicitados = value; }

  public get status(): "En Espera" | "Listo para Despacho" { return this._status; }
  public set status(value: "En Espera" | "Listo para Despacho") { this._status = value; }

  public get licBioanalista(): string { return this._licBioanalista; }
  public set licBioanalista(value: string) { this._licBioanalista = value; }

  public get resultados(): IResultadoExamen[] { return this._resultados; }
  public set resultados(value: IResultadoExamen[]) { this._resultados = value; }

  // --- LÓGICA COMPARTIDA ---
  public static calcularEdadDesdeFecha(fechaNacimientoStr: string): number {
    if (!fechaNacimientoStr) return 0;
    const fechaNac = new Date(fechaNacimientoStr);
    const fechaActual = new Date();
    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();
    const mesDiferencia = fechaActual.getMonth() - fechaNac.getMonth();
    if (mesDiferencia < 0 || (mesDiferencia === 0 && fechaActual.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

  public desglosarExamenes(): { examen: string; cantidad: number }[] {
    const listado: { examen: string; cantidad: number }[] = [];
    if (!this._examenesSolicitados) return listado;
    const partes = this._examenesSolicitados.split(",");
    partes.forEach(parte => {
      const estudio = parte.trim();
      if (estudio) listado.push({ examen: estudio, cantidad: 1 });
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

  public toJSON() {
    return {
      id: this.id,
      cedula: this.cedula,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      esEmbarazada: this.esEmbarazada,
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
}
