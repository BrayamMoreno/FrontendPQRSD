import { FileText, UndoIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { LoadingSpinner } from "../components/LoadingSpinner"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { useNavigate } from "react-router-dom"
import apiServiceWrapper from "../api/ApiService"
import type { TipoPQ } from "../models/TipoPQ"
import type { PQ } from "../models/PQ"
import config from "../config";

const Dashboard: React.FC = () => {

	const API_URL = config.apiBaseUrl;

	const navigate = useNavigate()
	const api = apiServiceWrapper

	const [solicitudes, setSolicitudes] = useState<any[]>([])
	const [modalOpen, setModalOpen] = useState(false)
	const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null)
	const itemsPerPage = 10
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(0)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [modalRadicarSolicitud, setModalRadicarSolicitud] = useState(false)

	const [tipoPQ, setTipoPQ] = useState<TipoPQ[]>([])

	const [formPeticion, setFormPeticion] = useState<PQ>({
		tipo_pq_id: "",
		solicitante_id: "",
		detalleAsunto: "",
		detalleDescripcion: "",
		lista_documentos: []
	})

	const [errors, setErrors] = useState<Partial<PQ>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const fecthSolicitudes = async () => {
		setIsLoading(true)
		try {
			const rawId = sessionStorage.getItem("persona_id")
			const solicitanteId = rawId ? Number(rawId) : null

			const response = await api.get("/pqs/mis_pqs", {
				solicitanteId,
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
		fetchAllData()
	}, [currentPage])

	const handleVerClick = async (solicitud: any) => {
		setModalOpen(true)
		setSelectedSolicitud(solicitud)
	}

	const handleCloseModal = () => {
		setSelectedSolicitud(null)
		setModalOpen(false)
	}

	const fetchAllData = async () => {
		try {
			await Promise.all([
				fetchData("tipos_pqs", setTipoPQ),
			])
		} catch (error) {
			console.error("Error al cargar datos iniciales:", error)
		}
	}

	const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
		try {
			const response = await api.get(`/${endpoint}`)
			const data = await response.data
			setter(data.data || [])
		} catch (error) {
			console.error(`Error al obtener los datos de ${endpoint}:`, error)
		}
	}

	const validateForm = (): boolean => {
		const newErrors: Partial<PQ> = {}
		if (!formPeticion?.tipo_pq_id) newErrors.tipo_pq_id = "El tipo es requerido"
		if (!formPeticion?.detalleAsunto?.trim()) newErrors.detalleAsunto = "El asunto es requerido"
		if (!formPeticion?.detalleDescripcion?.trim()) newErrors.detalleDescripcion = "La descripción es requerida"
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleInputChange = (field: keyof PQ, value: string) => {
		setFormPeticion((prev) => ({
			...prev!,
			[field]: value
		}))
		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: undefined
			}))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const usuarioId = sessionStorage.getItem("persona_id");
		formPeticion.solicitante_id = usuarioId ?? "0";

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			const documentosBase64 = await Promise.all(
				formPeticion.lista_documentos.map(async (file) => {
					const base64 = await fileToBase64(file);
					return {
						Nombre: file.name,
						Tipo: file.type,
						Contenido: base64
					};
				})
			);

			const payload = {
				tipo_pq_id: formPeticion.tipo_pq_id,
				solicitante_id: formPeticion.solicitante_id,
				detalleAsunto: formPeticion.detalleAsunto,
				detalleDescripcion: formPeticion.detalleDescripcion,
				lista_documentos: documentosBase64
			};
			const response = await api.post("/pqs/radicar_pq", payload);

			if (response.status === 201) {
				fecthSolicitudes();
				setModalRadicarSolicitud(false);
				setFormPeticion({
					tipo_pq_id: "",
					solicitante_id: "",
					detalleAsunto: "",
					detalleDescripcion: "",
					lista_documentos: []
				});
			}

		} catch (error) {
			console.error("Error al enviar:", error);
			alert("Error al enviar la PQRSDF");
		} finally {
			setIsSubmitting(false);
		}
	};

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
			lista_documentos: prev.lista_documentos.filter((_, i) => i !== index),
		}))
	}

	const addFiles = (files: File[]) => {
		const validFiles = files.filter((file) => {
			const validTypes = [
				"application/pdf",
			]
			const maxSize = 5 * 1024 * 1024 // 5MB

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

		setFormPeticion((prev: any) => ({
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

	const handleCloseModalRadicar = () => {
		setModalRadicarSolicitud(false)
	}

	return (
		<div className="flex min-h-screen w-screen bg-gray-100">
			<div className="ml-14 w-full">
				<div className="max-w-7xl mx-auto">

					{/* Header */}
					<div className="flex justify-between items-center mb-6 mt-8">
						<h1 className="text-2xl font-bold text-blue-900">Panel de PQRSDF</h1>
					</div>

					<div className="flex justify-end mb-4">
						{/* Botón para abrir el modal */}
						<Button
							className="bg-blue-600 text-white hover:bg-blue-700"
							onClick={() => setModalRadicarSolicitud(true)}
						>
							+ Radicar Petición
						</Button>
					</div>

					{/* Tarjetas de estadísticas */}
					<div className="grid grid-cols-4 gap-4 mb-6">
						<Card className="bg-white shadow-sm">
							<CardContent className="p-4">
								<div className="text-sm text-gray-600">Total PQRSDF</div><div className="text-2xl font-bold">
									{totalCount}
								</div>
							</CardContent></Card>
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">Pendientes</div><div className="text-2xl font-bold text-yellow-500"></div></CardContent></Card>
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">En Proceso</div><div className="text-2xl font-bold text-blue-500"></div></CardContent></Card>
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">Resueltos</div><div className="text-2xl font-bold text-green-500"></div></CardContent></Card>
					</div>
					{/* Listado de PQRSDF */}
					<Card className="bg-white shadow-sm">
						<CardContent className="p-2">
							<h2 className="text-lg mb-2 font-semibold">Listado de PQRSDF</h2>

							{isLoading ? (
								<div className="flex justify-center py-10">
									<LoadingSpinner />
								</div>
							) : solicitudes && solicitudes.length > 0 ? (
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
											<div className="w-1/3 text-sm truncate">
												<strong>Asunto:</strong> {solicitud.detalleAsunto}
											</div>

											{/* Columna 3 - Fecha */}
											<div className="w-1/6 text-xs text-gray-600">
												{new Date(solicitud.fechaRadicacion).toLocaleDateString()}
											</div>

											{/* Columna 4 - Estado */}
											<div className="w-1/6 badge">
												<Badge
													variant="secondary"
													style={{
														backgroundColor:
															solicitud.historialEstados?.[solicitud.historialEstados.length - 1]?.estado?.color || "#6B7280"
													}}
												>
													{solicitud.nombreUltimoEstado}
												</Badge>

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
									No hay solicitudes registradas
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Información Principal */}
								<div className="space-y-4">
									<div>
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
												<p className="text-gray-900 mt-1">{selectedSolicitud.responsable?.personaResponsable.nombre || "No asignado"} {selectedSolicitud.responsable?.personaResponsable.apellido}</p>
											</div>
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

							<div className="mt-2 px-1 pb-4">
								<h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
									Documentos de Respuesta
								</h3>
								<div className="bg-gray-50 p-4 rounded-lg space-y-4">
									{selectedSolicitud.adjuntos && selectedSolicitud.adjuntos.length > 0 ? (
										<ul className="text-sm text-blue-600 space-y-2">
											{selectedSolicitud.adjuntos.map((archivo: any, i: number) => (
												(archivo.respuesta && (
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

						</div>

						{/* Footer del Modal */}
						<div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between items-center sticky bottom-0">
							<div className="text-sm text-gray-500">
								ID: {selectedSolicitud.id} | Creado:{" "}
								{new Date(selectedSolicitud.fechaRadicacion).toLocaleDateString()}
							</div>
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => {
										handleCloseModal();
									}}
									className="bg-gray-600 text-white hover:bg-gray-700 border-gray-600"
								>
									Cerrar
								</Button>
							</div>
						</div>

					</div>
				</div>
			)}

			{modalRadicarSolicitud && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
						{/* Header del Modal */}
						<div className="bg-blue-900 text-white p-6">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-bold">Radicar Peticion</h2>
							</div>
						</div>

						{/* Contenido del Modal */}
						<div className="p-6 space-y-4">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Tipo de PQRSDF */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="tipo" className="text-sm font-medium">
											Tipo de PQRSDF <span className="text-red-500">*</span>
										</Label>
										<Select
											value={formPeticion.tipo_pq_id}
											onValueChange={(value) => handleInputChange("tipo_pq_id", value)}
										>
											<SelectTrigger className={errors.tipo_pq_id ? "border-red-500" : ""}>
												<SelectValue placeholder="Seleccione el tipo" />
											</SelectTrigger>
											<SelectContent>
												{tipoPQ.map((tipo) => (
													<SelectItem key={tipo.id} value={String(tipo.id)}>
														<div className="flex items-center gap-2">
															<span>{tipo.nombre}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.tipo_pq_id && (
											<p className="text-sm text-red-500">{errors.tipo_pq_id}</p>
										)}
									</div>

								</div>

								{/* Asunto */}
								<div className="space-y-2">
									<Label htmlFor="asunto" className="text-sm font-medium">
										Asunto <span className="text-red-500">*</span>
									</Label>
									<Input
										id="asunto"
										type="text"
										placeholder="Ingrese el asunto de su PQRSDF"
										value={formPeticion.detalleAsunto}
										onChange={(e) => handleInputChange("detalleAsunto", e.target.value)}
										className={errors.detalleAsunto ? "border-red-500" : ""}
									/>
									{errors.detalleAsunto && <p className="text-sm text-red-500">{errors.detalleAsunto}</p>}
								</div>

								{/* Descripción */}
								<div className="space-y-2">
									<Label htmlFor="descripcion" className="text-sm font-medium">
										Descripción detallada <span className="text-red-500">*</span>
									</Label>
									<Textarea
										id="descripcion"
										placeholder="Describa detalladamente su solicitud ..."
										value={formPeticion.detalleDescripcion}
										onChange={(e) => handleInputChange("detalleDescripcion", e.target.value)}
										className={`min-h-32 ${errors.detalleDescripcion ? "border-red-500" : ""}`}
									/>
									{errors.detalleDescripcion && <p className="text-sm text-red-500">{errors.detalleDescripcion}</p>}
								</div>

								{/* Zona de archivos */}
								<div className="border-t pt-6">
									<h3 className="text-lg font-semibold text-blue-900 mb-4">Archivo adjunto (Solo se puede adjuntar un archivo)</h3>

									<div className="space-y-4">
										{/* Dropzone */}
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
													Formatos permitidos: PDF (máximo 5MB)
												</p>
											</div>

											<input
												id="file-input"
												type="file"
												multiple
												accept=".pdf"
												onChange={handleFileSelect}
												className="hidden"
											/>
										</div>

										{formPeticion.lista_documentos.length > 0 && (
											<div className="space-y-2">
												<h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
												<div className="space-y-2">
													{formPeticion.lista_documentos.map((file, index) => (
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

								{/* Botones */}
								<div className="flex justify-end gap-4 pt-6 border-t">
									<Button type="button" variant="outline" onClick={handleCloseModalRadicar} disabled={isSubmitting}>
										Cancelar
									</Button>
									<Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
										{isSubmitting ? "Enviando..." : "Radicar PQRSDF"}
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Dashboard
