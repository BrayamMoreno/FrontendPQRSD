import { AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthProvider";
import type { LoginForm } from "../models/LoginForm";


const Login: React.FC = () => {

	const { login } = useAuth();
	const navigate = useNavigate();

	const [loginForm, setLoginForm] = useState<LoginForm>({
		correo: "",
		contrasena: "",
	});
	const [error, setError] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setLoginForm((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		if (!loginForm.correo || !loginForm.contrasena) {
			setError("Todos los campos son obligatorios.");
			return;
		}

		if (!/\S+@\S+\.\S+/.test(loginForm.correo)) {
			setError("El correo electrónico no es válido.");
			return;
		}
		handleLogin();
	};

	const handleLogin = async () => {
		try {
			await login(loginForm.correo, loginForm.contrasena);
		} catch (error) {
			setError("Error al iniciar sesión. Verifica tus credenciales.");
			console.error("Error al iniciar sesión:", error);
		}
	}

	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<Card className="w-96 shadow-lg">
				<CardHeader>
					<CardTitle>Iniciar sesión</CardTitle>
					<CardDescription>Accede con tu cuenta</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-5 w-5" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleSubmit}>
						<div className="space-y-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="email">Correo electrónico</Label>
								<Input
									id="correo"
									type="email"
									value={loginForm.correo}
									onChange={handleChange}
									placeholder="usuario@ejemplo.com"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="password">Contraseña</Label>
								<Input
									id="contrasena"
									type="password"
									value={loginForm.contrasena}
									onChange={handleChange}
									placeholder="********"
								/>
							</div>
							{/* BOTÓN CON LA NUEVA PALETA DE COLORES */}
							<Button type="submit" className="bg-[#6a040f] text-white hover:bg-[#9d0208] focus:ring-2 focus:ring-[#9d0208] focus:ring-opacity-50">
								Iniciar sesión
							</Button>
						</div>
					</form>
				</CardContent>
				<CardFooter>
					<p className="text-sm text-gray-600">
						¿No tienes una cuenta? <a href="#" className="text-[#9d0208] hover:text-[#9d0208]">Regístrate</a>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Login;