import type React from "react";
import { Button } from "../../components/ui/button";
import apiServiceWrapper from "../../api/ApiService";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import type { HistorialEstado } from "../../models/HistorialEstado";
import HistorialEstadosModal from "../../components/Admin/HistorialEstadosModal";

const HistorialEstados: React.FC = () => {
    const api = apiServiceWrapper;
    const [data, setData] = useState<HistorialEstado[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<HistorialEstado | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<HistorialEstado>>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [readOnly, setReadOnly] = useState(false);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const { permisos: permisosAuth } = useAuth();

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page: currentPage - 1,
                size: itemsPerPage,
            };

            const response = await api.get<PaginatedResponse<HistorialEstado>>(
                `/historial_estados`,
                params
            );

            setData(response.data || []);
            const totalPages = Math.ceil(
                (response.total_count ?? 0) / response.items_per_page
            );
            setTotalPages(totalPages);
        } catch (error) {
            console.error("Error al obtener historial:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorial();
    }, [currentPage]);

    const handleEdit = (item: HistorialEstado) => {
        setEditingItem(item);
        setFormData(item);
        setReadOnly(false);
        setShowForm(true);
    };

    const handleView = (item: HistorialEstado) => {
        setEditingItem(item);
        setFormData(item);
        setReadOnly(true);
        setShowForm(true);
    };

    const handleDelete = async (id: number | string) => {
        if (!window.confirm("¿Seguro que quieres eliminar este registro?")) return;
        try {
            await api.delete(`/historial_estados/${id}`, {});
            fetchHistorial();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };


    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">
                            Gestión Historial de Estados
                        </h1>
                        {permisosAuth.some(
                            (p) => p.accion === "agregar" && p.tabla === "historial_estados"
                        ) && (
                                <Button
                                    onClick={() => {
                                        setShowForm(true);
                                        setEditingItem(null);
                                        setFormData({});
                                        setErrors({});
                                        setReadOnly(false);
                                    }}
                                    className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                >
                                    <PlusCircle size={18} /> Nuevo Registro
                                </Button>
                            )}
                    </div>

                    {/* Tabla */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left">
                                    <thead className="bg-blue-50 text-blue-700 uppercase text-sm">
                                        <tr>
                                            <th className="px-6 py-3">ID</th>
                                            <th className="px-6 py-3">#Radicado</th>
                                            <th className="px-6 py-3">Estado</th>
                                            <th className="px-6 py-3">Usuario Modificador</th>
                                            <th className="px-6 py-3">Fecha de Cambio</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length > 0 ? (
                                            data.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b hover:bg-blue-50 transition"
                                                >
                                                    <td className="px-6 py-2">{item.id}</td>
                                                    <td className="px-6 py-2">
                                                        {item.numeroRadicado || (
                                                            <span className="text-gray-500">Sin número</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-2">
                                                        {item.estado?.nombre || (
                                                            <span className="text-gray-500">Sin estado</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-2">
                                                        {item.usuario?.persona?.nombre}{" "}
                                                        {item.usuario?.persona?.apellido}
                                                    </td>
                                                    <td className="px-6 py-2">
                                                        {new Date(item.fechaCambio).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-2 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {permisosAuth.some(
                                                                (p) =>
                                                                    p.accion === "modificar" &&
                                                                    p.tabla === "historial_estados"
                                                            ) && (
                                                                    <Button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </Button>
                                                                )}
                                                            <Button
                                                                onClick={() => handleView(item)}
                                                                className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                                                            >
                                                                <Eye size={16} />
                                                            </Button>
                                                            {permisosAuth.some(
                                                                (p) =>
                                                                    p.accion === "eliminar" &&
                                                                    p.tabla === "historial_estados"
                                                            ) && (
                                                                    <Button
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </Button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="text-center py-6 text-gray-500"
                                                >
                                                    No hay registros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default HistorialEstados;
