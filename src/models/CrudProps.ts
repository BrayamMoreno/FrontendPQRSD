import type { Column } from "./Column";

export interface CrudProps<T> {
    titulo: string;
    endpoint: string;
    tabla?: string;
    accion: string;
    Columns: Column<T>[];
}
