import React, { useEffect, useMemo, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
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
import { Edit3, Eye, PlusCircleIcon, Trash2 } from "lucide-react"

import apiServiceWrapper from "../../api/ApiService"
import PersonaForm from "../../components/Formularios/PersonaForm"
import type { Persona } from "../../models/Persona"
import type { PaginatedResponse } from "../../models/PaginatedResponse"

const GestionPersonas: React.FC = () => {

    const api = apiServiceWrapper

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [search, setSearch] = useState("")

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Persona | null>(null)
    const [toDelete, setToDelete] = useState<Persona | null>(null)
    const [readOnly, setReadOnly] = useState(false);

    const fetchAllPersonas = async () => {
        setLoading(true);
        let allPersonas: Persona[] = [];
        let page = 0;
        const pageSize = 20;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await api.get<PaginatedResponse<Persona>>(`/personas?page=${page}&size=${pageSize}`);

                if (!response) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const personas = response.data;
                allPersonas = [...allPersonas, ...personas];

                if (response.has_more === false || personas.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            }
            setData(allPersonas);
        } catch (e) {
            console.error("Error cargando usuarios:", e);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPersonas()
    }, [])

    const filtered = useMemo(() => {
        const safeData = Array.isArray(data) ? data : []

        return safeData.filter((u) => {
            const matchText =
                !search ||
                `${u.nombre} ${u.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
                u.telefono.toLowerCase().includes(search.toLowerCase()) ||
                u.dni.toLowerCase().includes(search.toLowerCase())

            return matchText
        })
    }, [data, search])

    const deletePersona = async (id: number) => {
        try {
            await api.delete(`/personas/${id}`, {})
            await fetchAllPersonas()
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
                        <h1 className="text-2xl font-bold text-blue-900">Gestión de Personas</h1>
                        <div className="flex gap-2">
                            <Button onClick={() => setFormOpen(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition">
                                <PlusCircleIcon size={18} />
                                Nuevo Persona
                            </Button>
                        </div>
                    </div>

                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                                <Input
                                    className="w-full"
                                    placeholder="Buscar por nombre, numero de Telefono o documento..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
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
                                    <th className="px-6 py-3">Telefono</th>
                                    <th className="px-6 py-3">Direccion Fisica</th>
                                    <th className="px-6 py-3">Cuenta</th>
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
                                {filtered.map((p) => (
                                    <tr key={p.id}
                                        className="border-b hover:bg-blue-50 transition"
                                    >
                                        <td className="px-6 py-4">{p.id}</td>
                                        <td>
                                            {p.nombre} {p.apellido}
                                        </td>
                                        <td className="px-6 py-4">{p.dni}</td>
                                        <td className="px-6 py-4">{p.telefono || "Sin Telefono"}</td>
                                        <td className="px-6 py-4">{p.direccion || "Sin Direccion"}</td>
                                        <td className="px-6 py-4">
                                            {p.correoUsuario ? (
                                                <span className="text-green-600 font-medium">
                                                    {p.correoUsuario}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 font-medium">
                                                    Sin cuenta
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-2 ">
                                            <div className="flex gap-2">
                                                {/* Editar */}
                                                <Button
                                                    onClick={() => {
                                                        setEditing(p)
                                                        setFormOpen(true)
                                                    }}
                                                    className="bg-blue-400 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"
                                                >
                                                    <Edit3 className="h-4 w-4" />

                                                </Button>

                                                {/* Mostrar */}
                                                <Button
                                                    onClick={() => {
                                                        setReadOnly(true)
                                                        setEditing(p)
                                                        setFormOpen(true)
                                                    }}
                                                    className="bg-yellow-400 hover:bg-yellow-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"

                                                >
                                                    <Eye className="h-4 w-4" />

                                                </Button>

                                                {/* Eliminar */}
                                                <AlertDialog
                                                    open={toDelete?.id === p.id}
                                                    onOpenChange={(open: any) => !open && setToDelete(null)}
                                                >
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            className="bg-red-400 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm"
                                                            onClick={() => setToDelete(p)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                ⚠️ Esta acción no se puede deshacer.
                                                                Si la persona tiene una cuenta activa, <b>todas sus peticiones serán eliminadas</b> y su cuenta también será eliminada junto con la persona.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="">Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                                                                onClick={() => deletePersona(p.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                    <PersonaForm
                        persona={editing ?? undefined}
                        readOnly={readOnly}
                        onClose={() => {
                            setReadOnly(false)
                            setFormOpen(false)
                            setEditing(null)
                        }}
                        onSave={async (payload: any) => {
                            try {
                                const body = payload.persona ?? payload;
                                if (editing) {
                                    await api.put(`/personas/${editing.id}`, body)
                                } else {
                                    await api.post(`/personas`, body)
                                }
                                await fetchAllPersonas()
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

export default GestionPersonas;
