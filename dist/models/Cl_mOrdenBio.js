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
        this._id = id;
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
}
//# sourceMappingURL=Cl_mOrdenBio.js.map