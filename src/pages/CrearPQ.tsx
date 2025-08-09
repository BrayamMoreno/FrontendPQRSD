"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { FaArrowLeft, FaFileAlt, FaExclamationTriangle, FaComments, FaThumbsUp } from "react-icons/fa"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { useNavigate } from "react-router-dom"
import apiServiceWrapper from "../api/ApiService"
import type { TipoPQ } from "../models/TipoPQ"
import type { PQ } from "../models/PQ"
import { FormProvider } from "react-hook-form"
import axios from "axios"

const CrearPQRSDF: React.FC = () => {

  const navigate = useNavigate()
  const api = apiServiceWrapper

  const [tipoPQ, setTipoPQ] = useState<TipoPQ[]>([])

  const [formPeticion, setFormPeticion] = useState<PQ>({
    tipo_pq_id: "",
    solicitante_id: "",
    detalleAsunto: "",
    detalleDescripcion: "",
    lista_documentos: []
  })

  const [errors, setErrors] = useState<Partial<PQ>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchData("tipos_pqs", setTipoPQ),
      ])
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error)
    }
  }

  const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const response = await api.get(`/${endpoint}`)
      const data = await response.data
      setter(data.data || [])
    } catch (error) {
      console.error(`Error al obtener los datos de ${endpoint}:`, error)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<PQ> = {}

    if (!formPeticion?.tipo_pq_id) newErrors.tipo_pq_id = "El tipo es requerido"
    if (!formPeticion?.detalleAsunto?.trim()) newErrors.detalleAsunto = "El asunto es requerido"
    if (!formPeticion?.detalleDescripcion?.trim()) newErrors.detalleDescripcion = "La descripción es requerida"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleInputChange = (field: keyof PQ, value: string) => {
    setFormPeticion((prev) => ({
      ...prev!,
      [field]: value
    }))
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const usuarioId = sessionStorage.getItem("persona_id");
  formPeticion.solicitante_id = usuarioId ?? "0";

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const documentosBase64 = await Promise.all(
      formPeticion.lista_documentos.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          Nombre: file.name,
          Tipo: file.type,
          Contenido: base64
        };
      })
    );

    const payload = {
      tipo_pq_id: formPeticion.tipo_pq_id,
      solicitante_id: formPeticion.solicitante_id,
      detalleAsunto: formPeticion.detalleAsunto,
      detalleDescripcion: formPeticion.detalleDescripcion,
      lista_documentos: documentosBase64
    };
    const response = await api.post("/pqs/radicar_pq", payload);
    
    console.log(response.status)

    if(response.status === 201) {
      navigate("/dashboard");
    }
  
  } catch (error) {
    console.error("Error al enviar:", error);
    alert("Error al enviar la PQRSDF");
  } finally {
    setIsSubmitting(false);
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // O reader.readAsBinaryString(file)
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1]; // Quita el "data:..." al inicio
      resolve(base64);
    };
    reader.onerror = reject;
  });
};



    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      addFiles(files)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
    }

    const removeFile = (index: number) => {
      setFormPeticion((prev) => ({
        ...prev,
        lista_documentos: prev.lista_documentos.filter((_, i) => i !== index),
      }))
    }

    const addFiles = (files: File[]) => {
      const validFiles = files.filter((file) => {
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/jpg",
          "image/png",
        ]
        const maxSize = 10 * 1024 * 1024 // 10MB

        if (!validTypes.includes(file.type)) {
          alert(`El archivo ${file.name} no tiene un formato válido`)
          return false
        }

        if (file.size > maxSize) {
          alert(`El archivo ${file.name} es demasiado grande (máximo 10MB)`)
          return false
        }

        return true
      })

      setFormPeticion((prev) => ({
        ...prev,
        lista_documentos: [...prev.lista_documentos, ...validFiles],
      }))

    }

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
      <div className="flex min-h-screen w-screen bg-gray-100">
        {/* Contenido principal */}
        <div className="ml-14 w-full">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                  <FaArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
                <h1 className="text-2xl font-bold text-blue-900">Radicar Nueva PQRSDF</h1>
              </div>
            </div>

            {/* Información */}
            <Card className="bg-blue-50 border-blue-200 mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    i
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Información importante</h3>
                    <p className="text-sm text-blue-800">
                      Por favor complete todos los campos requeridos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900">Datos de la PQRSDF</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo de PQRSDF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-sm font-medium">
                        Tipo de PQRSDF <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formPeticion.tipo_pq_id}
                        onValueChange={(value) => handleInputChange("tipo_pq_id", value)}
                      >
                        <SelectTrigger className={errors.tipo_pq_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoPQ.map((tipo) => (
                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                              <div className="flex items-center gap-2">
                                <span>{tipo.nombre}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipo_pq_id && (
                        <p className="text-sm text-red-500">{errors.tipo_pq_id}</p>
                      )}
                    </div>

                  </div>

                  {/* Asunto */}
                  <div className="space-y-2">
                    <Label htmlFor="asunto" className="text-sm font-medium">
                      Asunto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="asunto"
                      type="text"
                      placeholder="Ingrese el asunto de su PQRSDF"
                      value={formPeticion.detalleAsunto}
                      onChange={(e) => handleInputChange("detalleAsunto", e.target.value)}
                      className={errors.detalleAsunto ? "border-red-500" : ""}
                    />
                    {errors.detalleAsunto && <p className="text-sm text-red-500">{errors.detalleAsunto}</p>}
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium">
                      Descripción detallada <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describa detalladamente su solicitud ..."
                      value={formPeticion.detalleDescripcion}
                      onChange={(e) => handleInputChange("detalleDescripcion", e.target.value)}
                      className={`min-h-32 ${errors.detalleDescripcion ? "border-red-500" : ""}`}
                    />
                    {errors.detalleDescripcion && <p className="text-sm text-red-500">{errors.detalleDescripcion}</p>}
                  </div>

                  {/* Zona de archivos */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Archivos adjuntos (opcional)</h3>

                    <div className="space-y-4">
                      {/* Dropzone */}
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => document.getElementById("file-input")?.click()}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-700">Arrastra y suelta tus archivos aquí</p>
                            <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar archivos</p>
                          </div>
                          <p className="text-xs text-gray-400">
                            Formatos permitidos: PDF, DOC, DOCX, JPG, PNG (máximo 10MB por archivo)
                          </p>
                        </div>

                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>

                      {formPeticion.lista_documentos.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
                          <div className="space-y-2">
                            {formPeticion.lista_documentos.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-blue-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={isSubmitting}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
                      {isSubmitting ? "Enviando..." : "Radicar PQRSDF"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  export default CrearPQRSDF