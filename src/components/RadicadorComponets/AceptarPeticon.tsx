import { FileText, UserPlus, CheckCircle, XCircle } from "lucide-react";
import ReactQuill from "react-quill-new";
import type { PqItem } from "../../models/PqItem";
import type { Usuario } from "../../models/Usuario";
import { Button } from "../ui/button";

import "react-quill-new/dist/quill.snow.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import type { Adjunto } from "../../models/Adjunto";
import config from "../../config";
import apiServiceWrapper from "../../api/ApiService";

interface Radicacion {
    id: number;
    responsableId: string;
    comentario: string;
    motivoRechazo?: string;
    isAprobada: boolean;
    radicadorId: number;
}

interface AceptarPeticonProps {
    isOpen: boolean;
    selectedSolicitud: PqItem | null;
    responsables: Usuario[];
    onClose: () => void;
}

export default function AceptarPeticon({ isOpen, selectedSolicitud, responsables, onClose }: AceptarPeticonProps) {

    const { user } = useAuth()
    const API_URL = config.apiBaseUrl;
    const api = apiServiceWrapper


    const [tab, setTab] = useState("aceptar");
    const [formdata, setFormdata] = useState<Radicacion>({
        id: 0,
        responsableId: "",
        comentario: "",
        isAprobada: false,
        radicadorId: Number(user?.id)
    });

    const handleChange = (field: keyof Radicacion, value: string | boolean) => {
        setFormdata(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRadicarPeticion = async (data: Radicacion) => {
        try {
            const payload = {
                radicadorId: Number(data.radicadorId),
                solicitudId: Number(data.id),
                responsableId: data.responsableId ? Number(data.responsableId) : null,
                motivoRechazo: data.motivoRechazo,
                comentario: data.comentario,
                isAprobada: Boolean(data.isAprobada),
            };


            await api.post(`pqs/aprobacion_pq`, JSON.stringify(payload));

            clearFormData();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const clearFormData = () => {
        setFormdata({
            id: 0,
            responsableId: "",
            comentario: "",
            isAprobada: false,
            radicadorId: Number(user?.id)
        });
    }

    const cleanHtml = (html: string) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };


    if (!isOpen || !selectedSolicitud) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                {/* Header del Modal */}
                <div className="bg-blue-900 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-2">
                                #{selectedSolicitud.numeroRadicado ?? selectedSolicitud.id}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{selectedSolicitud.tipoPQ?.nombre}</span>
                            </div>
                        </div>

                        {/* Parte resaltada */}
                        <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                            {selectedSolicitud.nombreUltimoEstado}
                        </span>
                    </div>
                </div>

                {/* Contenido del Modal */}
                <div className="p-6">
                    {/* Información del Solicitante */}
                    <div className="space-y-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                            Información del Solicitante
                        </h3>
                        <div className="space-y-2 grid grid-cols-2 gap-1">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Nombre Completo:</label>
                                <p className="text-gray-900 font-medium">
                                    {selectedSolicitud.solicitante?.nombre} {selectedSolicitud.solicitante?.apellido}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">{selectedSolicitud.solicitante?.tipoDoc.nombre}:</label>
                                <p className="text-gray-900">{selectedSolicitud.solicitante?.dni || "No registrada"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Correo:</label>
                                <p className="text-gray-900 break-all">{selectedSolicitud.solicitante?.correoUsuario || "No registrado"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Teléfono:</label>
                                <p className="text-gray-900">{selectedSolicitud.solicitante?.telefono || "No registrado"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Dirección:</label>
                                <p className="text-gray-900">{selectedSolicitud.solicitante?.direccion || "No registrada"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Genero:</label>
                                <p className="text-gray-900">{selectedSolicitud.solicitante?.genero.nombre || "No registrada"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Tipo de Persona:</label>
                                <p className="text-gray-900">{selectedSolicitud.solicitante?.tipoPersona.nombre || "No registrada"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información Principal */}
                        <div className="space-y-4">

                            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Información Principal</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Asunto:</label>
                                    <p className="text-gray-900 mt-1">{selectedSolicitud.detalleAsunto}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Descripción:</label>
                                    <div
                                        className="prose prose-sm max-w-none bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 text-gray-800"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedSolicitud.detalleDescripcion || "<p><em>Sin descripción disponible</em></p>",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Respuesta:</label>
                                    <div
                                        className="prose prose-sm max-w-none bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2 text-gray-800"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedSolicitud.respuesta || "<p><em>Sin respuesta</em></p>",
                                        }}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Información de Fechas */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Fechas y Tiempos</h3>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Fecha de Radicación:</label>
                                        <p className="text-gray-900 mt-1 font-medium">
                                            {new Date(selectedSolicitud.fechaRadicacion).toLocaleDateString("es-CO", {
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
                                            {selectedSolicitud.horaRadicacion
                                                ? new Date(`1970-01-01T${selectedSolicitud.horaRadicacion}`).toLocaleTimeString("es-CO", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                : "No disponible"}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Resolución Estimada:</label>
                                        <p className="text-gray-900 mt-1 font-medium">
                                            {selectedSolicitud.fechaResolucionEstimada
                                                ? new Date(selectedSolicitud.fechaResolucionEstimada).toLocaleDateString("es-CO", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })
                                                : "Sin fecha estimada"}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${selectedSolicitud.fechaResolucion ? "bg-green-50" : "bg-yellow-50"}`}>
                                        <label className="text-sm font-medium text-gray-600">Fecha de Resolución:</label>
                                        <p className="text-gray-900 mt-1 font-medium">
                                            {selectedSolicitud.fechaResolucion
                                                ? new Date(selectedSolicitud.fechaResolucion).toLocaleDateString("es-CO", {
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

                    {/* Información Adicional */}
                    {(selectedSolicitud.historialEstados || selectedSolicitud.adjuntos) && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Adicional</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedSolicitud.historialEstados && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Observaciones:</label>
                                        <p className="text-gray-900 mt-2 text-sm leading-relaxed">{selectedSolicitud.historialEstados.map((estado) => estado.observacion).join(", ") || "Sin observaciones"}</p>
                                    </div>
                                )}
                                {selectedSolicitud.adjuntos && selectedSolicitud.adjuntos.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Documentos Adjuntos:</label>
                                        <div className="mt-2 space-y-1">
                                            {selectedSolicitud.adjuntos.map((doc: Adjunto, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                                                    📄 <span>{doc.nombreArchivo || `Documento ${index + 1}`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-lg p-6 border border-gray-200 mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Historial de Estados</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Pasa el cursor sobre cada nodo para ver las observaciones de cada estado.
                        </p>
                        {selectedSolicitud.historialEstados && selectedSolicitud.historialEstados.length > 0 ? (
                            <div className="relative flex items-start justify-between w-full">
                                {/* Línea atravesando las bolitas */}
                                <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                                {selectedSolicitud.historialEstados.map((estado: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center relative w-1/4 min-w-0"
                                    >
                                        {/* Nodo y Tooltip */}
                                        <div className="group relative">
                                            <div className="w-5 h-5 rounded-full ring-2 transition-all duration-300 bg-blue-600 ring-blue-600"></div>
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal w-40 text-center pointer-events-none">
                                                {estado.observacion ? estado.observacion : "Sin observación"}
                                            </div>
                                        </div>
                                        {/* Texto del estado */}
                                        <div className="mt-4 text-center">
                                            <p className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                                                {estado.estado.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(estado.fechaCambio).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Sin historial disponible.</p>
                        )}
                    </div>


                    <div className="mt-2 px-1 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                            Documentos Radicados
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            {selectedSolicitud.adjuntos && selectedSolicitud.adjuntos.length > 0 ? (
                                <ul className="text-sm text-blue-600 space-y-2">
                                    {selectedSolicitud.adjuntos.map((archivo: any, i: number) => (
                                        (!archivo.respuesta && (
                                            <li key={i} className="flex items-center gap-2">
                                                {/* Ícono del archivo */}
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                {/* Enlace para ver/descargar el archivo */}
                                                <a
                                                    href={`${API_URL}/adjuntosPq/${archivo.id}/download`}
                                                    download
                                                    className="hover:underline break-all"
                                                >
                                                    {archivo.nombreArchivo}
                                                </a>
                                                {/* Fecha opcional */}
                                                <span className="text-[10px] text-gray-500 ml-auto">
                                                    {new Date(archivo.createdAt).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No hay documentos cargados.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 px-4 pb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-3">
                            <UserPlus className="w-5 h-5 text-indigo-600" />
                            Opciones de Radicación
                        </h3>

                        {/* Tabs */}
                        <div className="flex border-b mb-5">
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "aceptar"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                onClick={() => setTab("aceptar")}
                            >
                                Aceptar
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "rechazar"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                onClick={() => setTab("rechazar")}
                            >
                                Rechazar
                            </button>
                        </div>

                        {/* Card */}
                        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-5">
                            {tab === "aceptar" && (
                                <>
                                    {/* Selector */}
                                    <div>
                                        <label htmlFor="responsable" className="block text-sm font-medium mb-2">
                                            Asignar Responsable
                                        </label>
                                        <select
                                            id="responsable"
                                            value={formdata.responsableId}
                                            onChange={(e) => handleChange("responsableId", e.target.value)}
                                            className="w-full border border-gray-300 bg-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Seleccione un responsable</option>
                                            {responsables.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.rol.nombre} #{r.persona.id} {r.persona.nombre} {r.persona.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Comentario */}
                                    <div>
                                        <label htmlFor="comentarioAceptar" className="block text-sm font-medium text-black mb-2">
                                            Comentario
                                        </label>
                                        <textarea
                                            id="comentarioAceptar"
                                            value={formdata.comentario}
                                            onChange={(e) => handleChange("comentario", e.target.value)}
                                            placeholder="Escriba un comentario (opcional)..."
                                            rows={3}
                                            className="w-full border bg-white border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Botón */}
                                    <button
                                        onClick={() =>
                                            handleRadicarPeticion({
                                                ...formdata,
                                                id: selectedSolicitud.id,
                                                isAprobada: true
                                            })
                                        }
                                        disabled={!formdata.responsableId}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Aceptar y Asignar
                                    </button>
                                </>
                            )}

                            {tab === "rechazar" && (
                                <>
                                    {/* Comentario */}
                                    <div>
                                        <label htmlFor="comentarioRechazar" className="block text-sm font-medium text-gray-700 mb-2">
                                            Comentario
                                        </label>
                                        <textarea
                                            id="comentarioRechazar"
                                            value={formdata.comentario}
                                            onChange={(e) => handleChange("comentario", e.target.value)}
                                            placeholder="Indique la razón del rechazo..."
                                            rows={3}
                                            className="w-full border bg-white border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>

                                    <div className="space-y-2 pb-10">
                                        <label htmlFor="descripcion" className="text-sm font-medium">
                                            Motivo del Rechazo <span className="text-red-500">*</span>
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={formdata.motivoRechazo}
                                            onChange={(value) =>
                                                setFormdata((prev) => ({ ...prev, motivoRechazo: value }))
                                            }
                                            className="bg-white rounded-lg mb-3 h-36"
                                            placeholder="Escribe la descripción aquí..."
                                            modules={{
                                                toolbar: [
                                                    [{ header: [1, 2, false] }],
                                                    ["bold", "italic", "underline", "strike"],
                                                    [{ list: "ordered" }, { list: "bullet" }],
                                                    ["link"],
                                                    ["clean"],
                                                ],
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleRadicarPeticion({
                                                ...formdata,
                                                id: selectedSolicitud.id,
                                                responsableId: "",
                                                isAprobada: false
                                            })
                                        }
                                        disabled={!cleanHtml(formdata.motivoRechazo || "").trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Rechazar Petición
                                    </button>

                                </>
                            )}
                        </div>
                    </div>


                </div>

                {/* Footer del Modal */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between items-center sticky bottom-0">
                    <div className="text-sm">
                        ID: {selectedSolicitud.id} | Creado:{" "}
                        {new Date(selectedSolicitud.fechaRadicacion).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3 border broder-black">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}