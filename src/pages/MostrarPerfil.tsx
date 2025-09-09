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
import { useAuth } from "../context/AuthProvider";
import Breadcrumbs from "../components/Navegacion/Breadcrumbs";

const MostrarPerfil: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const api = apiServiceWrapper

	const [iniciales, setIniciales] = useState<string>("");
	const [perfil, setPerfil] = useState<any>({});
	const [perfilBackup, setPerfilBackup] = useState<any>({});
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const nombre = user?.persona.nombre;
		const apellido = user?.persona.apellido;
		const tipoDocumento = user?.persona.tipoDoc.nombre;
		const cedula = user?.persona.dni;
		const email = user?.correo;
		const telefono = user?.persona.telefono;
		const direccion = user?.persona.direccion;
		const genero = user?.persona.genero.nombre;
		const fechaCreacion = new Date(user?.createdAt ?? "").toLocaleDateString();

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
		<div className="flex min-h-screen w-screen bg-gray-50">
			<div className="w-full pt-32 px-8">
				<div className="max-w-7xl mx-auto">

					{/* Breadcrumbs arriba */}
					<div className="flex items-center mb-2">
						<Breadcrumbs />
					</div>

					{/* Grid de columnas */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

						{/* Columna izquierda */}
						<div className="col-span-1 space-y-6">
							{/* Cabecera perfil */}
							<Card className="rounded-2xl shadow-md">
								<CardContent className="flex flex-col items-center p-6 space-y-4">
									<div className="w-20 h-20 rounded-full bg-blue-800 text-white flex items-center justify-center text-2xl font-bold shadow">
										{iniciales}
									</div>
									<div className="text-center">
										<h2 className="text-xl font-bold text-blue-900">
											{perfil.nombre} {perfil.apellido}
										</h2>
										<p className="text-sm text-gray-600">Perfil del usuario</p>
									</div>
									<Button variant="outline" onClick={() => navigate("/dashboard")}>
										<UndoIcon className="w-4 h-4 mr-1" /> Volver
									</Button>
								</CardContent>
							</Card>

							{/* Menú opciones */}
							<Card className="rounded-2xl shadow-md">
								<CardContent className="p-4">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
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
											<DropdownMenuItem>
												<KeyIcon className="w-4 h-4 mr-2" /> Cambiar contraseña
											</DropdownMenuItem>
											<DropdownMenuItem className="text-red-600">
												<DeleteIcon className="w-4 h-4 mr-2" /> Eliminar cuenta
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</CardContent>
							</Card>
						</div>

						{/* Columna derecha */}
						<div className="col-span-2">
							<Card className="rounded-2xl shadow-md">
								<CardContent className="p-6 space-y-6">
									<h3 className="text-xl font-semibold text-blue-900">
										Información del Perfil
									</h3>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
												<label className="text-sm text-gray-500 mb-1">{item.label}</label>

												{/* Condicional: Selects en edición */}
												{isEditing && item.field === "tipoDocumento" ? (
													<select
														value={perfil[item.field] || ""}
														onChange={(e) => handleChange(item.field, e.target.value)}
														className="border rounded-md px-3 py-2 text-sm border-blue-600 focus:ring focus:ring-blue-200 bg-white"
													>
														<option value="">Seleccione un tipo</option>
														<option value="Cédula">Cédula</option>
														<option value="Pasaporte">Pasaporte</option>
														<option value="Licencia">Licencia</option>
													</select>
												) : isEditing && item.field === "genero" ? (
													<select
														value={perfil[item.field] || ""}
														onChange={(e) => handleChange(item.field, e.target.value)}
														className="border rounded-md px-3 py-2 text-sm border-blue-600 focus:ring focus:ring-blue-200 bg-white"
													>
														<option value="">Seleccione un género</option>
														<option value="Masculino">Masculino</option>
														<option value="Femenino">Femenino</option>
														<option value="Otro">Otro</option>
													</select>
												) : (
													<input
														type="text"
														value={perfil[item.field] || ""}
														readOnly={
															!isEditing ||
															item.field === "fechaCreacion" ||
															item.field === "cedula"
														}
														onChange={(e) => handleChange(item.field, e.target.value)}
														className={`border rounded-md px-3 py-2 text-sm transition ${isEditing &&
																item.field !== "fechaCreacion" &&
																item.field !== "cedula"
																? "border-blue-600 focus:ring focus:ring-blue-200 bg-white"
																: "border-gray-300 bg-gray-50"
															}`}
													/>
												)}
											</div>
										))}
									</div>

									{isEditing && (
										<div className="flex justify-end gap-3">
											<Button
												variant="outline"
												onClick={handleCancel}
												disabled={isSaving}
											>
												<XIcon className="w-4 h-4 mr-1" /> Cancelar
											</Button>
											<Button
												onClick={handleSave}
												disabled={isSaving}
												className="bg-green-600 hover:bg-green-700 text-white"
											>
												<DiscIcon className="w-4 h-4 mr-1" />
												{isSaving ? "Guardando..." : "Guardar"}
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MostrarPerfil;
