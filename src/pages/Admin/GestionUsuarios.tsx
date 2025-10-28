import { useEffect, useState } from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
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
} from "../../components/ui/alert-dialog"
import { Eye, Pencil, PlusCircleIcon, Trash2 } from "lucide-react"

import apiServiceWrapper from "../../api/ApiService"
import UsuarioForm from "../../components/Formularios/UsuarioForm"
import type { PaginatedResponse } from "../../models/PaginatedResponse"
import type { Usuario } from "../../models/Usuario"
import type { Rol } from "../../models/Rol"
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { useAuth } from "../../context/AuthProvider"
import { useAlert } from "../../context/AlertContext"

const GestionCuentas: React.FC = () => {

    const api = apiServiceWrapper
    const { permisos: permisosAuth } = useAuth();
    const { showAlert } = useAlert();

    const [data, setData] = useState<Usuario[]>([])
    const [search, setSearch] = useState("")

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [roles, setRoles] = useState<Rol[]>([])
    const [rolSeleccionado, setRolSeleccionado] = useState<string>("TODOS")

    const [estado, setEstado] = useState<string | "TODOS">("TODOS")
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Usuario | null>(null)
    const [toDelete, setToDelete] = useState<Usuario | null>(null)
    const [readOnly, setReadOnly] = useState(false);

    const itemsPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    const fetchUser = async () => {
        try {
            const params: Record<string, any> = {
                page: currentPage - 1,
                size: itemsPerPage,
            };

            if (search) params.busqueda = search;
            if (rolSeleccionado && rolSeleccionado !== "TODOS") params.rolId = rolSeleccionado;
            if (estado && estado !== "TODOS") {
                params.estado = estado === "true";
            }

            const response = await api.get<PaginatedResponse<Usuario>>(
                "/usuarios/search",
                params
            );

            setData(response.data || []);
            setTotalPages(Math.ceil((response.total_count ?? 0) / itemsPerPage));
        } catch (error) {
            console.error("Error al obtener las solicitudes:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAllData = async () => {
        await Promise.all([
            fetchData<Rol>('/roles', setRoles),
        ]);
    }

    useEffect(() => {
        fetchAllData()
    }, []);

    useEffect(() => {
        fetchUser();
    }, [rolSeleccionado, currentPage]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUser();
        }, 1500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

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

    const deleteUser = async (id: number) => {
        try {
            await api.delete(`/usuarios/${id}`, {});
            await fetchUser()
        } catch (e) {
            console.error(e)
        } finally {
            setToDelete(null)
        }
    }

    useEffect(() => {
        if (formOpen === true) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [formOpen]);

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">Gestión de Usuarios</h1>
                        {permisosAuth.some(p => p.accion === "agregar" && p.tabla === 'usuarios') && (
                            <Button
                                onClick={() => setFormOpen(true)}
                                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                            >
                                <PlusCircleIcon size={18} />
                                Nuevo usuario
                            </Button>
                        )}
                    </div>

                    <Card className="mb-4">
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    className="w-full"
                                    placeholder="Buscar por nombre, correo o documento..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Select onValueChange={(v) => setRolSeleccionado(v)} value={rolSeleccionado}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos los roles</SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.id.toString()}>
                                                {r.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                    onClick={() => {
                                        setSearch("")
                                        setRolSeleccionado("TODOS")
                                        setEstado("TODOS")
                                    }}
                                >
                                    Limpiar filtros
                                </Button>

                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-blue-50 text-blue-700 uppercase text-sm">
                                <tr>
                                    <th className="px-6 py-3">Id</th>
                                    <th>Nombre</th>
                                    <th className="px-6 py-3">Numero de Documento</th>
                                    <th className="px-6 py-3">Correo</th>
                                    <th className="px-6 py-3">Rol</th>
                                    <th className="px-6 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-500">
                                            <LoadingSpinner />
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-500">
                                            No hay usuarios disponibles
                                        </td>
                                    </tr>
                                ) : data.map((u) => (
                                    <tr key={u.id}
                                        className={`border-b transition hover:bg-blue-50`}
                                    >
                                        <td className="px-6 py-4">{u.id}</td>
                                        <td>
                                            {u.persona.nombre} {u.persona.apellido}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.persona.dni}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.correo}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline">
                                                {u.rol.nombre}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {permisosAuth.some(p => p.accion === "modificar" && p.tabla === 'usuarios') && (
                                                    <Button
                                                        className={`btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400`}
                                                        onClick={() => {
                                                            setEditing(u)
                                                            setReadOnly(false)
                                                            setFormOpen(true)
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1" />
                                                    </Button>

                                                )}
                                                <Button
                                                    onClick={() => {
                                                        setReadOnly(true)
                                                        setEditing(u)
                                                        setFormOpen(true)
                                                    }}
                                                    className={`btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}
                                                >
                                                    <Eye className="h-4 w-4" />

                                                </Button>
                                                {permisosAuth.some(p => p.accion === "eliminar" && p.tabla === 'usuarios') && (
                                                    <AlertDialog
                                                        open={toDelete?.id === u.id}
                                                        onOpenChange={(open: any) => !open && setToDelete(null)}
                                                    >
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                className={`bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm`}
                                                                onClick={() => setToDelete(u)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="">Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                                                                    onClick={() => deleteUser(u.id)}
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
                    </div>
                </div>
            </div>

            {formOpen && (
                <UsuarioForm
                    usuario={editing ?? undefined}
                    readOnly={readOnly}
                    onClose={() => {
                        setFormOpen(false)
                        setEditing(null)
                        setReadOnly(false)
                    }}
                    onSave={async (payload: any) => {
                        try {
                            if (editing) {
                                await api.put(`/usuarios/${editing.id}`, payload)
                            } else {
                                const response = await api.post(`/usuarios`, payload)

                                if (response.status === 201) {
                                    showAlert("Usuario creado exitosamente.", "success")
                                } else {
                                    showAlert("Error al crear usuario.", "error")
                                }
                            }
                            await fetchUser()
                            setFormOpen(false)
                            setEditing(null)
                        } catch (e) {
                            console.error("Error guardando usuario:", e)
                        }
                    }}
                />
            )}
        </div >
    )
}

export default GestionCuentas;
