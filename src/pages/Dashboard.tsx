import { useEffect, useState } from "react"
import { UndoIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import apiServiceWrapper from "../api/ApiService"

import { LoadingSpinner } from "../components/LoadingSpinner"

import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

const Dashboard: React.FC = () => {

	const navigate = useNavigate()
	const api = apiServiceWrapper

	const [solicitudes, setSolicitudes] = useState<any[]>([])
	const [currentPage, setCurrentPage] = useState(1)

	const [iniciales, setIniciales] = useState<any[]>([])

	const itemsPerPage = 10
	const [hasMore, setHasMore] = useState(true)
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(0)

	const [isLoading, setIsLoading] = useState<boolean>(false)

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

			setSolicitudes(response.data)
			setTotalCount(response.total_count ?? 0)
			setHasMore(response.has_more ?? false)

			const totalPages = Math.ceil((response.total_count ?? 0) / itemsPerPage)
			setTotalPages(totalPages)
		} catch (error) {
			console.error("Error al obtener las solicitudes:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchInitials = async () => {
		setIniciales(sessionStorage.getItem("persona_nombre")?.split(" ").map(name => name.charAt(0).toUpperCase()) || [])
	}

	useEffect(() => {
		fetchInitials()
		fecthSolicitudes()
	}, [currentPage])

	return (
		<div className="flex min-h-screen w-screen bg-gray-100 z-15">
			<div className="ml-14 w-full">
				<div className="max-w-7xl mx-auto p-6">

					{/* Header */}
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-bold text-blue-900">Panel de PQRSDF</h1>
						<div className="flex items-center gap-2">
							<span className="text-sm">
								Bienvenido, {`${sessionStorage.getItem("persona_nombre") ?? ""} ${sessionStorage.getItem("persona_apellido") ?? ""}`}
							</span>
							<div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white">
								{iniciales}
							</div>
						</div>
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
								): totalCount}</div></CardContent></Card>
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
								): solicitudes.map((solicitud: any) => (
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
													onClick={() => navigate(`/dashboard/editar_pq/${solicitud.id}`)}
												>
													<UndoIcon className="w-3 h-3 mr-1" />
													Ver
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
		</div>
	)
}

export default Dashboard
