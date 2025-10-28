import { UndoIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { LoadingSpinner } from "../../components/LoadingSpinner"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import apiServiceWrapper from "../../api/ApiService"

import type { PaginatedResponse } from "../../models/PaginatedResponse"
import type { PqItem } from "../../models/PqItem"
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import type { TipoPQ } from "../../models/TipoPQ"
import AceptarPeticon from "../../components/Asignador/AceptarPeticon"
import { useAlert } from "../../context/AlertContext"
import type { Responsable } from "../../models/Responsable"
import { useAuth } from "../../context/AuthProvider"

const DashboardAsignador: React.FC = () => {

    const api = apiServiceWrapper
    const { showAlert } = useAlert();
    const { user } = useAuth();

    const [solicitudes, setSolicitudes] = useState<PqItem[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSolicitud, setSelectedSolicitud] = useState<PqItem | null>(null)
    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [responsables, setResponsables] = useState<Responsable[]>([]);

    const [tipoPQ, setTipoPQ] = useState<TipoPQ[]>([]);
    const [tipoPqSeleccionado, setTipoPqSeleccionado] = useState<number | null>(null)
    const [numeroRadicado, setNumeroRadicado] = useState<string | null>(null)

    const [fechaInicio, setFechaInicio] = useState<string | null>(null);
    const [fechaFin, setFechaFin] = useState<string | null>(null);

    const fetchSolicitudes = async () => {
        setIsLoading(true)

        const rawId = user?.persona.id;
        const radicadorId = rawId ? Number(rawId) : null;

        try {
            const params: Record<string, any> = {
                page: currentPage - 1,
                size: itemsPerPage,
                radicadorId: radicadorId
            };

            if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
                showAlert("La fecha de inicio no puede ser mayor a la fecha fin.", "warning");
                return;
            }

            if (tipoPqSeleccionado !== null) params.tipoId = tipoPqSeleccionado;
            if (numeroRadicado && numeroRadicado.trim() !== "")
                params.numeroRadicado = numeroRadicado;
            if (fechaInicio) params.fechaInicio = fechaInicio;
            if (fechaFin) params.fechaFin = fechaFin;

            const response = await api.get<PaginatedResponse<PqItem>>(
                "/pqs/por_asignar",
                params
            );

            setSolicitudes(response.data || []);
            setTotalPages(Math.ceil((response.total_count ?? 0) / itemsPerPage));
        } catch (error) {
            console.error("Error al obtener las solicitudes:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSolicitudes()
        fetchAllData()
    }, [currentPage])

    useEffect(() => {
        setCurrentPage(1)
        const delayDebounce = setTimeout(fetchSolicitudes, 1500);
        return () => clearTimeout(delayDebounce);
    }, [tipoPqSeleccionado, numeroRadicado, fechaInicio, fechaFin]);

    useEffect(() => {
		if (modalOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
    }, [modalOpen]);

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchData<TipoPQ>("tipos_pqs", setTipoPQ)
            ])
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error)
        }
    }

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>,
    ) => {
        try {
            const params: Record<string, any> = {
                size: 100,
            };
            const response = await api.get<PaginatedResponse<T>>(endpoint, params);
            setter(response.data || []);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const handleVerClick = async (solicitud: PqItem) => {
        setModalOpen(true)
        setSelectedSolicitud(solicitud)
        await Promise.all([
            fetchData<Responsable>('/responsables_pqs', setResponsables)
        ])
    }

    const handleCloseModal = (shouldRefresh: boolean = false) => {
        if (shouldRefresh) {
            fetchSolicitudes();
        }
        setModalOpen(false);
        setSelectedSolicitud(null);
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 ">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        {/* Breadcrumbs arriba */}
                        <Breadcrumbs />
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-blue-900">Solicitudes Pendientes de Asignacion</h1>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <Card className="mb-4">
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                    {/* Listado de PQRSD */}
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-2">
                            <h2 className="text-lg mb-2 font-semibold">Listado de PQRSD Pendientes</h2>

                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <LoadingSpinner />
                                </div>
                            ) : solicitudes.length > 0 ? (
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
                                            <div className="w-1/6 badge">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-white"
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
                                                    className="text-xs flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                                    onClick={() => handleVerClick(solicitud)}
                                                >
                                                    <UndoIcon className="w-3 h-3 mr-1" />
                                                    Asignar
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
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    ⏮ Primero
                                </Button>
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
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Siguiente ▶
                                </Button>
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

            <AceptarPeticon
                isOpen={modalOpen}
                selectedSolicitud={selectedSolicitud}
                responsables={responsables}
                onClose={handleCloseModal}
            />
        </div >
    )
}

export default DashboardAsignador
