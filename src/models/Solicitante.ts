import type { TipoDoc } from "./TipoDoc";
import type { TipoPersona } from "./TipoPersona";
import type { Genero } from "./Genero";

export interface Solicitante {
  id: number;
  nombre: string;
  apellido: string;
  tipoDoc: TipoDoc;
  dni: string;
  tipoPersona: TipoPersona;
  telefono: string;
  direccion: string;
  codigoRadicador: string | null;
  tratamientoDatos: boolean;
  genero: Genero;
  createdAt: string; // ISO Date string
  updatedAt: string | null;
  eliminado: boolean;
}
