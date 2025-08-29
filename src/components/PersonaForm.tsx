import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import apiServiceWrapper from "../api/ApiService";
import type { TipoDoc } from "../models/TipoDoc";
import type { Genero } from "../models/Genero";
import type { TipoPersona } from "../models/TipoPersona";
import type { PaginatedResponse } from "../models/PaginatedResponse";
import type { Persona } from "../models/Persona";

interface PersonaFormProps {
    persona?: Persona;
    onClose: () => void;
    onSave: (persona: Persona) => void;
    readOnly?: boolean;
}

export default function PersonaForm({ persona, onClose, onSave, readOnly = false }: PersonaFormProps) {
    const api = apiServiceWrapper;

    const [tipoDoc, setTiposDoc] = useState<TipoDoc[]>([]);
    const [generos, setGeneros] = useState<Genero[]>([]);
    const [tiposPersonas, setTiposPersonas] = useState<TipoPersona[]>([]);
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [catalogosListos, setCatalogosListos] = useState(false);

    const [formData, setFormData] = useState<Persona>({
        id: "",
        nombre: "",
        apellido: "",
        correoUsuario: "",
        dni: "",
        telefono: "",
        direccion: "",
        codigoRadicador: "",
        tratamientoDatos: false,
        tipoDoc: { id: "", nombre: "" },
        tipoPersona: { id: "", nombre: "" },
        genero: { id: "", nombre: "" },
        createdAt: "",
        updatedAt: "",
    });

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchData<TipoDoc>("/tipos_documentos", setTiposDoc),
                fetchData<TipoPersona>("/tipos_personas", setTiposPersonas),
                fetchData<Genero>("/generos", setGeneros),
            ]);
            setCatalogosListos(true);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 👉 Efecto SOLO para cargar catálogos
    useEffect(() => {
        fetchAllData();
    }, []);

    // 👉 Efecto separado: setea formData cuando persona cambia y catálogos ya están listos
    useEffect(() => {
        if (persona && catalogosListos) {
            setFormData({
                id: persona.id || "",
                nombre: persona.nombre || "",
                apellido: persona.apellido || "",
                correoUsuario: persona.correoUsuario || "",
                dni: persona.dni || "",
                telefono: persona.telefono || "",
                direccion: persona.direccion || "",
                codigoRadicador: persona.codigoRadicador || "",
                tratamientoDatos: persona.tratamientoDatos ?? false,
                tipoDoc: {
                    id: persona.tipoDoc?.id ? String(persona.tipoDoc.id) : "",
                    nombre: persona.tipoDoc?.nombre || "",
                },
                tipoPersona: {
                    id: persona.tipoPersona?.id ? String(persona.tipoPersona.id) : "",
                    nombre: persona.tipoPersona?.nombre || "",
                },
                genero: {
                    id: persona.genero?.id ? String(persona.genero.id) : "",
                    nombre: persona.genero?.nombre || "",
                },
                createdAt: persona.createdAt || "",
                updatedAt: persona.updatedAt || "",
            });
        }
    }, [persona, catalogosListos]);

    const handleChange = (path: string, value: any) => {
        setFormData((prev) => {
            const keys = path.split(".");
            const updated: any = { ...prev };
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = { ...obj[keys[i]] };
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
        if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";
        if (!formData.dni.trim()) newErrors.dni = "El documento es obligatorio";
        if (!formData.tipoDoc.id) newErrors.tipoDoc = "Debe seleccionar un tipo de documento";
        if (!formData.tipoPersona.id) newErrors.tipoPersona = "Debe seleccionar un tipo de persona";
        if (!formData.genero.id) newErrors.genero = "Debe seleccionar un género";
        if (!formData.tratamientoDatos) newErrors.tratamientoDatos = "Debe aceptar el tratamiento de datos";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSave(formData);
    };

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ): Promise<void> => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint);
            const result = response.data ?? [];
            setter(result);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {persona ? (readOnly ? `Ver Persona #${persona.id}` : `Editar Persona #${persona.id}`) : "Nueva Persona"}
                    </h2>
                    <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                        {readOnly ? "Solo lectura" : persona ? "Edición" : "Creación"}
                    </span>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {!readOnly && Object.keys(errors).length > 0 && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-md">
                                Por favor corrija los errores antes de continuar.
                            </div>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <span className="text-white">Cargando...</span>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos de la Persona</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nombre" value={formData.nombre} error={errors.nombre} onChange={(val: string) => handleChange("nombre", val)} readOnly={readOnly} />
                                <InputField label="Apellido" value={formData.apellido} error={errors.apellido} onChange={(val: string) => handleChange("apellido", val)} readOnly={readOnly} />
                                <SelectField label="Tipo de Documento" value={formData.tipoDoc.id || ""} error={errors.tipoDoc} onChange={(val: string) => handleChange("tipoDoc.id", val)} options={tipoDoc} readOnly={readOnly} />
                                <InputField label="Número de Documento" value={formData.dni} error={errors.dni} onChange={(val: string) => handleChange("dni", val)} readOnly={readOnly} />
                                <SelectField label="Tipo de Persona" value={formData.tipoPersona.id || ""} error={errors.tipoPersona} onChange={(val: string) => handleChange("tipoPersona.id", val)} options={tiposPersonas} readOnly={readOnly} />
                                <SelectField label="Género" value={formData.genero.id || ""} error={errors.genero} onChange={(val: string) => handleChange("genero.id", val)} options={generos} readOnly={readOnly} />
                                <InputField label="Teléfono" value={formData.telefono} onChange={(val: string) => handleChange("telefono", val)} readOnly={readOnly} />
                                <InputField label="Dirección" value={formData.direccion} onChange={(val: string) => handleChange("direccion", val)} readOnly={readOnly} />
                                <InputField label="Código Radicador" value={formData.codigoRadicador} onChange={(val: string) => handleChange("codigoRadicador", val)} readOnly={readOnly} />
                            </div>

                            {persona?  (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-4 mb-4">Fecha de Creación y Modificación</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Fecha de Creación" value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : "Sin fecha"} onChange={(val: string) => handleChange("createdAt", val)} readOnly={true} />
                                        <InputField label="Fecha de Actualización" value={formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : "Sin fecha"} onChange={(val: string) => handleChange("updatedAt", val)} readOnly={true} />
                                    </div>
                                </div>
                            ): <div className="text-red-500 text-sm mt-2">Por favor, complete todos los campos requeridos.</div>}

                            <div className="mt-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <Checkbox
                                        checked={formData.tratamientoDatos}
                                        onCheckedChange={(val) => handleChange("tratamientoDatos", val === true)}
                                        disabled={readOnly}
                                    />
                                    Acepto el tratamiento de mis datos personales
                                </label>
                                {errors.tratamientoDatos && (
                                    <p className="text-red-500 text-xs mt-1">{errors.tratamientoDatos}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" type="button" onClick={onClose}>
                                Cerrar
                            </Button>
                            {!readOnly && <Button type="submit">{persona ? "Actualizar" : "Crear"}</Button>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

interface InputFieldProps {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
    readOnly?: boolean;
}

function InputField({
    label,
    value,
    onChange,
    type = "text",
    error,
    readOnly = false,
}: InputFieldProps) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 w-full">{label}</label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={error ? "border-red-500" : ""}
                disabled={readOnly}
                readOnly={readOnly}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

interface SelectFieldProps<T> {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    options: T[];
    displayKey?: keyof T;
    valueKey?: keyof T;
    error?: string;
    readOnly?: boolean;
}

function SelectField<T extends Record<string, any>>({
    label,
    value,
    onChange,
    options,
    displayKey = "nombre",
    valueKey = "id",
    error,
    readOnly = false,
}: SelectFieldProps<T>) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600">{label}</label>
            {readOnly ? (
                <Input
                    value={options.find((opt) => String(opt[valueKey]) === String(value))?.[displayKey] || ""}
                    disabled
                />
            ) : (
                <Select value={String(value)} onValueChange={onChange}>
                    <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={`Seleccione ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={String(opt[valueKey])} value={String(opt[valueKey])}>
                                {String(opt[displayKey])}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
