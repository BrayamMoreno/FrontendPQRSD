import React, { useEffect, useState, type ChangeEvent } from "react";
import { Pencil, Trash2, PlusCircle, Eye } from "lucide-react";
import { type CrudProps } from "../models/CrudProps";
import apiServiceWrapper from "../api/ApiService";
import { Button } from "./ui/button";
import type { PaginatedResponse } from "../models/PaginatedResponse";

function GenericCrud<T extends { id: number | string }>({
    endpoint,
    Columns,
    titulo,
}: CrudProps<T>) {
    const api = apiServiceWrapper;
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<T>>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [readOnly, setReadOnly] = useState(false);

    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

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


    // 🔹 Validación simple
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        Columns.forEach((col) => {
            const value = formData[col.key]; // 👈 variable temporal

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
        setReadOnly(false);   // 🔹 resetear
        setShowForm(true);
    };

    const handleView = (item: T) => {
        setEditingItem(item);
        setFormData(item);
        setReadOnly(true);    // 🔹 solo vista
        setShowForm(true);
    };

    const handleDelete = async (id: number | string) => {
        if (!window.confirm("¿Seguro que quieres eliminar este registro?")) return;
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
        <div className="flex min-h-screen w-screen bg-gray-100 z-15">
            <div className="ml-14 w-full">
                <div className="max-w-7xl mx-auto p-10">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-blue-900">{titulo}</h1>
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
                    </div>

                    {/* Tabla */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={Columns.length + 1}
                                            className="text-center py-6 text-gray-500"
                                        >
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : data.length > 0 ? (
                                    data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-blue-50 transition"
                                        >
                                            {Columns.map((col) => (
                                                <td key={String(col.key)} className="px-6 py-3">
                                                    {col.type === "color" ? (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-6 h-6 rounded border"
                                                                style={{ backgroundColor: String(getNestedValue(item, col.key) ?? "#ffffff") }}
                                                            ></div>
                                                            <span>{String(getNestedValue(item, col.key) ?? "Sin Valor")}</span>
                                                        </div>
                                                    ) : col.type === "date" ? (
                                                        new Date(String(getNestedValue(item, col.key))).toLocaleString("es-CO", {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })
                                                    ) : (
                                                        String(getNestedValue(item, col.key) ?? "Sin Valor")
                                                    )}
                                                </td>

                                            ))}

                                            <td className="px-6 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(item)}
                                                        className="btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400"
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleView(item)}
                                                        className="btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
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
                            {/* Ir al inicio */}
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            >
                                ⏮ Primero
                            </Button>

                            {/* Página anterior */}
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

                            {/* Página siguiente */}
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Siguiente ▶
                            </Button>

                            {/* Ir al final */}
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            >
                                Último ⏭
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800">
                            {editingItem ? "Editar" : "Nuevo"} Registro
                        </h3>
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
            )}
        </div>
    );
}

export default GenericCrud;

