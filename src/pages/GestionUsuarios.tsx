import { useEffect, useMemo, useState } from "react"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
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
} from "../components/ui/alert-dialog"
import { Edit3, Eye, PlusCircleIcon, Trash2 } from "lucide-react"

import apiServiceWrapper from "../api/ApiService"
import UsuarioForm from "../components/Formularios/UsuarioForm"
import type { PaginatedResponse } from "../models/PaginatedResponse"
import type { Usuario } from "../models/Usuario"
import type { Rol } from "../models/Rol"

const GestionCuentas: React.FC = () => {

    const api = apiServiceWrapper

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<Usuario[]>([])
    const [search, setSearch] = useState("")

    const [roles, setRoles] = useState<Rol[]>([]) // lista de roles
    const [rolSeleccionado, setRolSeleccionado] = useState<string>("TODOS") // filtro actual

    const [estado, setEstado] = useState<string | "TODOS">("TODOS")
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Usuario | null>(null)
    const [toDelete, setToDelete] = useState<Usuario | null>(null)
    const [readOnly, setReadOnly] = useState(false);

    const fetchAllUsers = async () => {
        setLoading(true);
        let allUsers: Usuario[] = [];
        let page = 0;
        const pageSize = 20; // ajusta según tu API
        let hasMore = true;

        try {
            while (hasMore) {
                const response = await api.get<PaginatedResponse<Usuario>>(`/usuarios?page=${page}&size=${pageSize}`);

                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const users = response.data;
                allUsers = [...allUsers, ...users];

                if (response.has_more === false || users.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            }
            setData(allUsers);
        } catch (e) {
            console.error("Error cargando usuarios:", e);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers()
        fetchRoles()
    }, [])

    const filtered = useMemo(() => {
        const safeData = Array.isArray(data) ? data : []

        return safeData.filter((u) => {
            const matchText =
                !search ||
                `${u.persona.nombre} ${u.persona.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
                u.correo.toLowerCase().includes(search.toLowerCase()) ||
                u.persona.dni.toLowerCase().includes(search.toLowerCase())

            const matchRol = rolSeleccionado === "TODOS" || u.rol.nombre === rolSeleccionado

            const matchEstado =
                estado === "TODOS" ||
                (estado === "true" && u.isEnable === true) ||
                (estado === "false" && u.isEnable === false)

            return matchText && matchRol && matchEstado
        })
    }, [data, search, rolSeleccionado, estado])


    const fetchRoles = async () => {
        try {
            const response = await api.get<PaginatedResponse<Rol>>('/roles')
            setRoles(Array.isArray(response.data) ? response.data : [])
        } catch (e) {
            console.error(e)
            setRoles([])
        }
    }

    const handleStatusAccount = async (id: number, isEnable: boolean) => {
        try {
            const action = isEnable ? 'disable-account' : 'enable-account';
            await api.post(`/usuarios/${action}/${id}`, {});

            await fetchAllUsers();
        } catch (e) {
            console.error("Error actualizando estado de cuenta:", e);
        }
    };

    const deleteUser = async (id: number) => {
        try {
            await api.delete(`/usuarios/${id}`, {})

            await fetchAllUsers()
        } catch (e) {
            console.error(e)
        } finally {
            setToDelete(null)
        }
    }

    return (
        <div className="flex min-h-screen w-screen bg-gray-100 z-15">
            <div className="ml-14 w-full">
                <div className="max-w-7xl mx-auto p-10">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-blue-900">Gestión de Usuarios</h1>
                        <div className="flex gap-2">
                            <Button onClick={() => setFormOpen(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition">
                                <PlusCircleIcon size={18} />
                                Nuevo usuario
                            </Button>
                        </div>
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
                                <Select onValueChange={(v) => setRolSeleccionado(v)} value={rolSeleccionado}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos los roles</SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.nombre}>
                                                {r.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select onValueChange={(v) => setEstado(v)} value={estado}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos los estados</SelectItem>
                                        <SelectItem value="true">Activa</SelectItem>
                                        <SelectItem value="false">Inactiva</SelectItem>
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
                                    <th className="px-6 py-3">Estado de Cuenta</th>
                                    <th className="px-6 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6}
                                            className="text-center py-6 text-gray-500">
                                            {loading ? "Cargando..." : "Sin resultados"}
                                        </td>
                                    </tr>
                                )}
                                {filtered.map((u) => (
                                    <tr key={u.id}
                                        className="border-b hover:bg-blue-50 transition"
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
                                            <Badge
                                                className={`w-[80px] justify-center ${u.isEnable ? "bg-green-600" : "bg-gray-400"}`}
                                            >
                                                {u.isEnable ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {/* Activar / Desactivar */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`h-9 min-w-[90px] flex items-center justify-center
                                                                ${u.isEnable
                                                            ? "border-yellow-500 text-yellow-700"
                                                            : "border-green-600 text-green-700"
                                                        }`}
                                                    onClick={() => handleStatusAccount(u.id, u.isEnable)}
                                                >
                                                    {u.isEnable ? "Desactivar" : "Activar"}
                                                </Button>

                                                {/* Editar */}
                                                <Button
                                                    className="bg-blue-400 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"onClick={() => {
                                                        setEditing(u)
                                                        setReadOnly(false)
                                                        setFormOpen(true)
                                                    }}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                </Button>

                                                <Button
                                                    onClick={() => {
                                                        setReadOnly(true)
                                                        setEditing(u)
                                                        setFormOpen(true)
                                                    }}
                                                    className="bg-yellow-400 hover:bg-yellow-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />

                                                </Button>

                                                {/* Eliminar */}
                                                <AlertDialog
                                                    open={toDelete?.id === u.id}
                                                    onOpenChange={(open: any) => !open && setToDelete(null)}
                                                >
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            className="bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm"
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {
                formOpen && (
                    <UsuarioForm
                        usuario={editing ?? undefined}
                        readOnly={readOnly}
                        onClose={() => {
                            setFormOpen(false)
                            setEditing(null)
                        }}
                        onSave={async (payload: any) => {
                            try {
                                if (editing) {
                                    console.error("Actualizando usuario:", payload)
                                    await api.put(`/usuarios/${editing.id}`, payload)
                                } else {
                                    await api.post(`/usuarios`, payload)
                                }
                                await fetchAllUsers()
                                setFormOpen(false)
                                setEditing(null)
                            } catch (e) {
                                console.error("Error guardando usuario:", e)
                            }
                        }}
                    />
                )
            }
        </div >
    )
}

export default GestionCuentas;
