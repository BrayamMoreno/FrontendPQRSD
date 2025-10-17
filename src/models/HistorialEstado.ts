import type { Estado } from "./Estado";
import type { Usuario } from "./Usuario";

export interface HistorialEstado {
    id: number;
    estado: Estado;
    usuario: Usuario | null;
    observacion: string | null;
    fechaCambio: string;
    numeroRadicado: string;
    eliminado: boolean;
}