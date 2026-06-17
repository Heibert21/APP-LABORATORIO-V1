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
        if (isMenor && cedulaRep.trim() !== "") {
            return this._validarDuplicadoMenor(cedulaRep, nombreRep, apellidoRep);
        }
        return this._validarDuplicadoAdulto(cedula, nombre, apellido);
    }
    _validarDuplicadoMenor(cedulaRep, nombreRep, apellidoRep) {
        const cedulaRepNorm = cedulaRep.trim().toLowerCase();
        const nombreRepNorm = nombreRep.trim().toLowerCase();
        const apellidoRepNorm = apellidoRep.trim().toLowerCase();
        return this._ordenes.some(orden => {
            if (!orden.cedulaRepresentante)
                return false;
            const mismaCedulaRep = orden.cedulaRepresentante.trim().toLowerCase() === cedulaRepNorm;
            const mismoNombreRep = orden.nombreRepresentante.trim().toLowerCase() === nombreRepNorm;
            const mismoApellidoRep = orden.apellidoRepresentante.trim().toLowerCase() === apellidoRepNorm;
            return mismaCedulaRep && !(mismoNombreRep && mismoApellidoRep);
        });
    }
    // Metodo que permite validar el duplicado de un paciente adulto
    _validarDuplicadoAdulto(cedula, nombre, apellido) {
        const cedulaNorm = cedula.trim().toLowerCase();
        const nombreNorm = nombre.trim().toLowerCase();
        const apellidoNorm = apellido.trim().toLowerCase();
        // Si la cedula es menor o es una cedula de representante, no se valida
        if (cedulaNorm === "menor" || cedulaNorm.startsWith("cr"))
            return false;
        // Se recorre la lista de ordenes para validar el duplicado
        return this._ordenes.some(orden => {
            if (orden.cedula.trim().toLowerCase() === "menor" || orden.cedula.trim().toLowerCase().startsWith("cr"))
                return false;
            const mismaCedula = orden.cedula.trim().toLowerCase() === cedulaNorm;
            const mismoNombre = orden.nombre.trim().toLowerCase() === nombreNorm;
            const mismoApellido = orden.apellido.trim().toLowerCase() === apellidoNorm;
            return mismaCedula && !(mismoNombre && mismoApellido);
        });
    }
    // Metodo que permite obtener las ordenes en espera ordenadas cronológicamente
    obtenerOrdenesEnEsperaOrdenadas() {
        return this._ordenes
            .filter(o => o.status === "En Espera")
            .sort((a, b) => {
            // Usar obtenerMinutosEspera: más minutos = más antiguo = primero en la lista
            const minsA = a.obtenerMinutosEspera();
            const minsB = b.obtenerMinutosEspera();
            if (minsA === -1)
                return 1;
            if (minsB === -1)
                return -1;
            return minsB - minsA; // Mayor espera primero
        });
    }
    // Metodo que permite calcular el total de pacientes atendidos
    calcularTotalPacientesAtendidos() {
        return this._ordenes.length;
    }
    // Metodo que permite calcular el monto total en dolares
    calcularMontoTotalUsd() {
        return this._ordenes.reduce((acum, o) => acum + o.montoTotal$, 0);
    }
    calcularMontoTotalBs() {
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
    // Metodo que permite contar la cantidad de veces que un examen especifico fue solicitado durante un dia particular
    contarExamenesPorFecha(nombreExamen, fechaFiltroYMD) {
        if (!fechaFiltroYMD)
            return 0;
        let conteo = 0;
        const nombreNormalizado = nombreExamen.trim().toLowerCase();
        this._ordenes.forEach(orden => {
            if (!orden.fechaRegistro)
                return;
            const partesEspacio = orden.fechaRegistro.replace(",", "").trim().split(" ");
            if (partesEspacio.length < 1)
                return;
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
    calcularTiemposEntrega(horasProcesamiento) {
        const ahora = new Date();
        const horaPrometida = new Date(ahora.getTime() + horasProcesamiento * 60 * 60 * 1000);
        const registro = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entrega = horaPrometida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { registro, entrega };
    }
}
//# sourceMappingURL=Cl_mLaboratorio.js.map