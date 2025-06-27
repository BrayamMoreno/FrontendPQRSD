import type React from "react"

import { AlertCircle, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
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

  // Estados para los datos de las listas desplegables
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [tipoDoc, setTiposDoc] = useState<TipoDocumentos[]>([])
  const [municipios, setMunicipios] = useState<Municipios[]>([])
  const [departamentos, setDepartamentos] = useState<Departamentos[]>([])
  const [generos, setGeneros] = useState<Generos[]>([])
  const [tiposPersonas, setTiposPersonas] = useState<TiposPersonas[]>([])
  const [alert, setAlert] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  const [Check, setCheck] = useState(false)
  const form = useForm<RegisterForm>();

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
      }
        , 2000)
    } catch (error) {
      console.error("Error en el registro:", error)
      setAlert("Ocurrió un error al registrarse")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }



  // Función para obtener datos de la API
  const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${endpoint}`)
      const data = await response.json()
      setter(data.data || [])
    } catch (error) {
      console.error(`Error al obtener los datos de ${endpoint}:`, error)
    }
  }

  // Cargar todos los datos necesarios
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

  // Cargar municipios cuando cambia el departamento
  const fetchMunicipios = async (departamentoId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/municipios/mpd_data?departamentoId=${departamentoId}`)
      if (!response.ok) {
        throw new Error("Error al obtener los municipios")
      }
      const data = await response.json()
      setMunicipios(data.data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Manejar el cambio de departamento
  const handleDepartamentoChange = (value: string) => {
    fetchMunicipios(value)
  }


  return (
    <div className=" bg-gray-200 relative flex w-screen h-screen justify-center items-center ">
      <div className="flex min-w-screen">
        <Card className="max-h mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Registro Para El Sistema De PQRSD</CardTitle>
            <CardDescription>Complete el formulario para crear su cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            {showAlert && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <div>
                  <h3 className="text-lg font-medium">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Información del Usuario</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
                  {isLoading ? "Cargando..." : "Registrarse"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;