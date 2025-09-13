import { FileText, User, HelpCircle, ClipboardList, Bell } from "lucide-react"
import { useAuth } from "../../context/AuthProvider"
import Breadcrumbs from "../Navegacion/Breadcrumbs"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

const InicioUsuario: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const currentRole = location.pathname.split("/")[1]
    // Ejemplo de datos que podrías traer de tu backend
    const stats = {
        activas: 3,
        cerradas: 12,
        pendientes: 1,
    }

    return (
        <div className="flex min-h-screen w-screen bg-gray-50">
            <div className="w-full p-32">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumbs />
                        <div className="flex items-center justify-between mt-2">
                            <h1 className="text-2xl font-bold text-blue-900">Inicio</h1>
                        </div>
                    </div>

                    {/* Bienvenida */}
                    <Card className="bg-white shadow-lg rounded-2xl">
                        <CardContent>
                            <div className="flex flex-col items-center text-center space-y-6 py-6">
                                {/* Avatar */}
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
                                    Aquí podrás gestionar tus solicitudes PQRSD, hacer seguimiento y mantener toda tu
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

                    {/* Indicadores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-blue-700">{stats.activas}</p>
                                <p className="text-gray-600">Solicitudes Activas</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-green-600">{stats.cerradas}</p>
                                <p className="text-gray-600">Solicitudes Cerradas</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-orange-500">{stats.pendientes}</p>
                                <p className="text-gray-600">Pendientes de Respuesta</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Accesos rápidos */}
                    <h2 className="text-xl font-semibold text-blue-900 mt-10 mb-4">Accesos rápidos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                        <Card
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate(`/${currentRole}/peticiones`)}
                        >
                            <CardContent className="flex flex-col items-center p-6">
                                <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="font-semibold text-blue-900">Mis Solicitudes</p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => (window.location.href = "/usuario/notificaciones")}
                        >
                            <CardContent className="flex flex-col items-center p-6">
                                <Bell className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="font-semibold text-blue-900">Notificaciones</p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => (window.location.href = "/usuario/ayuda")}
                        >
                            <CardContent className="flex flex-col items-center p-6">
                                <HelpCircle className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="font-semibold text-blue-900">Centro de Ayuda</p>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Guía rápida */}
                    <h2 className="text-xl font-semibold text-blue-900 mt-10 mb-4">Guía rápida</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>1. Radica tu solicitud en la sección <b>Gestión PQRSD</b>.</li>
                        <li>2. Haz seguimiento en <b>Mis Solicitudes</b>.</li>
                        <li>3. Revisa el estado y responde observaciones si es necesario.</li>
                        <li>4. Consulta la guía de uso para más detalles.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default InicioUsuario
