import type React from "react";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Edit3, Eye, PlusCircleIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import apiServiceWrapper from "../../api/ApiService";
import { useAuth } from "../../context/AuthProvider";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { AreaResponsable } from "../../models/AreaResponsable";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { useAlert } from "../../context/AlertContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import type { Responsable } from "../../models/Responsable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import CrearResponsableModal from "../../components/Admin/CrearResponsableModal";
import DetalleResponsablePq from "../../components/Admin/DetallesResponsablePq";

const GestionResponsablesPqs: React.FC = () => {

    const api = apiServiceWrapper
    const { permisos: permisosAuth } = useAuth();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);

    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [responsablesPq, setResponsablesPq] = useState<Responsable[]>([])

    const [search, setSearch] = useState("");

    const [areas, setArea] = useState<AreaResponsable[]>([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState<string>("TODAS");

    const [toDelete, setToDelete] = useState<Responsable | null>(null)
    const [editing, setEditing] = useState<Responsable | null>(null)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
    const [persona, setPersona] = useState<Responsable | null>(null);

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ): Promise<void> => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint, { page: 0, size: 1000 });
            if (!response || !response.data) {
                showAlert('Error al obtener los datos del servidor, intentelo mas tarde', 'error');
                return
            }
            const result = response.data ?? [];
            setter(result);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchData<AreaResponsable>('/areas_responsables', setArea)
        ]);
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchResponsables = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage - 1,
                size: itemsPerPage,
            };
            if (search) params.search = search;
            if (areaSeleccionada && areaSeleccionada !== "TODAS") params.areaId = areaSeleccionada;

            const response = await api.get<PaginatedResponse<Responsable>>('/responsables_pqs/search', params);
            if (!response || !response.data) {
                showAlert('Error al obtener los datos del servidor, intentelo mas tarde', 'error');
                return;
            }
            setResponsablesPq(response.data || []);
            setTotalPages(Math.ceil((response.total_count ?? 0) / itemsPerPage));
        } catch (error) {
            console.error(`Error al obtener los datos de responsables:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResponsables();
        setCurrentPage(1);
    }, [currentPage, search, areaSeleccionada]);

    const deleteResponsable = async (id: number) => {
        try {
            await api.delete(`/responsables_pqs/${id}`, {})
            await fetchResponsables();
            showAlert('Responsable eliminado correctamente', 'success');
        } catch (e) {
            console.error(e)
        } finally {
            setToDelete(null)
        }
    }

    const handleView = (responsable: Responsable) => {
        setPersona(responsable);
        setIsDetalleModalOpen(true);
    }

    const handleEdit = (responsable: Responsable) => {
        setEditing(responsable);
        setIsModalOpen(true);
    }

    const handleStatus = async (id: number, isActive: boolean) => {
        try {
            const action = isActive ? 'disable-responsable' : 'enable-responsable';
            await api.patch(`/responsables_pqs/${action}/${id}`, {});
            await fetchResponsables();
            isActive ? showAlert(`Responsable desactivado correctamente`, 'success') : showAlert(`Responsable activado correctamente`, 'success');
        } catch (e) {
            console.error("Error actualizando estado de cuenta:", e);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">Gestión de Responsables PQs</h1>
                        {permisosAuth.some(p => p.accion === "agregar" && p.tabla === 'responsables_pqs') && (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                            >
                                <PlusCircleIcon size={18} />
                                Nuevo responsable PQs
                            </Button>
                        )}
                    </div>

                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <Input
                                    className="w-full"
                                    placeholder="Buscar por nombre, correo o documento..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Select onValueChange={(v) => setAreaSeleccionada(v)} value={areaSeleccionada}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Area" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODAS">Todas las areas</SelectItem>
                                        {areas.map((a) => (
                                            <SelectItem key={a.id} value={a.id.toString()}>
                                                {a.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                    onClick={() => {
                                        setSearch("")
                                        setAreaSeleccionada("TODAS")
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-blue-50 text-blue-700 uppercase text-sm">
                                    <tr>
                                        <th className="px-4 py-3">Id</th>
                                        <th className="px-4 py-3">Codigo Area</th>
                                        <th className="px-4 py-3">Area Responsable</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Fecha Asignacion</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-10">
                                                <div className="flex justify-center items-center">
                                                    <LoadingSpinner />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : responsablesPq.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-gray-500">
                                                No hay responsables disponibles
                                            </td>
                                        </tr>
                                    ) : responsablesPq.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-b hover:bg-blue-50 transition"
                                        >
                                            <td className="px-4 py-4">{r.id}</td>
                                            <td className="px-4 py-4">{r.area?.codigoDep || "Sin Codigo"}</td>
                                            <td className="px-4 py-4">
                                                {r.area?.nombre || "Sin Area"}
                                            </td>
                                            <td className="px-4 py-4">
                                                {r.personaResponsable
                                                    ? `${r.personaResponsable.nombre} ${r.personaResponsable.apellido}`
                                                    : "Sin Responsable"}
                                            </td>
                                            <td className="px-4 py-4">
                                                {r.fechaAsignacion
                                                    ? new Date(r.fechaAsignacion).toLocaleDateString()
                                                    : "Sin Fecha"}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Editar */}
                                                    {permisosAuth.some(p => p.accion === "modificar" && p.tabla === 'responsables_pqs') && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className={`h-9 min-w-[90px] flex items-center justify-center
                                                                ${r.isActive
                                                                        ? "border-yellow-500 text-yellow-700"
                                                                        : "border-green-600 text-green-700"
                                                                    }`}
                                                                onClick={() => handleStatus(r.id, r.isActive)}
                                                            >
                                                                {r.isActive ? "Desactivar" : "Activar"}
                                                            </Button>
                                                            <Button
                                                                className="bg-blue-400 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"
                                                                onClick={() => handleEdit(r)}
                                                            >
                                                                <Edit3 className="h-4 w-4 mr-1" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* Ver */}
                                                    <Button
                                                        onClick={() => handleView(r)}
                                                        className="bg-yellow-400 hover:bg-yellow-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {permisosAuth.some(p => p.accion === "eliminar" && p.tabla === 'responsables_pqs') && (
                                                        <AlertDialog
                                                            open={toDelete?.id === r.id}
                                                            onOpenChange={(open: any) => !open && setToDelete(null)}
                                                        >
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    className="bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm"
                                                                    onClick={() => setToDelete(r)}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </AlertDialogTrigger>

                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar responsable?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>

                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                                                                        onClick={() => deleteResponsable(r.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 🔹 Paginación afuera de la tabla */}
                        <div className="flex justify-center items-center gap-2 py-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            >
                                ⏮ Primero
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                ◀ Anterior
                            </Button>

                            <span className="px-2 text-sm whitespace-nowrap">
                                Página {currentPage} de {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                Siguiente ▶
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            >
                                Último ⏭
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {isModalOpen && (
                <CrearResponsableModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditing(null);
                    }}
                    Areas={areas}
                    editing={editing}
                    onSuccess={() => {
                        fetchResponsables();
                        setIsModalOpen(false);
                    }}
                />
            )}

            <DetalleResponsablePq
                isOpen={isDetalleModalOpen}
                onClose={() => setIsDetalleModalOpen(false)}
                responsable={persona}
            />
        </div>
    );
}

export default GestionResponsablesPqs;