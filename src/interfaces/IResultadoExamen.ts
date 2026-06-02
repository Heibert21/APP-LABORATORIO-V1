export interface IResultadoExamen {
    parametro: string;       // Ej: "Hemoglobina", "Glicemia"
    resultado: string;       // El valor numérico que meterá el bioanalista
    unidad: string;          // Ej: "g/dL", "mg/dL"
    rangoReferencia: string; // Ej: "12.0 - 16.0", "70 - 100"
}
