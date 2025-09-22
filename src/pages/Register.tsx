import type React from "react"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../components/ui/select"
import type { RegisterForm } from "../models/RegisterForm"
import type { TipoPersona } from "../models/TipoPersona"
import type { Genero } from "../models/Genero"
import type { TipoDoc } from "../models/TipoDoc"
import type { Municipios } from "../models/Municipios"
import type { Departamentos } from "../models/Departamentos"
import config from "../config"

const Register: React.FC = () => {
    const navigate = useNavigate()
    const apiBaseUrl = config.apiBaseUrl

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [tipoDoc, setTiposDoc] = useState<TipoDoc[]>([])
    const [municipios, setMunicipios] = useState<Municipios[]>([])
    const [departamentos, setDepartamentos] = useState<Departamentos[]>([])
    const [generos, setGeneros] = useState<Genero[]>([])
    const [tiposPersonas, setTiposPersonas] = useState<TipoPersona[]>([])
    const [alert, setAlert] = useState<string | null>(null)
    const [showAlert, setShowAlert] = useState(false)

    const form = useForm<RegisterForm>({})

    useEffect(() => {
        fetchAllData()
    }, [])

    const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
        try {
            setIsLoading(true)
            await sendData(data)
            console.log("Datos del formulario:", data)
        } catch (error) {
            console.error("Error en el registro:", error)
            setAlert("Ocurrió un error al registrarse")
            setShowAlert(true)
        } finally {
            setIsLoading(false)
        }
    }

    const sendData = async (data: RegisterForm) => {
        try {
            const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                if (response.status >= 400 && response.status < 500 && errorData?.mensaje) {
                    throw new Error(errorData.mensaje);
                }

                throw new Error("Ocurrió un error inesperado. Inténtalo más tarde.");
            }

            const result = await response.json();
            console.log("Registro exitoso:", result);
            setAlert("Registro exitoso");
            setShowAlert(true);
            setTimeout(() => navigate("/login"), 2000);

        } catch (error: any) {
            console.error("Error en el registro:", error);
            setAlert(error.message || "Ocurrió un error al registrarse");
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchData = async (
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        try {
            const response = await fetch(`${apiBaseUrl}/${endpoint}`)
            const data = await response.json()
            setter(data.data || [])
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error)
        }
    }

    const fetchAllData = async () => {
        try {
            setIsLoading(true)
            await Promise.all([
                fetchData("tipos_documentos", setTiposDoc),
                fetchData("departamentos", setDepartamentos),
                fetchData("tipos_personas", setTiposPersonas),
                fetchData("generos", setGeneros)
            ])
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMunicipios = async (departamentoId: number) => {
        try {
            const response = await fetch(`${apiBaseUrl}/municipios/municipios_departamento?departamentoId=${departamentoId}`)
            if (!response.ok) throw new Error("Error al obtener los municipios")
            const data = await response.json()
            setMunicipios(data.data)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const handleDepartamentoChange = (value: number) => {
        fetchMunicipios(value)
    }

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#0A192F] to-[#173A5E] px-4">
            <Card className="w-full max-w-4xl rounded-2xl shadow-2xl bg-white">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-[#0A192F]">
                        Registro al Sistema de PQRSD
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Complete el formulario para crear su cuenta
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-10">
                    {showAlert && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{alert}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                                {/* Información personal */}
                                <fieldset className="border-l-4 border-[#173A5E] pl-4 space-y-6">
                                    <legend className="text-xl font-semibold text-[#173A5E]">
                                        Información Personal
                                    </legend>
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Nombres */}
                                        <FormField name="nombre" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombres</FormLabel>
                                                <FormControl><Input placeholder="Ingrese sus nombres" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Apellidos */}
                                        <FormField name="apellido" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Apellidos</FormLabel>
                                                <FormControl><Input placeholder="Ingrese sus apellidos" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Género */}
                                        <FormField name="genero" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Género Biologico</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Seleccione su genero biologico" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {generos.map((g) => (
                                                            <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Tipo Documento */}
                                        <FormField name="tipoDocumento" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Documento</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Seleccione un tipo de documento" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {tipoDoc.map((t) => (
                                                            <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Documento */}
                                        <FormField name="dni" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Documento</FormLabel>
                                                <FormControl><Input placeholder="Ingrese su documento" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Tipo Persona */}
                                        <FormField name="tipoPersona" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Persona</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Seleccione un tipo de persona" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {tiposPersonas.map((tp) => (
                                                            <SelectItem key={tp.id} value={tp.id}>{tp.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Teléfono */}
                                        <FormField name="telefono" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono</FormLabel>
                                                <FormControl><Input placeholder="Ingrese su teléfono" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Departamento */}
                                        <FormField name="departamentosId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Departamento de residencia</FormLabel>
                                                <Select
                                                    onValueChange={(value) => { field.onChange(value); handleDepartamentoChange(Number(value)) }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Seleccione un departamento" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departamentos.map((d) => (
                                                            <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Municipio */}
                                        <FormField name="municipioId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Municipio de residencia</FormLabel>
                                                <Select disabled={municipios.length === 0} onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Seleccione un municipio" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {municipios.map((m) => (
                                                            <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Dirección */}
                                        <FormField name="direccion" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección</FormLabel>
                                                <FormControl><Input placeholder="Ingrese su dirección" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </fieldset>

                                {/* Información del usuario */}
                                <fieldset className="border-l-4 border-[#173A5E] pl-4 space-y-6">
                                    <legend className="text-xl font-semibold text-[#173A5E]">
                                        Información del Usuario
                                    </legend>
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Correo */}
                                        <FormField name="correo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Correo Electrónico</FormLabel>
                                                <FormControl><Input type="email" placeholder="ejemplo@correo.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {/* Contraseña */}
                                        <FormField name="contraseña" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contraseña</FormLabel>
                                                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        {/* Tratamiento de datos */}
                                        <FormField
                                            name="tratamientoDatos"
                                            rules={{ required: "Debes aceptar el tratamiento de datos personales" }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-start space-x-2 mt-4">
                                                        <FormControl>
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1"
                                                                checked={field.value}
                                                                onChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="text-sm leading-snug">
                                                            <FormLabel className="font-medium">
                                                                Acepto el{" "}
                                                                <a
                                                                    href="/politica"
                                                                    target="_blank"
                                                                    className="underline text-[#173A5E] hover:text-[#0A192F]"
                                                                >
                                                                    tratamiento de datos personales
                                                                </a>.
                                                            </FormLabel>
                                                            <FormMessage />
                                                        </div>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </fieldset>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#1E4C7C] hover:bg-[#173A5E] text-white font-semibold py-3 rounded-lg transition"
                                disabled={isLoading}
                            >
                                {isLoading ? "Cargando..." : "Registrarse"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register
