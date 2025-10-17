import type { Permiso } from "./Permiso";

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
  permisos: Permiso[];
  eliminado: boolean;
}