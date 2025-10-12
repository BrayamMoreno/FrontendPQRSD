import { useEffect, useState } from "react";
import type { HistorialEstado } from "../../models/HistorialEstado";
import { Button } from "../ui/button";

interface HistorialEstadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  historial?: HistorialEstado;
  readOnly: boolean;
  onSubmit: (data: HistorialEstadoRequest) => Promise<void>;
}

export interface HistorialEstadoRequest {
  id: number;
  numeroRadicado: string;
  estado: {
    id: number;
  };
  observacion: string;
  fechaCambio: string;
}

export default function HistorialEstadosModal({
  isOpen,
  onClose,
  historial,
  readOnly,
  onSubmit,
}: HistorialEstadosModalProps) {
  const [formData, setFormData] = useState<HistorialEstadoRequest>({
    id: 0,
    numeroRadicado: "",
    estado: { id: 0 },
    observacion: "",
    fechaCambio: "",
  });

  useEffect(() => {
    if (historial) {
      setFormData({
        id: historial.id,
        numeroRadicado: historial.numeroRadicado ?? "",
        estado: historial.estado ?? { id: 0, nombre: "" },
        observacion: historial.observacion ?? "",
        fechaCambio: historial.fechaCambio ?? "",
      });
    } else {
      setFormData({
        id: 0,
        numeroRadicado: "",
        estado: { id: 0 },
        observacion: "",
        fechaCambio: "",
      });
    }
  }, [historial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {readOnly
              ? `Ver Registro #${historial?.id ?? ""}`
              : formData.id
              ? `Editar Registro #${formData.id}`
              : "Nuevo Registro"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Número radicado */}
              <div>
                <label className="block font-semibold mb-1">
                  Número Radicado
                </label>
                <input
                  type="text"
                  value={formData.numeroRadicado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numeroRadicado: e.target.value,
                    })
                  }
                  readOnly={readOnly}
                  className={`w-full border px-3 py-2 rounded-lg ${
                    readOnly ? "bg-gray-100" : ""
                  }`}
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block font-semibold mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.estado?.id|| ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: {
                        ...formData.estado,
                        id: Number(e.target.value)  ,
                      },
                    })
                  }
                  readOnly={readOnly}
                  className={`w-full border px-3 py-2 rounded-lg ${
                    readOnly ? "bg-gray-100" : ""
                  }`}
                />
              </div>

              {/* Observación */}
              <div>
                <label className="block font-semibold mb-1">Observación</label>
                <textarea
                  value={formData.observacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      observacion: e.target.value,
                    })
                  }
                  readOnly={readOnly}
                  className={`w-full border px-3 py-2 rounded-lg h-24 ${
                    readOnly ? "bg-gray-100" : ""
                  }`}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border bg bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                {readOnly ? "Cerrar" : "Cancelar"}
              </Button>
              {!readOnly && (
                <Button
                  type="submit"
                  className="bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 font-semibold px-6 py-2 rounded-lg shadow-md"
                >
                  Guardar
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
