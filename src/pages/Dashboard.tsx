import { useEffect, useState } from "react"
import { UndoIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import apiServiceWrapper from "../api/ApiService"

import { LoadingSpinner } from "../components/LoadingSpinner"

import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { FaEye, FaFileAlt } from "react-icons/fa"

const Dashboard: React.FC = () => {

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
	const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false)

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
	}, [currentPage])

	const handleSetHistorialEstados = (id: number | string) => {
		api.get(`/historial_estados/GetByPqId?pqId=${id}`)
			.then(response => {
				const historial = response.data; // accede a .data si el array está ahí
				const mappedData = historial.map((item: any) => ({
					id: item.id,
					nombre: item.estado?.nombre || "Sin nombre",
					fecha: item.fechaCambio,
					observacion: item.observacion || "Sin observación"
				}));
				setHistorialEstados(mappedData);
				console.log("Historial de estados (mapeado):", mappedData);
			})
			.catch(error => {
				console.error("Error al obtener el historial de estados:", error);
			});
	};

	const handleSetDocumentos = (id: number | string) => {
		api.get(`/adjuntosPq/GetByPqId?pqId=${id}`)
			.then(response => {
				console.log("Documentos obtenidos:", response);
				setDocumentos(response.data)
				console.log("Documentos:", response.data);
			})
			.catch(error => {
				console.error("Error al obtener el historial de estados:", error);
			});
	};


	const handleVerClick = (solicitud: any) => {
		setIsLoadingDetails(true);
		setSelectedSolicitud(solicitud)
		handleSetHistorialEstados(solicitud.id)
		handleSetDocumentos(solicitud.id)
		setModalOpen(true)
		setIsLoadingDetails(false)
	}


	return (
		<div className="flex min-h-screen w-screen bg-gray-100 z-15">
			<div className="ml-14 w-full">
				<div className="max-w-7xl mx-auto p-6">

					{/* Header */}
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-bold text-blue-900">Panel de PQRSDF</h1>
					</div>

					{/* Botón para radicar petición */}
					<div className="flex justify-end mb-4">
						<Button
							className="bg-blue-600 text-white hover:bg-blue-700"
							onClick={() => navigate("/dashboard/crear_pq")}
						>
							+ Radicar Petición
						</Button>
					</div>

					{/* Tarjetas de estadísticas */}
					<div className="grid grid-cols-4 gap-4 mb-6">
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">Total PQRSDF</div><div className="text-2xl font-bold">{isLoading ? (
							<div className="flex justify-center py-10">
								<LoadingSpinner />
							</div>
						) : totalCount}</div></CardContent></Card>
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">Pendientes</div><div className="text-2xl font-bold text-yellow-500"></div></CardContent></Card>
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">En Proceso</div><div className="text-2xl font-bold text-blue-500"></div></CardContent></Card>
						<Card className="bg-white shadow-sm"><CardContent className="p-4"><div className="text-sm text-gray-600">Resueltos</div><div className="text-2xl font-bold text-green-500"></div></CardContent></Card>
					</div>

					{/* Listado de PQRSDF */}
					<Card className="bg-white shadow-sm">
						<CardContent className="p-2">
							<h2 className="text-lg mb-2">Listado de PQRSDF</h2>

							<div className="space-y-2">
								{isLoading ? (
									<div className="flex justify-center py-10">
										<LoadingSpinner />
									</div>
								) : solicitudes.map((solicitud: any) => (
									<Card key={solicitud.id} className="border border-gray-200 shadow-sm hover:shadow-md transition duration-200">
										<CardContent className="p-2 space-y-1">
											<div className="flex justify-between items-center">
												<h3 className="text-md font-bold text-blue-800">
													#{solicitud.numeroRadicado ?? solicitud.id} - {solicitud.tipoPQ?.nombre}
												</h3>
												<Badge className="bg-gray-200 text-gray-800">{solicitud.nombreUltimoEstado}</Badge>
											</div>

											<div className="text-sm text-gray-700 grid grid-cols-3 gap-x-10">
												<span><strong>Asunto:</strong> {solicitud.detalleAsunto}</span>
												<span><strong>Fecha:</strong> {new Date(solicitud.fechaRadicacion).toLocaleDateString()}</span>
												<span><strong>Hora:</strong> {new Date(`1970-01-01T${solicitud.horaRadicacion}`).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>

												<span><strong>Responsable:</strong> {solicitud.detalleAsunto}</span>
												<span><strong>Resolución Estimada:</strong> {solicitud.fechaResolucionEstimada ? new Date(solicitud.fechaResolucionEstimada).toLocaleDateString() : "Sin fecha estimada"}</span>
												<span><strong>Resolución:</strong> {solicitud.fechaResolucion ? new Date(solicitud.fechaResolucion).toLocaleDateString() : "Sin resolución"}</span>
											</div>


											<div className="flex justify-end">
												<Button
													variant="outline"
													className="text-blue-600 hover:text-blue-800 py-0.1 px-2 text-xs"
													onClick={() => handleVerClick(solicitud)}
												>
													<UndoIcon className="w-3 h-3 mr-1" />
													Ver Detalles
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Paginación */}
							<div className="flex justify-center mt-4 gap-4 items-center">
								<Button
									variant="outline"
									disabled={currentPage === 0}
									onClick={() => setCurrentPage(prev => prev - 1)}
								>
									Anterior
								</Button>
								<span className="text-sm">
									Página {currentPage} de {totalPages}
								</span>
								<Button
									variant="outline"
									disabled={currentPage === totalPages}
									onClick={() => setCurrentPage(prev => prev + 1)}
								>
									Siguiente
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
												<label className="text-sm font-medium text-gray-600">Responsable:</label>
												<p className="text-gray-900 mt-1">{selectedSolicitud.responsable?.nombre || "No asignado"}</p>
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

							<div className="mt-8 px-1">
								<h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
									Historial de Estados
								</h3>

								{isLoadingDetails ? (
									// Mientras carga
									<div className="flex justify-center py-10">
										<LoadingSpinner />
									</div>
								) : (
									// Cuando termina de cargar
									<div className="bg-blue-50 rounded-lg p-4 overflow-x-auto">
										<p className="text-sm text-gray-700 mb-2">
											Para consultar las observaciones de cada estado, pasa el cursor sobre el nodo correspondiente.
										</p>
										{historialEstados && historialEstados.length > 0 ? (
											<div className="relative flex items-center w-full h-24">
												{/* Línea atravesando las bolitas */}
												<div className="absolute top-[28px] left-0 right-0 h-0.5 bg-blue-300 z-0"></div>

												{historialEstados.map((estado: any, index: number) => (
													<div
														key={index}
														className="relative flex flex-col items-center flex-1 text-center z-10"
													>
														{/* Contenedor de bolita y tooltip */}
														<div className="relative group z-10 mb-2">
															{/* Bolita */}
															<div className="w-4 h-4 bg-blue-600 rounded-full"></div>

															{/* Tooltip */}
															{estado.observacion && (
																<div className="absolute -top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none max-w-[160px] text-wrap text-center">
																	{estado.observacion}
																</div>
															)}
														</div>

														{/* Nombre y fecha */}
														<p className="text-xs text-gray-700 font-medium">{estado.nombre}</p>
														<p className="text-[10px] text-gray-500">
															{new Date(estado.fecha).toLocaleDateString()}
														</p>
													</div>
												))}
											</div>
										) : (
											<p className="text-sm text-gray-500">Sin historial disponible.</p>
										)}
									</div>
								)}
							</div>


							<div className="mt-8 px-1 pb-4">
								<h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
									Documentos Enviados
								</h3>
								<div className="bg-gray-50 p-4 rounded-lg space-y-4">
									{documentos && documentos.length > 0 ? (
										<ul className="text-sm text-blue-600 space-y-2">
											{documentos.map((archivo: any, i: number) => (
												<li key={i} className="flex items-center gap-2">
													{/* Ícono del archivo */}
													<span className="text-lg">📄</span>
													{/* Enlace para ver/descargar el archivo */}
													<a
														href={`https://TU_DOMINIO_O_STORAGE/${archivo.rutaArchivo}`}
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
											))}
										</ul>
									) : (
										<p className="text-sm text-gray-500">No hay documentos cargados.</p>
									)}
								</div>
							</div>

						</div>

						{/* Footer del Modal */}
						<div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between items-center">
							<div className="text-sm text-gray-500">
								ID: {selectedSolicitud.id} | Creado:{" "}
								{new Date(selectedSolicitud.fechaRadicacion).toLocaleDateString()}
							</div>
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => {
										// Liberar variables / resetear estados
										setSelectedSolicitud(null);
										setHistorialEstados([]);
										setDocumentos([]);
										setIsLoading(false);

										// Cerrar modal
										setModalOpen(false);
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


		</div>
	)
}

export default Dashboard
