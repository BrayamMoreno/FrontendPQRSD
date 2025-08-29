import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import apiServiceWrapper from "../api/ApiService"
import type { TipoDoc } from "../models/TipoDoc"
import type { Genero } from "../models/Genero"
import type { TipoPersona } from "../models/TipoPersona"
import type { Usuario } from "../models/Usuario"
import type { PaginatedResponse } from "../models/PaginatedResponse"
import { set } from "react-hook-form"
import type { Rol } from "../models/Rol"

interface UsuarioFormProps {
  usuario?: Usuario;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
  readOnly?: boolean;
}

export default function UsuarioForm({ usuario, onClose, onSave, readOnly = false }: UsuarioFormProps) {
    const api = apiServiceWrapper

    const [tipoDoc, setTiposDoc] = useState<TipoDoc[]>([])
    const [generos, setGeneros] = useState<Genero[]>([])
    const [roles, setRoles] = useState<Rol[]>([])
    const [tiposPersonas, setTiposPersonas] = useState<TipoPersona[]>([])

    const [errors, setErrors] = useState<Record<string, string>>({})

    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState<Usuario>({
        id: 0,
        correo: "",
        contrasena: "",
        isEnable: false,
        accountNoExpired: true,
        accountNoLocked: true,
        credentialNoExpired: true,
        resetToken: null,
        persona: {
            id: 0,
            nombre: "",
            apellido: "",
            codigoRadicador: "",
            tipoDoc: { id: "", nombre: "" },
            dni: "",
            tipoPersona: { id: "", nombre: "" },
            telefono: "",
            direccion: "",
            tratamientoDatos: false,
            genero: { id: "", nombre: "" },
            createdAt: "",
            updatedAt: "",
            correoUsuario: ""
        },
        rol: {
            id: 0,
            nombre: "",
            descripcion: "",
            createdAt: "",
            updatedAt: "",
            permisos: []
        },
        createdAt: "",
        updatedAt: null,
    });

    const [catalogosListos, setCatalogosListos] = useState(false);

    useEffect(() => {
        const loadCatalogosYUser = async () => {
            setIsLoading(true);
            try {
                await fetchAllData();
                setCatalogosListos(true);

                if (usuario) {
                    setFormData({
                        id: usuario.id ?? 0,
                        correo: usuario.correo ?? "",
                        contrasena: "",
                        isEnable: usuario.isEnable ?? true,
                        accountNoExpired: usuario.accountNoExpired ?? true,
                        accountNoLocked: usuario.accountNoLocked ?? true,
                        credentialNoExpired: usuario.credentialNoExpired ?? true,
                        resetToken: usuario.resetToken ?? null,
                        persona: {
                            id: usuario.persona?.id ?? 0,
                            nombre: usuario.persona?.nombre ?? "",
                            apellido: usuario.persona?.apellido ?? "",
                            correoUsuario: usuario.persona?.correoUsuario ?? "",
                            dni: usuario.persona?.dni ?? "",
                            telefono: usuario.persona?.telefono ?? "",
                            direccion: usuario.persona?.direccion ?? "",
                            codigoRadicador: usuario.persona?.codigoRadicador ?? "",
                            tratamientoDatos: usuario.persona?.tratamientoDatos ?? false,
                            tipoDoc: {
                                id: usuario.persona?.tipoDoc?.id ?? "",
                                nombre: usuario.persona?.tipoDoc?.nombre ?? ""
                            },
                            tipoPersona: {
                                id: usuario.persona?.tipoPersona?.id ?? "",
                                nombre: usuario.persona?.tipoPersona?.nombre ?? ""
                            },
                            genero: {
                                id: usuario.persona?.genero?.id ?? "",
                                nombre: usuario.persona?.genero?.nombre ?? ""
                            },
                            createdAt: usuario.persona?.createdAt ?? "",
                            updatedAt: usuario.persona?.updatedAt ?? ""
                        },
                        rol: {
                            id: usuario.rol?.id ?? 0,
                            nombre: usuario.rol?.nombre ?? "",
                            descripcion: usuario.rol?.descripcion ?? "",
                            createdAt: usuario.rol?.createdAt ?? "",
                            updatedAt: usuario.rol?.updatedAt ?? "",
                            permisos: usuario.rol?.permisos ?? []
                        },
                        createdAt: usuario.createdAt ?? "",
                        updatedAt: usuario.updatedAt ?? null
                    });
                }
            } catch (error) {
                console.error("Error al cargar usuario y catálogos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCatalogosYUser();
    }, [usuario]);

    const handleChange = (path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split(".")
            const updated = { ...prev }
            let obj: any = updated
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = { ...obj[keys[i]] }
                obj = obj[keys[i]]
            }
            obj[keys[keys.length - 1]] = value
            return updated
        })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.persona.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
        if (!formData.persona.apellido.trim()) newErrors.apellido = "El apellido es obligatorio"
        if (!formData.persona.dni.trim()) newErrors.dni = "El documento es obligatorio"
        if (!formData.correo.trim()) newErrors.correo = "El correo es obligatorio"
        if (!usuario && !formData.contrasena.trim()) newErrors.contrasena = "La contraseña es obligatoria"
        if (!formData.persona.tipoDoc.id) newErrors.tipoDoc = "Debe seleccionar un tipo de documento"
        if (!formData.persona.tipoPersona.id) newErrors.tipoPersona = "Debe seleccionar un tipo de persona"
        if (!formData.persona.genero.id) newErrors.genero = "Debe seleccionar un género"
        if (!formData.rol.id) newErrors.rol = "Debe seleccionar un rol"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }
        onSave(formData)
    }

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

    const fetchAllData = async () => {
        await Promise.all([
            fetchData<TipoDoc>("/tipos_documentos", setTiposDoc),
            fetchData<TipoPersona>("/tipos_personas", setTiposPersonas),
            fetchData<Genero>("/generos", setGeneros),
            fetchData<Rol>("/roles", setRoles)
        ])
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <span className="text-white">Cargando...</span>
                    </div>
                )}

                <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {usuario ? (readOnly ? `Ver Usuario #${usuario.id}` : `Editar Usuario #${usuario.id}`) : "Nuevo Usuario"}
                    </h2>
                    <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                        {readOnly ? "Solo lectura" : usuario ? "Edición" : "Creación"}
                    </span>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {!readOnly && Object.keys(errors).length > 0 && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-md">
                                Por favor corrija los errores antes de continuar.
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos Personales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nombre" value={formData.persona.nombre} error={errors.nombre} onChange={(val: string) => handleChange("persona.nombre", val)} readOnly={readOnly} />
                                <InputField label="Apellido" value={formData.persona.apellido} error={errors.apellido} onChange={(val: string) => handleChange("persona.apellido", val)} readOnly={readOnly} />
                                <InputField label="Número de Documento" value={formData.persona.dni} error={errors.dni} onChange={(val: string) => handleChange("persona.dni", val)} readOnly={readOnly} />
                                <SelectField
                                    label="Tipo de Documento"
                                    value={String(formData.persona.tipoDoc.id || "")}
                                    error={errors.tipoDoc}
                                    readOnly={readOnly}
                                    onChange={(val: string) => handleChange("persona.tipoDoc.id", val ? parseInt(val) : null)}
                                    options={tipoDoc}
                                />

                                <SelectField label="Tipo de Persona" value={String(formData.persona.tipoPersona.id)} error={errors.tipoPersona} onChange={(val: string) => handleChange("persona.tipoPersona.id", parseInt(val))} options={tiposPersonas} readOnly={readOnly} />
                                <SelectField label="Género" value={String(formData.persona.genero.id)} error={errors.genero} onChange={(val: string) => handleChange("persona.genero.id", parseInt(val))} options={generos} readOnly={readOnly} />
                                <InputField label="Teléfono" value={formData.persona.telefono} onChange={(val: string) => handleChange("persona.telefono", val)} readOnly={readOnly} />
                                <InputField label="Dirección" value={formData.persona.direccion} onChange={(val: string) => handleChange("persona.direccion", val)} readOnly={readOnly} />
                                <InputField label="Código Radicador" value={formData.persona.codigoRadicador} onChange={(val: string) => handleChange("persona.codigoRadicador", val)} readOnly={readOnly} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos de Usuario</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Correo" type="email" value={formData.correo} error={errors.correo} onChange={(val: string) => handleChange("correo", val)} readOnly={readOnly} />
                                {!usuario && (
                                    <InputField
                                        label="Contraseña"
                                        type="password"
                                        value={formData.contrasena}
                                        error={errors.contrasena}
                                        onChange={(val: string) => handleChange("contrasena", val)}
                                        readOnly={readOnly}
                                    />
                                )}

                                <SelectField label="Rol" value={String(formData.rol.id)} error={errors.rol} onChange={(val: string) => handleChange("rol.id", parseInt(val))} options={roles} readOnly={readOnly} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Configuración</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SwitchField label="Habilitado" checked={formData.isEnable} onChange={(val: boolean) => handleChange("isEnable", val)} readOnly={readOnly} />
                                <SwitchField label="Cuenta no expirada" checked={formData.accountNoExpired} onChange={(val: boolean) => handleChange("accountNoExpired", val)} readOnly={readOnly} />
                                <SwitchField label="Cuenta no bloqueada" checked={formData.accountNoLocked} onChange={(val: boolean) => handleChange("accountNoLocked", val)} readOnly={readOnly} />
                                <SwitchField label="Credenciales no expiradas" checked={formData.credentialNoExpired} onChange={(val: boolean) => handleChange("credentialNoExpired", val)} readOnly={readOnly} />
                                <SwitchField label="Tratamiento de datos" checked={formData.persona.tratamientoDatos} onChange={(val: boolean) => handleChange("persona.tratamientoDatos", val)} readOnly={readOnly} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" type="button" onClick={onClose}>Cerrar</Button>
                            {!readOnly && <Button type="submit">{usuario ? "Actualizar" : "Crear"}</Button>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
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

function SwitchField({ label, checked, onChange, readOnly = false }: any) {
    return (
        <div className={`flex items-center justify-between border rounded p-3 w-full ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm font-medium text-gray-600">{label}</span>

            <button
                type="button"
                onClick={() => {
                    if (!readOnly) onChange(!checked);
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-16 transition-colors duration-300 border border-gray-400
                    ${checked ? 'bg-green-500' : 'bg-gray-300'}
                    ${readOnly ? 'pointer-events-none' : ''}`}
            >
                <span
                    className={`absolute left-0 ml-1 text-xs text-white transition-all duration-300 ${checked ? 'opacity-100' : 'opacity-0'}`}
                >
                    Sí
                </span>
                <span
                    className={`absolute right-0 mr-1 text-xs text-white transition-all duration-300 ${checked ? 'opacity-0' : 'opacity-100'}`}
                >
                    No
                </span>
                <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform duration-300
                        ${checked ? 'translate-x-5' : '-translate-x-4'}`}
                />
            </button>
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

