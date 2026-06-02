export default class Cl_mOrdenBio {
    _id = "";
    _cedula = "";
    _nombre = "";
    _apellido = "";
    _edad = 0;
    _sexo = "";
    _esEmbarazada = false;
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
    constructor({ id, cedula, nombre, apellido, edad, esEmbarazada, sexo, telefono = "", correo = "", metodoPago = "", montoTotal$ = 0, fechaRegistro, horaEntregaEstimada = "", examenesSolicitados, status = "En Espera", licBioanalista = "", resultados = [] }) {
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
    get id() { return this._id; }
    set id(value) { this._id = value; }
    get cedula() { return this._cedula; }
    set cedula(value) { this._cedula = value; }
    get nombre() { return this._nombre; }
    set nombre(value) { this._nombre = value; }
    get apellido() { return this._apellido; }
    set apellido(value) { this._apellido = value; }
    get edad() { return this._edad; }
    set edad(value) { this._edad = value; }
    get sexo() { return this._sexo; }
    set sexo(value) { this._sexo = value; }
    get esEmbarazada() { return this._esEmbarazada; }
    set esEmbarazada(value) { this._esEmbarazada = value; }
    get telefono() { return this._telefono; }
    set telefono(value) { this._telefono = value; }
    get correo() { return this._correo; }
    set correo(value) { this._correo = value; }
    get metodoPago() { return this._metodoPago; }
    set metodoPago(value) { this._metodoPago = value; }
    get montoTotal$() { return this._montoTotal$; }
    set montoTotal$(value) { this._montoTotal$ = value; }
    get fechaRegistro() { return this._fechaRegistro; }
    set fechaRegistro(value) { this._fechaRegistro = value; }
    get horaEntregaEstimada() { return this._horaEntregaEstimada; }
    set horaEntregaEstimada(value) { this._horaEntregaEstimada = value; }
    get examenesSolicitados() { return this._examenesSolicitados; }
    set examenesSolicitados(value) { this._examenesSolicitados = value; }
    get status() { return this._status; }
    set status(value) { this._status = value; }
    get licBioanalista() { return this._licBioanalista; }
    set licBioanalista(value) { this._licBioanalista = value; }
    get resultados() { return this._resultados; }
    set resultados(value) { this._resultados = value; }
    // --- LÓGICA COMPARTIDA ---
    static calcularEdadDesdeFecha(fechaNacimientoStr) {
        if (!fechaNacimientoStr)
            return 0;
        const fechaNac = new Date(fechaNacimientoStr);
        const fechaActual = new Date();
        let edad = fechaActual.getFullYear() - fechaNac.getFullYear();
        const mesDiferencia = fechaActual.getMonth() - fechaNac.getMonth();
        if (mesDiferencia < 0 || (mesDiferencia === 0 && fechaActual.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return edad;
    }
    desglosarExamenes() {
        const listado = [];
        if (!this._examenesSolicitados)
            return listado;
        const partes = this._examenesSolicitados.split(",");
        partes.forEach(parte => {
            const estudio = parte.trim();
            if (estudio)
                listado.push({ examen: estudio, cantidad: 1 });
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
    toJSON() {
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
//# sourceMappingURL=Cl_mOrdenBio.js.map