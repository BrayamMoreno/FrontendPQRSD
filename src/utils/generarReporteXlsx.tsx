import { useAlert } from "../context/AlertContext";
import type { PqItem } from "../models/PqItem";
import type { PaginatedResponse } from "../models/PaginatedResponse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import apiServiceWrapper from "../api/ApiService";

export const useGenerarReporteXlsx = () => {
    const { showAlert } = useAlert();

    const generarReporteXlsx = async (fechaInicio?: string, fechaFin?: string) => {
        const api = apiServiceWrapper;
        let allData: PqItem[] = [];
        let page = 0;
        const size = 100;

        try {
            while (true) {
                const params: Record<string, any> = { size, page };
                if (fechaInicio) params.fechaInicio = fechaInicio;
                if (fechaFin) params.fechaFin = fechaFin;

                const response = await api.get<PaginatedResponse<PqItem>>("/pqs/all_pqs", params);
                const pageData = response.data ?? [];

                if (Array.isArray(pageData) && pageData.length > 0) {
                    allData = allData.concat(pageData);
                }

                if (!response.has_more || !Array.isArray(pageData) || pageData.length === 0) break;
                page++;
            }

            if (!allData || allData.length === 0) {
                showAlert("No se encontraron datos para las fechas seleccionadas.", "info");
                return;
            } else {

            }

            const formatearFecha = (fecha: string | null): string => {
                if (!fecha) return "";
                const date = new Date(fecha);
                return isNaN(date.getTime()) ? "" : date.toLocaleDateString("es-CO");
            };

            const getPlainTextFromHtml = (html?: string): string => {
                const tmp = document.createElement("div");
                tmp.innerHTML = html || "";
                let text = tmp.textContent || tmp.innerText || "";
                text = text.replace(/\u00A0/g, "");
                text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
                return text.trim();
            };

            const getEdad = (fechaNac: string): number | string => {
                if (!fechaNac) return "No especificada";
                const [anio, mes, dia] = fechaNac.split("T")[0].split("-").map(Number);
                const hoy = new Date();
                let edad = hoy.getFullYear() - anio;
                const mesActual = hoy.getMonth() + 1;
                const diaActual = hoy.getDate();
                if (mesActual < mes || (mesActual === mes && diaActual < dia)) edad--;
                return edad;
            };

            const datosFormateados: Record<string, any>[] = allData.map((item) => ({
                ID: item.id,
                Num_Rad_Ciu: item.numeroRadicado ?? "Sin número de radicado",
                Fec_Rad: item.fechaRadicacion ? formatearFecha(item.fechaRadicacion) : "No radicado",
                Tip_Pqr: item.tipoPQ?.nombre ?? "N/A",
                Tip_Origen: item.solicitante?.tipoPersona?.nombre ?? "N/A",
                Num_Ide_Ciu: item.solicitante?.dni ?? "Sin documento",
                Nom_Ciu: `${item.solicitante?.nombre ?? "Sin nombre"} ${item.solicitante?.apellido ?? ""}`,
                Edad_Ciu: item.solicitante?.fechaNacimiento ? getEdad(item.solicitante.fechaNacimiento) : "No especificada",
                Tip_Sex: item.solicitante?.genero?.nombre ?? "Sin especificar",
                Det_Asu: item.detalleAsunto ? getPlainTextFromHtml(item.detalleAsunto) : "No especificado",
                Dir_Ciu: item.solicitante?.direccion ?? "No especificado",
                Num_Ciu: item.solicitante?.telefono ?? "No especificado",
                Fecha_Respuesta: item.fechaResolucion ? formatearFecha(item.fechaResolucion) : "Pendiente",
                Radicador: `${item.radicador?.nombre ?? "Sin Radicador"} ${item.radicador?.apellido ?? ""}`,
                Responsable: `${item.responsable?.personaResponsable?.nombre ?? "Sin asignar"} ${item.responsable?.personaResponsable?.apellido ?? ""}`,
                Estado: item.nombreUltimoEstado ?? "Desconocido",
                Respuesta: item.respuesta ? getPlainTextFromHtml(item.respuesta) : "Sin respuesta",
            }));

            console.log("Datos formateados para Excel:", datosFormateados);

            const ws = XLSX.utils.json_to_sheet(datosFormateados);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Reporte PQRS");

            ws["!cols"] = Object.keys(datosFormateados[0]).map((key) => ({
                wch: Math.max(
                    key.length,
                    ...datosFormateados.map((fila) => String(fila[key] ?? "").length)
                ) + 2,
            }));

            let nombreArchivo = "Reporte_PQRS.xlsx";
            if (!fechaInicio && !fechaFin) nombreArchivo = "Reporte_PQRS_completo.xlsx";
            else if (fechaInicio && !fechaFin) nombreArchivo = `Reporte_PQRS_desde_${fechaInicio}.xlsx`;
            else if (!fechaInicio && fechaFin) nombreArchivo = `Reporte_PQRS_hasta_${fechaFin}.xlsx`;
            else nombreArchivo = `Reporte_PQRS_${fechaInicio}_a_${fechaFin}.xlsx`;

            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            if (datosFormateados.length > 0) {
                saveAs(blob, nombreArchivo);
                showAlert("Reporte generado correctamente", "success");
            }
        } catch (error) {
            console.error("Error al generar el reporte:", error);
            showAlert("Error al generar el reporte.", "error");
        }
    };

    return { generarReporteXlsx };
};
