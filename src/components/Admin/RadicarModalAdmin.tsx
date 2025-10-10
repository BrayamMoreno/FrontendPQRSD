import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import type { TipoPQ } from "../../models/TipoPQ"
import apiServiceWrapper from "../../api/ApiService"
import type { PaginatedResponse } from "../../models/PaginatedResponse"
import type { Usuario } from "../../models/Usuario"
import { useAlert } from "../../context/AlertContext"

interface FormPeticion {
    tipo_pq_id: string
    solicitante_id: string
    detalleAsunto: string
    detalleDescripcion: string
    lista_documentos: File[]
}

interface RadicarModalAdminProps {
    isOpen: boolean
    tipoPq: TipoPQ[]
    onClose: () => void
    onSuccess: () => void
}

export default function RadicarModalAdmin({
    isOpen,
    tipoPq,
    onClose,
    onSuccess,
}: RadicarModalAdminProps) {

    const { showAlert } = useAlert();

    const closeModal = () => {
        setFormPeticion({
            tipo_pq_id: "",
            solicitante_id: "",
            detalleAsunto: "",
            detalleDescripcion: "",
            lista_documentos: [],
        });
        setErrors({
            tipo_pq_id: undefined,
            solicitante_id: undefined,
            detalleAsunto: undefined,
            detalleDescripcion: undefined,
            lista_documentos: undefined,
        });
        setUsuarios([]);
        setPage(1);
        onClose()
    }

    const [formPeticion, setFormPeticion] = useState<FormPeticion>({
        tipo_pq_id: "",
        solicitante_id: "",
        detalleAsunto: "",
        detalleDescripcion: "",
        lista_documentos: [],
    })

    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)

    const [errors, setErrors] = useState<Partial<FormPeticion>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const api = apiServiceWrapper
    const observerRef = useRef<HTMLDivElement | null>(null)

    const fetchUsuarios = useCallback(
        async (reset = false) => {
            if (isLoadingUsers || (!hasMore && !reset)) return
            setIsLoadingUsers(true)

            const params: Record<string, any> = {
                page: 0,
                size: 10,
                rolId: 5, // Rol de "Usuario"
            };

            if (searchTerm.trim()) {
                params.busqueda = searchTerm.trim();
            }

            try {
                const currentPage = reset ? 1 : page

                const response = await api.get<PaginatedResponse<Usuario>>("/usuarios/search", params)

                const nuevosUsuarios = response.data || []

                setUsuarios((prev) => (reset ? nuevosUsuarios : [...prev, ...nuevosUsuarios]))

                setHasMore(response.has_more)
                setPage(currentPage + 1)
            } catch (err) {
                console.error("Error cargando usuarios:", err)
                showAlert(`Error cargando usuarios: ${err instanceof Error ? err.message : String(err)}`, "error")

            } finally {
                setIsLoadingUsers(false)
            }
        },
        [page, searchTerm, hasMore, isLoadingUsers, api]
    )

    useEffect(() => {
        if (isOpen) fetchUsuarios(true)
    }, [isOpen])

    useEffect(() => {
        fetchUsuarios(true)
    }, [searchTerm])

    const handleInputChange = (field: keyof FormPeticion, value: any) => {
        setFormPeticion(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<FormPeticion> = {}
        if (!formPeticion.tipo_pq_id) newErrors.tipo_pq_id = "El tipo es requerido"
        if (!formPeticion.solicitante_id) newErrors.solicitante_id = "Debe seleccionar un solicitante"
        if (!formPeticion.detalleAsunto.trim()) newErrors.detalleAsunto = "El asunto es requerido"
        if (!formPeticion.detalleDescripcion.trim()) newErrors.detalleDescripcion = "La descripción es requerida"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        setIsSubmitting(true)
        try {
            const documentosBase64 = await Promise.all(
                formPeticion.lista_documentos.map(async (file) => {
                    const base64 = await fileToBase64(file);
                    return {
                        Nombre: file.name,
                        Tipo: file.type,
                        Contenido: base64,
                    };
                })
            );

            const payload = {
                ...formPeticion,
                lista_documentos: documentosBase64,
            }
            await api.post("/pqs/radicar_pq", payload)
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error al radicar:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const result = reader.result as string
                const base64 = result.split(",")[1]
                resolve(base64)
            }
            reader.onerror = reject
        })
    }

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

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const removeFile = (index: number) => {
        setFormPeticion((prev) => ({
            ...prev,
            lista_documentos: prev.lista_documentos.filter((_, i) => i !== index),
        }))
    }

    const addFiles = (files: File[]) => {
        const validFiles = files.filter((file) => {
            const validTypes = ["application/pdf"]
            const maxSize = 2 * 1024 * 1024 // 2MB

            if (!validTypes.includes(file.type)) {
                showAlert(`El archivo ${file.name} no es un PDF válido`, "warning")
                return false
            }

            if (file.size > maxSize) {
                showAlert(`El archivo ${file.name} excede el tamaño máximo de 2MB`, "warning")
                return false
            }

            return true
        })

        setFormPeticion((prev) => ({
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


    if (!isOpen) return null

    return (
        <div className="fixed w-screen inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                <div className="bg-blue-900 text-white px-6 py-4  flex justify-between">
                    <h2 className="text-lg font-semibold">Radicar PQRSD (Administrador)</h2>
                </div>

                <div className="p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label>Tipo de PQRSD</Label>
                            <Select
                                value={formPeticion.tipo_pq_id}
                                onValueChange={(v) => handleInputChange("tipo_pq_id", v)}
                            >
                                <SelectTrigger className={errors.tipo_pq_id ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Seleccione un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tipoPq.map((tipo) => (
                                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                                            {tipo.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tipo_pq_id && <p className="text-red-500 text-sm">{errors.tipo_pq_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Solicitante</Label>
                            <Input
                                placeholder="Buscar por nombre o identificación..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                            />
                            <div
                                className="border rounded-md max-h-52 overflow-y-auto p-2"
                            >
                                {usuarios.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleInputChange("solicitante_id", String(u.id))}
                                        className={`cursor-pointer px-3 py-2 rounded-md hover:bg-blue-50 ${formPeticion.solicitante_id === String(u.id) ? "bg-blue-100" : ""}`}
                                    >
                                        <p className="font-medium text-gray-800">{u.persona.nombre}</p>
                                        <p className="text-sm text-gray-500">{u.persona.dni}</p>
                                    </div>
                                ))}
                                {isLoadingUsers && (
                                    <p className="text-center text-gray-500 text-sm py-2">Cargando...</p>
                                )}
                                {!isLoadingUsers && usuarios.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-2">Sin resultados</p>
                                )}
                                <div ref={observerRef} className="h-2" />
                            </div>
                            {errors.solicitante_id && (
                                <p className="text-red-500 text-sm">{errors.solicitante_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Asunto</Label>
                            <Input
                                value={formPeticion.detalleAsunto}
                                onChange={(e) => handleInputChange("detalleAsunto", e.target.value)}
                                placeholder="Ingrese el asunto"
                                className={errors.detalleAsunto ? "border-red-500" : ""}
                            />
                            {errors.detalleAsunto && <p className="text-red-500 text-sm">{errors.detalleAsunto}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <ReactQuill
                                theme="snow"
                                value={formPeticion.detalleDescripcion}
                                onChange={(v) => handleInputChange("detalleDescripcion", v)}
                                className={errors.detalleDescripcion ? "border-red-500" : ""}
                            />
                            {errors.detalleDescripcion && (
                                <p className="text-red-500 text-sm">{errors.detalleDescripcion}</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                Archivo adjunto (Solo se puede adjuntar un archivo)
                            </h3>
                            <div className="space-y-4">

                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${formPeticion.lista_documentos.length >= 1
                                        ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                                        : "border-gray-300 hover:border-blue-400"
                                        }`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() =>
                                        formPeticion.lista_documentos.length < 1 &&
                                        document.getElementById("file-input")?.click()
                                    }
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-700">
                                                {formPeticion.lista_documentos.length >= 1
                                                    ? "Ya has cargado un archivo"
                                                    : "Arrastra y suelta tu archivo aquí"}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formPeticion.lista_documentos.length >= 1
                                                    ? "Elimina el archivo si quieres cambiarlo"
                                                    : "o haz clic para seleccionar el archivo"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Formatos permitidos: PDF (máximo 2 MB)
                                        </p>
                                    </div>

                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".pdf"
                                        disabled={formPeticion.lista_documentos.length >= 1}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {formPeticion.lista_documentos.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-700">Archivo seleccionado:</h4>
                                        {formPeticion.lista_documentos.map((file, index) => (
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
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(file.size)}
                                                        </p>
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
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting ? "Guardando..." : "Radicar PQRSD"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
