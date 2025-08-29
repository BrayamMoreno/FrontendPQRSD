import type { Permiso } from "./Permiso";

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
  permisos: Permiso[];
}