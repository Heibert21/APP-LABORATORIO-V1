export default class Cl_mOrdenBio {
    _id = "";
    _cedula = "";
    _cedulaRepresentante = "";
    _nombreRepresentante = "";
    _apellidoRepresentante = "";
    _nombre = "";
    _apellido = "";
    _edad = "";
    _sexo = "";
    _telefono = "";
    _correo = "";
    _metodoPago = "";
    _montoTotal$ = 0;
    _fechaRegistro = "";
    _horaEntregaEstimada = "";
    _examenesSolicitados = "";
    _status = "En Espera";
    _licBioanalista = "";
    _resultados = [];
    constructor({ id, cedula, cedulaRepresentante = "", nombreRepresentante = "", apellidoRepresentante = "", nombre, apellido, edad, sexo, telefono = "", correo = "", metodoPago = "", montoTotal$ = 0, fechaRegistro, horaEntregaEstimada = "", examenesSolicitados, status = "En Espera", licBioanalista = "", resultados = [] }) {
        this._id = String(id ?? "");
        this._cedulaRepresentante = cedulaRepresentante;
        this._nombreRepresentante = nombreRepresentante;
        this._apellidoRepresentante = apellidoRepresentante;
        this._nombre = nombre;
        this._apellido = apellido;
        this._edad = typeof edad === "number" ? `${edad} Año(s)` : String(edad || "");
        this._sexo = sexo;
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
        const edadAnios = Cl_mOrdenBio.convertirEdadAAños(this._edad);
        this._cedula = (edadAnios <= 9 && (!cedula || cedula.trim() === "")) ? "MENOR" : cedula.trim();
    }
    //GETTERS Y SETTERS
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get cedula() {
        return this._cedula;
    }
    set cedula(value) {
        this._cedula = value;
    }
    get cedulaRepresentante() {
        return this._cedulaRepresentante;
    }
    set cedulaRepresentante(value) {
        this._cedulaRepresentante = value;
    }
    get nombreRepresentante() {
        return this._nombreRepresentante;
    }
    set nombreRepresentante(value) {
        this._nombreRepresentante = value;
    }
    get apellidoRepresentante() {
        return this._apellidoRepresentante;
    }
    set apellidoRepresentante(value) {
        this._apellidoRepresentante = value;
    }
    get nombre() {
        return this._nombre;
    }
    set nombre(value) {
        this._nombre = value;
    }
    get apellido() {
        return this._apellido;
    }
    set apellido(value) {
        this._apellido = value;
    }
    get edad() {
        return this._edad;
    }
    set edad(value) {
        this._edad = value;
    }
    get sexo() {
        return this._sexo;
    }
    set sexo(value) {
        this._sexo = value;
    }
    get telefono() {
        return this._telefono;
    }
    set telefono(value) {
        this._telefono = value;
    }
    get correo() {
        return this._correo;
    }
    set correo(value) {
        this._correo = value;
    }
    get metodoPago() {
        return this._metodoPago;
    }
    set metodoPago(value) {
        this._metodoPago = value;
    }
    get montoTotal$() {
        return this._montoTotal$;
    }
    set montoTotal$(value) {
        this._montoTotal$ = value;
    }
    get fechaRegistro() {
        return this._fechaRegistro;
    }
    set fechaRegistro(value) {
        this._fechaRegistro = value;
    }
    get horaEntregaEstimada() {
        return this._horaEntregaEstimada;
    }
    set horaEntregaEstimada(value) {
        this._horaEntregaEstimada = value;
    }
    get examenesSolicitados() {
        return this._examenesSolicitados;
    }
    set examenesSolicitados(value) {
        this._examenesSolicitados = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get licBioanalista() {
        return this._licBioanalista;
    }
    set licBioanalista(value) {
        this._licBioanalista = value;
    }
    get resultados() {
        return this._resultados;
    }
    set resultados(value) {
        this._resultados = value;
    }
    // --- LÓGICA Para Calcular la Edad de los Pacientes
    static calcularEdad(fechaNacimientoStr) {
        if (!fechaNacimientoStr)
            return "0 Años";
        const fechaNac = new Date(fechaNacimientoStr);
        const fechaActual = new Date();
        // SI LA FECHA DE NACIMIENTO ES MAYOR A LA FECHA ACTUAL, RETORNAR 0 AÑOS
        if (fechaNac > fechaActual)
            return "0 Años";
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
    static convertirEdadAAños(edad) {
        if (typeof edad === "number")
            return edad;
        if (!edad)
            return 0;
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
    desglosarExamenes() {
        const listado = [];
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
    registrarValorResultado(parametro, valor) {
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
    static validarRangoTexto(valor, rangoTexto) {
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
    toJSON() {
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
    obtenerTituloReporte() {
        return `Reporte de Resultados - Orden #${this.id}`;
    }
    obtenerContenidoReporte() {
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
        ${this.resultados.map((r) => {
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
//# sourceMappingURL=Cl_mOrdenBio.js.map