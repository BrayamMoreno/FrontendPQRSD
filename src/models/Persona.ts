import type { Genero } from "./Genero";
import type { TipoDoc } from "./TipoDoc";
import type { TipoPersona } from "./TipoPersona";

export interface Persona {
    id: number | string;
    nombre: string;
    apellido: string;
    correoUsuario: string;
    dni: string;
    telefono: string;
    direccion: string;
    tratamientoDatos: boolean;
    tipoDoc: TipoDoc;
    tipoPersona: TipoPersona;
    genero: Genero;
    createdAt: string;
    updatedAt: string;
}
