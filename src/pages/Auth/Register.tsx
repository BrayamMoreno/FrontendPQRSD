import type React from "react"
import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../../components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../../components/ui/select"

import type { RegisterForm } from "../../models/RegisterForm"
import type { TipoPersona } from "../../models/TipoPersona"
import type { Genero } from "../../models/Genero"
import type { TipoDoc } from "../../models/TipoDoc"
import type { Municipios } from "../../models/Municipios"
import type { Departamentos } from "../../models/Departamentos"
import config from "../../config"

import fondo1 from "../../assets/fondo1.svg"
import { useAlert } from "../../context/AlertContext"
import apiServiceWrapper from "../../api/ApiService"
import type { PaginatedResponse } from "../../models/PaginatedResponse"

const Register: React.FC = () => {
    const navigate = useNavigate()
    const api = apiServiceWrapper
    const { showAlert } = useAlert()

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [tipoDoc, setTiposDoc] = useState<TipoDoc[]>([])
    const [municipios, setMunicipios] = useState<Municipios[]>([])
    const [departamentos, setDepartamentos] = useState<Departamentos[]>([])
    const [generos, setGeneros] = useState<Genero[]>([])
    const [tiposPersonas, setTiposPersonas] = useState<TipoPersona[]>([])
    const [step, setStep] = useState(1)

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
        } finally {
            setIsLoading(false)
            showAlert("Registro exitoso, redirigiendo a login...", "success")
        }
    }

    const validateForm = (data: RegisterForm): boolean => {
        const emailRegex = /\S+@\S+\.\S+/
        if (
            !data.nombre ||
            !data.apellido ||
            !data.tipoPersona ||
            !data.genero ||
            !data.tipoDocumento ||
            !data.dni ||
            !data.telefono ||
            !data.departamentosId ||
            !data.municipioId ||
            !data.correo ||
            !emailRegex.test(data.correo) ||
            !data.contraseña ||
            !data.tratamientoDatos
        ) {
            return false
        }
        return true
    }

    const sendData = async (data: RegisterForm) => {
        try {
            const isValid = validateForm(data)

            if (!isValid) {
                showAlert("Por favor, completa todos los campos correctamente.", "warning")
                return
            }

            console.log("Enviando datos al servidor:", data)
            const response = await api.post(`/auth/register`, data)

            if (!response.status || response.status < 200 || response.status >= 300) {
                showAlert("Error en el registro. Por favor, intenta nuevamente.", "error")
                throw new Error(`Error en el registro: ${response.statusText || response.status}`)
            }

            if (response.status === 201) {
                showAlert("Registro exitoso, redirigiendo a login...", "success");
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (error: any) {
            console.error("Error en el registro:", error);
        } finally {
            setIsLoading(false);
        }
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
            const params: Record<string, any> = { departamentoId }
            const response = await api.get<PaginatedResponse<Municipios>>(`/municipios/municipios_departamento`, params)
            setMunicipios(response.data || [])
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const handleDepartamentoChange = (value: number) => {
        fetchMunicipios(value)
    }

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${fondo1})` }}
            />

            <Card className="relative w-full max-w-4xl rounded-2xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="absolute left-6 top-6 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Cancelar y volver
                </Button>

                <CardHeader className="text-center space-y-2 mt-8">
                    <CardTitle className="text-3xl font-bold text-[#0A192F]">
                        Registro al Sistema de PQRSD
                    </CardTitle>
                    <CardDescription className="text-gray-600">Paso {step} de 3</CardDescription>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                            className="h-2 rounded-full bg-[#173A5E] transition-all"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 md:p-10 w-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                            <AnimatePresence mode="wait">

                                {/* STEP 1 */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6 w-full"
                                    >
                                        <h2 className="text-xl font-semibold text-[#173A5E]">Datos Personales</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                            {/* Nombre */}
                                            <FormField name="nombre" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Nombres</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese sus nombres" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Apellido */}
                                            <FormField name="apellido" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Apellidos</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese sus apellidos" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Tipo Persona */}
                                            <FormField
                                                name="tipoPersona"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>Tipo de Persona</FormLabel>
                                                        <Select
                                                            onValueChange={(v) => field.onChange(Number(v))}
                                                            value={field.value?.toString() || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccione un tipo de persona" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {tiposPersonas.map((tp) => (
                                                                    <SelectItem key={tp.id} value={tp.id.toString()}>
                                                                        {tp.nombre}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Genero */}
                                            <FormField name="genero" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Sexo Biológico</FormLabel>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione su sexo biológico" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {generos.map((g) => (
                                                                <SelectItem key={g.id} value={g.id.toString()}>
                                                                    {g.nombre}
                                                                </SelectItem>
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
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione un tipo de documento" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {tipoDoc.map((t) => (
                                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                                    {t.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Documento */}
                                            <FormField name="dni" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Documento</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese su documento" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2 */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6 w-full"
                                    >
                                        <h2 className="text-xl font-semibold text-[#173A5E]">Datos de Contacto</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                            {/* Teléfono */}
                                            <FormField name="telefono" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Teléfono</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese su teléfono" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Departamento */}
                                            <FormField name="departamentosId" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Departamento</FormLabel>
                                                    <Select
                                                        onValueChange={(v) => {
                                                            field.onChange(Number(v))
                                                            handleDepartamentoChange(Number(v))
                                                        }}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione un departamento" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {departamentos.map((d) => (
                                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                                    {d.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Municipio */}
                                            <FormField name="municipioId" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Municipio</FormLabel>
                                                    <Select
                                                        disabled={municipios.length === 0}
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione un municipio" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {municipios.map((m) => (
                                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                                    {m.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Dirección */}
                                            <FormField name="direccion" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Dirección</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese su dirección" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3 */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6 w-full"
                                    >
                                        <h2 className="text-xl font-semibold text-[#173A5E]">Datos de Usuario</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                            {/* Correo */}
                                            <FormField name="correo" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Correo Electrónico</FormLabel>
                                                    <FormControl><Input type="email" placeholder="ejemplo@correo.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            {/* Contraseña */}
                                            <FormField name="contraseña" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Contraseña</FormLabel>
                                                    <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

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
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Botones */}
                            <div className="flex justify-between mt-8 w-full">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        className="bg-gray-300 text-black hover:bg-gray-400"
                                    >
                                        Atrás
                                    </Button>
                                )}
                                {step < 3 && (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="ml-auto bg-[#1E4C7C] hover:bg-[#173A5E] text-white"
                                    >
                                        Siguiente
                                    </Button>
                                )}
                                {step === 3 && (
                                    <Button
                                        type="submit"
                                        className="ml-auto bg-[#1E4C7C] hover:bg-[#173A5E] text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Cargando..." : "Registrarse"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register
