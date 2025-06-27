// Register.tsx
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
  CardTitle,
} from "../components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"

import type { RegisterForm } from "../models/RegisterForm"
import type { TiposPersonas } from "../models/TiposPersonas"
import type { Generos } from "../models/Generos"
import type { TipoDocumentos } from "../models/TiposDocumentos"
import type { Municipios } from "../models/Municipios"
import type { Departamentos } from "../models/Departamentos"
import config from "../config"

const RegisterTest: React.FC = () => {
  const navigate = useNavigate()
  const apiBaseUrl = config.apiBaseUrl

  const [isLoading, setIsLoading] = useState(true)
  const [tipoDoc, setTiposDoc] = useState<TipoDocumentos[]>([])
  const [municipios, setMunicipios] = useState<Municipios[]>([])
  const [departamentos, setDepartamentos] = useState<Departamentos[]>([])
  const [generos, setGeneros] = useState<Generos[]>([])
  const [tiposPersonas, setTiposPersonas] = useState<TiposPersonas[]>([])
  const [alert, setAlert] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  const form = useForm<RegisterForm>()

  useEffect(() => {
    fetchAllData()
  }, [])

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
        fetchData("generos", setGeneros),
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
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-4xl p-6 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Registro en PQRSD</CardTitle>
          <CardDescription className="text-gray-500">
            Complete el formulario para crear su cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showAlert && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Información Personal */}
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ... todos los campos personales aquí ... */}
                  <FormField
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombres</FormLabel>
                        <FormControl>
                          <Input
                            className="text-black"
                            type="text"
                            placeholder="Ingrese sus nombres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input
                            className="text-black"
                            type="text"
                            placeholder="Ingrese sus apellidos  " {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl >
                            <SelectTrigger className="w-full min-w-[262.56px]">
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

                  <FormField
                    name="tipoDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl >
                            <SelectTrigger className="w-full min-w-[262.56px]">
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

                  <FormField
                    name="tipoPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Persona</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl >
                            <SelectTrigger className="w-full min-w-[262.56px]">
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

                  <FormField
                    name="departamentosId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select onValueChange={(value) => handleDepartamentoChange(value)} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full min-w-[262.56px]">
                              <SelectValue placeholder="Seleccione un departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departamentos.map((departamento) => (
                              <SelectItem key={departamento.id} value={String(departamento.id)}>
                                {departamento.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectTrigger className="w-full min-w-[262.56px]">
                              <SelectValue placeholder="Seleccione un municipio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {municipios.map((municipio) => (
                              <SelectItem key={municipio.id} value={String(municipio.id)}>
                                {municipio.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

              {/* Información del Usuario */}
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">Información del Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ... todos los campos de cuenta aquí ... */}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6">
              Registrarse
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterTest