import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Users, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import apiServiceWrapper from "../../api/ApiService";
import type { Rol } from "../../models/Rol";
import type { Permiso } from "../../models/Permiso";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";


type RolFormData = {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: number[];
};

function GestionRoles() {
    const api = apiServiceWrapper;
    const { permisos: permisosAuth } = useAuth();

    const [roles, setRoles] = useState<Rol[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRol, setEditingRol] = useState<Rol | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [toDelete, setToDelete] = useState<Rol | null>(null)

    const [readOnly, setReadOnly] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);

    const [formData, setFormData] = useState<RolFormData>({
        id: 0,
        nombre: "",
        descripcion: "",
        permisos: [],
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const mapRolToFormData = (rol: Rol): RolFormData => ({
        id: Number(rol.id),
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos.map((p) => Number(p.id)),
    });

    const mapFormDataToPayload = () => ({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        permisos: formData.permisos.map((id) => ({ id })),
    });

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ): Promise<void> => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint, { page: 0, size: 1000 });
            const result = response.data ?? [];
            setter(result);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([
            fetchData<Rol>("/roles", setRoles),
            fetchData<Permiso>("/permisos", setPermisos)
        ]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

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
            setLoadingSave(true);
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
        } finally {
            setLoadingSave(false);
        }
    };

    const handleEdit = (rol: Rol) => {
        setEditingRol(rol);
        setFormData(mapRolToFormData(rol));
        setShowForm(true);
    };

    const handleView = (rol: Rol) => {
        setEditingRol(rol);
        setFormData(mapRolToFormData(rol));
        setReadOnly(true);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/roles/${id}`, { method: 'DELETE' });
        loadData();
    };

    useEffect(() => {
        if(showForm === false) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [showForm]);

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    {/* Encabezado */}
                    <Breadcrumbs />
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">Gestión de Roles</h1>
                        {permisosAuth.some(p => p.accion === 'agregar' && p.tabla === 'roles') && (
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
                                    className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                >
                                    <PlusCircle size={18} /> Nuevo Registro
                                </Button>
                            </div>
                        )}
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
                                        <td colSpan={6} className="py-10">
                                            <div className="flex justify-center">
                                                <LoadingSpinner />
                                            </div>
                                        </td>
                                    </tr>
                                ) : roles.length > 0 ? (
                                    roles.map((rol) => (
                                        <tr
                                            key={rol.id}
                                            className={`border-b transition hover:bg-blue-50"`}
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
                                                            {permiso.tabla}: {permiso.accion}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {permisosAuth.some(p => p.accion === 'modificar' && p.tabla === 'roles') && (
                                                        <Button
                                                            onClick={() => handleEdit(rol)}
                                                            className={`btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400`}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => handleView(rol)}
                                                        className={`btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    {permisosAuth.some(p => p.accion === 'eliminar' && p.tabla === 'roles') && (
                                                        <AlertDialog
                                                            open={toDelete?.id === rol.id}
                                                            onOpenChange={(open: boolean) => {
                                                                if (!open) setToDelete(null);
                                                            }}
                                                        >
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    onClick={() => setToDelete(rol)}
                                                                    className={`bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm`}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </AlertDialogTrigger>

                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción no se puede deshacer. Se eliminará permanentemente el rol
                                                                        <strong> {rol.nombre}</strong>.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                                                                        onClick={async () => {
                                                                            await handleDelete(rol.id);
                                                                            setToDelete(null);
                                                                        }}
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
                                            colSpan={4}
                                            className="text-center py-6 text-gray-500"
                                        >
                                            No hay roles registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Formulario */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                        <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {readOnly ? `Ver Registro #${editingRol?.id}` : editingRol?.id ? `Editar Registro #${editingRol.id}` : "Nuevo Registro"}
                            </h2>
                            <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                                {readOnly ? "Ver" : editingRol ? "Edición" : "Creación"} Registro
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
                                            readOnly={readOnly}   // 🔹 modo solo lectura
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
                                            readOnly={readOnly}
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
                                    {/* Selección de Permisos Mejorada */}
                                    <div>
                                        <label className="block text-sm font-medium mb-3 text-gray-700">
                                            Permisos Asignados
                                        </label>

                                        <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 max-h-80 overflow-y-auto">
                                            {permisos.length > 0 ? (
                                                Object.entries(
                                                    permisos.reduce((acc, permiso) => {
                                                        if (!acc[permiso.tabla]) acc[permiso.tabla] = [];
                                                        acc[permiso.tabla].push(permiso);
                                                        return acc;
                                                    }, {} as Record<string, Permiso[]>)
                                                )
                                                    .sort(([a], [b]) => a.localeCompare(b))
                                                    .map(([tabla, grupo]) => {
                                                        const allSelected = grupo.every(p =>
                                                            formData.permisos.includes(Number(p.id))
                                                        );
                                                        const someSelected =
                                                            grupo.some(p => formData.permisos.includes(Number(p.id))) &&
                                                            !allSelected;

                                                        return (
                                                            <div key={tabla} className="mb-4 border-b pb-3 last:border-none">
                                                                {/* Encabezado del módulo */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`grupo-${tabla}`}
                                                                            checked={allSelected}
                                                                            onCheckedChange={() => {
                                                                                const permisosIds = grupo.map(p => Number(p.id));
                                                                                const nuevosPermisos = allSelected
                                                                                    ? formData.permisos.filter(p => !permisosIds.includes(p))
                                                                                    : [...new Set([...formData.permisos, ...permisosIds])];
                                                                                setFormData({ ...formData, permisos: nuevosPermisos });
                                                                            }}
                                                                            disabled={readOnly}
                                                                            className={`${someSelected ? "indeterminate" : ""}`}
                                                                        />
                                                                        <label
                                                                            htmlFor={`grupo-${tabla}`}
                                                                            className="font-semibold text-blue-800 text-sm cursor-pointer"
                                                                        >
                                                                            {tabla.toUpperCase()}
                                                                        </label>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">
                                                                        {grupo.filter(p => formData.permisos.includes(Number(p.id))).length} / {grupo.length} seleccionados
                                                                    </span>
                                                                </div>

                                                                {/* Permisos individuales */}
                                                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                                    {grupo.map(permiso => (
                                                                        <div
                                                                            key={permiso.id}
                                                                            className="flex flex-col gap-1 bg-white border rounded-lg p-3 hover:bg-blue-50 transition"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Checkbox
                                                                                    id={`permiso-${permiso.id}`}
                                                                                    checked={formData.permisos.includes(Number(permiso.id))}
                                                                                    onCheckedChange={() => handlePermisoToggle(permiso.id)}
                                                                                    disabled={readOnly}
                                                                                />
                                                                                <label
                                                                                    htmlFor={`permiso-${permiso.id}`}
                                                                                    className="text-sm font-medium text-gray-800 cursor-pointer"
                                                                                >
                                                                                    {permiso.accion}
                                                                                </label>
                                                                            </div>
                                                                            {permiso.descripcion && (
                                                                                <p className="text-xs text-gray-500 pl-6">
                                                                                    {permiso.descripcion}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">
                                                    No hay permisos disponibles
                                                </p>
                                            )}
                                        </div>

                                        {errors.permisos && (
                                            <p className="text-red-500 text-sm mt-1">{errors.permisos}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Seleccionados: {formData.permisos.length} de {permisos.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    {readOnly ? (
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setReadOnly(false);
                                                setEditingRol(null);
                                                setFormData({
                                                    id: 0,
                                                    nombre: "",
                                                    descripcion: "",
                                                    permisos: [],
                                                });
                                                setErrors({});
                                            }}
                                            className="px-6 py-2 border bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            Cerrar
                                        </Button>
                                    ) : (
                                        <>
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
                                                disabled={loadingSave}
                                            >{loadingSave
                                                ? (editingRol ? "Actualizando..." : "Creando...")
                                                : (editingRol ? "Actualizar Rol" : "Crear Rol")}
                                            </Button>
                                        </>
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

export default GestionRoles;
