import { FileText, UndoIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { LoadingSpinner } from "../../components/LoadingSpinner"

import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import apiServiceWrapper from "../../api/ApiService"
import type { PqItem } from "../../models/PqItem"
import type { TipoPQ } from "../../models/TipoPQ"
import type { PaginatedResponse } from "../../models/PaginatedResponse"
import type { Estado } from "../../models/Estado"

import { useAuth } from "../../context/AuthProvider"
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs"
import "react-quill-new/dist/quill.snow.css"
import { useLocation } from "react-router-dom"
import SolicitudModal from "../../components/Usuarios/SolicitudModal"
import RadicarSolicitudModal from "../../components/Usuarios/RadicarSolicitudModal"
import { useAlert } from "../../context/AlertContext"

const Dashboard: React.FC = () => {

	const api = apiServiceWrapper
	const { user } = useAuth();

	const [modalOpen, setModalOpen] = useState(false);

	const itemsPerPage = 10
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(0)

	const [solicitudes, setSolicitudes] = useState<PqItem[]>([]);
	const [selectedSolicitud, setSelectedSolicitud] = useState<PqItem | null>(null);
	const [modalRadicarSolicitud, setModalRadicarSolicitud] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingFilters, setIsLoadingFilters] = useState(false);

	const [estadosPq, SetEstadosPq] = useState<Estado[]>([]);
	const [estadoSeleccionado, setEstadoSeleccionado] = useState<number | null>(null);
	const [tipoPQ, setTipoPQ] = useState<TipoPQ[]>([]);
	const [tipoPqSeleccionado, setTipoPqSeleccionado] = useState<number | null>(null)
	const [numeroRadicado, setNumeroRadicado] = useState<String | null>(null)

	const [fechaInicio, setFechaInicio] = useState<string | null>(null);
	const [fechaFin, setFechaFin] = useState<string | null>(null);

	const totalSolicitudesInicial = useRef<number | null>(null);
	const location = useLocation();

	const { showAlert } = useAlert();

	useEffect(() => {
		if (location.state?.modal) {
			setModalRadicarSolicitud(true);
		}
	}, [location.state]);

	// Cambia fetchSolicitudes para que también guarde el total general:
	const fetchSolicitudes = async () => {
		if (!isLoading) setIsLoadingFilters(true);
		try {
			const rawId = user?.persona.id;
			const solicitanteId = rawId ? Number(rawId) : null;

			if (fechaInicio && fechaFin) {
				const inicio = new Date(fechaInicio);
				const fin = new Date(fechaFin);

				if (inicio > fin) {
					showAlert("La fecha de inicio no puede ser posterior a la fecha de fin.", "warning");
					setIsLoading(false);
					setIsLoadingFilters(false)
					return;
				}
			}

			const params: Record<string, any> = {
				solicitanteId,
				page: currentPage - 1,
				size: itemsPerPage,
			};

			if (estadoSeleccionado !== null) params.estadoId = estadoSeleccionado;
			if (tipoPqSeleccionado !== null) params.tipoId = tipoPqSeleccionado;
			if (numeroRadicado && numeroRadicado.trim() !== "")
				params.numeroRadicado = numeroRadicado;
			if (fechaInicio) params.fechaInicio = fechaInicio;
			if (fechaFin) params.fechaFin = fechaFin;

			const response = await api.get<PaginatedResponse<PqItem>>(
				"/pqs/mis_pqs_usuarios",
				params
			);

			console.log("Respuesta de solicitudes:", response.data);

			setSolicitudes(response.data || []);

			if (totalSolicitudesInicial.current === null) {
				totalSolicitudesInicial.current = response.total_count ?? 0;
			}
			const totalPages = Math.ceil((response.total_count ?? 0) / itemsPerPage);
			setTotalPages(totalPages);
		} catch (error) {
			console.error("Error al obtener las solicitudes:", error);
		} finally {
			setIsLoading(false);
			setIsLoadingFilters(false)
		}
	};

	useEffect(() => {
		if (modalRadicarSolicitud || modalOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [modalRadicarSolicitud, modalOpen]);

	useEffect(() => {
		fetchAllData()
	}, [])

	useEffect(() => {
		fetchSolicitudes();
	}, [currentPage]);

	useEffect(() => {
		const delayDebounce = setTimeout(fetchSolicitudes, 500);
		return () => clearTimeout(delayDebounce);
	}, [estadoSeleccionado, tipoPqSeleccionado, numeroRadicado, fechaInicio, fechaFin]);


	const fetchData = async <T,>(
		endpoint: string,
		setter: React.Dispatch<React.SetStateAction<T[]>>
	): Promise<void> => {
		try {
			const response = await api.get<PaginatedResponse<T>>(endpoint);
			const result = response.data ?? [];
			setter(result);
		} catch (error) {
			console.error(`Error al obtener los datos de ${endpoint}:`, error);
		}
	};

	const handleVerClick = async (solicitud: PqItem) => {
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
				fetchData<TipoPQ>("tipos_pqs", setTipoPQ),
				fetchData<Estado>("estados_pqs", SetEstadosPq)
			])
		} catch (error) {
			console.error("Error al cargar datos iniciales:", error)
		}
	}


	return (
		<div className="min-h-screen w-full bg-gray-50">
			<div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
				<div className="max-w-7xl mx-auto">
					<div className="mb-6">
						{/* Breadcrumbs arriba */}
						<Breadcrumbs />
						{/* Contenedor de título y botón */}
						<div className="flex items-center justify-between mt-2">
							<h1 className="text-2xl font-bold text-blue-900">Mis Peticiones</h1>
							{/* Botón alineado a la derecha */}
							{solicitudes.length == 0 ? (
								null
							) : (
								<Button
									className="bg-blue-600 text-white hover:bg-blue-700"
									onClick={() => setModalRadicarSolicitud(true)}
								>
									+ Radicar Petición
								</Button>
							)}
						</div>
					</div>
				</div>
				{isLoading ? (
					<Card className="bg-white shadow-md border max-w-7xl mx-auto">
						<CardContent>
							<div className="flex justify-center items-center py-20">
								<LoadingSpinner />
							</div>
						</CardContent>
					</Card>
				) : solicitudes.length === 0 && totalSolicitudesInicial.current === 0 ? (
					<Card className="bg-white shadow-md border max-w-7xl mx-auto">
						<CardContent>
							<div className="flex flex-col items-center text-center space-y-6 h-200">
								<div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
									<FileText className="w-10 h-10 text-blue-700" />
								</div>
								<h1 className="text-3xl font-bold text-blue-900">
									Aún no tienes solicitudes registradas
								</h1>
								<p className="text-gray-600 max-w-xl">
									Empieza creando tu primera solicitud PQRSD para hacer seguimiento y recibir respuestas de manera organizada.
								</p>
								<Button
									className="bg-blue-600 text-white hover:bg-blue-700"
									onClick={() => setModalRadicarSolicitud(true)}
								>
									+ Radicar mi primera Solicitud
								</Button>
							</div>
						</CardContent>
					</Card>
				) : (
					<div>
						<div className="max-w-7xl mx-auto">
							<Card className="mb-4">
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
										{/* Numero Radicado */}
										<div className="flex flex-col">
											<label className="text-sm text-gray-600 mb-1">N° Radicado</label>
											<Input
												placeholder="Buscar por N° Radicado"
												value={numeroRadicado ? String(numeroRadicado) : ""}
												onChange={(e) => {
													const value = e.target.value.trim();
													setNumeroRadicado(value === "" ? null : value);
												}}
											/>
										</div>

										{/* Tipo PQ */}
										<div className="flex flex-col">
											<label className="text-sm text-gray-600 mb-1">Tipo Solicitud</label>
											<Select
												value={tipoPqSeleccionado ? String(tipoPqSeleccionado) : "TODOS"}
												onValueChange={(value) =>
													setTipoPqSeleccionado(value === "TODOS" ? null : Number(value))
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Tipo Solicitud" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="TODOS">Todos los tipos</SelectItem>
													{tipoPQ.map((tipo) => (
														<SelectItem key={tipo.id} value={String(tipo.id)}>
															{tipo.nombre}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{/* Estado */}
										<div className="flex flex-col">
											<label className="text-sm text-gray-600 mb-1">Estado</label>
											<Select
												value={estadoSeleccionado ? String(estadoSeleccionado) : "TODOS"}
												onValueChange={(value) =>
													setEstadoSeleccionado(value === "TODOS" ? null : Number(value))
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Estado" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="TODOS">Todos los estados</SelectItem>
													{estadosPq.map((estado) => (
														<SelectItem key={estado.id} value={String(estado.id)}>
															{estado.nombre}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{/* Fecha Inicio */}
										<div className="flex flex-col">
											<label className="text-sm text-gray-600 mb-1">Fecha Inicio</label>
											<Input
												type="date"
												value={fechaInicio ?? ""}
												onChange={(e) => setFechaInicio(e.target.value || null)}
											/>
										</div>

										{/* Fecha Fin */}
										<div className="flex flex-col">
											<label className="text-sm text-gray-600 mb-1">Fecha Fin</label>
											<Input
												type="date"
												value={fechaFin ?? ""}
												onChange={(e) => setFechaFin(e.target.value || null)}
											/>
										</div>

										{/* Botón limpiar */}
										<div className="flex flex-col">
											<label className="text-sm text-transparent mb-1">.</label>
											<Button
												className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
												onClick={() => {
													setEstadoSeleccionado(null);
													setTipoPqSeleccionado(null);
													setNumeroRadicado(null);
													setFechaInicio(null);
													setFechaFin(null);
												}}
											>
												Limpiar filtros
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						<Card className="bg-white mx-auto max-w-7xl">
							<CardContent >
								<h2 className="text-lg mb-2 font-semibold">Mis Solicitudes</h2>

								{isLoadingFilters ? (
									<div className="flex justify-center py-10">
										<LoadingSpinner />
									</div>
								) : solicitudes && solicitudes.length > 0 ? (
									<div className="divide-y divide-gray-200">
										{solicitudes.map((solicitud: PqItem) => (
											<div
												key={solicitud.id}
												className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-2 border-b hover:bg-gray-50 transition"
											>
												{/* Columna 1 - ID y Tipo */}
												<div className="flex flex-col min-w-0 flex-1 sm:basis-2/5">
													<span className="font-semibold text-blue-800 text-sm truncate">
														#Radicado: {solicitud.numeroRadicado ?? solicitud.id}
													</span>
													<span className="text-xs text-gray-500 truncate">{solicitud.tipoPQ?.nombre}</span>
												</div>

												{/* Columna 2 - Asunto */}
												<div className="min-w-0 flex-1 sm:basis-2/5 text-sm truncate">
													<strong>Asunto:</strong> {solicitud.detalleAsunto}
												</div>

												{/* Columna 3 - Fecha */}
												<div className="min-w-0 flex-1 sm:basis-1/5 text-xs text-gray-600 truncate">
													{new Date(solicitud.fechaRadicacion).toLocaleDateString()}
												</div>

												{/* Columna 4 - Estado */}
												<div className="min-w-0 flex-1 sm:basis-1/5">
													<Badge
														variant="secondary"
														className="text-white truncate"
														style={{
															backgroundColor:
																estadosPq.filter(estado => estado.nombre === solicitud.nombreUltimoEstado)[0]?.color || "#6B7280"
														}}
													>
														{solicitud.nombreUltimoEstado}
													</Badge>
												</div>

												{/* Columna 5 - Botón */}
												<div className="w-auto flex-shrink-0">
													<Button
														className="text-xs flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
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

								<div className="text-center space-x-2">
									{/* Ir al inicio */}
									<Button
										variant="outline"
										size="sm"
										disabled={currentPage === 1}
										onClick={() => setCurrentPage(1)}
										className="w-auto flex-shrink-0 px-2"
									>
										⏮ Primero
									</Button>

									{/* Página anterior */}
									<Button
										variant="outline"
										size="sm"
										disabled={currentPage === 1}
										onClick={() => setCurrentPage(prev => prev - 1)}
										className="w-auto flex-shrink-0 px-2"
									>
										◀ Anterior
									</Button>

									{/* Info de página */}
									<span className="px-2 whitespace-nowrap text-center">
										Página {currentPage} de {totalPages}
									</span>

									{/* Página siguiente */}
									<Button
										variant="outline"
										size="sm"
										disabled={currentPage === totalPages}
										onClick={() => setCurrentPage(prev => prev + 1)}
										className="w-auto flex-shrink-0 px-2"
									>
										Siguiente ▶
									</Button>

									{/* Ir al final */}
									<Button
										variant="outline"
										size="sm"
										disabled={currentPage === totalPages}
										onClick={() => setCurrentPage(totalPages)}
										className="w-auto flex-shrink-0 px-2"
									>
										Último ⏭
									</Button>
								</div>

							</CardContent>
						</Card>
					</div>
				)}
			</div>

			<SolicitudModal
				isOpen={modalOpen}
				solicitud={selectedSolicitud}
				onClose={handleCloseModal}
			/>

			<RadicarSolicitudModal
				isOpen={modalRadicarSolicitud}
				tipoPq={tipoPQ}
				onClose={() => setModalRadicarSolicitud(false)}
				onSuccess={() => {
					// Refrescar la lista después de radicar una nueva solicitud
					setCurrentPage(1); // Volver a la primera página
					totalSolicitudesInicial.current = null; // Resetear el total inicial para que se recalcule
					fetchSolicitudes();
				}}
			/>
		</div>
	)
}

export default Dashboard
