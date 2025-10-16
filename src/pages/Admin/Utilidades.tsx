import React, { useEffect, useRef, useState } from "react";
import apiServiceWrapper from "../../api/ApiService";
import { Button } from "../../components/ui/button";
import { Download, Trash2, PlusCircle, BarChart3 } from "lucide-react";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { useAuth } from "../../context/AuthProvider";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAlert } from "../../context/AlertContext";
import type { PaginatedResponse } from "../../models/PaginatedResponse";

interface BackupItem {
    fecha: string;
    hora: string;
    nombre: string;
    ruta: string;
    tamaño: string;
}

interface AuditLog {
    id: number;
    username?: string;
    action: string;
    method: string;
    endpoint: string;
    statusCode: number;
    timestamp: string;
}

const Utilidades: React.FC = () => {
    const api = apiServiceWrapper;
    const { permisos } = useAuth();
    const { showAlert } = useAlert();

    const [backups, setBackups] = useState<BackupItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMoreLogs, setHasMoreLogs] = useState(true);

    const logsContainerRef = useRef<HTMLDivElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // ========================= BACKUPS =========================
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
            setLoading(true);
            const response = await api.post("/backups", {});
            if (response.status === 201) {
                showAlert("Backup creado correctamente.", "success");
            } else if (response.status === 401 || response.status === 403) {
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

    const handleDownload = async (fileName: string) => {
        try {
            const response = await api.get(`/download/${fileName}`);
            console.log(response);
            const link = document.createElement("a");
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("❌ Error al descargar el backup.");
        }
    };

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

    // ========================= LOGS =========================
    const fetchLogs = async (newPage = 0) => {
        if (!hasMoreLogs || loadingLogs) return;
        try {
            setLoadingLogs(true);
            const container = logsContainerRef.current;
            const isAtBottom = container
                ? container.scrollHeight - container.scrollTop === container.clientHeight
                : false;

            const response = await api.get<PaginatedResponse<AuditLog>>(`/logs?page=${newPage}&size=50`);
            const fetchedLogs = response.data || [];

            if (fetchedLogs.length < 50) setHasMoreLogs(false);

            setLogs(prevLogs => {
                const combinedLogs = [...prevLogs, ...fetchedLogs];
                return combinedLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            setPage(newPage);

            // Scroll solo si estaba al final, ajustando directamente scrollTop
            if (container && isAtBottom) {
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 50);
            }

        } catch (error) {
            console.error("Error al obtener logs:", error);
            showAlert("No se pudieron cargar los logs del sistema.", "error");
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleScroll = () => {
        const container = logsContainerRef.current;
        if (!container) return;

        // Cargar logs antiguos si scroll arriba
        if (container.scrollTop === 0 && hasMoreLogs) {
            fetchLogs(page + 1);
        }
    };

    // ========================= INIT =========================
    useEffect(() => {
        fetchBackups();
        fetchLogs(0);
    }, []);

    // ========================= RENDER =========================
    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />

                    {/* Header */}
                    <div className="bg-blue-100 rounded-2xl shadow mt-2 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800 mb-1">Utilidades del Sistema</h1>
                            <p className="text-blue-700 text-sm">
                                Administración avanzada del sistema (Backups, Logs y Reportes)
                            </p>
                        </div>
                    </div>

                    {/* GRID PRINCIPAL */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Backups */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">Gestión de Backups</h2>
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
                                            <th className="p-2 text-left">Nombre</th>
                                            <th className="p-2 text-left">Tamaño</th>
                                            <th className="p-2 text-left">Fecha</th>
                                            <th className="p-2 text-left">Hora</th>
                                            <th className="p-2 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((backup) => (
                                            <tr key={backup.nombre} className="border-b hover:bg-blue-50 transition">
                                                <td className="p-2">{backup.nombre}</td>
                                                <td className="p-2">{backup.tamaño}</td>
                                                <td className="p-2">{backup.fecha}</td>
                                                <td className="p-2">{backup.hora}</td>
                                                <td className="p-2 text-center space-x-6">
                                                    <Button variant="outline" size="sm" onClick={() => handleDownload(backup.nombre || "")}>
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(backup.nombre)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Reportes */}
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                            <BarChart3 className="w-12 h-12 text-blue-600 mb-3" />
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">Reportes del Sistema</h2>
                            <p className="text-gray-600 text-center mb-4">
                                Próximamente podrás generar reportes de actividad, rendimiento y análisis de datos.
                            </p>
                            <Button disabled className="bg-gray-400 text-white">En desarrollo</Button>
                        </div>

                    </div>

                    {/* Logs */}
                    <div className="bg-white rounded-xl shadow p-6 mt-8 w-full">
                        <div className="flex justify-between items-center mb-4 w-full">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Logs del Sistema
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} disabled={loadingLogs}>
                                Actualizar
                            </Button>
                        </div>

                        <div
                            ref={logsContainerRef}
                            onScroll={handleScroll}
                            className="bg-gray-900 text-green-400 text-sm p-4 rounded-lg overflow-y-auto max-h-[400px] whitespace-pre-wrap font-mono"
                        >
                            {logs.length > 0 ? (
                                logs.map(log => (
                                    <div key={log.id}>
                                        <strong>{log.username || "Usuario Anónimo"}</strong> - {log.action} ({log.method} {log.endpoint}) - {log.statusCode} - {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                ))
                            ) : (
                                "No hay logs registrados."
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Utilidades;
