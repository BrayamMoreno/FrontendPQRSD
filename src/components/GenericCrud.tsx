import { useEffect, useState, type ChangeEvent } from "react";
import { Pencil, Trash2, PlusCircle, Eye } from "lucide-react";
import { type CrudProps } from "../models/CrudProps";
import apiServiceWrapper from "../api/ApiService";
import { Button } from "./ui/button";
import type { PaginatedResponse } from "../models/PaginatedResponse";
import Breadcrumbs from "./Navegacion/Breadcrumbs";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAuth } from "../context/AuthProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

function GenericCrud<T extends { id: number | string, eliminado: boolean }>({
    endpoint,
    Columns,
    titulo,
    tabla
}: CrudProps<T>) {
    const api = apiServiceWrapper;
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<T>>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [toDelete, setToDelete] = useState<T | null>(null)
    const [readOnly, setReadOnly] = useState(false);

    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showForm]);

    const { permisos: permisosAuth } = useAuth();
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get<PaginatedResponse<T>>(
                `${endpoint}`, {
                page: currentPage - 1,
                size: itemsPerPage,
            });
            setData(response.data || []);
            const totalPages = Math.ceil((response.total_count ?? 0) / response.items_per_page);
            setTotalPages(totalPages);
        } catch (error) {
            console.error(`Error al obtener datos de ${endpoint}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, currentPage, itemsPerPage]);


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        Columns.forEach((col) => {
            const value = formData[col.key];

            if (
                col.key !== "id" &&
                (value === undefined || (typeof value === "string" && value.trim() === ""))
            ) {
                newErrors[col.key as string] = `El campo ${col.label} es obligatorio`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            if (editingItem) {
                await api.put(`${endpoint}/${editingItem.id}`, formData);
            } else {
                await api.post(endpoint, formData);
            }
            setShowForm(false);
            setFormData({});
            setEditingItem(null);
            fetchData();
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const handleEdit = (item: T) => {
        setEditingItem(item);
        setFormData(item);
        setReadOnly(false);
        setShowForm(true);
    };

    const handleView = (item: T) => {
        setEditingItem(item);
        setFormData(item);
        setReadOnly(true);
        setShowForm(true);
    };

    const handleDelete = async (id: number | string) => {
        try {
            await api.delete(`${endpoint}/${id}`, {});
            fetchData();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const getNestedValue = (obj: any, path: string) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    {/* Encabezado */}
                    <Breadcrumbs />
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">{titulo}</h1>
                        {permisosAuth.some(p => p.accion === 'agregar' && p.tabla === tabla) && (
                            <div className="flex gap-2">
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
                            </div>
                        )}
                    </div>

                    {/* Tabla */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                                                {Columns.map((col) => (
                                                    <th key={String(col.key)} className="px-6 py-3">
                                                        {col.label}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.length > 0 ? (
                                                data.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className={`border-b transition ${(item).eliminado
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "hover:bg-blue-50"
                                                            }`}
                                                    >

                                                        {Columns.map((col) => (
                                                            <td key={String(col.key)} className="px-6 py-3">
                                                                {col.type === "color" ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="w-6 h-6 rounded border"
                                                                            style={{
                                                                                backgroundColor: String(
                                                                                    getNestedValue(item, col.key) ?? "#ffffff"
                                                                                ),
                                                                            }}
                                                                        ></div>
                                                                        <span>
                                                                            {String(getNestedValue(item, col.key) ?? "Sin Valor")}
                                                                        </span>
                                                                    </div>
                                                                ) : col.type === "date" ? (
                                                                    new Date(
                                                                        String(getNestedValue(item, col.key))
                                                                    ).toLocaleString("es-CO", {
                                                                        year: "numeric",
                                                                        month: "2-digit",
                                                                        day: "2-digit",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })
                                                                ) : (
                                                                    String(getNestedValue(item, col.key) ?? "Sin Valor")
                                                                )}
                                                            </td>
                                                        ))}

                                                        <td className="px-6 py-2 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {permisosAuth.some(p => p.accion === 'modificar' && p.tabla === tabla) && (
                                                                    <Button
                                                                        onClick={() => handleEdit(item)}
                                                                        className={`btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400
                                                                            ${item.eliminado ? "opacity-50 cursor-not-allowed hover:bg-yellow-500" : ""}`
                                                                        }
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    onClick={() => handleView(item)}
                                                                    className={`btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
                                                                        ${item.eliminado ? "opacity-50 cursor-not-allowed hover:bg-blue-600" : ""}`
                                                                    }
                                                                >
                                                                    <Eye size={16} />
                                                                </Button>
                                                                {permisosAuth.some(p => p.accion === 'eliminar' && p.tabla === tabla) && (
                                                                    <AlertDialog
                                                                        open={toDelete?.id === item.id}
                                                                        onOpenChange={(open: any) => !open && setToDelete(null)}
                                                                    >
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                className={`bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm
                                                                                    ${item.eliminado ? "opacity-50 cursor-not-allowed hover:bg-red-400" : ""}`
                                                                                }
                                                                                onClick={() => setToDelete(item)}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </Button>
                                                                        </AlertDialogTrigger>

                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>¿Eliminar Registro?</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>

                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                                                                                    onClick={() => handleDelete(item.id)}
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
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={Columns.length + 1}
                                                        className="text-center py-6 text-gray-500"
                                                    >
                                                        No hay registros
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

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
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                        >
                                            ◀ Anterior
                                        </Button>

                                        <span className="text-sm px-3">
                                            Página {currentPage} de {totalPages}
                                        </span>

                                        <Button
                                            variant="outline"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">

                        {/* Header */}
                        <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {readOnly
                                    ? `Ver Registro #${editingItem?.id}`
                                    : editingItem?.id
                                        ? `Editar Registro #${editingItem.id}`
                                        : "Nuevo Registro"}
                            </h2>
                            <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                                {readOnly
                                    ? "Ver"
                                    : editingItem
                                        ? "Edición"
                                        : "Creación"}{" "}
                                Registro
                            </span>
                        </div>

                        {/* Contenido */}
                        <div className="p-8">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSave();
                                }}
                            >
                                <div className="space-y-4">
                                    {Columns.map((col) => (
                                        <div key={String(col.key)}>
                                            {col.key !== "id" && (
                                                <>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        {col.label}
                                                    </label>
                                                    <input
                                                        type={col.type ?? "text"}
                                                        name={String(col.key)}
                                                        value={String(formData[col.key] ?? "")}
                                                        onChange={handleChange}
                                                        disabled={col.key === "id"}
                                                        readOnly={readOnly}
                                                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${errors[col.key as string]
                                                            ? "border-red-500 focus:ring-red-500"
                                                            : "border-blue-300 focus:ring-blue-500"
                                                            } ${col.key === "id"
                                                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                                : "bg-white"
                                                            }`}
                                                    />

                                                    {errors[col.key as string] && (
                                                        <p className="text-red-500 text-sm mt-1">
                                                            {errors[col.key as string]}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 mt-8">
                                    <Button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2 border bg bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                    >
                                        {readOnly ? "Cerrar" : "Cancelar"}
                                    </Button>
                                    {!readOnly && (
                                        <Button
                                            type="submit"
                                            className="bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 font-semibold px-6 py-2 rounded-lg shadow-md"
                                        >
                                            Guardar
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GenericCrud;

