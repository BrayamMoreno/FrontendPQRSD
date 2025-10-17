import type { Persona } from "./Persona";
import type { Rol } from "./Rol";

export interface Usuario {
    id: number;
    correo: string;
    contrasena: string;
    isEnable: boolean;
    resetToken: string | null;
    persona: Persona;
    rol: Rol;
    createdAt: string;
    updatedAt: string | null;
    eliminado: boolean;
}