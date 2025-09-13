import { ClipboardCheck, UserCog, User } from "lucide-react"

import { useAuth } from "../../context/AuthProvider"
import Breadcrumbs from "../Navegacion/Breadcrumbs"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table" // Asegúrate de tener estos componentes
import { useNavigate } from "react-router-dom"

const InicioContratista: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    // Simulación de peticiones por vencer
    const peticionesPorVencer = [
        { id: 1, usuario: "Juan Pérez", tipo: "Reclamo", fecha: "2025-09-12" },
        { id: 2, usuario: "Ana Gómez", tipo: "Sugerencia", fecha: "2025-09-10" },
        { id: 3, usuario: "Carlos Ruiz", tipo: "Queja", fecha: "2025-09-11" },
    ]

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
                    <Card className="bg-white shadow-md border mb-8">
                        <CardContent className="text-center">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-md">
                                    <UserCog className="w-10 h-10 text-green-700" />
                                </div>
                                <h1 className="text-3xl font-bold text-blue-900">
                                    ¡Bienvenido
                                    {user?.persona?.nombre
                                        ? `, ${user?.persona?.nombre} ${user?.persona?.apellido}`
                                        : ""}!
                                </h1>
                                <p className="text-gray-600 max-w-xl">
                                    Desde aquí podrás gestionar y dar solución a las solicitudes PQRSD, así como administrar tu cuenta.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sección de gestión de peticiones */}
                    <Card className="bg-white shadow-md border mb-8">
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-blue-900">Peticiones Vencidas</h2>
                            </div>

                            {/* Tabla de peticiones por vencer */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Fecha Vencimiento</TableHead>
                                        <TableHead>Tiempo Vencido</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {peticionesPorVencer.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.id}</TableCell>
                                            <TableCell>{p.usuario}</TableCell>
                                            <TableCell>{p.tipo}</TableCell>
                                            <TableCell>{p.fecha}</TableCell>    
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Sección de gestión de peticiones */}
                    <Card className="bg-white shadow-md border mb-8">
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-blue-900">Peticiones Pendientes</h2>
                                <Button
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => navigate("/contratista/peticiones")}
                                >
                                    <ClipboardCheck className="w-5 h-5 mr-2" />
                                    Gestionar Solicitudes
                                </Button>
                            </div>

                            {/* Tabla de peticiones por vencer */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Fecha Vencimiento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {peticionesPorVencer.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.id}</TableCell>
                                            <TableCell>{p.usuario}</TableCell>
                                            <TableCell>{p.tipo}</TableCell>
                                            <TableCell>{p.fecha}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Sección de gestión de cuenta */}
                    <Card className="bg-white shadow-md border">
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-blue-900">Mi Cuenta</h2>
                                <Button
                                    variant="outline"
                                    className="hover:bg-gray-100"
                                    onClick={() => (window.location.href = "/contratista/perfil")}
                                >
                                    <User className="w-5 h-5 mr-2" />
                                    Editar Perfil
                                </Button>
                            </div>
                            <p className="text-gray-600">
                                Aquí puedes editar tu información personal, cambiar tu contraseña y administrar tus preferencias.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default InicioContratista
