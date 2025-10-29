import React, { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import type { PqItem } from "../../models/PqItem";
import apiServiceWrapper from "../../api/ApiService";
import { useAlert } from "../../context/AlertContext";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import type { Responsable } from "../../models/Responsable";
import { useAuth } from "../../context/AuthProvider";
import { useDownloadFile } from "../../utils/useDownloadFile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const ReasignarPeticiones: React.FC = () => {

    const user = useAuth();
    const api = apiServiceWrapper;
    const { showAlert } = useAlert();
    const { downloadFile } = useDownloadFile();

    const [numeroRadicado, setNumeroRadicado] = useState("");
    const [solicitud, setSolicitud] = useState<PqItem | null>(null);
    const [nuevoResponsable, setNuevoResponsable] = useState("");
    const [itemsPerPage] = useState(10);
    const [comentario, setComentario] = useState("");

    const [isLoading, setIsloading] = useState<boolean>(false)
    const [isFinding, setIsFinding] = useState<boolean>(false)

    const [usuarios, setUsuarios] = useState<Responsable[]>([]);

    useEffect(() => {
        fetchResponsables();
    }, []);

    const fetchResponsables = async () => {
        try {
            const response = await api.get<PaginatedResponse<Responsable>>("/responsables_pqs", { page: 0, size: 100 });
            setUsuarios(response.data || []);
        } catch (error) {
            console.error("Error al obtener los responsables:", error);
        }
    };

    const fetchSolicitud = async () => {
        try {
            setIsFinding(true)
            const params: Record<string, any> = { page: 0, size: itemsPerPage };
            if (numeroRadicado) {
                const radicadoLimpio = numeroRadicado.startsWith("#")
                    ? numeroRadicado.slice(1)
                    : numeroRadicado;
                params.numeroRadicado = radicadoLimpio;
            }

            const response = await api.get<PaginatedResponse<PqItem>>("/pqs/all_pqs", params);
            if (response._meta?.status === 204) {
                showAlert("No se encontraron solicitudes con ese número de radicado.", "warning");
                setSolicitud(null);
                return;
            }

            setSolicitud(response.data[0] || null);
        } catch (error) {
            console.error("Error al obtener las solicitudes:", error);
        } finally {
            setIsFinding(false)
        }
    };

    const handleGuardarCambio = async () => {
        setIsloading(true)

        if (solicitud?.responsable.personaResponsable.id === Number(nuevoResponsable)) {
            showAlert("El nuevo responsable debe ser diferente al actual.", "warning");
            return;
        }

        try {
            const payload = {
                pqId: solicitud?.id,
                nuevoResponsableId: Number(nuevoResponsable),
                cambiadoPorId: user.user?.id,
                comentario: comentario.trim(),
            };

            const response = await api.post(`/pqs/reasignar_responsable`, payload);

            if (response.status !== 200) {
                showAlert("Error al reasignar el responsable.", "error");
                return;
            }

            if (response.status === 200) {
                await fetchSolicitud();
                showAlert("Responsable reasignado correctamente.", "success");

                setNuevoResponsable("");
                setComentario("");
            }
        } catch (error) {
            console.error(error);
            showAlert("Error al reasignar el responsable.", "error");
        } finally {
            setIsloading(false)
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />

                    {/* 🔍 Búsqueda */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">Reasignar Petición</h1>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar por número de radicado..."
                                value={numeroRadicado}
                                onChange={(e) => setNumeroRadicado(e.target.value)}
                                className="w-72"
                            />
                            <Button onClick={fetchSolicitud} variant="outline" disabled={isFinding || !numeroRadicado.trim()}>
                                <Search className="w-4 h-4 mr-2" />
                                {!isFinding ? "Buscar" : "Buscando..."}
                            </Button>
                        </div>
                    </div>

                    {!solicitud ? (
                        <p className="text-gray-500 text-center mt-10">
                            Ingresa un número de radicado y haz clic en “Buscar”.
                        </p>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white shadow-xl rounded-2xl p-6 space-y-8"
                        >
                            {/* 🟦 ENCABEZADO */}
                            <div className="bg-blue-900 text-white p-6 rounded-xl flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        #{solicitud.numeroRadicado} - {solicitud.tipoPQ?.nombre}
                                    </h2>
                                    <p className="text-sm opacity-90">{solicitud.detalleAsunto}</p>
                                </div>
                                <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                                    {solicitud.nombreUltimoEstado}
                                </span>
                            </div>

                            {/* 👤 Información del Solicitante */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Información del Solicitante
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <p><strong>Nombre Completo:</strong> {solicitud.solicitante?.nombre} {solicitud.solicitante?.apellido}</p>
                                    <p><strong>{solicitud.solicitante?.tipoDoc?.nombre}:</strong> {solicitud.solicitante?.dni}</p>
                                    <p><strong>Correo:</strong> {solicitud.solicitante?.correoUsuario}</p>
                                    <p><strong>Teléfono:</strong> {solicitud.solicitante?.telefono}</p>
                                    <p><strong>Dirección:</strong> {solicitud.solicitante?.direccion}</p>
                                    <p><strong>Género:</strong> {solicitud.solicitante?.genero?.nombre}</p>
                                    <p><strong>Tipo de Persona:</strong> {solicitud.solicitante?.tipoPersona?.nombre}</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Información Principal
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-md font-semibold text-blue-900 mb-2">Asunto</h4>
                                        <p className="text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            {solicitud.detalleAsunto || "Sin asunto especificado"}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold text-blue-900 mb-2">Descripción</h4>
                                        <div
                                            className="prose-sm max-w-none bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    solicitud.detalleDescripcion ||
                                                    "<p><em>Sin descripción disponible</em></p>",
                                            }}
                                        />
                                    </div>
                                </div>

                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Fechas y Tiempos
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600 font-medium">Fecha de Radicación:</p>
                                        <p className="text-gray-900 font-semibold mt-1">
                                            {new Date(solicitud.fechaRadicacion).toLocaleDateString("es-CO")}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600 font-medium">Hora de Radicación:</p>
                                        <p className="text-gray-900 font-semibold mt-1">
                                            {solicitud.horaRadicacion || "No disponible"}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600 font-medium">Resolución Estimada:</p>
                                        <p className="text-gray-900 font-semibold mt-1">
                                            {solicitud.fechaResolucionEstimada
                                                ? new Date(solicitud.fechaResolucionEstimada).toLocaleDateString("es-CO")
                                                : "Sin fecha estimada"}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-3 rounded-lg ${solicitud.fechaResolucion ? "bg-green-50" : "bg-yellow-50"
                                            }`}
                                    >
                                        <p className="text-sm text-gray-600 font-medium">Fecha de Resolución:</p>
                                        <p className="text-gray-900 font-semibold mt-1">
                                            {solicitud.fechaResolucion
                                                ? new Date(solicitud.fechaResolucion).toLocaleDateString("es-CO")
                                                : "Pendiente de resolución"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="bg-white rounded-lg p-6 border border-gray-200 mt-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Historial de Estados</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Pasa el cursor sobre cada nodo para ver las observaciones de cada estado.
                                </p>
                                {solicitud.historialEstados && solicitud.historialEstados.length > 0 ? (
                                    <div className="relative flex items-start justify-between w-full">
                                        {/* Línea atravesando las bolitas */}
                                        <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                                        {solicitud.historialEstados.reverse().map((estado: any, index: number) => (
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

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Documentos
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Documentos Radicados */}
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <h4 className="text-md font-semibold text-gray-800 mb-4">Documentos Radicados</h4>
                                        {solicitud.adjuntos?.filter((a) => !a.respuesta).length ? (
                                            <ul className="text-sm text-blue-600 space-y-2">
                                                {solicitud.adjuntos
                                                    .filter((a) => !a.respuesta)
                                                    .map((archivo: any, i: number) => (
                                                        <li key={i} className="flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    downloadFile(archivo.id, archivo.nombreArchivo);
                                                                }}
                                                                className="hover:underline"
                                                            >
                                                                {archivo.nombreArchivo}
                                                            </a>
                                                            <span className="text-[10px] text-gray-500 ml-auto">
                                                                {new Date(archivo.createdAt).toLocaleDateString("es-CO")}
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No hay documentos cargados.</p>
                                        )}
                                    </div>

                                    {/* Documentos de Respuesta */}
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <h4 className="text-md font-semibold text-gray-800 mb-4">Documentos de Respuesta</h4>
                                        {solicitud.adjuntos?.filter((a) => a.respuesta).length ? (
                                            <ul className="text-sm text-blue-600 space-y-2">
                                                {solicitud.adjuntos
                                                    .filter((a) => a.respuesta)
                                                    .map((archivo: any, i: number) => (
                                                        <li key={i} className="flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    downloadFile(archivo.id, archivo.nombreArchivo);
                                                                }}
                                                                className="hover:underline"
                                                            >
                                                                {archivo.nombreArchivo}
                                                            </a>
                                                            <span className="text-[10px] text-gray-500 ml-auto">
                                                                {new Date(archivo.createdAt).toLocaleDateString("es-CO")}
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No hay documentos cargados.</p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">Reasignar Responsable</h3>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <p className="text-gray-700 font-medium">
                                        <strong>Responsable Actual:</strong>{" "}
                                        {solicitud.responsable?.personaResponsable?.nombre} {solicitud.responsable?.personaResponsable?.apellido || "N/A"}
                                        <strong> ({solicitud.responsable?.area.nombre || "N/A"})</strong>
                                    </p>

                                    <Select value={nuevoResponsable} onValueChange={setNuevoResponsable}>
                                        <SelectTrigger className="w-full text-sm">
                                            <SelectValue placeholder="Seleccionar nuevo responsable" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {usuarios.map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.personaResponsable.nombre} {r.personaResponsable.apellido} ({r.area.nombre})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Campo de comentario */}
                                    <textarea
                                        value={comentario}
                                        onChange={(e) => setComentario(e.target.value)}
                                        placeholder="Agrega un comentario sobre el cambio de responsable..."
                                        className="border rounded-lg p-2 w-full text-sm text-gray-700"
                                        rows={3}
                                    />

                                    <Button
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
                                        onClick={handleGuardarCambio}
                                        disabled={!nuevoResponsable || comentario.trim() === "" || isLoading}
                                    >
                                        {!isLoading ? "Guardar Cambio" : "Guardando..."}
                                    </Button>

                                </div>
                            </section>

                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReasignarPeticiones;
