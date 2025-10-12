import type { CrudProps } from "./models/CrudProps";

export const crudConfigs: CrudProps<any>[] = [
  {
    titulo: "Tipos de Documentos",
    endpoint: "/tipos_documentos",
    tabla: "tipos_documentos",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
    ],
  },
  {
    titulo: "Tipos de Personas",
    endpoint: "/tipos_personas",
    tabla: "tipos_personas",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Tipo de Persona" },
    ],
  },
  {
    titulo: "Géneros",
    endpoint: "/generos",
    tabla: "generos",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Género" },
    ],
  },
  {
    titulo: "Tipos de Solicitudes",
    endpoint: "/tipos_pqs",
    tabla: "tipos_pqs",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Tipo de Solicitud" },
      { key: "diasHabilesRespuesta", label: "Días Hábiles Para Respuesta" },
    ],
  },
  {
    titulo: "Areas Responsables",
    endpoint: "/areas_responsables",
    tabla: "areas_responsables",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "codigoDep", label: "Código de Área" },
      { key: "nombre", label: "Nombre del Área" },
    ],
  },
  {
    titulo: "Departamentos",
    endpoint: "/departamentos",
    tabla: "departamentos",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "codigoDane", label: "Código DANE" },
    ],
  },
  {
    titulo: "Estados de las Peticiones",
    endpoint: "/estados_pqs",
    tabla: "estados_pqs",
    accion: "leer",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "color", label: "Color", type: "color" },
      { key: "descripcion", label: "Descripción" },
    ],
  },
];
