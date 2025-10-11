import { useState, useEffect, useCallback, useRef } from "react"
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
import type { AreaResponsable as Area } from "../../models/AreaResponsable"
import type { Usuario } from "../../models/Usuario"
import type { PaginatedResponse } from "../../models/PaginatedResponse"
import type { Responsable } from "../../models/Responsable"
import apiServiceWrapper from "../../api/ApiService"
import { useAlert } from "../../context/AlertContext"

interface CrearResponsableForm {
    personaResponsable: { id: string }
    area: { id: string }
}

interface CrearResponsableModalProps {
    isOpen: boolean
    Areas: Area[]
    onClose: () => void
    onSuccess: () => void
    editing?: Responsable | null
    readOnly?: boolean
}

export default function CrearResponsableModal({
    isOpen,
    Areas,
    onClose,
    onSuccess,
    editing = null,
    readOnly = false,
}: CrearResponsableModalProps) {
    const { showAlert } = useAlert()
    const api = apiServiceWrapper

    const [form, setForm] = useState<CrearResponsableForm>({
        personaResponsable: { id: "" },
        area: { id: "" },
    })
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [errors, setErrors] = useState<Partial<CrearResponsableForm>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const observerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (editing) {
            setForm({
                personaResponsable: { id: editing.personaResponsable?.id?.toString() || "" },
                area: { id: editing.area?.id?.toString() || "" },
            })
        } else {
            setForm({ personaResponsable: { id: "" }, area: { id: "" } })
        }
    }, [editing])

    const fetchUsuarios = useCallback(
        async (reset = false) => {
            if (isLoadingUsers || (!hasMore && !reset)) return
            setIsLoadingUsers(true)

            const params: Record<string, any> = {
                page: reset ? 0 : page,
                size: 10,
                rolId: 2,
            }

            if (searchTerm.trim()) params.busqueda = searchTerm.trim()

            try {
                const response = await api.get<PaginatedResponse<Usuario>>("/usuarios/search", params)
                const nuevosUsuarios = response.data || []

                setUsuarios((prev) => (reset ? nuevosUsuarios : [...prev, ...nuevosUsuarios]))
                setHasMore(response.has_more)
                setPage((prev) => prev + 1)
            } catch (err: any) {
                console.error("Error cargando usuarios:", err)
                if (err.response && err.response.status === 401) {
                    showAlert(
                        `Error cargando usuarios: ${err instanceof Error ? err.message : String(err)}`,
                        "error"
                    )
                }
                if (err.response && err.response.status === 403) {
                    showAlert(
                        `Error cargando usuarios: No posee permisos para esta accion`,
                        "error"
                    )
                }

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

    const handleInputChange = (path: string, value: string) => {
        setForm((prev) => {
            const newForm = { ...prev };

            // Soporte para propiedades anidadas, ej: "personaResponsable.id"
            const keys = path.split(".");
            let current: any = newForm;

            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    current[key] = value;
                } else {
                    // Asegura que los niveles intermedios existan
                    current[key] = { ...current[key] };
                    current = current[key];
                }
            });

            return newForm;
        });

        // Limpia errores del campo (si existían)
        const topField = path.split(".")[0] as keyof CrearResponsableForm;
        if (errors[topField]) setErrors((prev) => ({ ...prev, [topField]: undefined }));
    };


    const validateForm = (): boolean => {
        const newErrors: Partial<CrearResponsableForm> = {}
        if (!form.personaResponsable.id) newErrors.personaResponsable = { id: "Debe seleccionar un usuario" }
        if (!form.area.id) newErrors.area = { id: "Debe seleccionar un área" }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        setIsSubmitting(true)
        try {
            if (editing) {
                await api.put(`/responsables_pqs/${editing.id}`, form)
                showAlert("Responsable actualizado correctamente", "success")
            } else {
                await api.post("/responsables_pqs", form)
                showAlert("Responsable creado correctamente", "success")
            }
            onSuccess()
            handleClose()
        } catch (err: any) {
            console.error("Error al guardar responsable:", err);

            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Error al guardar responsable";

            if (
                errorMessage.includes("Ya existe un registro") ||
                errorMessage.includes("duplicate key") ||
                errorMessage.includes("UNIQUE")
            ) {
                showAlert("Esta persona ya está asignada a otra área.", "warning");
            } else {
                showAlert("Error al guardar responsable.", "error");
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setForm({ personaResponsable: { id: "" }, area: { id: "" } })
        setUsuarios([])
        setPage(1)
        setSearchTerm("")
        setErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed w-screen inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                        {readOnly
                            ? "Detalles del Responsable"
                            : editing
                                ? "Editar Responsable"
                                : "Nuevo Responsable"}
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* --- Usuario --- */}
                        <div className="space-y-2">
                            <Label>Seleccionar persona</Label>
                            {!readOnly && (
                                <Input
                                    placeholder="Buscar usuario por nombre o identificación..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            )}
                            <div className={`border rounded-md max-h-52 overflow-y-auto p-2 ${readOnly ? "bg-gray-100" : ""}`}>
                                {usuarios.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => !readOnly && handleInputChange("personaResponsable.id", String(u.id))}
                                        className={`cursor-pointer px-3 py-2 rounded-md ${form.personaResponsable.id === String(u.id)
                                            ? "bg-blue-100"
                                            : "hover:bg-blue-50"
                                            } ${readOnly ? "pointer-events-none opacity-70" : ""}`}
                                    >
                                        <p className="font-medium text-gray-800">{u.persona.nombre}</p>
                                        <p className="text-sm text-gray-500">{u.persona.dni}</p>
                                    </div>
                                ))}
                                {isLoadingUsers && <p className="text-center text-gray-500 text-sm py-2">Cargando...</p>}
                                {!isLoadingUsers && usuarios.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-2">Sin resultados</p>
                                )}
                                <div ref={observerRef} className="h-2" />
                            </div>
                            {errors.personaResponsable && <p className="text-red-500 text-sm">{errors.personaResponsable.id}</p>}
                        </div>

                        {/* --- Área --- */}
                        <div className="space-y-2">
                            <Label>Área asignada</Label>
                            <Select
                                value={form.area.id}
                                onValueChange={(v) => handleInputChange("area.id", v)}
                                disabled={readOnly}
                            >
                                <SelectTrigger className={errors.area ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Seleccione un área" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Areas.map((area) => (
                                        <SelectItem key={area.id} value={String(area.id)}>
                                            {area.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.area && <p className="text-red-500 text-sm">{errors.area.id}</p>}
                        </div>

                        {/* --- Botones --- */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button variant="outline" onClick={handleClose}>
                                {readOnly ? "Cerrar" : "Cancelar"}
                            </Button>
                            {!readOnly && (
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    {isSubmitting
                                        ? "Guardando..."
                                        : editing
                                            ? "Actualizar"
                                            : "Guardar"}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
