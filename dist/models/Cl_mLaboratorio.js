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
            this._ordenes.push(new Cl_mOrdenBio(o));
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
    crearEstructuraResultadosVacios(nombre, unidad, rango) {
        return [{
                parametro: nombre,
                resultado: "",
                unidad: unidad.trim() !== "" ? unidad.trim() : "U.",
                rangoReferencia: rango.trim() !== "" ? rango.trim() : "Normal"
            }];
    }
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
    _validarDuplicadoAdulto(cedula, nombre, apellido) {
        const cedulaNorm = cedula.trim().toLowerCase();
        const nombreNorm = nombre.trim().toLowerCase();
        const apellidoNorm = apellido.trim().toLowerCase();
        if (cedulaNorm === "menor" || cedulaNorm.startsWith("cr"))
            return false;
        return this._ordenes.some(orden => {
            if (orden.cedula.trim().toLowerCase() === "menor" || orden.cedula.trim().toLowerCase().startsWith("cr"))
                return false;
            const mismaCedula = orden.cedula.trim().toLowerCase() === cedulaNorm;
            const mismoNombre = orden.nombre.trim().toLowerCase() === nombreNorm;
            const mismoApellido = orden.apellido.trim().toLowerCase() === apellidoNorm;
            return mismaCedula && !(mismoNombre && mismoApellido);
        });
    }
    obtenerOrdenesEnEsperaOrdenadas() {
        return this._ordenes
            .filter(o => o.status === "En Espera")
            .sort((a, b) => {
            const minsA = a.obtenerMinutosEspera();
            const minsB = b.obtenerMinutosEspera();
            if (minsA === -1)
                return 1;
            if (minsB === -1)
                return -1;
            return minsB - minsA;
        });
    }
    calcularTotalPacientesAtendidos() {
        return this._ordenes.length;
    }
    calcularMontoTotalUsd() {
        return this._ordenes.reduce((acum, o) => acum + o.montoTotal$, 0);
    }
    calcularMontoTotalBs() {
        return this.calcularMontoTotalUsd() * this._tasaCambio;
    }
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
    calcularTiemposEntrega(horasProcesamiento) {
        const ahora = new Date();
        const horaPrometida = new Date(ahora.getTime() + horasProcesamiento * 60 * 60 * 1000);
        const registro = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entrega = horaPrometida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { registro, entrega };
    }
    obtenerOrdenesAntiguasSemanaMas() {
        const ahora = new Date();
        const limiteMs = 7 * 24 * 60 * 60 * 1000;
        return this._ordenes.filter(orden => {
            if (!orden.fechaRegistro)
                return false;
            try {
                const normalizado = orden.fechaRegistro.replace(",", "").trim();
                const partes = normalizado.split(" ");
                if (partes.length < 1)
                    return false;
                const segmentosFecha = partes[0].split("/");
                if (segmentosFecha.length !== 3)
                    return false;
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
            }
            catch {
                return false;
            }
        });
    }
    obtenerReporteExamenes(filtros) {
        let filtradas = this._ordenes;
        const nombreNormalizado = filtros.examen.trim().toLowerCase();
        const conteoExamenes = {};
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
//# sourceMappingURL=Cl_mLaboratorio.js.map