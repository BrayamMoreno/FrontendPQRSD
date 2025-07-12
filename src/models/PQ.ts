import type { AdjuntosPQ } from "./AdjuntosPQ";

export type PQ = {
    tipo_pq_id: "" | string;
    solicitante_id: "" | string;
    detalleAsunto : "" | string;
    detalleDescripcion: "" | string;
    lista_documentos: AdjuntosPQ[];
}