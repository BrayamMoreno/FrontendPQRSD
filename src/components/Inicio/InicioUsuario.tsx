import { FileText, User, HelpCircle } from "lucide-react"

import { useAuth } from "../../context/AuthProvider"
import Breadcrumbs from "../Navegacion/Breadcrumbs"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"

const InicioUsuario: React.FC = () => {
    const { user } = useAuth()

    return (
        <div className="flex min-h-screen w-screen bg-gray-50">
            <div className="w-full p-32">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        {/* Breadcrumbs arriba */}
                        <Breadcrumbs />

                        {/* Contenedor de título y botón */}
                        <div className="flex items-center justify-between mt-2">
                            <h1 className="text-2xl font-bold text-blue-900">Inicio</h1>
                        </div>
                    </div>

                    {/* Bienvenida */}
                    <Card className="bg-white shadow-md border">
                        <CardContent>
                            <div className="flex flex-col items-center text-center space-y-6 h-200">

                                {/* Ícono principal */}
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
                                    <User className="w-10 h-10 text-blue-700" />
                                </div>

                                {/* Título */}
                                <h1 className="text-3xl font-bold text-blue-900">
                                    ¡Bienvenido
                                    {user?.persona?.nombre ? `, ${user?.persona?.nombre} ${user?.persona?.apellido}` : ""}!
                                </h1>

                                {/* Subtítulo */}
                                <p className="text-gray-600 max-w-xl">
                                    Aquí podrás gestionar tus solicitudes PQRSDF, hacer seguimiento y mantener toda tu
                                    información organizada en un solo lugar.
                                </p>

                                {/* Acciones principales */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => (window.location.href = "/usuario/gestion_pqs")}
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Radicar mi Solicitud
                                    </Button>
                                    <Button variant="outline" className="hover:bg-gray-100">
                                        <HelpCircle className="w-5 h-5 mr-2" />
                                        Ver guía de uso
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}

export default InicioUsuario
