import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import apiServiceWrapper from "../api/ApiService";
import type { Rol } from "../models/Rol";
import type { Permiso } from "../models/Permiso";
import type { PaginatedResponse } from "../models/PaginatedResponse";

type RolFormData = {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: number[]; // 👈 aquí permisos son solo IDs
};


function GestionRoles() {
    const api = apiServiceWrapper;

    const [roles, setRoles] = useState<Rol[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRol, setEditingRol] = useState<Rol | null>(null);
    const [showForm, setShowForm] = useState(false);

    // FormData separado del modelo Rol
    const [formData, setFormData] = useState<RolFormData>({
        id: 0,
        nombre: "",
        descripcion: "",
        permisos: [],
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 🔹 Helpers para transformar datos
    const mapRolToFormData = (rol: Rol): RolFormData => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos.map((p) => Number(p.id)),
    });

    const mapFormDataToPayload = () => ({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        permisos: formData.permisos.map((id) => ({ id })), // 👈 backend espera objetos
    });

    // 🔹 Método genérico para cargar datos
    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ): Promise<void> => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint, { page: 0, size: 100 });
            // 👇 ojo: si tu backend devuelve {data, meta}, asegúrate de extraer bien
            const result = response.data ?? [];
            setter(result);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await fetchData<Rol>("/roles", setRoles);
        await fetchData<Permiso>("/permisos", setPermisos);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // ✅ Validación del formulario
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!(formData.nombre ?? "").trim()) {
            newErrors.nombre = "El nombre del rol es obligatorio";
        }

        if (!(formData.descripcion ?? "").trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        }

        if ((formData.permisos ?? []).length === 0) {
            newErrors.permisos = "Debe seleccionar al menos un permiso";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    // ✅ Manejo de checkboxes con IDs
    const handlePermisoToggle = (permisoId: number | string) => {
        const id = Number(permisoId);
        const isSelected = formData.permisos.includes(id);

        const newPermisos = isSelected
            ? formData.permisos.filter((p) => p !== id)
            : [...formData.permisos, id];

        setFormData({ ...formData, permisos: newPermisos });
        setErrors({ ...errors, permisos: "" });
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const payload = mapFormDataToPayload();

            if (editingRol) {
                await api.put(`/roles/${editingRol.id}`, payload);
            } else {
                await api.post("/roles", payload);
            }

            setShowForm(false);
            setFormData({ id: 0, nombre: "", descripcion: "", permisos: [] });
            setEditingRol(null);
            loadData();
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const handleEdit = (rol: Rol) => {
        setEditingRol(rol);
        setFormData(mapRolToFormData(rol));
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar este rol?")) return;
        try {
            await api.delete(`/roles/${id}`, { method: 'DELETE' });
            loadData();
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
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-blue-900">
                                Gestión de Roles y Permisos
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditingRol(null);
                                    setFormData({
                                        id: 0,
                                        nombre: "",
                                        descripcion: "",
                                        permisos: [],
                                    });
                                    setErrors({});
                                }}
                                className="flex items-center gap-2 bg-blue-400 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                            >
                                <PlusCircle size={18} /> Nuevo Rol
                            </Button>
                        </div>
                    </div>

                    {/* Tabla de Roles */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-blue-50 text-blue-700 uppercase text-sm">
                                <tr>
                                    <th className="px-6 py-3">Rol</th>
                                    <th className="px-6 py-3">Descripción</th>
                                    <th className="px-6 py-3">Fecha Creación</th>
                                    <th className="px-6 py-3">Fecha Modificación</th>
                                    <th className="px-6 py-3">Permisos</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center py-6 text-gray-500"
                                        >
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : roles.length > 0 ? (
                                    roles.map((rol) => (
                                        <tr
                                            key={rol.id}
                                            className="border-b hover:bg-blue-50 transition"
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-blue-600" />
                                                    <span className="font-medium">{rol.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {rol.descripcion}
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {rol.createdAt ? new Date(rol.createdAt).toLocaleDateString("es-ES") : "No disponible"}
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {rol.updatedAt ? new Date(rol.updatedAt).toLocaleDateString("es-ES") : "No disponible"}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {rol.permisos.map((permiso) => (
                                                        <span
                                                            key={permiso.id}
                                                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                        >
                                                            {permiso.tabla}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(rol)}
                                                        className="bg-blue-400 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm"
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(rol.id)}
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
                                            colSpan={4}
                                            className="text-center py-6 text-gray-500"
                                        >
                                            No hay roles registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <p className="text-center text-gray-500 py-3 text-sm">
                            Lista de Roles y Permisos
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de Formulario */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                        <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {editingRol?.id ? `Editar Rol #${editingRol.id}` : "Nuevo Rol"}
                            </h2>
                            <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                                {editingRol ? "Edición" : "Creación"}
                            </span>
                        </div>

                        <div className="p-6">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSave();
                                }}
                            >
                                <div className="space-y-6">
                                    {/* Nombre del Rol */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Nombre del Rol
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${errors.nombre
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-blue-300 focus:ring-blue-500"
                                                } bg-white`}
                                            placeholder="Ej: Administrador, Editor, Viewer"
                                        />
                                        {errors.nombre && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.nombre}
                                            </p>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${errors.descripcion
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-blue-300 focus:ring-blue-500"
                                                } bg-white resize-none`}
                                            placeholder="Describe las responsabilidades de este rol"
                                        />
                                        {errors.descripcion && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.descripcion}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selección de Permisos */}
                                    <div>
                                        <label className="block text-sm font-medium mb-3 text-gray-700">
                                            Permisos Asignados
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                                            {permisos.length > 0 ? (
                                                <div className="grid grid-cols-4 gap-3">
                                                    {permisos.map((permiso) => (
                                                        <div key={permiso.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border hover:bg-blue-50 transition">
                                                            <Checkbox
                                                                id={`permiso-${permiso.id}`}
                                                                checked={formData.permisos.includes(
                                                                    Number(permiso.id)
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handlePermisoToggle(permiso.id)
                                                                }
                                                                className="mt-1"
                                                            />
                                                            <div className="flex-1">
                                                                <label
                                                                    htmlFor={`permiso-${permiso.id}`}
                                                                    className="text-sm font-medium text-gray-900 cursor-pointer"
                                                                >
                                                                    {permiso.tabla}
                                                                </label>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {permiso.descripcion}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">
                                                    No hay permisos disponibles
                                                </p>
                                            )}
                                        </div>
                                        {errors.permisos && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.permisos}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Seleccionados: {formData.permisos.length} de{" "}
                                            {permisos.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <Button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2 border bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md"
                                    >
                                        {editingRol ? "Actualizar Rol" : "Crear Rol"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionRoles;
