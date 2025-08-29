import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint);
            setData(response.data || []);
        } catch (error) {
            console.error(`Error al obtener datos de ${endpoint}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // limpiar error al escribir
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

    return (
        <div className="flex min-h-screen w-screen bg-gray-100 z-15">
            <div className="ml-14 w-full">
                <div className="max-w-7xl mx-auto p-10">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-blue-900">Crud {titulo}</h1>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditingItem(null);
                                    setFormData({});
                                    setErrors({});
                                }}
                                className="flex items-center gap-2 bg-blue-400 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
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
                                                    {String(item[col.key])}
                                                </td>
                                            ))}
                                            <td className="px-6 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(item)}
                                                        className="bg-blue-400 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm"
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm"
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

                        <p className="text-center text-gray-500 py-3 text-sm">
                            Lista de {titulo}
                        </p>
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
                                                    type="text"
                                                    name={String(col.key)}
                                                    value={String(formData[col.key] ?? "")}
                                                    onChange={handleChange}
                                                    disabled={col.key === "id"}
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
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md"
                                >
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GenericCrud;

