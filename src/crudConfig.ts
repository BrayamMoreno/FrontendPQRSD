import type { CrudProps } from "./models/CrudProps";

export const crudConfigs: CrudProps<any>[] = [
  {
    titulo: "Tipos de Documentos",
    endpoint: "/tipos_documentos",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
    ],
  },
  {
    titulo: "Tipos de Personas",
    endpoint: "/tipos_personas",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Tipo de Persona" },
    ],
  },
  {
    titulo: "Géneros",
    endpoint: "/generos",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Género" },
    ],
  },
  {
    titulo: "Tipos de Solicitudes",
    endpoint: "/tipos_pqs",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Tipo de Solicitud" },
      { key: "diasHabilesRespuesta", label: "Días Hábiles Para Respuesta" },
    ],
  },
  {
    titulo: "Areas Responsables",
    endpoint: "/areas_responsables",
    Columns: [
      { key: "id", label: "ID" },
      { key: "codigoDep", label: "Código de Área" },
      { key: "nombre", label: "Nombre del Área" },
    ],
  },
  {
    titulo: "Departamentos",
    endpoint: "/departamentos",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "codigoDane", label: "Código DANE" },
    ],
  },
  {
    titulo: "Estados de las Peticiones",
    endpoint: "/estados_pqs",
    Columns: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "color", label: "Color", type: "color" },
      { key: "descripcion", label: "Descripción" },
    ],
  },
  {
    titulo: "Historial de Estados",
    endpoint: "/historial_estados",
    Columns: [
      { key: "id", label: "ID" },
      { key: "estado.nombre", label: "Estado" },
      { key: "fechaCambio", label: "Fecha de Asignación", type: "date" },
      { key: "usuario.persona.nombre", label: "Usuario Modificador" },
    ],
  },
];
