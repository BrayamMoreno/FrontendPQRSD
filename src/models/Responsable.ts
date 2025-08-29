import type { Area } from "./Area";
import type { Persona } from "./Persona";

export interface Responsable {
    id: number;
    personaResponsable: Persona;
    area: Area;
    fechaAsignacion: string; // ISO Date string
}