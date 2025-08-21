import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import apiServiceWrapper from "../api/ApiService"
import type { TipoDocumentos } from "../models/TiposDocumentos"
import type { Generos } from "../models/Generos"
import type { TiposPersonas } from "../models/TiposPersonas"

export default function UsuarioForm({ user, onClose, onSave }: any) {
    const api = apiServiceWrapper

    const [tipoDoc, setTiposDoc] = useState<TipoDocumentos[]>([])
    const [generos, setGeneros] = useState<Generos[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [tiposPersonas, setTiposPersonas] = useState<TiposPersonas[]>([])

    const [errors, setErrors] = useState<any>({})

    const [formData, setFormData] = useState({
        correo: "",
        contrasena: "",
        isEnable: true,
        accountNoExpired: true,
        accountNoLocked: true,
        credentialNoExpired: true,
        persona: {
            nombre: "",
            apellido: "",
            dni: "",
            telefono: "",
            direccion: "",
            codigoRadicador: "",
            tratamientoDatos: true,
            tipoDoc: { id: "" },
            tipoPersona: { id: "" },
            genero: { id: "" }
        },
        rol: { id: "" }
    })

    const [catalogosListos, setCatalogosListos] = useState(false);

    useEffect(() => {
        const loadCatalogos = async () => {
            await fetchAllData();
            setCatalogosListos(true);
        };
        loadCatalogos();
    }, []);

    useEffect(() => {
        if (user && catalogosListos) {
            setFormData({
                correo: user.correo || "",
                contrasena: "",
                isEnable: user.isEnable ?? true,
                accountNoExpired: user.accountNoExpired ?? true,
                accountNoLocked: user.accountNoLocked ?? true,
                credentialNoExpired: user.credentialNoExpired ?? true,
                persona: {
                    nombre: user.persona?.nombre || "",
                    apellido: user.persona?.apellido || "",
                    dni: user.persona?.dni || "",
                    telefono: user.persona?.telefono || "",
                    direccion: user.persona?.direccion || "",
                    codigoRadicador: user.persona?.codigoRadicador || "",
                    tratamientoDatos: user.persona?.tratamientoDatos ?? false,
                    tipoDoc: { id: user.persona?.tipoDoc?.id || "" },
                    tipoPersona: { id: user.persona?.tipoPersona?.id || "" },
                    genero: { id: user.persona?.genero?.id || "" }
                },
                rol: { id: user.rol?.id || "" }
            });
        }
    }, [user, catalogosListos]);

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
        const newErrors: any = {}

        if (!formData.persona.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
        if (!formData.persona.apellido.trim()) newErrors.apellido = "El apellido es obligatorio"
        if (!formData.persona.dni.trim()) newErrors.dni = "El documento es obligatorio"
        if (!formData.correo.trim()) newErrors.correo = "El correo es obligatorio"
        if (!user && !formData.contrasena.trim()) newErrors.contrasena = "La contraseña es obligatoria"
        if (!formData.persona.tipoDoc.id) newErrors.tipoDoc = "Debe seleccionar un tipo de documento"
        if (!formData.persona.tipoPersona.id) newErrors.tipoPersona = "Debe seleccionar un tipo de persona"
        if (!formData.persona.genero.id) newErrors.genero = "Debe seleccionar un género"
        if (!formData.rol.id) newErrors.rol = "Debe seleccionar un rol"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }
        onSave(formData)
    }

    const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        try {
            const response = await api.get(endpoint)
            const data = await response.data.data
            setter(data || [])
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error)
        }
    }

    const fetchAllData = async () => {
        await Promise.all([
            fetchData("/tipos_documentos", setTiposDoc),
            fetchData("/tipos_personas", setTiposPersonas),
            fetchData("/generos", setGeneros),
            fetchData("/roles", setRoles)
        ])
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">

                <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{user ? `Editar Usuario #${user.id}` : "Nuevo Usuario"}</h2>
                    <span className="bg-white text-blue-900 font-semibold px-3 py-1 rounded-full shadow">
                        {user ? "Edición" : "Creación"}
                    </span>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {Object.keys(errors).length > 0 && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-md">
                                Por favor corrija los errores antes de continuar.
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos Personales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nombre" value={formData.persona.nombre} error={errors.nombre} onChange={(val: any) => handleChange("persona.nombre", val)} />
                                <InputField label="Apellido" value={formData.persona.apellido} error={errors.apellido} onChange={(val: any) => handleChange("persona.apellido", val)} />
                                <InputField label="Número de Documento" value={formData.persona.dni} error={errors.dni} onChange={(val: any) => handleChange("persona.dni", val)} />
                                <SelectField
                                    label="Tipo de Documento"
                                    value={String(formData.persona.tipoDoc.id || "")}
                                    error={errors.tipoDoc}
                                    onChange={(val: string) => handleChange("persona.tipoDoc.id", val ? parseInt(val) : null)}
                                    options={tipoDoc}
                                />

                                <SelectField label="Tipo de Persona" value={String(formData.persona.tipoPersona.id)} error={errors.tipoPersona} onChange={(val: any) => handleChange("persona.tipoPersona.id", parseInt(val))} options={tiposPersonas} />
                                <SelectField label="Género" value={String(formData.persona.genero.id)} error={errors.genero} onChange={(val: any) => handleChange("persona.genero.id", parseInt(val))} options={generos} />
                                <InputField label="Teléfono" value={formData.persona.telefono} onChange={(val: any) => handleChange("persona.telefono", val)} />
                                <InputField label="Dirección" value={formData.persona.direccion} onChange={(val: any) => handleChange("persona.direccion", val)} />
                                <InputField label="Código Radicador" value={formData.persona.codigoRadicador} onChange={(val: any) => handleChange("persona.codigoRadicador", val)} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos de Usuario</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Correo" type="email" value={formData.correo} error={errors.correo} onChange={(val: any) => handleChange("correo", val)} />
                                {!user && (
                                    <InputField
                                        label="Contraseña"
                                        type="password"
                                        value={formData.contrasena}
                                        error={errors.contrasena}
                                        onChange={(val: any) => handleChange("contrasena", val)}
                                    />
                                )}

                                <SelectField label="Rol" value={String(formData.rol.id)} error={errors.rol} onChange={(val: any) => handleChange("rol.id", parseInt(val))} options={roles} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Configuración</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SwitchField label="Habilitado" checked={formData.isEnable} onChange={(val: any) => handleChange("isEnable", val)} />
                                <SwitchField label="Cuenta no expirada" checked={formData.accountNoExpired} onChange={(val: any) => handleChange("accountNoExpired", val)} />
                                <SwitchField label="Cuenta no bloqueada" checked={formData.accountNoLocked} onChange={(val: any) => handleChange("accountNoLocked", val)} />
                                <SwitchField label="Credenciales no expiradas" checked={formData.credentialNoExpired} onChange={(val: any) => handleChange("credentialNoExpired", val)} />
                                <SwitchField label="Tratamiento de datos" checked={formData.persona.tratamientoDatos} onChange={(val: any) => handleChange("persona.tratamientoDatos", val)} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                            <Button type="submit">{user ? "Actualizar" : "Crear"}</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


// Componentes reutilizables con error
function InputField({ label, value, onChange, type = "text", error }: any) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 w-full">{label}</label>
            <Input type={type} value={value} onChange={e => onChange(e.target.value)} className={error ? "border-red-500" : ""} />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    )
}

function SwitchField({ label, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between border rounded p-3 w-full">
            <span className="text-sm font-medium text-gray-600">{label}</span>

            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex items-center h-6 rounded-full w-16 transition-colors duration-300 border border-gray-400
                            ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <span
                    className={`absolute left-0 ml-1 text-xs text-white transition-all duration-300 ${checked ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    Sí
                </span>
                <span
                    className={`absolute right-0 mr-1 text-xs text-white transition-all duration-300 ${checked ? 'opacity-0' : 'opacity-100'
                        }`}
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

function SelectField({ label, value, onChange, options, displayKey = "nombre", valueKey = "id", error }: any) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
                    <SelectValue placeholder={`Seleccione ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt: any) => (
                        <SelectItem key={opt[valueKey]} value={String(opt[valueKey])}>
                            {opt[displayKey]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
