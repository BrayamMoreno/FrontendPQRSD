import { FileText } from "lucide-react";
import type { PqItem } from "../../models/PqItem";
import { Button } from "../ui/button";
import type { Adjunto } from "../../models/Adjunto";
import { motion } from "framer-motion";
import { useDownloadFile } from "../../utils/useDownloadFile";


interface SolicitudModalProps {
    isOpen: boolean;
    solicitud: PqItem | null;
    onClose: () => void;
}

export default function SolicitudModal({ isOpen, solicitud, onClose }: SolicitudModalProps) {
    if (!isOpen || !solicitud) return null;

    const { downloadFile } = useDownloadFile();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto"
            >
                {/* HEADER */}
                <div className="bg-blue-900 text-white p-6  sticky top-0 z-20 shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-1">
                                #{solicitud.numeroRadicado ?? solicitud.id}
                            </h2>
                            <span className="text-sm sm:text-base font-medium">{solicitud.tipoPQ?.nombre}</span>
                        </div>
                        <span
                            className="bg-white text-blue-900 font-semibold px-4 py-1 rounded-full shadow text-sm whitespace-nowrap self-start sm:self-auto"
                        >
                            {solicitud.nombreUltimoEstado}
                        </span>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div className="p-6 space-y-6">
                    {/* Información principal y fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información Principal */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-2">
                                Información Principal
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Asunto:</label>
                                    <p className="text-gray-900 mt-1">{solicitud.detalleAsunto}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Descripción:</label>
                                    <div
                                        className="prose prose-sm max-w-none bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 text-gray-800 overflow-x-auto"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                solicitud.detalleDescripcion ||
                                                "<p><em>Sin descripción disponible</em></p>",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Respuesta:</label>
                                    <div
                                        className="prose prose-sm max-w-none bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2 text-gray-800 overflow-x-auto"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                solicitud.respuesta ||
                                                "<p><em>Sin respuesta</em></p>",
                                        }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Fechas y tiempos */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-2">
                                Fechas y Tiempos
                            </h3>

                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-sm font-medium text-gray-600">Fecha de Radicación:</label>
                                    <p className="text-gray-900 mt-1 font-medium">
                                        {new Date(solicitud.fechaRadicacion).toLocaleDateString("es-CO", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-sm font-medium text-gray-600">Hora de Radicación:</label>
                                    <p className="text-gray-900 mt-1 font-medium">
                                        {solicitud.horaRadicacion
                                            ? new Date(`1970-01-01T${solicitud.horaRadicacion}`).toLocaleTimeString(
                                                "es-CO",
                                                {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                }
                                            )
                                            : "No disponible"}
                                    </p>
                                </div>

                                <div
                                    className={`p-3 rounded-lg ${solicitud.fechaResolucion ? "bg-green-50" : "bg-yellow-50"
                                        }`}
                                >
                                    <label className="text-sm font-medium text-gray-600">Fecha de Resolución:</label>
                                    <p className="text-gray-900 mt-1 font-medium">
                                        {solicitud.fechaResolucion
                                            ? new Date(solicitud.fechaResolucion).toLocaleDateString("es-CO", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "Pendiente de resolución"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* DOCUMENTOS RADICADOS */}
                    <section className="px-1 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                            Documentos Radicados
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 overflow-x-auto">
                            {solicitud.adjuntos &&
                                solicitud.adjuntos.filter((a) => !a.respuesta).length > 0 ? (
                                <ul className="text-sm text-blue-600 space-y-2">
                                    {solicitud.adjuntos.filter((archivo) => archivo.respuesta)
                                        .map(
                                            (archivo: Adjunto, i: number) =>
                                                !archivo.respuesta && (
                                                    <li key={i} className="flex items-center gap-2">
                                                        {/* Ícono */}
                                                        <FileText className="w-5 h-5 text-blue-600" />

                                                        {/* Enlace controlado por onClick */}
                                                        <a
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(archivo.id, archivo.nombreArchivo);
                                                            }}
                                                            className="text-blue-600 hover:underline cursor-pointer"
                                                        >
                                                            {archivo.nombreArchivo}
                                                        </a>

                                                        {/* Fecha */}
                                                        <span className="text-[10px] text-gray-500 ml-auto">
                                                            {new Date(archivo.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </li>

                                                )
                                        )}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No hay documentos cargados.</p>
                            )}
                        </div>
                    </section>

                    {/* DOCUMENTOS DE RESPUESTA */}
                    <section className="px-1 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                            Documentos de Respuesta
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 overflow-x-auto">
                            {solicitud.adjuntos &&
                                solicitud.adjuntos.filter((a) => a.respuesta).length > 0 ? (
                                <ul className="text-sm text-blue-600 space-y-2">
                                    {solicitud.adjuntos
                                        .filter((archivo) => archivo.respuesta)
                                        .map((archivo: Adjunto, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        downloadFile(archivo.id, archivo.nombreArchivo);
                                                    }}
                                                    className="text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    {archivo.nombreArchivo}
                                                </a>
                                                <span className="text-[10px] text-gray-500 ml-auto">
                                                    {new Date(archivo.createdAt).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No hay documentos cargados.</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="bg-gray-100 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-3 sticky bottom-0">
                    <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                        ID: {solicitud.id} | Creado el{" "}
                        {new Date(solicitud.fechaRadicacion).toLocaleDateString()}
                    </div>
                    <Button
                        onClick={onClose}
                        className="bg-gray-700 text-white hover:bg-gray-800 px-6 py-2 rounded-full"
                    >
                        Cerrar
                    </Button>
                </div>
            </motion.div>
        </div>
    );

}