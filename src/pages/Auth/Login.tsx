import { AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthProvider";
import type { LoginForm } from "../../models/LoginForm";
import logo from "../../assets/Logo.webp"
import fondo1 from "../../assets/fondo1.svg"
import { useNavigate } from "react-router-dom";

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
	};

	return (
		<div className="relative min-h-screen w-screen flex items-center justify-center bg-gray-100">
			{/* Fondo estilo SAC adaptado */}<div
				className="absolute inset-0 bg-cover bg-center opacity-20"
				style={{ backgroundImage: `url(${fondo1})` }}
			/>

			<Card className="w-96 shadow-2xl relative z-10">
				<CardHeader className="text-center">
					{/* Encabezado institucional */}
					<img
						src={logo}
						alt="Secretaría de Tránsito y Transporte"
						className="mx-auto w-20 mb-2"
					/>
					<CardTitle className="text-xl font-bold text-blue-900">
						Secretaría de Tránsito y Transporte de Girardot
					</CardTitle>
					<CardDescription>
						Sistema de Gestión PQRSD
					</CardDescription>
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
								<Label htmlFor="correo">Correo electrónico</Label>
								<Input
									id="correo"
									type="email"
									value={loginForm.correo}
									onChange={handleChange}
									placeholder="usuario@ejemplo.com"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="contrasena">Contraseña</Label>
								<Input
									id="contrasena"
									type="password"
									value={loginForm.contrasena}
									onChange={handleChange}
									placeholder="********"
								/>
							</div>
							<Button
								type="submit"
								className="bg-blue-700 text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-800 focus:ring-opacity-50 w-full"
							>
								Iniciar sesión
							</Button>
						</div>
					</form>
				</CardContent>

				<CardFooter className="flex flex-col items-center gap-2">
					<p className="text-sm text-gray-600 text-center">
						¿No tienes una cuenta?{" "}
						<a onClick={() => navigate("/register")} className="text-blue-700 hover:underline hover:text-blue-800">
							Regístrate
						</a>
					</p>
					<p className="text-xs text-gray-500 text-center">
						Accede las 24 horas del día para consultas tus PQRS
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Login;
