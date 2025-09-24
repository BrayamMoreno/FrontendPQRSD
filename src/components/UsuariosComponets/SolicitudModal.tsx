import { FileText } from "lucide-react";
import type { PqItem } from "../../models/PqItem";
import { Button } from "../ui/button";
import type { Adjunto } from "../../models/Adjunto";
import config from "../../config";


interface SolicitudModalProps {
    isOpen: boolean;
    solicitud: PqItem | null;
    onClose: () => void;
}

export default function SolicitudModal({ isOpen, solicitud, onClose }: SolicitudModalProps) {
    if (!isOpen || !solicitud) return null;

    const API_URL = config.apiBaseUrl

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-900 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-2">
                                #{solicitud.numeroRadicado ?? solicitud.id}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{solicitud.tipoPQ?.nombre}</span>
                            </div>
                        </div>
                        <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                            {solicitud.nombreUltimoEstado}
                        </span>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información principal */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Información Principal
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">
                                            Asunto:
                                        </label>
                                        <p className="text-gray-900 mt-1">{solicitud.detalleAsunto}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">
                                            Descripción:
                                        </label>
                                        <div
                                            className="prose prose-sm max-w-none bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 text-gray-800"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    solicitud.detalleDescripcion ||
                                                    "<p><em>Sin descripción disponible</em></p>",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">
                                            Respuesta:
                                        </label>
                                        <div
                                            className="prose prose-sm max-w-none bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2 text-gray-800"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    solicitud.respuesta ||
                                                    "<p><em>Sin respuesta</em></p>",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fechas */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Fechas y Tiempos
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">
                                            Fecha de Radicación:
                                        </label>
                                        <p className="text-gray-900 mt-1 font-medium">
                                            {new Date(solicitud.fechaRadicacion).toLocaleDateString(
                                                "es-CO",
                                                {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">
                                            Hora de Radicación:
                                        </label>
                                        <p className="text-gray-900 mt-1 font-medium">
                                            {solicitud.horaRadicacion
                                                ? new Date(
                                                    `1970-01-01T${solicitud.horaRadicacion}`
                                                ).toLocaleTimeString("es-CO", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                : "No disponible"}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-3 rounded-lg ${solicitud.fechaResolucion ? "bg-green-50" : "bg-yellow-50"
                                            }`}
                                    >
                                        <label className="text-sm font-medium text-gray-600">
                                            Fecha de Resolución:
                                        </label>
                                        <p className="text-gray-900 mt-1 font-medium">
                                            {solicitud.fechaResolucion
                                                ? new Date(
                                                    solicitud.fechaResolucion
                                                ).toLocaleDateString("es-CO", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })
                                                : "Pendiente de resolución"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Adjuntos */}
                    <div className="mt-2 px-1 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                            Documentos Radicados
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            {solicitud.adjuntos && solicitud.adjuntos.length > 0 ? (
                                <ul className="text-sm text-blue-600 space-y-2">
                                    {solicitud.adjuntos.map(
                                        (archivo: Adjunto, i: number) =>
                                            !archivo.respuesta && (
                                                <li key={i} className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                    <a
                                                        href={`${API_URL}/adjuntosPq/${archivo.id}/download`}
                                                        download
                                                        className="hover:underline break-all"
                                                    >
                                                        {archivo.nombreArchivo}
                                                    </a>
                                                    <span className="text-[10px] text-gray-500 ml-auto">
                                                        {new Date(archivo.createdAt).toLocaleDateString()}
                                                    </span>
                                                </li>
                                            )
                                    )}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No hay documentos cargados.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 px-1 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                            Documentos de Respuesta
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            {solicitud.adjuntos &&
                                solicitud.adjuntos.filter((a) => a.respuesta).length > 0 ? (
                                <ul className="text-sm text-blue-600 space-y-2">
                                    {solicitud.adjuntos
                                        .filter((archivo) => archivo.respuesta)
                                        .map((archivo: Adjunto, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <a
                                                    href={`${API_URL}/adjuntosPq/${archivo.id}/download`}
                                                    download
                                                    className="hover:underline break-all"
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
                                <p className="text-sm text-gray-500">No hay documentos cargados</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between items-center sticky bottom-0">
                    <div className="text-sm text-gray-500">
                        ID: {solicitud.id} | Creado:{" "}
                        {new Date(solicitud.fechaRadicacion).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="bg-gray-600 text-white hover:bg-gray-700 border-gray-600"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}