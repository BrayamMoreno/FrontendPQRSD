import type { PqItem } from "../models/PqItem";

// **IMPORTACIÓN DEL LOGO**
import logo from "../assets/Logo.webp"

/**
 * Función auxiliar para formatear una fecha o devolver un valor por defecto.
 * @param dateString La cadena de fecha (o null/undefined).
 * @param defaultValue El valor a mostrar si la fecha es inválida o nula.
 * @returns La fecha formateada o el valor por defecto.
 */
const formatPqDate = (dateString: string | Date | null | undefined, defaultValue: string = "No definida"): string => {
    if (!dateString) return defaultValue;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return defaultValue;
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch {
        return defaultValue;
    }
};

/**
 * Genera un informe PDF estilizado a partir de un objeto PqItem.
 * Utiliza html2pdf.js para la conversión de HTML a PDF.
 * @param solicitud El objeto PqItem a incluir en el informe, o null.
 */
export const generarInformePDF = (solicitud: PqItem | null) => {
    if (!solicitud) {
        console.error("No se puede generar el informe PDF: el objeto de solicitud es nulo.");
        return;
    }

    const radicado = solicitud.numeroRadicado ?? solicitud.id;
    console.log(`Generando informe PDF para la solicitud: ${radicado}`);

    // Refactorizar la generación de HTML en una función separada para mayor claridad
    const contenido = buildPqReportHtml(solicitud);

    // Importar y usar html2pdf.js
    import("html2pdf.js")
        .then(({ default: html2pdf }) => {
            html2pdf()
                .from(contenido)
                // Opciones de configuración mejoradas para el PDF
                .set({
                    margin: [10, 10, 10, 10], // Margen en mm [top, left, bottom, right]
                    filename: `PQRS_${radicado}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .save();
        })
        .catch(error => {
            console.error("Error al cargar o usar html2pdf.js:", error);
        });
};

/**
 * Genera la cadena de HTML para el informe. 
 * Aplica estilos mejorados y estructura con CSS moderno.
 * @param solicitud El objeto PqItem.
 * @returns La cadena HTML del contenido del informe.
 */
const buildPqReportHtml = (solicitud: PqItem): string => {
    const radicado = solicitud.numeroRadicado ?? solicitud.id;
    const solicitante = solicitud.solicitante;

    return `
    <style>
        /* Estilos CSS moderno para mejor presentación */
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
        .report-container { padding: 20px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        
        /* **ESTILOS PARA CONTROL DE SALTO DE PÁGINA** */
        h3 { 
            color: #0056b3; 
            border-left: 5px solid #0056b3; 
            padding-left: 10px; 
            margin: 25px 0 10px 0; 
            page-break-after: avoid; 
        }
        .page-break-avoid {
            page-break-inside: avoid;
        }

        /* Encabezado */
        .header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            margin-bottom: 20px; 
            border-bottom: 3px solid #0056b3; 
            padding-bottom: 10px; 
        }
        .header-title {
            text-align: right;
            flex-grow: 1; 
        }
        .header img {
            width: 80px; 
            height: auto;
            margin-right: 20px;
        }
        .header h1 { 
            color: #0056b3; 
            margin: 0; 
            font-size: 20px; 
            font-weight: bold;
        }
        .header h2 { 
            color: #333; 
            margin-top: 5px; 
            font-size: 16px; 
            font-weight: normal; 
        }
        
        .data-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; margin-bottom: 15px; }
        .full-row { grid-column: 1 / -1; }
        .data-item strong { display: block; color: #555; font-weight: 600; margin-bottom: 2px; }
        .data-item span { display: block; color: #333; }
        
        ul { list-style-type: none; padding-left: 0; margin-bottom: 20px; }
        ul li { 
            margin-bottom: 5px; 
            padding: 5px 0; 
            border-bottom: 1px dotted #ccc; 
            page-break-inside: avoid;
        }

        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #ccc; padding-top: 10px; }
        
        /* **DESCRIPCIÓN FINAL: TOTALMENTE LIMPIA** */
        .description-content {
            padding: 5px 0 5px 0; /* Ajustamos padding para eliminar el espacio del border-left */
            color: #333;
            white-space: pre-wrap; 
            word-wrap: break-word;
            /* ¡ELIMINADO! border-left: 2px solid #ccc; */
            /* ¡ELIMINADO! padding-left: 10px; */ 
            page-break-inside: avoid;
        }
    </style>
    <div class="report-container">
      <div class="header">
        <img src="${logo}" alt="Logo de la Secretaría">
        <div class="header-title">
            <h1>Secretaría de Tránsito y Transporte de Girardot</h1>
            <h2>Informe de Petición, Queja, Reclamo o Sugerencia (PQRS)</h2>
            <p style="font-size: 14px; margin: 5px 0;">Radicado: **#${radicado}**</p>
        </div>
      </div>

      <div class="data-section page-break-avoid">
        <div class="data-item">
            <strong>Estado Actual:</strong>
            <span>${solicitud.nombreUltimoEstado || "Pendiente"}</span>
        </div>
        <div class="data-item">
            <strong>Tipo de PQ:</strong>
            <span>${solicitud.tipoPQ?.nombre || "No definido"}</span>
        </div>
      </div>

      <div class="page-break-avoid">
        <h3>Información del Solicitante</h3>
        <div class="data-section">
          <div class="data-item">
              <strong>Nombre Completo:</strong>
              <span>${solicitante?.nombre || "N/A"} ${solicitante?.apellido || ""}</span>
          </div>
          <div class="data-item">
              <strong>Documento:</strong>
              <span>${solicitante?.tipoDoc?.nombre || ""} - ${solicitante?.dni || "No registrado"}</span>
          </div>
          <div class="data-item">
              <strong>Correo:</strong>
              <span>${solicitante?.correoUsuario || "No registrado"}</span>
          </div>
          <div class="data-item">
              <strong>Teléfono:</strong>
              <span>${solicitante?.telefono || "No registrado"}</span>
          </div>
          <div class="data-item">
              <strong>Dirección:</strong>
              <span>${solicitante?.direccion || "No registrada"}</span>
          </div>
          <div class="data-item">
              <strong>Género:</strong>
              <span>${solicitante?.genero?.nombre || "No registrado"}</span>
          </div>
        </div>
      </div>

      <div class="page-break-avoid">
        <h3>Detalle de la Solicitud</h3>
        <div class="data-section">
          <div class="data-item full-row">
              <strong>Asunto:</strong>
              <span>${solicitud.detalleAsunto || "Sin asunto"}</span>
          </div>
          <div class="data-item full-row">
              <strong>Descripción del Caso:</strong>
              <div class="description-content">${solicitud.detalleDescripcion || "Sin descripción disponible"}</div>
          </div>
          <div class="data-item">
              <strong>Responsable Asignado:</strong>
              <span>${solicitud.responsable?.personaResponsable?.nombre || "No asignado"} ${solicitud.responsable?.personaResponsable?.apellido || ""}</span>
          </div>
          <div class="data-item">
              <strong>Radicador:</strong>
              <span>${solicitud.radicador?.nombre || "No asignado"} ${solicitud.radicador?.apellido || ""}</span>
          </div>
        </div>
      </div>

      <div class="page-break-avoid">
        <h3>Fechas Importantes</h3>
        <div class="data-section">
          <div class="data-item">
              <strong>Fecha de Radicación:</strong>
              <span>${formatPqDate(solicitud.fechaRadicacion)}</span>
          </div>
          <div class="data-item">
              <strong>Fecha de Resolución Estimada:</strong>
              <span>${formatPqDate(solicitud.fechaResolucionEstimada, "No definida")}</span>
          </div>
          <div class="data-item">
              <strong>Fecha de Resolución Real:</strong>
              <span>${formatPqDate(solicitud.fechaResolucion, "Pendiente")}</span>
          </div>
        </div>
      </div>

      <div class="page-break-avoid">
        <h3>Documentos Adjuntos</h3>
        <ul>
          ${solicitud.adjuntos?.length ?
            solicitud.adjuntos.map(a =>
                `<li>${a.nombreArchivo} <small>(${a.respuesta ? "Respuesta" : "Radicado"})</small></li>`
            ).join("") :
            '<li>No hay documentos adjuntos registrados.</li>'
        }
        </ul>
      </div>

      <div class="page-break-avoid">
        <h3>Historial de Estados</h3>
        <ul>
          ${solicitud.historialEstados?.length ?
            solicitud.historialEstados
                .sort((a, b) => new Date(a.fechaCambio).getTime() - new Date(b.fechaCambio).getTime())
                .map(h =>
                    `<li><strong>${h.estado?.nombre || "Desconocido"}</strong> - ${formatPqDate(h.fechaCambio, 'Fecha no registrada')} <br><small>Observación: ${h.observacion || "Sin observación"}</small></li>`
                ).join("") :
            '<li>No se encontró historial de estados.</li>'
        }
        </ul>
      </div>

      <div class="footer">
        Este es un informe generado automáticamente del sistema PQRS.<br>
        Secretaría de Tránsito y Transporte de Girardot - ${new Date().getFullYear()}
      </div>
    </div>
    `;
};