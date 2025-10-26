import type { Departamentos } from "./Departamentos";

export type Municipios = {
    id: "" | string;
    nombre: "" | string;
    codigoDane: "" | string;
    departamento: Departamentos | null;
}
