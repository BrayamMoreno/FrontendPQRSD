import { useCallback, useEffect, useMemo, useState } from "react"
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
import type { PaginatedResponse } from "../models/PaginatedResponse"
import type { Adjunto } from "../models/Adjunto"
import config from "../config"

type AdjuntoFormData = Adjunto & {
    lista_documentos: File[]
}

type FormErrors = Partial<Record<keyof AdjuntoFormData, string>> & {
    general?: string
}

const GestionAdjuntos: React.FC = () => {
    const api = apiServiceWrapper
    const API_URL = config.apiBaseUrl;

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<Adjunto[]>([])
    const [search, setSearch] = useState("")

    const [estado, setEstado] = useState<string | "TODOS">("TODOS")
    const [toDelete, setToDelete] = useState<Adjunto | null>(null)

    const [editingItem, setEditingItem] = useState<Adjunto | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState<AdjuntoFormData>({
        id: 0,
        pqRadicado: "",
        nombreArchivo: "",
        rutaArchivo: "",
        respuesta: false,
        createdAt: "",
        lista_documentos: []
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [readOnly, setReadOnly] = useState(false);

    const fetchAllAdjuntos = async () => {
        setLoading(true);
        let allAdjuntos: Adjunto[] = [];
        let page = 0;
        const pageSize = 20;
        let hasMore = true;

        try {
            while (hasMore) {
                const response = await api.get<PaginatedResponse<Adjunto>>(`/adjuntosPq?page=${page}&size=${pageSize}`);

                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const adjuntos = response.data;
                allAdjuntos = [...allAdjuntos, ...adjuntos];

                if (response.has_more === false || adjuntos.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            }
            setData(allAdjuntos);
        } catch (e) {
            console.error("Error cargando adjuntos:", e);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = useCallback(() => {
        fetchAllAdjuntos()
    }, [])

    useEffect(() => {
        refreshData()
    }, [refreshData])

    const filtered = useMemo(() => {
        return data.filter((u) => {
            const matchText =
                !search ||
                u.nombreArchivo.toLowerCase().includes(search.toLowerCase()) ||
                u.createdAt.toLowerCase().includes(search.toLowerCase())

            const matchEstado =
                estado === "TODOS" ||
                (estado === "true" && u.respuesta === true) ||
                (estado === "false" && u.respuesta === false)

            return matchText && matchEstado
        })
    }, [data, search, estado])

    const deleteAdjunto = async (id: number) => {
        try {
            await api.delete(`/adjuntosPq/${id}`, {})
            refreshData()
        } catch (e) {
            console.error(e)
        } finally {
            setToDelete(null)
        }
    }

    const handleEdit = (item: Adjunto) => {
        setEditingItem(item);
        setFormData({ ...item, lista_documentos: [] });
        setReadOnly(false);
        setShowForm(true);
    };

    const handleView = (item: Adjunto) => {
        setEditingItem(item);
        setFormData({ ...item, lista_documentos: [] });
        setReadOnly(true);
        setShowForm(true);
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }, [])

    const validateForm = () => {
        const newErrors: FormErrors = {}

        if (!formData.pqRadicado?.trim()) {
            newErrors.pqRadicado = "El radicado es obligatorio"
        }
        if (!formData.nombreArchivo?.trim()) {
            newErrors.nombreArchivo = "El nombre del archivo es obligatorio"
        }
        if (!formData.lista_documentos?.length && !editingItem) {
            newErrors.lista_documentos = "Debes adjuntar al menos un archivo"
            newErrors.general = "Debes adjuntar al menos un archivo PDF antes de guardar."
        }


        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleClearFormData = () => {
        setFormData({
            id: 0,
            pqRadicado: "",
            nombreArchivo: "",
            rutaArchivo: "",
            respuesta: false,
            createdAt: "",
            lista_documentos: []
        });
        setErrors({});
    };

    const handleEditAdjunto = async (id: number) => {
        if (!validateForm()) return;

        const payload = {
            adjuntoPqId: id,
            nombreArchivo: formData.nombreArchivo,
            pqId: formData.pqRadicado,
            esRespuesta: formData.respuesta
        }

        try {
            const response = await api.put(`/adjuntosPq/actualizar_adjunto`, payload);
            fetchAllAdjuntos();
            return true; // ✅ éxito
        } catch (error: any) {
            if (error.response?.status === 404) {
                setErrors(prev => ({
                    ...prev,
                    general: error.response.data.mensaje || "Error inesperado al crear el adjunto."
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: "Error inesperado al crear el adjunto."
                }));
            }
            return false; // ⚡ indicar error
        }
    };

    const handleCreatedAdjunto = async (): Promise<boolean> => {
        if (!validateForm()) return false;

        const base64 = await Promise.all(
            formData.lista_documentos.map(async (file) => {
                const base64 = await fileToBase64(file);
                return {
                    Nombre: file.name,
                    tipo: file.type,
                    Contenido: base64
                }
            })
        );

        const payload = {
            pqId: formData?.pqRadicado,
            lista_documentos: base64
        }

        try {
            const response = await api.post(`adjuntosPq/crear_adjunto`, payload);
            fetchAllAdjuntos();
            return true; // ✅ éxito
        } catch (error: any) {
            if (error.response?.status === 404) {
                setErrors(prev => ({
                    ...prev,
                    general: error.response.data.mensaje || "Error inesperado al crear el adjunto."
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: "Error inesperado al crear el adjunto."
                }));
            }
            return false; // ⚡ indicar error
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            if (editingItem) {
                const edited = await handleEditAdjunto(editingItem.id);
                if(edited) {
                    setShowForm(false);
                    handleClearFormData();
                    setEditingItem(null);
                    fetchAllAdjuntos();
                }
            } else {
                const created = await handleCreatedAdjunto();
                if (created) {
                    setShowForm(false);
                    handleClearFormData();
                    setEditingItem(null);
                    fetchAllAdjuntos();
                }
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };



    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // O reader.readAsBinaryString(file)
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1]; // Quita el "data:..." al inicio
                resolve(base64);
            };
            reader.onerror = reject;
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        addFiles(files)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        addFiles(files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const removeFile = (index: number) => {
        setFormData((prev) => ({
            ...prev!,
            lista_documentos: prev!.lista_documentos?.filter((_, i) => i !== index) || [],
        }))
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const addFiles = (files: File[]) => {
        const validFiles = files.filter((file) => {
            const validTypes = ["application/pdf"]
            const maxSize = 5 * 1024 * 1024 // 5MB

            if (!validTypes.includes(file.type)) {
                alert(`El archivo ${file.name} no tiene un formato válido`)
                return false
            }

            if (file.size > maxSize) {
                alert(`El archivo ${file.name} es demasiado grande (máximo 5MB)`)
                return false
            }

            return true
        })

        setFormData((prev: any) => ({
            ...prev,
            lista_documentos: [...prev.lista_documentos, ...validFiles],
        }))
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }


    return (
        <div className="flex min-h-screen w-screen bg-gray-100">
            <div className="ml-0 md:ml-14 w-full">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
                    {/* Cabecera */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <h1 className="text-xl md:text-2xl font-bold text-blue-900">Gestión de Adjuntos</h1>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;">
                                <PlusCircleIcon size={18} />
                                Nuevo adjunto
                            </Button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                                <Input
                                    className="w-full"
                                    placeholder="Buscar por nombre o fecha..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Select onValueChange={(v) => setEstado(v)} value={estado}>
                                    <SelectTrigger className="w-full truncate">
                                        <SelectValue placeholder="Estado" className="truncate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos los estados</SelectItem>
                                        <SelectItem value="true">Documentos de Respuesta</SelectItem>
                                        <SelectItem value="false">Documentos Radicados</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                    onClick={() => {
                                        setSearch("")
                                        setEstado("TODOS")
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-blue-50 text-blue-700 uppercase text-sm">
                                    <tr>
                                        <th className="px-4 py-3">Id</th>
                                        <th className="px-4 py-3">Radicado Petición</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Fecha Creación</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
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
                                            <td className="px-4 py-4">{u.id}</td>
                                            <td className="px-4 py-4">{u.pqRadicado}</td>
                                            <td className="px-4 py-4">
                                                <a
                                                    href={`${API_URL}/adjuntosPq/${u.id}/download`}
                                                    download
                                                    className="hover:underline break-all text-blue-600 underline"
                                                >
                                                    {u.nombreArchivo}
                                                </a></td>
                                            <td className="px-4 py-4">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Sin Fecha"}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Editar */}
                                                    <Button
                                                        className="bg-blue-400 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm flex items-center gap-1"
                                                        onClick={() => handleEdit(u)}
                                                    >
                                                        <Edit3 className="h-4 w-4 mr-1" />
                                                    </Button>

                                                    {/* Ver */}
                                                    <Button
                                                        onClick={() => handleView(u)}
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
                                                                <AlertDialogTitle>¿Eliminar adjunto?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                                                                    onClick={() => deleteAdjunto(u.id)}
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
            </div>

            {/* Modal Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm md:max-w-lg overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
                            {readOnly ? "Detalle de Adjunto" : editingItem ? "Editar Adjunto" : "Nuevo Adjunto"}
                        </h3>

                        {/* 🔴 Bloque de error general */}
                        {errors.general && (
                            <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300 text-red-700 text-sm">
                                {errors.general}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            <div className="space-y-4">

                                {/* Radicado */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                        Petición (Numero de Radicado)
                                    </label>
                                    <Input
                                        type="text"
                                        name="pqRadicado"
                                        value={formData?.pqRadicado ?? ""}
                                        onChange={handleChange}
                                        readOnly={readOnly}
                                        className={`${errors.pqRadicado ? "border-red-500" : ""}`}
                                    />
                                    {errors.pqRadicado && (
                                        <p className="text-red-500 text-sm mt-1">{errors.pqRadicado}</p>
                                    )}
                                </div>

                                {/* Nombre archivo */}
                                {editingItem ? (
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Nombre del archivo
                                        </label>
                                        <Input
                                            type="text"
                                            name="nombreArchivo"
                                            value={formData?.nombreArchivo ?? ""}
                                            onChange={handleChange}
                                            readOnly={readOnly}
                                            className={`${errors.nombreArchivo ? "border-red-500" : ""}`}
                                        />
                                        {errors.nombreArchivo && (
                                            <p className="text-red-500 text-sm mt-1">{errors.nombreArchivo}</p>
                                        )}
                                    </div>
                                ) : null}



                                {/* Zona de archivos */}
                                {!editingItem && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Archivos adjuntos (Adjunta los archivos necesarios)</h3>

                                        <div className="space-y-4">
                                            {/* Dropzone */}
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onClick={() => document.getElementById("file-input")?.click()}
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-700">Arrastra y suelta tu archivo aquí</p>
                                                        <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar el archivo</p>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        Formatos permitidos: PDF (máximo 5MB)
                                                    </p>
                                                </div>

                                                <input
                                                    id="file-input"
                                                    type="file"
                                                    multiple
                                                    accept=".pdf"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </div>

                                            {formData && formData.lista_documentos?.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
                                                    <div className="space-y-2">
                                                        {formData.lista_documentos.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                                                        <svg
                                                                            className="w-4 h-4 text-blue-500"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Fecha */}
                                {formData?.createdAt && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Fecha de creación
                                        </label>
                                        <Input
                                            type="text"
                                            value={new Date(formData.createdAt).toLocaleString()}
                                            readOnly
                                            className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                )}

                                {/* Es respuesta */}
                                <div className="flex items-center gap-2">
                                    <span>Es documento de respuesta</span>
                                    <input
                                        type="checkbox"
                                        name="respuesta"
                                        checked={formData?.respuesta ?? false}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        handleClearFormData();
                                        setEditingItem(null);
                                    }}
                                    className="px-6 py-2 border bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
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
    )
}

export default GestionAdjuntos;
