import { CheckCircle, FileText, UndoIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import apiServiceWrapper from "../api/ApiService"
import type { PaginatedResponse } from "../models/PaginatedResponse"
import config from "../config"
import type { PqItem } from "../models/PqItem"
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

type FormPeticion = {
    para: string;
    asunto: string;
    respuesta: string;
    lista_documentos: File[];
};

const DashboardContratista: React.FC = () => {
    const api = apiServiceWrapper

    const API_URL = config.apiBaseUrl

    const [solicitudes, setSolicitudes] = useState<PqItem[]>([])

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSolicitud, setSelectedSolicitud] = useState<PqItem | null>(null)

    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    const [formPeticion, setFormPeticion] = useState<FormPeticion>({
        para: "",
        asunto: "",
        respuesta: "",
        lista_documentos: []
    });

    const fetchSolicitudes = async () => {
        try {
            const rawId = sessionStorage.getItem("persona_id")
            const responsableId = rawId ? Number(rawId) : null

            const response = await api.get<PaginatedResponse<PqItem>>("pqs/pqs_asignadas", {
                responsableId,
                page: currentPage - 1,
                size: itemsPerPage,
            })

            setSolicitudes(response.data)
            const totalPages = Math.ceil((response.total_count ?? 0) / itemsPerPage)
            setTotalPages(totalPages)
        } catch (error) {
            console.error("Error al obtener las solicitudes asignadas:", error)
        }
    }

    useEffect(() => {
        fetchSolicitudes()
    }, [currentPage])

    const handleCloseModal = () => {
        setSelectedSolicitud(null)
        setModalOpen(false)
    }


    const handleDarResolucion = async () => {
        try {
            const documentosBase64 = await Promise.all(
                formPeticion.lista_documentos.map(async (file) => {
                    const base64 = await fileToBase64(file);
                    return {
                        Nombre: file.name,
                        Tipo: file.type,
                        Contenido: base64,
                        isRespuesta: true
                    };
                })
            );

            const payload = {
                responsableId: Number(sessionStorage.getItem("usuario_id")),
                pqId: selectedSolicitud?.id,
                respuesta: formPeticion.respuesta,
                lista_documentos: documentosBase64
            };

            console.log("Payload a enviar:", payload);

            const response = await api.post("/pqs/dar_resolucion", payload);

            if (response.status === 201) {
                setFormPeticion({
                    para: "",
                    asunto: "",
                    respuesta: "",
                    lista_documentos: []
                });
            }
        } catch (error) {
            console.error("Error al enviar:", error);
            alert("Error al enviar la PQRSDF");
        } finally {
            fetchSolicitudes()
        }
    }

    const handleVerClick = async (solicitud: PqItem) => {
        setModalOpen(true)
        setSelectedSolicitud(solicitud)

        formPeticion.para = solicitud.solicitante?.correoUsuario || ""
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // O reader.readAsBinaryString(file)
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1]; // Quita el "data:..." al inicio
                resolve(base64);
            };
            reader.onerror = reject;
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        addFiles(files)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        addFiles(files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const removeFile = (index: number) => {
        setFormPeticion((prev) => ({
            ...prev,
            lista_documentos: prev.lista_documentos.filter((_: File, i: number) => i !== index),
        }));
    };

    const addFiles = (files: File[]) => {
        const validFiles = files.filter((file) => {
            const validTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/jpeg",
                "image/jpg",
                "image/png",
            ]
            const maxSize = 10 * 1024 * 1024 // 10MB

            if (!validTypes.includes(file.type)) {
                alert(`El archivo ${file.name} no tiene un formato válido`)
                return false
            }

            if (file.size > maxSize) {
                alert(`El archivo ${file.name} es demasiado grande (máximo 10MB)`)
                return false
            }

            return true
        })

        setFormPeticion((prev: FormPeticion) => ({
            ...prev,
            lista_documentos: [...prev.lista_documentos, ...validFiles],
        }))

    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }


    return (
        <div className="flex min-h-screen w-screen bg-gray-100 z-15">
            <div className="ml-14 w-full">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">Panel de Contratistas</h1>
                    </div>

                    {/* Tarjetas de estadísticas */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Total Asignadas</div>
                                <div className="text-2xl font-bold">

                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Pendientes por Respuesta </div>
                                <div className="text-2xl font-bold text-yellow-500">
                                    {/* Aquí puedes agregar el número de pendientes */}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">En Proceso</div>
                                <div className="text-2xl font-bold text-blue-500"></div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Resueltas</div>
                                <div className="text-2xl font-bold text-green-500"></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Listado */}
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-2">
                            <h2 className="text-lg mb-2 font-semibold">Solicitudes Asignadas</h2>

                            {solicitudes && solicitudes.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {solicitudes.map((solicitud: PqItem) => (
                                        <div
                                            key={solicitud.id}
                                            className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 transition"
                                        >
                                            {/* Columna 1 - ID y Tipo */}
                                            <div className="flex flex-col w-1/4">
                                                <span className="font-semibold text-blue-800 text-sm">
                                                    #Radicado: {solicitud.numeroRadicado ?? solicitud.id}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {solicitud.tipoPQ?.nombre}
                                                </span>
                                            </div>

                                            {/* Columna 2 - Asunto */}
                                            <div className="w-1/3 text-sm truncate">
                                                <strong>Asunto:</strong> {solicitud.detalleAsunto}
                                            </div>

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
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    No hay Solicitudes Asignadas.
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

            {/* Modal Responder */}
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
                                        <p className="text-gray-900 break-all">{selectedSolicitud.solicitante.correoUsuario || "No registrado"}</p>
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
                                            <label className="text-sm font-medium text-gray-600">Responsable:</label>
                                            <p className="text-gray-900 mt-1">{selectedSolicitud.responsable?.personaResponsable.nombre || "No asignado"} {selectedSolicitud.responsable?.personaResponsable.apellido}</p>
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
                            {(selectedSolicitud) && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Adicional</h3>
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


                            {/* Área para escribir la respuesta */}
                            <div className="pt-6">

                                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                                    Respuesta de la Solicitud
                                </h3>

                                {/* Campo PARA */}
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Para:
                                    </label>
                                    <input
                                        type="text"
                                        value={formPeticion.para}
                                        onChange={(e) =>
                                            setFormPeticion((prev) => ({ ...prev, para: e.target.value }))
                                        }
                                        placeholder="correo1@ejemplo.com, correo2@ejemplo.com"
                                        className="w-full border rounded-lg px-3 py-2 mt-1"
                                    />

                                </div>

                                {/* Campo ASUNTO */}
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Asunto:
                                    </label>
                                    <input
                                        type="text"
                                        value={formPeticion.asunto}
                                        onChange={(e) =>
                                            setFormPeticion((prev) => ({ ...prev, asunto: e.target.value }))
                                        }
                                        placeholder="Escribe el asunto..."
                                        className="w-full border rounded-lg px-3 py-2 mt-1"
                                    />
                                </div>

                                {/* Editor de texto */}
                                <ReactQuill
                                    theme="snow"
                                    value={formPeticion.respuesta}
                                    onChange={(value) =>
                                        setFormPeticion((prev) => ({ ...prev, respuesta: value }))
                                    }
                                    className="bg-white rounded-lg mb-3 h-36"
                                    placeholder="Escribe tu respuesta aquí..."
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

                                <div className="space-y-4 mt-12">
                                    {/* Dropzone */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Adjuntar archivos</h3>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => document.getElementById("file-input")?.click()}
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-gray-700">Arrastra y suelta tu archivo aquí</p>
                                                <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar el archivo</p>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (máximo MB)
                                            </p>
                                        </div>

                                        <input
                                            id="file-input"
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                    </div>

                                    {formPeticion.lista_documentos.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
                                            <div className="space-y-2">
                                                {formPeticion.lista_documentos.map((file: File, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                                                <svg
                                                                    className="w-4 h-4 text-blue-500"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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

                            <div className="flex gap-3  px-6">
                                <Button
                                    className="border border-black"
                                    variant="outline"
                                    onClick={() => {
                                        handleCloseModal();
                                    }}
                                >
                                    Cerrar
                                </Button>

                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                    onClick={() => {
                                        handleDarResolucion()
                                        handleCloseModal()
                                    }}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Dar Resolución
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardContratista
