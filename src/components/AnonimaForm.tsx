import type React from "react"
import { useState } from "react"
import { IoCheckmarkCircle, IoWarning } from "react-icons/io5" // Asegúrate de instalar react-icons

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

const AnonimaForm: React.FC = () => {
    const [tipo, setTipo] = useState("")
    const [asunto, setAsunto] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const response = await fetch(`${API_URL}/pq/anonima`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo, asunto, descripcion }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Error al enviar la petición")
            }

            setMessage({ text: "Petición anónima enviada correctamente", type: "success" })
            setTipo("")
            setAsunto("")
            setDescripcion("")
        } catch (error: any) {
            setMessage({ text: error.message || "No se pudo enviar la petición", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-4"
        >
            <h2 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">
                Petición Anónima
            </h2>
            <p className="text-gray-500 text-center">
                Completa los campos a continuación para enviar tu petición de forma anónima.
            </p>

            {/* Tipo */}
            <div>
                <label htmlFor="tipo" className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo
                </label>
                <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required
                    className="w-full border-gray-300 rounded-lg px-4 py-2 text-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Seleccione...</option>
                    <option value="Petición">Petición</option>
                    <option value="Queja">Queja</option>
                    <option value="Reclamo">Reclamo</option>
                    <option value="Sugerencia">Sugerencia</option>
                    <option value="Denuncia">Denuncia</option>
                    <option value="Felicitación">Felicitación</option>
                </select>
            </div>

            {/* Asunto */}
            <div>
                <label htmlFor="asunto" className="block text-sm font-semibold text-gray-700 mb-1">
                    Asunto
                </label>
                <input
                    id="asunto"
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    required
                    className="w-full border-gray-300 rounded-lg px-4 py-2 text-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-1">
                    Descripción
                </label>
                <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    rows={5}
                    className="w-full border-gray-300 rounded-lg px-4 py-2 text-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Botón */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Enviando...</span>
                    </>
                ) : (
                    "Enviar"
                )}
            </button>

            {/* Mensaje de estado */}
            {message && (
                <div
                    className={`p-4 rounded-lg flex items-center space-x-3 transition-opacity duration-300 ${message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {message.type === "success" ? (
                        <IoCheckmarkCircle className="h-6 w-6 text-green-500" />
                    ) : (
                        <IoWarning className="h-6 w-6 text-red-500" />
                    )}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}
        </form>
    )
}

export default AnonimaForm