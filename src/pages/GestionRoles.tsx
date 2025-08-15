import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusCircleIcon, EyeIcon, ExpandIcon, Trash } from "lucide-react"
import apiServiceWrapper from "../api/ApiService"

import { LoadingSpinner } from "../components/LoadingSpinner"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

const GestionRoles: React.FC = () => {
    const navigate = useNavigate()
    const api = apiServiceWrapper

    const [roles, setRoles] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRol, setSelectedRol] = useState<any | null>(null)

    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const fetchRoles = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/roles", {
                page: currentPage - 1,
                size: itemsPerPage,
            })
            setRoles(response.data.data)
            setTotalCount(response.data.total_count ?? 0)
            setTotalPages(Math.ceil((response.data.total_count ?? 0) / itemsPerPage))
        } catch (error) {
            console.error("Error al obtener los roles:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [currentPage])

    const handleCrearRol = () => {
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setSelectedRol(null)
        setModalOpen(false)
    }

    return (
        <div className="flex min-h-screen w-screen bg-gray-100">
            <div className="ml-14 w-full">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">Administración de Roles</h1>
                    </div>

                    {/* Botón crear rol */}
                    <div className="flex justify-end mb-4">
                        <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => navigate("/admin/dashboard/roles/crear")}
                        >
                            <PlusCircleIcon className="w-4 h-4 mr-2" /> Crear Rol
                        </Button>
                    </div>


                    {/* Listado de roles */}
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-2">
                            <h2 className="text-lg mb-2">Listado de Roles</h2>

                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <LoadingSpinner />
                                </div>
                            ) : roles.length > 0 ? (
                                <div className="space-y-2">
                                    {roles.map((rol: any) => (
                                        <Card
                                            key={rol.id}
                                            className="border border-gray-200 shadow-sm hover:shadow-md transition duration-200"
                                        >
                                            <CardContent className="p-2 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-md font-bold text-blue-800">{rol.nombre}</h3>
                                                    <p className="text-sm text-gray-600">Id: {rol.id || "Sin id"}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCrearRol()}
                                                        className="bg-red-50 text-red-600 border-red-600 hover:bg-red-100"
                                                    >
                                                        <Trash className="w-4 h-4 mr-1" /> Eliminar Rol
                                                    </Button>

                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No hay roles registrados.</p>
                            )}

                            {/* Paginación */}
                            <div className="flex justify-center mt-4 gap-4 items-center">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
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

            {/* Modal Detalles */}
            {modalOpen && selectedRol && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-blue-900">Detalles del Rol</h2>
                        <p><strong>Nombre:</strong> {selectedRol.nombre}</p>
                        <p><strong>Descripción:</strong> {selectedRol.descripcion || "Sin descripción"}</p>
                        <p><strong>Estado:</strong> {selectedRol.estado}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCloseModal}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GestionRoles
