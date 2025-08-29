import type { Column } from "./Column";

export interface CrudProps<T> {
    titulo: string;
    endpoint: string;
    Columns: Column<T>[];
}
