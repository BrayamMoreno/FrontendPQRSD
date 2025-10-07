import React from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";


const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 px-6">
            <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 animate-bounce" />

                <h1 className="text-7xl font-extrabold text-gray-900">404</h1>
                <p className="mt-4 text-xl font-medium text-gray-600">
                    Oops! La página que buscas no existe.
                </p>

                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-8 mx-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl shadow-md bg-blue-600 hover:bg-blue-700 transition-all"
                >
                    Volver atrás
                </Button>
            </div>
        </div>
    );
}

export default NotFound;
