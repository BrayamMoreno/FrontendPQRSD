import type { PqItem } from "../models/PqItem";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Genera y descarga un archivo Excel (.xlsx) con datos personalizados.
 * @param data - Lista de objetos (PqItem[]) a exportar.
 * @param nombreArchivo - Nombre del archivo (sin extensión).
 */
export const generarReporteXlsx = async (data: PqItem[], nombreArchivo: string) => {
    if (!data || data.length === 0) {
        console.warn("No hay datos para exportar a Excel.");
        return;
    }

    // ✅ Nombres personalizados de columnas
    // Puedes ajustar estos encabezados según las propiedades de tu modelo PqItem
    const columnas = [
        { header: "ID", key: "id" },
        { header: "Nombre del Producto", key: "nombre" },
        { header: "Categoría", key: "categoria" },
        { header: "Precio (USD)", key: "precio" },
        { header: "Fecha de Creación", key: "fechaCreacion" },
    ];

    // ✅ Mapear datos del modelo -> formato Excel
    const datosFormateados = data.map((item) => {
        const fila: Record<string, any> = {};
        columnas.forEach((col) => {
            fila[col.header] = (item as any)[col.key];
        });
        return fila;
    });

    const ws = XLSX.utils.json_to_sheet(datosFormateados);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    const anchoColumnas = columnas.map((col) => ({
        wch: Math.max(col.header.length, ...data.map((item) => String((item as any)[col.key] ?? "").length)) + 2,
    }));
    ws["!cols"] = anchoColumnas;

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${nombreArchivo}.xlsx`);
};
