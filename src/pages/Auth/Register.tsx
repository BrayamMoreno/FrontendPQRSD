import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
import type { PaginatedResponse } from "../../models/PaginatedResponse"

import fondo1 from "../../assets/fondo1.svg"
import { useAlert } from "../../context/AlertContext"
import apiServiceWrapper from "../../api/ApiService"

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

    const form = useForm<RegisterForm>({
        defaultValues: {
            nombre: "",
            apellido: "",
            tipoPersona: "",
            genero: "",
            tipoDocumento: "",
            departamentosId: "",
            municipioId: "",
            tratamientoDatos: false,
        },
    })

    useEffect(() => {
        fetchAllData()
    }, [])

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

            const response = await api.post(`/auth/register`, data)
            if (!response.status || response.status < 200 || response.status >= 300) {
                showAlert("Error en el registro. Por favor, intenta nuevamente.", "error")
                throw new Error(`Error en el registro: ${response.statusText || response.status}`)
            }

            if (response.status === 201) {
                showAlert("Registro exitoso, redirigiendo a login...", "success")
                setTimeout(() => navigate("/login"), 2000)
            }
        } catch (error: any) {
            console.error("Error en el registro:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ): Promise<void> => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint)
            const result = response.data ?? []
            setter(result)
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

    const [showPassword, setShowPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState<"Débil" | "Media" | "Fuerte" | "">("")

    const checkPasswordStrength = (password: string) => {
        let strength: "Débil" | "Media" | "Fuerte" | "" = ""
        const hasLower = /[a-z]/.test(password)
        const hasUpper = /[A-Z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSymbol = /[^A-Za-z0-9]/.test(password)

        if (password.length < 6) strength = "Débil"
        else if (hasLower && hasUpper && hasNumber && hasSymbol && password.length >= 8) strength = "Fuerte"
        else strength = "Media"

        setPasswordStrength(strength)
    }

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gray-50 flex flex-col items-center justify-center px-4 py-6 sm:px-8">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                style={{ backgroundImage: `url(${fondo1})` }}
            />

            <Card className="relative w-full max-w-3xl rounded-2xl shadow-lg bg-white overflow-y-auto max-h-[95vh] md:max-h-[90vh]">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="absolute left-4 top-4 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Cancelar y volver
                </Button>

                <CardHeader className="text-center sticky top-0 bg-white z-10 border-b space-y-2 py-4">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-[#0A192F]">
                        Registro al Sistema de PQRSD
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm sm:text-base">
                        Paso {step} de 3
                    </CardDescription>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                            className="h-2 rounded-full bg-[#173A5E] transition-all"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-10 w-full">
                    <Form {...form}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                sendData(form.getValues())
                            }}
                            className="w-full"
                        >
                            <AnimatePresence mode="wait">
                                {/** ================= STEP 1 ================= **/}
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
                                            <FormField name="nombre" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Nombres</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese sus nombres" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="apellido" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Apellidos</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese sus apellidos" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="tipoPersona" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Tipo de Persona</FormLabel>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl className="w-full">
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
                                            )} />
                                            <FormField name="genero" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Sexo Biológico</FormLabel>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl className="w-full">
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
                                            <FormField name="tipoDocumento" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Tipo de Documento</FormLabel>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl className="w-full">
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
                                            <FormField name="dni" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Documento</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese su documento" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </motion.div>
                                )}

                                {/** ================= STEP 2 ================= **/}
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
                                            <FormField name="telefono" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Teléfono</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese su teléfono" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="departamentosId" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Departamento</FormLabel>
                                                    <Select
                                                        onValueChange={(v) => {
                                                            field.onChange(Number(v))
                                                            handleDepartamentoChange(Number(v))
                                                        }}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl className="w-full">
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
                                            <FormField name="municipioId" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Municipio</FormLabel>
                                                    <Select
                                                        disabled={municipios.length === 0}
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <FormControl className="w-full">
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
                                            <FormField name="direccion" render={({ field }) => (
                                                <FormItem className="w-full mb-2">
                                                    <FormLabel>Dirección</FormLabel>
                                                    <FormControl><Input placeholder="Ingrese su dirección" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </motion.div>
                                )}

                                {/** ================= STEP 3 ================= **/}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="space-y-8 w-full max-w-2xl mx-auto"
                                    >
                                        <div className="grid grid-cols-1 gap-6 w-full">
                                            <FormField name="correo" render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Correo Electrónico</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="tucorreo@ejemplo.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField
                                                name="contraseña"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>Contraseña</FormLabel>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Mínimo 8 caracteres"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        field.onChange(e)
                                                                        checkPasswordStrength(e.target.value)
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword((prev) => !prev)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-[#173A5E]"
                                                            >
                                                                {showPassword ? "🙈" : "👁️"}
                                                            </button>
                                                        </div>

                                                        <div className="mt-2">
                                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-2 transition-all duration-500 ${
                                                                        passwordStrength === "Débil"
                                                                            ? "bg-red-500 w-1/3"
                                                                            : passwordStrength === "Media"
                                                                                ? "bg-yellow-500 w-2/3"
                                                                                : passwordStrength === "Fuerte"
                                                                                    ? "bg-green-500 w-full"
                                                                                    : "w-0"
                                                                    }`}
                                                                />
                                                            </div>
                                                            <p className={`text-xs mt-1 font-medium ${
                                                                passwordStrength === "Débil"
                                                                    ? "text-red-500"
                                                                    : passwordStrength === "Media"
                                                                        ? "text-yellow-500"
                                                                        : passwordStrength === "Fuerte"
                                                                            ? "text-green-500"
                                                                            : "text-gray-500"
                                                            }`}>
                                                                Fortaleza: {passwordStrength || "Escribe una contraseña"}
                                                            </p>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-center mt-8 w-full">
                                {step > 1 && (
                                    <Button variant="outline" type="button" onClick={prevStep}>
                                        Atrás
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep} className="ml-auto bg-[#173A5E] text-white">
                                        Siguiente
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isLoading} className="ml-auto bg-[#173A5E] text-white">
                                        {isLoading ? "Registrando..." : "Registrar"}
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
