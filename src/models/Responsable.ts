import type { AreaResponsable } from "./AreaResponsable";
import type { Persona } from "./Persona";

export interface Responsable {
    id: number;
    personaResponsable: Persona;
    area: AreaResponsable;
    fechaAsignacion: string;
    isActive: boolean;
}