import { useEffect, useState } from "react";
import { UndoIcon, PencilIcon, DiscIcon, XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import apiServiceWrapper from "../api/ApiService";
import { useAuth } from "../context/AuthProvider";
import Breadcrumbs from "../components/Navegacion/Breadcrumbs";
import type { PaginatedResponse } from "../models/PaginatedResponse";
import type { Genero } from "../models/Genero";
import type { TipoPersona } from "../models/TipoPersona";
import type { TipoDoc } from "../models/TipoDoc";
import type { Departamentos } from "../models/Departamentos";
import type { Municipios } from "../models/Municipios";
import { useAlert } from "../context/AlertContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

const MostrarPerfil: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { showAlert } = useAlert();
	const api = apiServiceWrapper;

	const [iniciales, setIniciales] = useState("");
	const [perfil, setPerfil] = useState<any>({});
	const [perfilBackup, setPerfilBackup] = useState<any>({});
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const [generos, setGeneros] = useState<Genero[]>([]);
	const [tiposDocumento, setTiposDocumento] = useState<TipoDoc[]>([]);
	const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
	const [municipios, setMunicipios] = useState<Municipios[]>([]);
	const [tiposPersona, setTiposPersona] = useState<TipoPersona[]>([]);

	// 🔹 Cargar catálogos iniciales
	const fetchData = async <T,>(endpoint: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
		try {
			const response = await api.get<PaginatedResponse<T>>(endpoint);
			setter(response.data ?? []);
		} catch (error) {
			console.error(`Error al obtener ${endpoint}:`, error);
		}
	};

	const fetchAllData = async () => {
		await Promise.all([
			fetchData<Genero>("generos", setGeneros),
			fetchData<TipoDoc>("tipos_documentos", setTiposDocumento),
			fetchData<TipoPersona>("tipos_personas", setTiposPersona),
			fetchData<Departamentos>("departamentos", setDepartamentos)
		]);
		setIsLoading(false);
	};

	const fetchMunicipios = async (departamentoId: number) => {
		if (!departamentoId) return;
		try {
			const response = await api.get<PaginatedResponse<Municipios>>(
				"/municipios/municipios_departamento",
				{ departamentoId }
			);
			setMunicipios(response.data || []);
		} catch (error) {
			console.error("Error al obtener municipios:", error);
		}
	};

	useEffect(() => {
		fetchAllData();
	}, []);

	useEffect(() => {
		if (!user || departamentos.length === 0) return;
		const persona = user.persona;
		const departamentoId = persona.municipio?.departamento?.id ?? null;

		if (departamentoId) fetchMunicipios(Number(departamentoId));

		const dataPerfil = {
			id: persona.id,
			nombre: persona.nombre,
			apellido: persona.apellido,
			tipoPersona: persona.tipoPersona?.id ?? null,
			tipoDocumento: persona.tipoDoc?.id ?? null,
			cedula: persona.dni,
			telefono: persona.telefono,
			direccion: persona.direccion,
			genero: persona.genero?.id ?? null,
			departamento: departamentoId,
			municipio: persona.municipio?.id ?? null,
			email: persona.correoUsuario,
			fechaCreacion: persona.createdAt
				? new Date(persona.createdAt).toLocaleDateString()
				: "No disponible",
		};

		setPerfil(dataPerfil);
		setPerfilBackup(dataPerfil);

		setIniciales(
			`${persona.nombre?.charAt(0) ?? ""}${persona.apellido?.charAt(0) ?? ""}`.toUpperCase()
		);
	}, [user, departamentos]);

	useEffect(() => {
		if (perfil.departamento) {
			fetchMunicipios(Number(perfil.departamento));
		}
	}, [perfil.departamento]);

	const handleChange = (field: string, value: string) => {
		setPerfil((prev: any) => ({ ...prev, [field]: value }));
	};

	const handleCancel = () => {
		setPerfil(perfilBackup);
		setIsEditing(false);
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			const payload = {
				nombre: perfil.nombre,
				apellido: perfil.apellido,
				tipoDoc: { id: perfil.tipoDocumento },
				dni: perfil.cedula,
				tipoPersona: { id: perfil.tipoPersona },
				telefono: perfil.telefono,
				direccion: perfil.direccion,
				tratamientoDatos: true,
				municipio: { id: perfil.municipio },
				genero: { id: perfil.genero },
				correoUsuario: null
			};
			await api.put(`/personas/${perfil.id}`, payload);
			setPerfilBackup(perfil);
			setIsEditing(false);
			showAlert("Perfil actualizado correctamente", "success");
		} catch (error) {
			console.error("Error al guardar perfil:", error);
			showAlert("Error al actualizar el perfil", "error");
		} finally {
			setIsSaving(false);
		}
	};

	const getDisplayValue = (field: string, value: any): string => {
		switch (field) {
			case "departamento":
				return departamentos.find(d => d.id.toString() === (value?.toString() ?? ""))?.nombre || "";
			case "municipio":
				return municipios.find(m => m.id.toString() === (value?.toString() ?? ""))?.nombre || "";
			case "tipoPersona":
				return tiposPersona.find(tp => tp.id.toString() === (value?.toString() ?? ""))?.nombre || "";
			case "tipoDocumento":
				return tiposDocumento.find(td => td.id.toString() === (value?.toString() ?? ""))?.nombre || "";
			case "genero":
				return generos.find(g => g.id.toString() === (value?.toString() ?? ""))?.nombre || "";
			default:
				return value || "";
		}
	};

	const fields = [
		{ label: "Nombre", field: "nombre" },
		{ label: "Apellido", field: "apellido" },
		{ label: "Tipo de persona", field: "tipoPersona" },
		{ label: "Tipo de documento", field: "tipoDocumento" },
		{ label: "Cédula", field: "cedula" },
		{ label: "Correo electrónico", field: "email" },
		{ label: "Teléfono", field: "telefono" },
		{ label: "Dirección", field: "direccion" },
		{ label: "Género", field: "genero" },
		{ label: "Departamento de residencia", field: "departamento" },
		{ label: "Municipio de residencia", field: "municipio" },
		{ label: "Fecha de creación", field: "fechaCreacion" }
	];

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
			<div className="max-w-7xl mx-auto space-y-8">
				<Breadcrumbs />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
					{/* Lado izquierdo */}
					<div className="space-y-6">
						<Card className="rounded-2xl shadow-md">
							<CardContent className="flex flex-col items-center p-6 space-y-4">
								<div className="w-20 h-20 rounded-full bg-blue-800 text-white flex items-center justify-center text-2xl font-bold shadow">
									{iniciales}
								</div>
								<h2 className="text-lg sm:text-xl font-bold text-blue-900 text-center">
									{perfil.nombre} {perfil.apellido}
								</h2>
								<p className="text-sm text-gray-600 text-center">Perfil del usuario</p>
								<Button variant="outline" onClick={() => navigate(-1)}>
									<UndoIcon className="w-4 h-4 mr-1" /> Volver
								</Button>
							</CardContent>
						</Card>

						<Card className="rounded-2xl shadow-md">
							<CardContent className="flex flex-col space-y-3 p-4">
								<h3 className="text-lg font-semibold text-blue-900">Opciones de Perfil</h3>
								<Button
									variant="outline"
									onClick={() => setIsEditing(true)}
									className="border-blue-600 text-blue-700 hover:bg-blue-50"
								>
									<PencilIcon className="w-4 h-4 mr-2" /> Editar perfil
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Lado derecho */}
					<div className="col-span-2">
						<Card className="rounded-2xl shadow-md">
							<CardContent className="p-4 sm:p-6 space-y-6">
								<h3 className="text-lg sm:text-xl font-semibold text-blue-900">
									Información del Perfil
								</h3>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
									{fields.map((item) => (
										<div key={item.field} className="flex flex-col">
											<label className="text-sm text-gray-500 mb-1">{item.label}</label>

											{isEditing &&
												["tipoPersona", "tipoDocumento", "genero", "departamento", "municipio"].includes(item.field) ? (
												<select
													value={perfil[item.field] ?? ""}
													onChange={(e) => handleChange(item.field, e.target.value)}
													className="w-full border rounded-md px-3 py-2 text-sm border-blue-600 focus:ring focus:ring-blue-200 bg-white"
												>
													<option value="">Seleccione una opción</option>
													{item.field === "tipoPersona" &&
														tiposPersona.map((tp) => (
															<option key={tp.id} value={tp.id}>{tp.nombre}</option>
														))}
													{item.field === "tipoDocumento" &&
														tiposDocumento.map((td) => (
															<option key={td.id} value={td.id}>{td.nombre}</option>
														))}
													{item.field === "genero" &&
														generos.map((g) => (
															<option key={g.id} value={g.id}>{g.nombre}</option>
														))}
													{item.field === "departamento" &&
														departamentos.map((d) => (
															<option key={d.id} value={d.id}>{d.nombre}</option>
														))}
													{item.field === "municipio" &&
														municipios.map((m) => (
															<option key={m.id} value={m.id}>{m.nombre}</option>
														))}
												</select>
											) : (
												<input
													type="text"
													value={
														isEditing
															? perfil[item.field] ?? ""
															: getDisplayValue(item.field, perfil[item.field])
													}
													readOnly={
														!isEditing ||
														["cedula", "tipoDocumento", "email", "fechaCreacion"].includes(item.field)
													}
													onChange={(e) => handleChange(item.field, e.target.value)}
													className={`w-full border rounded-md px-3 py-2 text-sm transition ${isEditing &&
															!["cedula", "tipoDocumento", "email", "fechaCreacion"].includes(item.field)
															? "border-blue-600 focus:ring focus:ring-blue-200 bg-white"
															: "border-gray-300 bg-gray-50"
														}`}
												/>
											)}
										</div>
									))}
								</div>

								{isEditing && (
									<div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
										<Button variant="outline" onClick={handleCancel} disabled={isSaving}>
											<XIcon className="w-4 h-4 mr-1" /> Cancelar
										</Button>
										<Button
											onClick={handleSave}
											disabled={isSaving}
											className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
										>
											{isSaving ? <LoadingSpinner /> : <><DiscIcon className="w-4 h-4 mr-1" /> Guardar</>}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MostrarPerfil;
