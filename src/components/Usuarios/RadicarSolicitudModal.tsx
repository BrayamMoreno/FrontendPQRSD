import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import type { TipoPQ } from "../../models/TipoPQ"
import type { RequestPq } from "../../models/RequestPq"
import apiServiceWrapper from "../../api/ApiService"
import { useAuth } from "../../context/AuthProvider"
import { useAlert } from "../../context/AlertContext"

interface FormPeticion {
    tipo_pq_id: string
    solicitante_id: string
    detalleAsunto: string
    detalleDescripcion: string
    lista_documentos: File[]
}

interface RadicarSolicitudModalProps {
    isOpen: boolean
    tipoPq: TipoPQ[]
    onClose: () => void
    onSuccess: () => void
}

export default function RadicarSolicitudModal({ isOpen, tipoPq, onClose, onSuccess }: RadicarSolicitudModalProps) {

    const [errors, setErrors] = useState<Partial<FormPeticion>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alertFile, setAlertFile] = useState<string | null>(null)
    const { showAlert } = useAlert();

    const [formPeticion, setFormPeticion] = useState<FormPeticion>({
        tipo_pq_id: "",
        solicitante_id: "",
        detalleAsunto: "",
        detalleDescripcion: "",
        lista_documentos: [],
    })

    const api = apiServiceWrapper
    const { user } = useAuth();

    const closeModal = () => {
        setFormPeticion({
            tipo_pq_id: "",
            solicitante_id: "",
            detalleAsunto: "",
            detalleDescripcion: "",
            lista_documentos: [],
        });
        setErrors({});
        setAlertFile(null);
        onClose()
    }

    const handleInputChange = (field: keyof RequestPq, value: string) => {
        setFormPeticion((prev) => ({
            ...prev!,
            [field]: value
        }))
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined
            }))
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
                setAlertFile(`El archivo ${file.name} no es un PDF válido`)
                return false
            }

            if (file.size > maxSize) {
                setAlertFile(`El archivo ${file.name} excede el tamaño máximo de 2MB`)
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

    const validateForm = (): boolean => {
        const newErrors: Partial<FormPeticion> = {}
        if (!formPeticion?.tipo_pq_id) newErrors.tipo_pq_id = "El tipo es requerido"
        if (!formPeticion?.detalleAsunto?.trim()) newErrors.detalleAsunto = "El asunto es requerido"
        if (!formPeticion?.detalleDescripcion?.trim()) newErrors.detalleDescripcion = "La descripción es requerida"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const rawId = user?.persona.id;
        const solicitanteId = rawId ? Number(rawId) : null;

        if (!validateForm()) return;

        setIsSubmitting(true);

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
                tipo_pq_id: formPeticion.tipo_pq_id,
                solicitante_id: solicitanteId,
                detalleAsunto: formPeticion.detalleAsunto,
                detalleDescripcion: formPeticion.detalleDescripcion,
                lista_documentos: documentosBase64,
            };

            const response = await api.post("/pqs/radicar_pq", payload);

            if (response.status === 201) {
                showAlert("PQRSD radicada exitosamente.", "success");
                setFormPeticion({
                    tipo_pq_id: "",
                    solicitante_id: "",
                    detalleAsunto: "",
                    detalleDescripcion: "",
                    lista_documentos: [],
                });

                setErrors({});
                setAlertFile(null);
            }

            if (response.status === 401) {
                showAlert("No tiene permisos para realizar esta acción.", "error");
                return;
            }

            if (response.status === 400) {
                showAlert("Error en los datos enviados. Por favor, verifique e intente de nuevo.", "error");
                console.error("Validation errors:", response.data);
                return;
            }

            if (response.status === 500) {
                showAlert("Error del servidor. Por favor, inténtelo de nuevo más tarde.", "error");
                console.error("Server error:", response.data);
                return;
            }

            onSuccess();
            onClose();
        } catch (error) {
            showAlert("Error al radicar la PQRSD. Por favor, inténtelo de nuevo.", "error");
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null

    return (
        <div className="fixed w-screen inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-900 text-white p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Radicar Petición</h2>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tipo de PQRSD */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="tipo" className="text-sm font-medium">
                                    Tipo de PQRSD <span className="text-red-500">*</span>
                                </Label>
                                {errors.tipo_pq_id && <p className="text-sm text-red-500">{errors.tipo_pq_id}</p>}
                                <Select
                                    value={formPeticion.tipo_pq_id}
                                    onValueChange={(value) => handleInputChange("tipo_pq_id", value)}
                                >
                                    <SelectTrigger className={errors.tipo_pq_id ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Seleccione el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipoPq.map((tipo) => (
                                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                                                {tipo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Asunto */}
                        <div className="space-y-2">
                            <Label htmlFor="asunto" className="text-sm font-medium">
                                Asunto <span className="text-red-500">*</span>
                            </Label>
                            {errors.detalleAsunto && <p className="text-sm text-red-500">{errors.detalleAsunto}</p>}
                            <Input
                                id="asunto"
                                type="text"
                                placeholder="Ingrese el asunto de su PQRSD"
                                value={formPeticion.detalleAsunto}
                                onChange={(e) => handleInputChange("detalleAsunto", e.target.value)}
                                className={errors.detalleAsunto ? "border-red-500" : ""}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label htmlFor="descripcion" className="text-sm font-medium">
                                Descripción detallada <span className="text-red-500">*</span>
                            </Label>
                            {errors.detalleDescripcion && <p className="text-sm text-red-500">{errors.detalleDescripcion}</p>}
                            <ReactQuill
                                theme="snow"
                                value={formPeticion.detalleDescripcion}
                                onChange={(value) => handleInputChange("detalleDescripcion", value)}
                                className="bg-white rounded-lg mb-3 h-36"
                                placeholder="Escribe la descripción aquí..."
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ["bold", "italic", "underline", "strike"],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ["link"],
                                        ["clean"],
                                    ],
                                }}
                            />
                        </div>

                        <div className="pt-10">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                Archivo adjunto (Solo se puede adjuntar un archivo)
                            </h3>
                            <div className="space-y-4">

                                {alertFile && (
                                    <p className="text-sm text-red-500">{alertFile}</p>
                                )}
                                {/* Dropzone */}
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


                        {/* Botones */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Enviando..." : "Radicar PQRSD"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
