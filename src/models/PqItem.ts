import type { HistorialEstado } from "./HistorialEstado";
import type { Responsable } from "./Responsable";
import type { Solicitante } from "./Solicitante";
import type { TipoPQ } from "./TipoPQ";
import type { Adjunto } from "./Adjunto";
import type { Persona } from "./Persona";

export interface PqItem {
    id: number;
    consecutivo: string;
    numeroRadicado: string | null;
    numeroFolio: string | null;
    detalleAsunto: string;
    detalleDescripcion: string;
    tipoPQ: TipoPQ;
    solicitante: Persona;
    respuesta: string | null;
    fechaRadicacion: string; // YYYY-MM-DD
    horaRadicacion: string; // HH:mm:ss
    fechaResolucionEstimada: string;
    fechaResolucion: string | null;
    radicador: Persona;
    responsable: Responsable;
    ultimoEstadoId: number;
    nombreUltimoEstado: string;
    web: boolean;
    historialEstados: HistorialEstado[];
    adjuntos: Adjunto[];
}