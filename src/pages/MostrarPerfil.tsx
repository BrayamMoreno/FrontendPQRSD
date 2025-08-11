import { useEffect, useState } from "react";
import {
	UndoIcon,
	PencilIcon,
	DiscIcon,
	DeleteIcon,
	BoltIcon,
	KeyIcon,
	XIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import apiServiceWrapper from "../api/ApiService"; // Asegúrate que tienes configurado axios o fetch aquí

const MostrarPerfil: React.FC = () => {
	const navigate = useNavigate();

	const api = apiServiceWrapper

	const [iniciales, setIniciales] = useState<string>("");
	const [perfil, setPerfil] = useState<any>({});
	const [perfilBackup, setPerfilBackup] = useState<any>({});
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const nombre = sessionStorage.getItem("persona_nombre") ?? "";
		const apellido = sessionStorage.getItem("persona_apellido") ?? "";
		const tipoDocumento = sessionStorage.getItem("persona_tipoDoc_nombre") ?? "";
		const cedula = sessionStorage.getItem("persona_dni") ?? "";
		const email = sessionStorage.getItem("usuario_correo") ?? "";
		const telefono = sessionStorage.getItem("persona_telefono") ?? "";
		const direccion = sessionStorage.getItem("persona_direccion") ?? "";
		const genero = sessionStorage.getItem("persona_genero_nombre") ?? "";
		const fechaCreacion = new Date(sessionStorage.getItem("persona_createdAt") ?? "").toLocaleDateString();

		const dataPerfil = { nombre, apellido, cedula, email, telefono, direccion, genero, fechaCreacion, tipoDocumento };
		setPerfil(dataPerfil);
		setPerfilBackup(dataPerfil);

		const ini = `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase();
		setIniciales(ini);
	}, []);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setPerfil(perfilBackup);
		setIsEditing(false);
	};

	const handleChange = (field: string, value: string) => {
		setPerfil((prev: any) => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			// Ejemplo de petición PUT (ajústalo a tu endpoint real)
			await api.put(`/perfil/${perfil.cedula}`, perfil);

			// Guardar cambios en sessionStorage
			Object.keys(perfil).forEach(key => {
				sessionStorage.setItem(`persona_${key}`, perfil[key]);
			});

			setPerfilBackup(perfil);
			setIsEditing(false);
		} catch (error) {
			console.error("Error al guardar perfil:", error);
		} finally {
			setIsSaving(false);
		}
	};

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
								<DropdownMenuItem onClick={handleEdit}>
									<PencilIcon className="w-4 h-4 mr-2" /> Editar perfil
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => console.log("Cambiar contraseña")}>
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
									{ label: "Nombre", field: "nombre" },
									{ label: "Apellido", field: "apellido" },
									{ label: "Tipo de documento", field: "tipoDocumento" },
									{ label: "Cédula", field: "cedula" },
									{ label: "Correo electrónico", field: "email" },
									{ label: "Teléfono", field: "telefono" },
									{ label: "Dirección", field: "direccion" },
									{ label: "Género", field: "genero" },
									{ label: "Fecha de creación", field: "fechaCreacion" },
								].map((item, idx) => (
									<div key={idx} className="flex flex-col">
										<label className="text-sm text-gray-600 mb-1">{item.label}</label>
										<input
											type="text"
											value={perfil[item.field] || ""}
											readOnly={!isEditing || item.field === "fechaCreacion" || item.field === "cedula"}
											onChange={(e) => handleChange(item.field, e.target.value)}
											className={`border-b border-gray-300 bg-transparent focus:outline-none text-sm p-1 ${
												isEditing && item.field !== "fechaCreacion" && item.field !== "cedula"
													? "focus:border-blue-600"
													: ""
											}`}
										/>
									</div>
								))}
							</div>

							{/* Botones de acción cuando está editando */}
							{isEditing && (
								<div className="flex justify-end gap-2 mt-4">
									<Button
										variant="outline"
										onClick={handleCancel}
										disabled={isSaving}
										className="flex items-center gap-1"
									>
										<XIcon className="w-4 h-4" /> Cancelar
									</Button>
									<Button
										onClick={handleSave}
										disabled={isSaving}
										className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
									>
										<DiscIcon className="w-4 h-4" /> {isSaving ? "Guardando..." : "Guardar"}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

				</div>
			</div>
		</div>
	);
};

export default MostrarPerfil;
