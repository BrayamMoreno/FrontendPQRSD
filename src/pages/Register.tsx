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
import { Separator } from "../components/ui/separator"
import type { RegisterForm } from "../models/RegisterForm"
import type { TiposPersonas } from "../models/TiposPersonas"
import type { Generos } from "../models/Generos"
import type { TipoDocumentos } from "../models/TiposDocumentos"
import type { Municipios } from "../models/Municipios"
import type { Departamentos } from "../models/Departamentos"
import config from "../config"

const Register: React.FC = () => {
  const navigate = useNavigate()
  const apiBaseUrl = config.apiBaseUrl

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [tipoDoc, setTiposDoc] = useState<TipoDocumentos[]>([])
  const [municipios, setMunicipios] = useState<Municipios[]>([])
  const [departamentos, setDepartamentos] = useState<Departamentos[]>([])
  const [generos, setGeneros] = useState<Generos[]>([])
  const [tiposPersonas, setTiposPersonas] = useState<TiposPersonas[]>([])
  const [alert, setAlert] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  const form = useForm<RegisterForm>({

  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    try {
      setIsLoading(true)
      sendData(data)
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error("Error al registrar el usuario")
      }
      const result = await response.json()
      console.log("Registro exitoso:", result)
      setAlert("Registro exitoso")
      setShowAlert(true)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      console.error("Error en el registro:", error)
      setAlert("Ocurrió un error al registrarse")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

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

  const fetchMunicipios = async (departamentoId: string) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/municipios/mpd_data?departamentoId=${departamentoId}`
      )
      if (!response.ok) {
        throw new Error("Error al obtener los municipios")
      }
      const data = await response.json()
      setMunicipios(data.data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDepartamentoChange = (value: string) => {
    fetchMunicipios(value)
  }

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Registro al Sistema de PQRSD</CardTitle>
          <CardDescription>
            Complete el formulario para crear su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAlert && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información personal */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombres */}
                  <FormField
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombres</FormLabel>
                        <FormControl>
                          <Input
                            className="text-black"
                            placeholder="Ingrese sus nombres"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Apellidos */}
                  <FormField
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input
                            className="text-black"
                            placeholder="Ingrese sus apellidos"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Género */}
                  <FormField
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {generos.map((genero) => (
                              <SelectItem key={genero.id} value={String(genero.id)}>
                                {genero.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Tipo Documento */}
                  <FormField
                    name="tipoDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tipoDoc.map((tipo) => (
                              <SelectItem key={tipo.id} value={String(tipo.id)}>
                                {tipo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Documento */}
                  <FormField
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese su documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Tipo de Persona */}
                  <FormField
                    name="tipoPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Persona</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo de persona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposPersonas.map((tipo) => (
                              <SelectItem key={tipo.id} value={String(tipo.id)}>
                                {tipo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Teléfono */}
                  <FormField
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese su teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Departamento */}
                  <FormField
                    name="departamentosId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleDepartamentoChange(value)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departamentos.map((dep) => (
                              <SelectItem key={dep.id} value={String(dep.id)}>
                                {dep.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Municipio */}
                  <FormField
                    name="municipioId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio</FormLabel>
                        <Select
                          disabled={municipios.length === 0}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un municipio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {municipios.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Dirección */}
                  <FormField
                    name="direccion"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese su dirección" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Información del usuario */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Información del Usuario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Correo */}
                  <FormField
                    name="correo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Contraseña */}
                  <FormField
                    name="contraseña"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Tratamiento de datos */}
              <FormField
                name="aceptaTratamientoDatos"
                rules={{ required: "Debes aceptar el tratamiento de datos personales" }}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <div className="flex items-start space-x-2">
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
                            className="underline text-blue-600 hover:text-blue-800"
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

              {/* Botón de registro */}
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-md mt-4"
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
