import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import apiServiceWrapper from "../api/ApiService"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { LoadingSpinner } from "../components/LoadingSpinner"

const DetallePQ: React.FC = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const api = apiServiceWrapper

	const [pq, setPq] = useState<any | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchPQ = async () => {
			try {
				const data = await api.getById("/pqs", id as string)
				setPq(data)
			} catch (error) {
				console.error("Error al obtener la PQRSDF:", error)
			} finally {
				setLoading(false)
			}
		}
		fetchPQ()
	}, [id])

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<LoadingSpinner />
			</div>
		)
	}

	if (!pq) {
		return <div className="p-4 text-red-500">No se encontró la PQRSDF.</div>
	}

	return (
		<div className="max-w-4xl mx-auto mt-8">
			<h1 className="text-2xl font-bold mb-4">Detalle de PQRSDF #{pq.numeroRadicado ?? pq.id}</h1>

			<Card className="mb-4">
				<CardContent className="p-4 space-y-2 text-sm">
					<div className="flex justify-between items-center">
						<p className="font-semibold text-blue-800">{pq.tipoPQ?.nombre}</p>
						<Badge>{pq.nombreUltimoEstado}</Badge>
					</div>

					<p><strong>Asunto:</strong> {pq.detalleAsunto}</p>
					<p><strong>Fecha:</strong> {new Date(pq.fechaRadicacion).toLocaleDateString()}</p>
					<p><strong>Hora:</strong> {new Date(`1970-01-01T${pq.horaRadicacion}`).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
					<p><strong>Responsable:</strong> {pq.detalleAsunto}</p>
					<p><strong>Resolución Estimada:</strong> {pq.fechaResolucionEstimada ? new Date(pq.fechaResolucionEstimada).toLocaleDateString() : "Sin estimar"}</p>
					<p><strong>Resolución:</strong> {pq.fechaResolucion ? new Date(pq.fechaResolucion).toLocaleDateString() : "Sin resolver"}</p>
				</CardContent>
			</Card>

			{pq.adjuntos?.length > 0 && (
				<Card className="mb-4">
					<CardContent className="p-4">
						<h2 className="text-lg font-bold mb-2">Adjuntos</h2>
						<ul className="list-disc list-inside text-sm">
							{pq.adjuntos.map((adjunto: any, index: number) => (
								<li key={index}>
									<a href={adjunto.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
										{adjunto.nombre}
									</a>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			<Button onClick={() => navigate("/dashboard")} className="bg-blue-600 text-white hover:bg-blue-700">
				← Volver al panel
			</Button>
		</div>
	)
}

export default DetallePQ
