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
        // Si no es menor pero tiene cédula "menor" o "cr" (legacy o generada), lo dejamos pasar
        if (cedulaNorm === "menor" || cedulaNorm.startsWith("cr"))
            return false;
        // Buscar si la cédula del paciente ya existe en el sistema con otro nombre
        return this._ordenes.some(orden => {
            // Ignoramos si la orden guardada es de un menor
            if (orden.cedula.trim().toLowerCase() === "menor" || orden.cedula.trim().toLowerCase().startsWith("cr"))
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
    /**
     * Método que contabiliza la cantidad de veces que un examen específico fue solicitado
     * durante un día particular (utilizado para el Reporte Dinámico en UI).
     * @param nombreExamen Texto libre a buscar en la lista de exámenes (Ej: "Creatinina", "Glucosa")
     * @param fechaFiltroYMD Fecha seleccionada en el selector (formato "yyyy-mm-dd")
     * @returns El número total de incidencias encontradas
     */
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
    //polimorfismo del reporte de resultados pdf
    obtenerTituloReporte() {
        const fecha = new Date().toLocaleDateString();
        return `Cierre de Caja - ${fecha}`;
    }
    //implementacion del polimorfismo
    obtenerContenidoReporte() {
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const totalPacientes = this.calcularTotalPacientesAtendidos();
        const estudioTop = this.obtenerEstudioMasSolicitado();
        const tasa = this.tasaCambio;
        const totalUsd = this.calcularMontoTotalUsd();
        const totalBs = this.calcularMontoTotalBs();
        return `
<!DOCTYPE html>
<html lang="es">
<head>
  <title>${this.obtenerTituloReporte()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
    body { padding: 50px; color: #000; font-size: 14px; }
    h1 { font-size: 26px; font-weight: 900; font-style: italic; margin-bottom: 4px; }
    .subtitulo { font-size: 13px; color: #64748b; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #0f172a; color: white; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .monto { font-weight: 700; font-size: 15px; }
    .pie { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <h1>Git Force <span style="font-size:14px;font-style:normal;">C.A.</span></h1>
  <p class="subtitulo">Cierre de Caja — ${fecha} a las ${hora}</p>
  <table>
    <thead>
      <tr>
        <th>Concepto</th>
        <th>Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Pacientes Atendidos</td><td class="monto">${totalPacientes}</td></tr>
      <tr><td>Examen Más Solicitado</td><td class="monto">${estudioTop}</td></tr>
      <tr><td>Tasa del Día (Bs/$)</td><td class="monto">${tasa.toFixed(2)} Bs</td></tr>
      <tr><td>Total Ingresos (USD)</td><td class="monto" style="color:#059669;">$ ${totalUsd.toFixed(2)}</td></tr>
      <tr><td>Total Ingresos (Bs)</td><td class="monto" style="color:#0284c7;">${totalBs.toFixed(2)} Bs</td></tr>
    </tbody>
  </table>
  <p class="pie">Generado por el Sistema de Laboratorio Git Force C.A. — © 2026 UCLA DCyT</p>
</body>
</html>`;
    }
}
//# sourceMappingURL=Cl_mLaboratorio.js.map