import React, { useEffect, useState } from "react";
import apiServiceWrapper from "../../api/ApiService";
import { Button } from "../../components/ui/button";
import { Download, Trash2, PlusCircle, BarChart3 } from "lucide-react";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { useAuth } from "../../context/AuthProvider";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAlert } from "../../context/AlertContext";

interface BackupItem {
    name: string;
    size: string;
    date: string;
}

const Utilidades: React.FC = () => {
    const api = apiServiceWrapper;
    const { permisos } = useAuth();
    const { showAlert } = useAlert();

    const [backups, setBackups] = useState<BackupItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Obtener lista de backups
    const fetchBackups = async () => {
        try {
            setLoading(true);
            const response = await api.getAll<BackupItem[]>("/backups");

            if (response.status === 204) {
                showAlert("No hay backups disponibles.", "info");
                setBackups([]);
                return;
            }

            if (response.status === 401 || response.status === 403) {
                showAlert("No tiene permisos para acceder a los backups.", "error");
                setBackups([]);
                return;
            }

            setBackups(response.data || []);
        } catch (error) {
            console.error("Error al obtener los backups:", error);
            showAlert("Error al conectar con el servidor o credenciales inválidas.", "error");
        } finally {
            setLoading(false);
        }
    };


    const handleCreateBackup = async () => {
        try {
            const response = await api.post("/backups", {});
            setLoading(true);
            if (response.status === 201) {
                showAlert("Backup creado correctamente.", "success");
            }

            if (response.status === 401 || response.status === 403) {
                showAlert("No tiene permisos para crear backups.", "error");
            }

            await fetchBackups();
        } catch (error) {
            console.error("Error al crear el backup:", error);
            showAlert("Ha ocurrido un error, intenta nuevamente mas tarde.", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Descargar backup
    const handleDownload = async (fileName: string) => {
        try {
            const response = await api.get(`/api/backups/download/${fileName}`);
            const link = document.createElement("a");
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("❌ Error al descargar el backup.");
        }
    };

    // 🔹 Eliminar backup
    const handleDelete = async (fileName: string) => {
        if (!window.confirm(`¿Seguro que deseas eliminar ${fileName}?`)) return;
        try {
            await api.delete(`/api/backups/${fileName}`);
            await fetchBackups();
            alert("🗑️ Backup eliminado correctamente.");
        } catch (error) {
            alert("❌ Error al eliminar el backup.");
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />

                    {/* Header */}
                    <div className="bg-blue-100 rounded-2xl shadow mt-2 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800 mb-1">
                                Utilidades del Sistema
                            </h1>
                            <p className="text-blue-700 text-sm">
                                Administración avanzada del sistema (Backups y Reportes)
                            </p>
                        </div>
                    </div>

                    {/* GRID PRINCIPAL */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* 🗄️ SECCIÓN DE BACKUPS */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    Gestión de Backups
                                </h2>
                                {permisos.some(p => p.tabla === "backups" && p.accion === "agregar") && (
                                    <Button
                                        disabled={loading}
                                        onClick={handleCreateBackup}
                                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Crear Backup
                                    </Button>
                                )}
                            </div>

                            {loading ? (
                                <div className="text-center py-6 text-gray-500">
                                    <LoadingSpinner />
                                </div>
                            ) : backups.length === 0 ? (
                                <p className="text-gray-500">No hay backups registrados.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-100 text-blue-800">
                                        <tr>
                                            <th className="p-2 text-left">Archivo</th>
                                            <th className="p-2 text-left">Tamaño</th>
                                            <th className="p-2 text-left">Fecha</th>
                                            <th className="p-2 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((backup) => (
                                            <tr
                                                key={backup.name}
                                                className="border-b hover:bg-blue-50 transition"
                                            >
                                                <td className="p-2">{backup.name}</td>
                                                <td className="p-2">{backup.size}</td>
                                                <td className="p-2">{backup.date}</td>
                                                <td className="p-2 text-center space-x-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownload(backup.name)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(backup.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* 📊 SECCIÓN DE REPORTES (FUTURA) */}
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                            <BarChart3 className="w-12 h-12 text-blue-600 mb-3" />
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                Reportes del Sistema
                            </h2>
                            <p className="text-gray-600 text-center mb-4">
                                Próximamente podrás generar reportes de actividad,
                                rendimiento y análisis de datos.
                            </p>
                            <Button disabled className="bg-gray-400 text-white">
                                En desarrollo
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Utilidades;
