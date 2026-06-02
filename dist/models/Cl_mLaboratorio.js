import Cl_mOrdenBio from "./Cl_mOrdenBio.js";
export default class Cl_mLaboratorio {
    _tasaCambio;
    _ordenes = [];
    constructor(tasaInicial = 0) {
        this._tasaCambio = tasaInicial;
    }
    get tasaCambio() {
        return this._tasaCambio;
    }
    set tasaCambio(nuevaTasa) {
        this._tasaCambio = nuevaTasa;
    }
    get ordenes() {
        return this._ordenes;
    }
    setOrdenes(arrayPlanos) {
        this._ordenes = [];
        arrayPlanos.forEach((o) => {
            this._ordenes.push(new Cl_mOrdenBio(o)); // Rehidrata directamente usando el modelo único
        });
    }
    determinarSugerenciaMedica(fechaNacimiento, sexo) {
        if (!fechaNacimiento)
            return "Todos";
        const edad = Cl_mOrdenBio.calcularEdad(fechaNacimiento);
        const edadAnios = Cl_mOrdenBio.convertirEdadAAños(edad);
        if (edadAnios < 12)
            return "Niño";
        if (sexo === "Femenino")
            return "Mujer";
        if (sexo === "Masculino")
            return "Hombre";
        return "Todos";
    }
    // Metodo que permite crear una estructura vacia para los resultados de los examenes
    crearEstructuraResultadosVacios(nombre, unidad, rango) {
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
    validarDuplicadoPaciente(cedula, nombre, apellido, isMenor = false, cedulaRep = "", nombreRep = "", apellidoRep = "") {
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
                if (!orden.cedulaRepresentante)
                    return false;
                const mismaCedulaRep = orden.cedulaRepresentante.trim().toLowerCase() === cedulaRepNorm;
                const mismoNombreRep = orden.nombreRepresentante.trim().toLowerCase() === nombreRepNorm;
                const mismoApellidoRep = orden.apellidoRepresentante.trim().toLowerCase() === apellidoRepNorm;
                // Conflicto: misma cédula de representante pero distinto nombre/apellido
                return mismaCedulaRep && !(mismoNombreRep && mismoApellidoRep);
            });
        }
        // Si no es menor pero tiene cédula "menor" (legacy), lo dejamos pasar
        if (cedulaNorm === "menor")
            return false;
        // Buscar si la cédula del paciente ya existe en el sistema con otro nombre
        return this._ordenes.some(orden => {
            // Ignoramos si la orden guardada es de un menor
            if (orden.cedula.trim().toLowerCase() === "menor")
                return false;
            const mismaCedula = orden.cedula.trim().toLowerCase() === cedulaNorm;
            const mismoNombre = orden.nombre.trim().toLowerCase() === nombreNorm;
            const mismoApellido = orden.apellido.trim().toLowerCase() === apellidoNorm;
            // Conflicto: misma cédula pero nombre o apellido diferente
            return mismaCedula && !(mismoNombre && mismoApellido);
        });
    }
    // --- ACUMULADORES DE CAJA CORREGIDOS ---
    calcularTotalPacientesAtendidos() {
        return this._ordenes.length;
    }
    calcularMontoTotalUsd() {
        return this._ordenes.reduce((acum, o) => acum + o.montoTotal$, 0);
    }
    calcularMontoTotalBs() {
        // Multiplica dinámicamente el total de dólares por la tasa del día
        return this.calcularMontoTotalUsd() * this._tasaCambio;
    }
    // Metodo que permite obtener el estudio mas solicitado
    obtenerEstudioMasSolicitado() {
        const conteoGlobal = {};
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
    calcularEstructuraFactura(estudiosElegidos) {
        let totalUsd = 0;
        let tiempoMaxHoras = 0;
        let matrizResultados = [];
        estudiosElegidos.forEach(e => {
            totalUsd += Number(e.precio);
            if (Number(e.tiempoProcesamiento) > tiempoMaxHoras) {
                tiempoMaxHoras = Number(e.tiempoProcesamiento);
            }
            if (e.parametrosAsociados && Array.isArray(e.parametrosAsociados)) {
                e.parametrosAsociados.forEach((p) => {
                    if (!matrizResultados.some(r => r.parametro === p.parametro)) {
                        matrizResultados.push({ ...p, resultado: "" });
                    }
                });
            }
        });
        const totalBs = totalUsd * this._tasaCambio;
        return { totalUsd, totalBs, tiempoMaxHoras, matrizResultados };
    }
    // Metodo que permite calcular los tiempos de entrega
    calcularTiemposEntrega(horasProcesamiento) {
        const ahora = new Date();
        const horaPrometida = new Date(ahora.getTime() + horasProcesamiento * 60 * 60 * 1000);
        const registro = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entrega = horaPrometida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { registro, entrega };
    }
}
//# sourceMappingURL=Cl_mLaboratorio.js.map