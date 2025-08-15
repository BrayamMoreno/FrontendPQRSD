import { useEffect, useMemo, useState } from "react"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
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
import { Edit3, Plus, RefreshCw, Trash2 } from "lucide-react"

import apiServiceWrapper from "../api/ApiService"
import UsuarioForm from "../components/UsuarioForm"

export default function UsuariosPage() {

    const api = apiServiceWrapper

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [search, setSearch] = useState("")

    const [roles, setRoles] = useState<any[]>([]) // lista de roles
    const [rolSeleccionado, setRolSeleccionado] = useState<string>("TODOS") // filtro actual

    const [estado, setEstado] = useState<any | "TODOS">("TODOS")
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<any | null>(null)
    const [toDelete, setToDelete] = useState<any | null>(null)

    const fetchAllUsers = async () => {
        setLoading(true);
        let allUsers: any[] = [];
        let page = 0;
        const pageSize = 20; // ajusta según tu API
        let hasMore = true;

        try {
            while (hasMore) {
                const response = await api.get(`/usuarios?page=${page}&size=${pageSize}`);

                if (!response.data || !Array.isArray(response.data.data)) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const users = response.data.data;
                allUsers = [...allUsers, ...users];

                if (response.data.hasMore === false || users.length < pageSize) {
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
            const response = await api.get('/roles')
            setRoles(Array.isArray(response.data.data) ? response.data.data : [])
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
                            <Button onClick={() => setFormOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
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


                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Id</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Numero de Documento</TableHead>
                                            <TableHead>Correo</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Estado de Cuenta</TableHead>
                                            <TableHead className="text-right pr-4">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    {loading ? "Cargando..." : "Sin resultados"}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {filtered.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">{u.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    {u.persona.nombre} {u.persona.apellido}
                                                </TableCell>
                                                <TableCell>
                                                    {u.persona.dni}
                                                </TableCell>
                                                <TableCell>{u.correo}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {u.rol.nombre}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`w-[80px] justify-center ${u.isEnable ? "bg-green-600" : "bg-gray-400"}`}
                                                    >
                                                        {u.isEnable ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Editar */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 min-w-[100px] flex items-center justify-center"
                                                            onClick={() => {
                                                                setEditing(u)
                                                                setFormOpen(true)
                                                            }}
                                                        >
                                                            <Edit3 className="h-4 w-4 mr-1" /> Editar
                                                        </Button>

                                                        {/* Activar / Desactivar */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={`h-9 min-w-[100px] flex items-center justify-center
                                                                ${u.isEnable
                                                                    ? "border-yellow-500 text-yellow-700"
                                                                    : "border-green-600 text-green-700"
                                                                }`}
                                                            onClick={() => handleStatusAccount(u.id, u.isEnable)}
                                                        >
                                                            {u.isEnable ? "Desactivar" : "Activar"}
                                                        </Button>

                                                        {/* Eliminar */}
                                                        <AlertDialog
                                                            open={toDelete?.id === u.id}
                                                            onOpenChange={(open: any) => !open && setToDelete(null)}
                                                        >
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="h-9 min-w-[100px] flex items-center justify-center"
                                                                    onClick={() => setToDelete(u)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>


            {formOpen && (
                <UsuarioForm
                    user={editing}
                    roles={roles}
                    onClose={() => {
                        setFormOpen(false)
                        setEditing(null)
                    }}
                    onSave={async (payload: any) => {
                        try {
                            if (editing) {
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
            )}
        </div>
    )
}


