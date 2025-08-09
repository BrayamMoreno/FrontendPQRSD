import { useEffect, useState } from "react"
import {
	UndoIcon,
	PencilIcon,
	DiscIcon,
	DeleteIcon,
	BoltIcon,
	KeyIcon
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "../components/ui/dropdown-menu"

const MostrarPerfil: React.FC = () => {
	const navigate = useNavigate()

	const [iniciales, setIniciales] = useState<string>("")
	const [perfil, setPerfil] = useState<any>({})

	useEffect(() => {
		const nombre = sessionStorage.getItem("persona_nombre") ?? ""
		const apellido = sessionStorage.getItem("persona_apellido") ?? ""
		const tipoDocumento = sessionStorage.getItem("persona_tipoDoc_nombre") ?? ""
		const cedula = sessionStorage.getItem("persona_dni") ?? ""
		const email = sessionStorage.getItem("usuario_correo") ?? ""
		const telefono = sessionStorage.getItem("persona_telefono") ?? ""
		const direccion = sessionStorage.getItem("persona_direccion") ?? ""
		const genero = sessionStorage.getItem("persona_genero_nombre") ?? ""
		const fechaCreacion = new Date(sessionStorage.getItem("persona_createdAt") ?? "").toLocaleDateString()

		setPerfil({ nombre, apellido, cedula, email, telefono, direccion, genero, fechaCreacion, tipoDocumento })

		const ini = `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase()
		setIniciales(ini)
	}, [])

	return (
		<div className="flex min-h-screen w-screen bg-gray-100">
			<div className="ml-14 w-full">
				<div className="max-w-4xl mx-auto p-6 space-y-6">

					{/* Cabecera del perfil */}
					<Card className="shadow-sm">
						<CardContent className="flex items-center justify-between p-4">
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 rounded-full bg-blue-800 text-white flex items-center justify-center text-xl font-bold">
									{iniciales}
								</div>
								<div>
									<h2 className="text-xl font-bold text-blue-900">
										{perfil.nombre} {perfil.apellido}
									</h2>
									<p className="text-sm text-gray-600">Perfil del usuario</p>
								</div>
							</div>
							<Button variant="outline" onClick={() => navigate("/dashboard")}>
								<UndoIcon className="w-4 h-4 mr-1" />
								Volver
							</Button>
						</CardContent>
					</Card>

					{/* Menú de opciones */}
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="default" className="bg-blue-700 hover:bg-blue-800 text-white">
									<BoltIcon className="w-4 h-4 mr-2" />
									Opciones de Perfil
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuLabel>Acciones rápidas</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => console.log("Editar perfil")}>
									<PencilIcon className="w-4 h-4 mr-2" /> Editar perfil
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => console.log("Guardar cambios")}>
									<KeyIcon className="w-4 h-4 mr-2" /> Cambiar contraseña
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => console.log("Eliminar cuenta")} className="text-red-600">
									<DeleteIcon className="w-4 h-4 mr-2" /> Eliminar cuenta
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Información en 2 columnas */}
					<Card className="shadow-sm">
						<CardContent className="p-6 space-y-4">
							<h3 className="text-lg font-semibold text-blue-900 mb-4">INFORMACIÓN DEL PERFIL</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{[
									{ label: "Nombre", value: perfil.nombre },
									{ label: "Apellido", value: perfil.apellido },
									{ label: "Tipo de documento", value: perfil.tipoDocumento },
									{ label: "Cédula", value: perfil.cedula },
									{ label: "Correo electrónico", value: perfil.email },
									{ label: "Teléfono", value: perfil.telefono },
									{ label: "Dirección", value: perfil.direccion },
									{ label: "Género", value: perfil.genero },
									{ label: "Fecha de creación", value: perfil.fechaCreacion },
								].map((item, idx) => (
									<div key={idx} className="flex flex-col">
										<label className="text-sm text-gray-600 mb-1">{item.label}</label>
										<input
											type="text"
											value={item.value}
											readOnly
											className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-600 text-sm p-1"
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>


				</div>
			</div>
		</div>
	)
}

export default MostrarPerfil
