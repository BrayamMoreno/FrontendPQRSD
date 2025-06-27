import type { AdjuntosPQ } from "./AdjuntosPQ";

export type PQ = {
    numero_radicado: "" | string;
    tipo_pq_id: "" | string;
    solicitante_id: "" | string;
    fecha_radicacion: "" | string;
    detalleAsunto : "" | string;
    detalleDescripcion: "" | string;
    Hora_radicacion: "" | string;
    lista_documentos: AdjuntosPQ[];
}