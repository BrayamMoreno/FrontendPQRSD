import { Calendar, CheckCircle, FileText, UndoIcon, UserPlus, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { LoadingSpinner } from "../components/LoadingSpinner"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { useNavigate } from "react-router-dom"
import apiServiceWrapper from "../api/ApiService"

import config from "../config";

const DashboradRadicador: React.FC = () => {

    const API_URL = config.apiBaseUrl;

    const navigate = useNavigate()

    const api = apiServiceWrapper

    const [solicitudes, setSolicitudes] = useState<any[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null)
    const [historialEstados, setHistorialEstados] = useState<any[]>([])
    const [documentos, setDocumentos] = useState<any[]>([])
    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true)
    const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(true)


    const [responsableSeleccionado, setResponsableSeleccionado] = useState("");
    const [responsables, setResponsables] = useState<any[]>([]);
    const [comentario, setComentario] = useState("");
    const [tab, setTab] = useState("aceptar");
    const [fechaAprobacion, setFechaAprobacion] = useState("");

    const fecthSolicitudes = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/pqs/sin_responsable", {
                page: currentPage - 1,
                size: itemsPerPage
            })
            setSolicitudes(response.data.data)
            setTotalCount(response.data.total_count ?? 0)
            setHasMore(response.data.has_more ?? false)
            const totalPages = Math.ceil((response.data.total_count ?? 0) / itemsPerPage)
            setTotalPages(totalPages)
        } catch (error) {
            console.error("Error al obtener las solicitudes:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fecthSolicitudes()
    }, [currentPage])

    const handleSetHistorialEstados = async (id: number | string) => {
        setIsLoadingDetails(true);
        try {
            const response = await api.get(`/historial_estados/GetByPqId?pqId=${id}`);
            const historial = response.data;
            const mappedData = historial.map((item: any) => ({
                id: item.id,
                nombre: item.estado?.nombre || "Sin nombre",
                fecha: item.fechaCambio,
                observacion: item.observacion || "Sin observación"
            }));
            setHistorialEstados(mappedData);
        } catch (error) {
            console.error("Error al obtener el historial de estados:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSetDocumentos = async (id: number | string) => {
        setIsLoadingDocuments(true);
        try {
            const response = await api.get(`/adjuntosPq/GetByPqId?pqId=${id}`);
            setDocumentos(response.data);
        } catch (error) {
            console.error("Error al obtener los documentos:", error);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    const handleVerClick = async (solicitud: any) => {
        setModalOpen(true)
        setSelectedSolicitud(solicitud)
        await Promise.all([
            handleSetHistorialEstados(solicitud.id),
            handleSetDocumentos(solicitud.id),
            fetchData('usuarios/contratistas', setResponsables)
        ])
    }

    const handleCloseModal = () => {

        fecthSolicitudes();

        setSelectedSolicitud(null)
        setResponsableSeleccionado("");
        setComentario("");
        setFechaAprobacion("");
        setTab("aceptar");

        setResponsableSeleccionado("")
        setHistorialEstados([])
        setDocumentos([])
        setModalOpen(false)
    }

    const inputRef = useRef<HTMLInputElement>(null); // 1. Creamos la referencia

    const handleIconClick = () => {
        if (inputRef.current) {
            (inputRef.current as HTMLInputElement).showPicker(); // 3. Usamos showPicker() para abrir el calendario
        }
    }

    const handleRadicarPeticion = async (id: number, responsableId: string, Comentario: String, Fecha: String, isAprobada: boolean, radicadorId: string) => {
        try {
            const data = {
                radicadorId: Number(radicadorId),
                solicitudId: Number(id),
                fechaResolucionEstimada: Fecha,   // asumiendo que es string tipo "2025-08-30"
                responsableId: Number(responsableId),
                comentario: Comentario,
                isAprobada: Boolean(isAprobada),  // asegura true/false
            };

            await api.post(`pqs/aprobacion_pq`, JSON.stringify(data));

            handleCloseModal();

        } catch (error) {
            console.error(error);
        }
    };

    const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        try {
            const response = await api.get(`/${endpoint}`)

            const data = await response.data
            setter(data.data || [])
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error)
        }
    }

    return (
        <div className="flex min-h-screen w-screen bg-gray-100 z-15">
            <div className="ml-14 w-full">
                <div className="max-w-7xl mx-auto p-6">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">Solicitudes PQRSDF Pendites de Asignacion</h1>
                    </div>

                    {/* Listado de PQRSDF */}
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-2">
                            <h2 className="text-lg mb-2 font-semibold">Listado de PQRSDF Pendientes</h2>

                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {solicitudes.map((solicitud: any) => (
                                        <div
                                            key={solicitud.id}
                                            className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 transition"
                                        >
                                            {/* Columna 1 - ID y Tipo */}
                                            <div className="flex flex-col w-1/4">
                                                <span className="font-semibold text-blue-800 text-sm">
                                                    #Radicado: {solicitud.numeroRadicado ?? solicitud.id}
                                                </span>
                                                <span className="text-xs text-gray-500">{solicitud.tipoPQ?.nombre}</span>
                                            </div>

                                            {/* Columna 2 - Asunto */}
                                            <div className="w-1/3 text-sm truncate"><strong>Asunto:</strong> {solicitud.detalleAsunto}</div>

                                            {/* Columna 3 - Fecha */}
                                            <div className="w-1/6 text-xs text-gray-600">
                                                {new Date(solicitud.fechaRadicacion).toLocaleDateString()}
                                            </div>

                                            {/* Columna 4 - Estado */}
                                            <div className="w-1/6">
                                                <Badge variant="secondary">{solicitud.nombreUltimoEstado}</Badge>
                                            </div>

                                            {/* Columna 5 - Botón */}
                                            <div className="w-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => handleVerClick(solicitud)}
                                                >
                                                    <UndoIcon className="w-3 h-3 mr-1" />
                                                    Ver Detalles
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Paginación */}
                            <div className="flex justify-center mt-4 gap-2 items-center">
                                {/* Ir al inicio */}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    ⏮ Primero
                                </Button>

                                {/* Página anterior */}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    ◀ Anterior
                                </Button>

                                <span className="text-sm px-3">
                                    Página {currentPage} de {totalPages}
                                </span>

                                {/* Página siguiente */}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Siguiente ▶
                                </Button>

                                {/* Ir al final */}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                >
                                    Último ⏭
                                </Button>
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>


            {modalOpen && selectedSolicitud && (
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
                                            <p className="text-gray-900 mt-1 text-sm leading-relaxed">
                                                {selectedSolicitud.detalleDescripcion || "Sin descripción disponible"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Respuesta:</label>
                                            <p className="text-gray-900 mt-1">{selectedSolicitud.respuesta || "Sin Respuesta"}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Responsable:</label>
                                            <p className="text-gray-900 mt-1">{selectedSolicitud.responsable?.nombre || "No asignado"}</p>
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
                            {(selectedSolicitud.observaciones || selectedSolicitud.documentos) && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Adicional</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedSolicitud.observaciones && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="text-sm font-medium text-gray-600">Observaciones:</label>
                                                <p className="text-gray-900 mt-2 text-sm leading-relaxed">{selectedSolicitud.observaciones}</p>
                                            </div>
                                        )}
                                        {selectedSolicitud.documentos && selectedSolicitud.documentos.length > 0 && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="text-sm font-medium text-gray-600">Documentos Adjuntos:</label>
                                                <div className="mt-2 space-y-1">
                                                    {selectedSolicitud.documentos.map((doc: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                                                            📄 <span>{doc.nombre || `Documento ${index + 1}`}</span>
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
                                                <label
                                                    htmlFor="responsable"
                                                    className="block text-sm font-medium bg-white mb-2"
                                                >
                                                    Asignar Responsable
                                                </label>
                                                <select
                                                    id="responsable"
                                                    value={responsableSeleccionado}
                                                    onChange={(e) => setResponsableSeleccionado(e.target.value)}
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
                                                <label
                                                    htmlFor="comentarioAceptar"
                                                    className="block text-sm font-medium text-black mb-2"
                                                >
                                                    Comentario
                                                </label>
                                                <textarea
                                                    id="comentarioAceptar"
                                                    value={comentario}
                                                    onChange={(e) => setComentario(e.target.value)}
                                                    placeholder="Escriba un comentario (opcional)..."
                                                    rows={3}
                                                    className="w-full border bg-white border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>

                                            {/* Fecha de Aprobación */}
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    id="fechaAprobacion"
                                                    value={fechaAprobacion}
                                                    onChange={(e) => setFechaAprobacion(e.target.value)}
                                                    ref={inputRef} // 2. Asignamos la referencia al input
                                                    className="w-full border bg-white border-gray-300 rounded-xl px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                                />
                                                {/* Ícono con evento onClick */}
                                                <Calendar
                                                    className="w-5 h-5 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer" // Añadimos cursor-pointer para mejor UX
                                                    onClick={handleIconClick} // 4. Agregamos el evento de clic
                                                />
                                            </div>

                                            {/* Botón */}
                                            <button
                                                onClick={() =>
                                                    handleRadicarPeticion(selectedSolicitud.id, responsableSeleccionado, comentario, fechaAprobacion, true, sessionStorage.getItem("persona_id") || "")
                                                }
                                                disabled={!responsableSeleccionado || !fechaAprobacion}
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
                                                <label
                                                    htmlFor="comentarioRechazar"
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Comentario (obligatorio)
                                                </label>
                                                <textarea
                                                    id="comentarioRechazar"
                                                    value={comentario}
                                                    onChange={(e) => setComentario(e.target.value)}
                                                    placeholder="Indique la razón del rechazo..."
                                                    rows={3}
                                                    className="w-full border bg-white border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>

                                            {/* Botón */}
                                            <button
                                                onClick={() => handleRadicarPeticion(selectedSolicitud.id, "", comentario, "", false, sessionStorage.getItem("usuario_id") || "")}
                                                disabled={!comentario.trim()}
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
                                    onClick={() => {
                                        handleCloseModal();
                                    }}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboradRadicador