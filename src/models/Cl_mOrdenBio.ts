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

    if (typeof datos.edad === "number") {
      datos.edad = `${datos.edad} Año(s)`;
    }

    this.hidratarDesde(datos);

    const edadAnios = Cl_mOrdenBio.convertirEdadAAños(this._edad);
    const cedulaInput = String(datos.cedula || "").trim();
    this._cedula = (edadAnios <= 9 && cedulaInput === "") ? "MENOR" : cedulaInput;
  }

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

  public static calcularEdad(fechaNacimientoStr: string): string {
    if (!fechaNacimientoStr) return "0 Años";
    const fechaNac = new Date(fechaNacimientoStr);
    const fechaActual = new Date();

    if (fechaNac > fechaActual) return "0 Años";
    let anos = fechaActual.getFullYear() - fechaNac.getFullYear();
    let meses = fechaActual.getMonth() - fechaNac.getMonth();
    let dias = fechaActual.getDate() - fechaNac.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate();
      dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    if (anos >= 1) {
      if (meses > 0) {
        return `${anos} Año${anos > 1 ? "s" : ""} y ${meses} Mes${meses > 1 ? "es" : ""}`;
      }
      return `${anos} Año${anos > 1 ? "s" : ""}`;
    }

    if (meses >= 1) {
      const semanas = Math.floor(dias / 7);
      const diasRestantes = dias % 7;
      let resultado = `${meses} Mes${meses > 1 ? "es" : ""}`;
      if (semanas > 0) {
        resultado += ` y ${semanas} Semana${semanas > 1 ? "s" : ""}`;
      }
      return resultado;
    }

    const totalDias = dias;
    const semanas = Math.floor(totalDias / 7);
    const diasRestantes = totalDias % 7;

    if (semanas >= 1) {
      if (diasRestantes > 0) {
        return `${semanas} Semana${semanas > 1 ? "s" : ""} y ${diasRestantes} Día${diasRestantes > 1 ? "s" : ""}`;
      }
      return `${semanas} Semana${semanas > 1 ? "s" : ""}`;
    }

    return `${totalDias} Día${totalDias !== 1 ? "s" : ""}`;
  }

  public static convertirEdadAAños(edad: string | number): number {
    if (typeof edad === "number") return edad;
    if (!edad) return 0;

    const matchAnios = edad.match(/^(\d+(?:\.\d+)?)\s*Año/i);
    if (matchAnios) {
      return parseFloat(matchAnios[1]);
    }

    const matchMeses = edad.match(/^(\d+(?:\.\d+)?)\s*Mes/i);
    if (matchMeses) {
      return parseFloat(matchMeses[1]) / 12;
    }

    const matchSemanas = edad.match(/^(\d+(?:\.\d+)?)\s*Semana/i);
    if (matchSemanas) {
      return parseFloat(matchSemanas[1]) / 52.1786;
    }

    const matchDias = edad.match(/^(\d+(?:\.\d+)?)\s*Día/i);
    if (matchDias) {
      return parseFloat(matchDias[1]) / 365.25;
    }

    const num = parseFloat(edad);
    return isNaN(num) ? 0 : num;
  }

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

  public static generarCedulaMenor(cedulaRep: string): string {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `CR${cedulaRep}-${randomNum}`;
  }

  public coincideConFiltro(textoBusqueda: string): boolean {
    const textoFiltro = textoBusqueda.trim().toLowerCase();
    if (!textoFiltro) return true;

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

    } catch { }
    return "";
  }

  public obtenerTituloReporte(): string {
    return `Reporte de Resultados - Orden #${this.id}`;
  }

  public obtenerContenidoReporte(): string {
    let cedulaFormateada = this.cedula;
    if (cedulaFormateada !== "MENOR" && !cedulaFormateada.startsWith("V-") && !cedulaFormateada.startsWith("CR")) {
      cedulaFormateada = "V-" + cedulaFormateada;
    }
    return `
<!DOCTYPE html>
<html lang="es">
<head>
<title>${this.obtenerTituloReporte()}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Arial', sans-serif; }
  body { padding: 40px 50px; color: #000; background: #fff; font-size: 13px; line-height: 1.4; }
  .cabecera-logo-seccion { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
  .logo-texto { font-size: 38px; font-weight: 900; font-style: italic; font-family: 'Arial Black', sans-serif; color: #000; line-height: 1; }
  .fecha-bloque { font-size: 14px; text-align: right; font-weight: bold; margin-top: 15px; }
  .datos-paciente-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; font-size: 13px; font-weight: bold; margin-top: 25px; margin-bottom: 5px; }
  .linea-separadora-principal { border-bottom: 2px solid #000; margin-bottom: 25px; margin-top: 5px; }
  .bloque-examen-contenedor { margin-bottom: 30px; }
  .titulo-examen-categoria { font-size: 13px; font-weight: bold; padding-bottom: 3px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.3px; }
  .tabla-medica-interna { width: 100%; border-collapse: collapse; margin-bottom: 5px; table-layout: fixed; }
  .tabla-medica-interna th { font-weight: normal; font-size: 12px; text-align: left; padding-bottom: 8px; }
  .tabla-medica-interna td { padding: 5px 0; vertical-align: top; }
  .col-parametro { width: 45%; padding-left: 10px; }
  .col-resultado { width: 15%; text-align: left; }
  .col-unidad-ref { width: 40%; text-align: left; color: #000; }
  .texto-alterado-alerta { color: #dc2626 !important; font-weight: bold !important; }
  .nota-verificacion { font-size: 11px; font-weight: bold; margin-top: 12px; padding-left: 10px; text-transform: uppercase; }
  .nota-sociedad-medica { font-size: 11px; font-weight: bold; color: #000; margin-top: 25px; text-align: justify; max-width: 95%; line-height: 1.3; }
  .pie-pagina-fijo { position: fixed; bottom: 40px; left: 50px; right: 50px; }
  .hora-sistema { text-align: right; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
  .tabla-firmas-estructura { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; font-weight: bold; border-top: 1px solid #000; }
  .tabla-firmas-estructura td { width: 33.33%; padding-top: 6px; vertical-align: top; border-right: 1px solid #000; }
  .tabla-firmas-estructura td:last-child { border-right: none; }
  .cargo-sub { font-size: 10px; color: #475569; font-weight: normal; margin-top: 2px; text-transform: uppercase; }
</style>
</head>
<body>
<div class="cabecera-logo-seccion">
  <div><div class="logo-texto">Git Force<span style="font-size:16px;font-style:normal;font-weight:bold;margin-left:2px;">C.A.</span></div></div>
  <div class="fecha-bloque">Fecha: &nbsp; ${this.fechaRegistro ? this.fechaRegistro.split(" ")[0] : new Date().toLocaleDateString()}</div>
</div>
<div class="datos-paciente-grid">
  <div>Paciente: &nbsp; ${this.apellido.toUpperCase()} ${this.nombre.toUpperCase()}</div>
  <div>Edad: &nbsp; ${this.edad}</div>
  <div>C.I: &nbsp; ${cedulaFormateada}</div>
</div>
<div class="datos-paciente-grid" style="margin-top:0px;margin-bottom:10px;">
  <div>Orden: &nbsp; ${this.id}</div>
</div>
<div class="linea-separadora-principal"></div>
<div class="cuerpo-reporte-estudios">
  <div class="bloque-examen-contenedor">
    <div class="titulo-examen-categoria">${this.examenesSolicitados.toUpperCase()}</div>
    <table class="tabla-medica-interna">
      <thead>
        <tr>
          <th class="col-parametro"></th>
          <th class="col-resultado"></th>
          <th class="col-unidad-ref" style="font-weight:bold;color:#000;">Intervalos de Referencia</th>
        </tr>
      </thead>
      <tbody>
        ${this.resultados.map((r: any) => {
      const esAlterado = r.resultado && r.resultado.includes("*");
      return `
            <tr>
              <td class="col-parametro">${r.parametro}</td>
              <td class="col-resultado ${esAlterado ? "texto-alterado-alerta" : ""}">${r.resultado}</td>
              <td class="col-unidad-ref">${r.unidad} I.R. ${r.rangoReferencia} ${r.unidad}</td>
            </tr>`;
    }).join("")}
      </tbody>
    </table>
    <div class="nota-verificacion">*RESULTADOS VERIFICADOS.</div>
  </div>
  <div class="bloque-examen-contenedor">
    <p class="nota-sociedad-medica">
      Los valores de referencia sugeridos para las pruebas analíticas han sido propuestos en concordancia con los lineamientos internacionales de la IFCC y la Sociedad Venezolana de Bioanalistas Especialistas, conforme a los últimos estudios clínicos automatizados. Para una correcta interpretación clínica consulte a su médico especialista.
    </p>
  </div>
</div>
<div class="pie-pagina-fijo">
  <div class="hora-sistema">Hora Entrada al Sistema: &nbsp; ${this.fechaRegistro ? this.fechaRegistro.split(" ")[1] || "08:00 AM" : "08:00 AM"}</div>
  <table class="tabla-firmas-estructura">
    <tbody>
      <tr>
        <td>${this.licBioanalista ? this.licBioanalista.toUpperCase() : "MIRNA MAHMUD"}<br><span class="cargo-sub">Lcda. en Bioanálisis</span></td>
        <td>JOSEFINA PEREZ<br><span class="cargo-sub">Transcrito por</span></td>
        <td>JOSEFINA PEREZ<br><span class="cargo-sub">Revisado por</span></td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>`;
  }
}