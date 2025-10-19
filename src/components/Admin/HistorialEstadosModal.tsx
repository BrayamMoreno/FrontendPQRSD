import { useEffect, useState } from "react";
import type { HistorialEstado } from "../../models/HistorialEstado";
import { Button } from "../ui/button";
import apiServiceWrapper from "../../api/ApiService";

/* IMPORTS del Select de shadcn - ajusta la ruta según tu proyecto */
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../ui/select";
import type { Usuario } from "../../models/Usuario";
import { useAuth } from "../../context/AuthProvider";

interface HistorialEstadosModalProps {
    isOpen: boolean;
    onClose: () => void;
    historial?: HistorialEstado;
    readOnly: boolean;
    // Ahora retorna booleano para indicar éxito
    onSubmit: (data: HistorialEstadoRequest) => Promise<boolean>;
}



export interface HistorialEstadoRequest {
    id: number;
    numeroRadicado: string;
    estado: {
        id: string | number;
    };
    observacion: string;
    usuario: {
        id: string | number;
    }

}

interface Estado {
    id: number;
    nombre: string;
}

// ... imports como antes

export default function HistorialEstadosModal({
    isOpen,
    onClose,
    historial,
    readOnly,
    onSubmit,
}: HistorialEstadosModalProps) {
    const api = apiServiceWrapper;
    const { user } = useAuth();

    const [formData, setFormData] = useState<HistorialEstadoRequest>({
        id: 0,
        numeroRadicado: "",
        estado: { id: "" },
        observacion: "",
        usuario: { id: user?.id || "" },
    });

    const [estados, setEstados] = useState<Estado[]>([]);
    const [errors, setErrors] = useState<{ numeroRadicado?: string; estado?: string }>({});

    const fetchEstados = async () => {
        try {
            const response = await api.getAll<{ data: Estado[] }>("/estados_pqs", { size: 1000, page: 0 });
            const data = Array.isArray(response?.data.data) ? response.data.data : [];
            setEstados(data);
        } catch (error) {
            console.error("Error al cargar los estados:", error);
        }
    };

    useEffect(() => {
        if (historial) {
            setFormData({
                id: historial.id,
                numeroRadicado: historial.numeroRadicado ?? "",
                estado: historial.estado ? { id: String(historial.estado.id) } : { id: "" },
                observacion: historial.observacion ?? "",
                usuario: { id: historial.usuario ? String((historial.usuario as Usuario).id) : user?.id || "" },
            });
        } else {
            setFormData({
                id: 0,
                numeroRadicado: "",
                estado: { id: "" },
                observacion: "",
                usuario: { id: user?.id || "" },
            });
        }
    }, [historial, user]);

    useEffect(() => {
        if (isOpen) fetchEstados();
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!formData.numeroRadicado) newErrors.numeroRadicado = "El número radicado es obligatorio.";
        if (!formData.estado?.id) newErrors.estado = "Debe seleccionar un estado.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const success = await onSubmit(formData); // onSubmit retorna true/false
            if (success) {
                handleClose(); // cerramos solo si la PQ fue creada
            }
        } catch (error) {
            console.error("Error al enviar datos:", error);
            // El modal permanece abierto si hay error
        }
    };


    const handleClose = () => {
        setFormData({
            id: 0,
            numeroRadicado: "",
            estado: { id: "" },
            observacion: "",
            usuario: { id: user?.id || "" },
        });
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
                <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {readOnly
                            ? `Ver Registro #${historial?.id ?? ""}`
                            : formData.id
                                ? `Editar Registro #${formData.id}`
                                : "Nuevo Registro"}
                    </h2>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Número radicado */}
                            <div>
                                <label className="block font-semibold mb-1">Número Radicado</label>
                                <input
                                    type="text"
                                    value={formData.numeroRadicado}
                                    placeholder="STTG-12321313-0001"
                                    onChange={(e) => setFormData({ ...formData, numeroRadicado: e.target.value })}
                                    readOnly={readOnly}
                                    className={`w-full border px-3 py-2 rounded-lg ${readOnly ? "bg-gray-100" : ""} ${errors.numeroRadicado ? "border-red-500" : ""}`}
                                />
                                {errors.numeroRadicado && <p className="text-red-500 text-sm mt-1">{errors.numeroRadicado}</p>}
                            </div>

                            {/* Estado */}
                            <div>
                                <Select
                                    value={formData.estado?.id ? String(formData.estado.id) : undefined} // <-- convertir a string
                                    onValueChange={(val: string) =>
                                        setFormData({
                                            ...formData,
                                            estado: { id: val }, // guardamos como string
                                        })
                                    }
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className={`w-full ${errors.estado ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder="Seleccione un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estados.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)}>
                                                {e.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
                            </div>

                            {/* Observación */}
                            <div>
                                <label className="block font-semibold mb-1">Observación</label>
                                <textarea
                                    value={formData.observacion}
                                    onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                    readOnly={readOnly}
                                    className={`w-full border px-3 py-2 rounded-lg h-24 ${readOnly ? "bg-gray-100" : ""}`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" onClick={handleClose} className="px-6 py-2 border bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                                {readOnly ? "Cerrar" : "Cancelar"}
                            </Button>
                            {!readOnly && (
                                <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 font-semibold px-6 py-2 rounded-lg shadow-md">
                                    Guardar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

