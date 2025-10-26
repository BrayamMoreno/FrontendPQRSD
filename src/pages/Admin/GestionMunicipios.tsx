import type React from "react";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Eye, Pencil, PlusCircleIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import apiServiceWrapper from "../../api/ApiService";
import { useAuth } from "../../context/AuthProvider";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { useAlert } from "../../context/AlertContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import type { Municipios } from "../../models/Municipios";
import type { Departamentos } from "../../models/Departamentos";

const GestionMunicipios: React.FC = () => {
    const api = apiServiceWrapper;
    const { permisos: permisosAuth } = useAuth();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [municipios, setMunicipios] = useState<Municipios[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);

    const [search, setSearch] = useState("");
    const [toDelete, setToDelete] = useState<Municipios | null>(null);
    const [editing, setEditing] = useState<Municipios | null>(null);
    const [readOnly, setReadOnly] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMunicipio, setFormMunicipio] = useState<Municipios | null>(null);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormMunicipio(null);
        setEditing(null);
        setReadOnly(true);
    }


    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isModalOpen]);

    // 🔹 Función genérica para obtener datos
    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ): Promise<void> => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint, { page: 0, size: 1000 });
            if (!response || !response.data) {
                showAlert("Error al obtener los datos del servidor, inténtelo más tarde", "error");
                return;
            }
            setter(response.data);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const fetchAllData = async () => {
        await fetchData<Departamentos>("/departamentos", setDepartamentos);
    };

    useEffect(() => {
        fetchAllData();
        fetchMunicipios();
    }, []);

    const fetchMunicipios = async () => {
        try {
            setLoading(true);
            const response = await api.get<PaginatedResponse<Municipios>>("/municipios");

            if (response._meta?.status === 403) {
                showAlert("No tienes permiso para realizar esta acción", "error");
                setMunicipios([]);
                setTotalPages(0);
                return;
            }

            setMunicipios(response.data || []);
            setTotalPages(Math.ceil((response.total_count ?? 0) / itemsPerPage));
        } catch (error) {
            console.error("Error al obtener los municipios:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMunicipio = async (id: number | string) => {
        try {
            await api.delete(`/municipios/${id}`, {});
            await fetchMunicipios();
            showAlert("Municipio eliminado correctamente", "success");
        } catch (e) {
            console.error(e);
            showAlert("Error al eliminar el municipio", "error");
        } finally {
            setToDelete(null);
        }
    };

    const handleView = (municipio: Municipios) => {
        setFormMunicipio(municipio);
        setReadOnly(true);
        setIsModalOpen(true);
    };

    const handleEdit = (municipio: Municipios) => {
        setEditing(municipio);
        setFormMunicipio(municipio);
        setReadOnly(false);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditing(null);
        setFormMunicipio({ codigoDane: "", nombre: "", departamento: null } as Municipios);
        setReadOnly(false);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">
                            Gestión de Municipios
                        </h1>

                        {permisosAuth.some(p => p.accion === "agregar" && p.tabla === "municipios") && (
                            <Button
                                onClick={handleNew}
                                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                            >
                                <PlusCircleIcon size={18} />
                                Nuevo Municipio
                            </Button>
                        )}
                    </div>

                    {/* Tabla de municipios */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-blue-50 text-blue-700 uppercase text-sm">
                                    <tr>
                                        <th className="px-4 py-3">Id</th>
                                        <th className="px-4 py-3">Código DANE</th>
                                        <th className="px-4 py-3">Municipio</th>
                                        <th className="px-4 py-3">Departamento</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center">
                                                <LoadingSpinner />
                                            </td>
                                        </tr>
                                    ) : municipios.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-gray-500">
                                                No hay municipios disponibles
                                            </td>
                                        </tr>
                                    ) : (
                                        municipios.map((m) => (
                                            <tr
                                                key={m.id}
                                                className={"border-b transition hover:bg-blue-50"}
                                            >
                                                <td className="px-4 py-4">{m.id}</td>
                                                <td className="px-4 py-4">{m.codigoDane || "Sin código DANE"}</td>
                                                <td className="px-4 py-4">{m.nombre || "Sin nombre"}</td>
                                                <td className="px-4 py-4">{m.departamento?.nombre || "Sin departamento"}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Editar */}
                                                        {permisosAuth.some(p => p.accion === "modificar" && p.tabla === "municipios") && (
                                                            <Button
                                                                className={`bg-yellow-500 text-white hover:bg-yellow-600`}
                                                                onClick={() => handleEdit(m)}
                                                            >
                                                                <Pencil className="h-4 w-4 mr-1" />
                                                            </Button>
                                                        )}

                                                        {/* Ver */}
                                                        <Button
                                                            onClick={() => handleView(m)}
                                                            className={`bg-blue-600 text-white hover:bg-blue-700`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>

                                                        {/* Eliminar */}
                                                        {permisosAuth.some(p => p.accion === "eliminar" && p.tabla === "municipios") && (
                                                            <AlertDialog
                                                                open={toDelete?.id === m.id}
                                                                onOpenChange={(open: any) => !open && setToDelete(null)}
                                                            >
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        className={`bg-red-500 hover:bg-red-600 text-white`}
                                                                        onClick={() => setToDelete(m)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </Button>
                                                                </AlertDialogTrigger>

                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                                            onClick={() => deleteMunicipio(Number(m.id))}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="flex justify-center items-center gap-2 py-4 border-t">
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                                ⏮ Primero
                            </Button>
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                ◀ Anterior
                            </Button>
                            <span className="px-2 text-sm whitespace-nowrap">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                                Siguiente ▶
                            </Button>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                                Último ⏭
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔹 Modal de formulario */}
            {isModalOpen && (
                <div className="fixed w-screen inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">
                                {readOnly
                                    ? "Detalles del Municipio"
                                    : editing
                                        ? "Editar Municipio"
                                        : "Nuevo Municipio"}
                            </h2>

                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const payload = {
                                        codigoDane: formMunicipio?.codigoDane || "",
                                        nombre: formMunicipio?.nombre || "",
                                        departamento: { id: formMunicipio?.departamento?.id || "" },
                                    };

                                    if (editing) {
                                        await api.put(`/municipios/${editing.id}`, payload);
                                        showAlert("Municipio actualizado correctamente", "success");
                                    } else {
                                        await api.post("/municipios", payload);
                                        showAlert("Municipio creado correctamente", "success");
                                    }

                                    setIsModalOpen(false);
                                    fetchMunicipios();
                                } catch (err) {
                                    console.error("Error al guardar municipio:", err);
                                    showAlert("Error al guardar municipio.", "error");
                                }
                            }}
                            className="p-6 space-y-4"
                        >
                            {/* Código DANE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código DANE</label>
                                <input
                                    type="text"
                                    value={formMunicipio?.codigoDane || ""}
                                    onChange={(e) =>
                                        setFormMunicipio((prev) => ({ ...prev!, codigoDane: e.target.value }))
                                    }
                                    disabled={readOnly}
                                    className={`w-full border rounded-md p-2 ${readOnly ? "bg-gray-100" : ""
                                        }`}
                                    placeholder="Ingrese código DANE"
                                />
                            </div>

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del municipio</label>
                                <input
                                    type="text"
                                    value={formMunicipio?.nombre || ""}
                                    onChange={(e) =>
                                        setFormMunicipio((prev) => ({ ...prev!, nombre: e.target.value }))
                                    }
                                    disabled={readOnly}
                                    className={`w-full border rounded-md p-2 ${readOnly ? "bg-gray-100" : ""
                                        }`}
                                    placeholder="Ingrese nombre del municipio"
                                />
                            </div>

                            {/* Departamento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>

                                {!readOnly && (
                                    <input
                                        type="text"
                                        placeholder="Buscar departamento..."
                                        className="w-full border rounded-md p-2 mb-2"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                )}

                                <div
                                    className={`border rounded-md max-h-40 overflow-y-auto p-2 ${readOnly ? "bg-gray-100" : ""
                                        }`}
                                >
                                    {departamentos
                                        .filter((d) =>
                                            d.nombre.toLowerCase().includes(search.toLowerCase()),
                                        ).map((d) => (
                                            <div
                                                key={d.id}
                                                onClick={() =>
                                                    !readOnly &&
                                                    setFormMunicipio((prev) => ({
                                                        ...prev!,
                                                        departamento: d as Departamentos,
                                                    }))
                                                }

                                                className={`cursor-pointer px-3 py-2 rounded-md ${formMunicipio?.departamento?.id === d.id
                                                    ? "bg-blue-100"
                                                    : "hover:bg-blue-50"
                                                    } ${readOnly ? "pointer-events-none opacity-70" : ""
                                                    }`}
                                            >
                                                {d.nombre}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button variant="outline" onClick={handleCloseModal} type="button">
                                    {readOnly ? "Cerrar" : "Cancelar"}
                                </Button>
                                {!readOnly && (
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {editing ? "Actualizar" : "Guardar"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionMunicipios;
