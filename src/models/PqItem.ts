import type { HistorialEstado } from "./HistorialEstado";
import type { Responsable } from "./Responsable";
import type { TipoPQ } from "./TipoPQ";
import type { Adjunto } from "./Adjunto";
import type { Persona } from "./Persona";

export interface PqItem {
    id: number;
    numeroRadicado: string | null;
    detalleAsunto: string;
    detalleDescripcion: string;
    tipoPQ: TipoPQ;
    solicitante: Persona;
    respuesta: string | null;
    fechaRadicacion: string;
    horaRadicacion: string;
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