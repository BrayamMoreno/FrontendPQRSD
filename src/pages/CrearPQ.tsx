"use client";
import React, { useState, useEffect } from "react";
import apiServiceWrapper from "../api/ApiService";
import { Button } from "../components/ui/button";

const CrearPQRSDF: React.FC = () => {
  
  const api = apiServiceWrapper

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formPeticion, setFormPeticion] = useState({
    tipo_pq_id: "",
    solicitante_id: "",
    detalleAsunto: "",
    detalleDescripcion: "",
    lista_documentos: [] as File[],
  });

  const validateForm = () => {
    if (!formPeticion.tipo_pq_id || !formPeticion.detalleAsunto || !formPeticion.detalleDescripcion) {
      alert("Todos los campos son obligatorios");
      return false;
    }
    return true;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
          return { Nombre: file.name, Tipo: file.type, Contenido: base64 };
        })
      );

      const payload = {
        tipo_pq_id: formPeticion.tipo_pq_id,
        solicitante_id: formPeticion.solicitante_id,
        detalleAsunto: formPeticion.detalleAsunto,
        detalleDescripcion: formPeticion.detalleDescripcion,
        lista_documentos: documentosBase64,
      };

      const response = await api.post("/pqs/radicar_pq", payload);

      if (response.status === 201) {
        setSelectedSolicitud(response.data.data);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Error al enviar la PQRSDF");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-screen bg-gray-100 p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl"
        >
          <h2 className="text-2xl font-bold mb-4">Crear PQRSDF</h2>

          <label className="block mb-2">Tipo de PQRSDF</label>
          <input
            type="text"
            value={formPeticion.tipo_pq_id}
            onChange={(e) => setFormPeticion({ ...formPeticion, tipo_pq_id: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block mb-2">Asunto</label>
          <input
            type="text"
            value={formPeticion.detalleAsunto}
            onChange={(e) => setFormPeticion({ ...formPeticion, detalleAsunto: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block mb-2">Descripción</label>
          <textarea
            value={formPeticion.detalleDescripcion}
            onChange={(e) => setFormPeticion({ ...formPeticion, detalleDescripcion: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          ></textarea>

          <label className="block mb-2">Documentos adjuntos</label>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setFormPeticion({ ...formPeticion, lista_documentos: Array.from(e.target.files || []) })
            }
            className="mb-4"
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </div>

    
    </>
  );
};

export default CrearPQRSDF;
