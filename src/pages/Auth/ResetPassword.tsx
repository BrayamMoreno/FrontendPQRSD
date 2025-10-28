import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import logo from "../../assets/Logo.webp";
import fondo1 from "../../assets/fondo1.svg";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../context/AlertContext";
import { useSearchParams } from "react-router-dom";
import apiServiceWrapper from "../../api/ApiService";

const ResetPassword: React.FC = () => {

    const api = apiServiceWrapper

    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<
        "Débil" | "Media" | "Fuerte" | ""
    >("");

    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const checkPasswordStrength = (password: string) => {
        let strength: "Débil" | "Media" | "Fuerte" | "" = "";
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);

        if (password.length < 6) strength = "Débil";
        else if (hasLower && hasUpper && hasNumber && hasSymbol && password.length >= 8)
            strength = "Fuerte";
        else strength = "Media";

        setPasswordStrength(strength);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            showAlert("Las contraseñas no coinciden.", "warning");
            return;
        }

        try {
            const payload = {
                token: searchParams.get("token"),
                newPassword: password
            };

            const response = await api.post("/auth/reset-password", payload);

            if (response.status !== 200) {
                showAlert("Ocurrió un error al restablecer la contraseña. Por favor, intenta nuevamente.", "error");
                return;
            }

            if (response.status == 200) {
                showAlert("Contraseña restablecida con éxito.", "success");
                navigate("/login");
            }
        } catch (error) {
            console.error("Error al restablecer la contraseña:", error);
            showAlert("Ocurrió un error al restablecer la contraseña. Por favor, intenta nuevamente.", "error");
        }

    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-white text-blue-900">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{ backgroundImage: `url(${fondo1})` }}
            />

            <Card className="w-96 shadow-2xl relative z-10 bg-white border border-gray-200">
                <CardHeader className="text-center">
                    <img src={logo} alt="STTG" className="mx-auto w-16 mb-2" />
                    <CardTitle className="text-xl font-bold text-blue-900">
                        Restablecer contraseña
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Crea una nueva contraseña segura
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            {/* Nueva contraseña */}
                            <div className="space-y-4">
                                <Label htmlFor="password">Nueva contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            checkPasswordStrength(e.target.value);
                                        }}
                                        placeholder="********"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2
                                    flex items-center justify-center
                                    bg-white z-10 rounded-full p-1
                                    text-gray-600 hover:text-blue-700 shadow-sm"
                                    >
                                        {showPassword ? (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13.875 18.825A10.027 10.027 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.975 9.975 0 011.56-3.267m.659-.659C4.654 6.848 6.75 5 12 5c4.478 0 8.268 2.943 9.543 7-1.326 4.194-5.06 7-9.543 7z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.326 4.194-5.06 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Indicador de fortaleza */}
                                <div className="mt-2">
                                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${passwordStrength === "Débil"
                                                ? "bg-red-500 w-1/3"
                                                : passwordStrength === "Media"
                                                    ? "bg-yellow-500 w-2/3"
                                                    : passwordStrength === "Fuerte"
                                                        ? "bg-green-500 w-full"
                                                        : "w-0"
                                                }`}
                                        ></div>
                                    </div>
                                    <p
                                        className={`text-xs mt-1 font-medium ${passwordStrength === "Débil"
                                            ? "text-red-500"
                                            : passwordStrength === "Media"
                                                ? "text-yellow-500"
                                                : passwordStrength === "Fuerte"
                                                    ? "text-green-500"
                                                    : "text-gray-500"
                                            }`}
                                    >
                                        Fortaleza: {passwordStrength || "Escribe tu contraseña"}
                                    </p>
                                </div>
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="space-y-4">
                                <Label htmlFor="confirm">Confirmar contraseña</Label>
                                <Input
                                    id="confirm"
                                    type={showPassword ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="********"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="bg-blue-700 text-white hover:bg-blue-800 w-full"
                            >
                                Guardar nueva contraseña
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

export default ResetPassword;
