import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import logo from "../../assets/Logo.webp";
import fondo1 from "../../assets/fondo1.svg";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../context/AlertContext";
import apiServiceWrapper from "../../api/ApiService";

const ForgotPassword: React.FC = () => {
    const api = apiServiceWrapper
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post(`/auth/forgot-password/${email}`, {});
            if (response.status === 200) {
                showAlert("Si el correo existe en nuestro sistema, se ha enviado un enlace de recuperación.", "success");
                navigate("/login");
            } else {
                showAlert("Ocurrió un error al intentar enviar el enlace de recuperación. Por favor, intenta nuevamente.", "error");
            }
        } catch (error) {
            console.error("Error al enviar el enlace de recuperación:", error);
            showAlert("Ocurrió un error al intentar enviar el enlace de recuperación. Por favor, intenta nuevamente.", "error");
        }
    };


    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-100">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${fondo1})` }}
            />

            <Card className="w-96 shadow-2xl relative z-10">
                <CardHeader className="text-center">
                    <img src={logo} alt="STTG" className="mx-auto w-20 mb-2" />
                    <CardTitle className="text-xl font-bold text-blue-900">Recuperar contraseña</CardTitle>
                    <CardDescription>Ingresa tu correo para recibir un enlace de recuperación</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 GAP-4">
                            <div className="space-y-4">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-blue-700 text-white hover:bg-blue-800 w-full"
                            >
                                Enviar enlace
                            </Button>
                            <p
                                onClick={() => navigate("/login")}
                                className="text-sm text-blue-700 hover:text-blue-800 hover:underline text-center cursor-pointer"
                            >
                                Volver al inicio de sesión
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
