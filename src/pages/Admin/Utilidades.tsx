import React, { useEffect, useRef, useState } from "react";
import apiServiceWrapper from "../../api/ApiService";
import { Button } from "../../components/ui/button";
import { Download, Trash2, PlusCircle, BarChart3 } from "lucide-react";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { useAuth } from "../../context/AuthProvider";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAlert } from "../../context/AlertContext";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { useGenerarReporteXlsx } from "../../utils/generarReporteXlsx";
import { apiService } from "../../api/ApiService";


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
    const { generarReporteXlsx } = useGenerarReporteXlsx();

    const [backups, setBackups] = useState<BackupItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMoreLogs, setHasMoreLogs] = useState(true);

    const logsContainerRef = useRef<HTMLDivElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const pendingScrollAdjustment = useRef<number | null>(null);
    const lastScrollHeight = useRef<number>(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [fechaInicioReporte, setFechaInicioReporte] = useState("");
    const [fechaFinReporte, setFechaFinReporte] = useState("");
    const [descargandoReporte, setDescargandoReporte] = useState(false);


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
            showAlert("Ha ocurrido un error, intenta nuevamente más tarde.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileName: string) => {
        try {
            const response = await apiService.get(`/backups/download/${fileName}`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
            showAlert("Backup descargado correctamente.", "success");
        } catch (error) {
            console.error("Error al descargar el backup:", error);
            showAlert(" Error al descargar el backup.", "error");
        }
    };


    const handleDelete = async (fileName: string) => {
        try {
            const response = await api.delete(`/backups/${fileName}`);

            if (response.status === 200) {
                showAlert("Backup eliminado correctamente.", "success");
                await fetchBackups();
            } else {
                showAlert(`Error al eliminar el backup: ${response.data || response.status}`, "error");
            }
        } catch (error) {
            console.error("Error al eliminar el backup:", error);
            showAlert("Error al eliminar el backup.", "error");
        }
    };


    function toLocalISOString(dateString: string) {
        const date = new Date(dateString);
        return date.toISOString().split('.')[0];
    }

    const fetchLogs = async (newPage = 0, reset = false) => {
        if ((!hasMoreLogs && !reset) || (loadingLogs && !reset)) return;

        try {
            setLoadingLogs(true);
            setHasMoreLogs(true);

            if (startDate && endDate && startDate > endDate) {
                showAlert("La fecha de inicio no puede ser mayor a la fecha final.", "error");
                setLoadingLogs(false);
                return;
            }

            const params = new URLSearchParams({
                page: String(newPage),
                size: "50",
            });

            if (searchTerm?.trim()) params.append("search", searchTerm.trim());
            if (startDate) params.append("fechaInicio", toLocalISOString(startDate));
            if (endDate) params.append("fechaFin", toLocalISOString(endDate));

            const response = await api.get<PaginatedResponse<AuditLog>>(`/logs?${params.toString()}`);
            const fetchedLogs = response.data || [];

            if (!Array.isArray(fetchedLogs)) {
                setLogs([]);
                setLoadingLogs(false);
                return;
            }

            if (fetchedLogs.length < 50) setHasMoreLogs(false);

            if (reset) {
                const orderedLogs = fetchedLogs.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
                setLogs(orderedLogs);
                setPage(0);

                setTimeout(() => {
                    if (logsContainerRef.current) {
                        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                    }
                }, 100);
            } else {
                setLogs(prevLogs => {
                    const combinedLogs = [...prevLogs, ...fetchedLogs];
                    const uniqueLogs = Array.from(
                        new Map(combinedLogs.map(log => [log.id, log])).values()
                    );
                    return uniqueLogs.sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                });
                setPage(newPage);
            }

        } catch (error) {
            console.error("Error al obtener logs:", error);
            showAlert("No se pudieron cargar los logs del sistema.", "error");
            setLogs([]);
            setHasMoreLogs(false);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        const container = logsContainerRef.current;
        if (!container) return;

        if (pendingScrollAdjustment.current !== null) {
            const oldHeight = pendingScrollAdjustment.current;
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - oldHeight;
            pendingScrollAdjustment.current = null;
        }
    }, [logs]);

    const handleScroll = async () => {
        const container = logsContainerRef.current;
        if (!container) return;

        if (container.scrollTop === 0 && hasMoreLogs && !loadingLogs) {
            lastScrollHeight.current = container.scrollHeight;
            await fetchLogs(page + 1);
            pendingScrollAdjustment.current = lastScrollHeight.current;
        }
    };

    const handleGenerarReporte = async () => {
        try {
            setDescargandoReporte(true);
            if(fechaInicioReporte > fechaFinReporte ) {
                showAlert("La fecha de inicio no puede ser mayor que la fecha de fin.", "error");
                return;
            }
            await generarReporteXlsx(fechaInicioReporte, fechaFinReporte);
        } catch (error) {
            console.error("Error al generar el reporte:", error);
            showAlert("Error al generar el reporte. Intenta nuevamente.", "error");
        } finally {
            setDescargandoReporte(false);
        }
    };

    useEffect(() => {
        fetchBackups();
        fetchLogs(0, true);
    }, []);

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
                        {permisos.some(p => p.tabla === "backups" && p.accion === "leer") && (
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
                                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                                        <table className="w-full text-sm">
                                            <thead className="bg-blue-100 text-blue-800 sticky top-0">
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
                                                        <td className="space-x-2 p-2 flex justify-center">
                                                            {permisos.some(p => p.tabla === "backups" && p.accion === "descargar") && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDownload(backup.nombre || "")}
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {permisos.some(p => p.tabla === "backups" && p.accion === "eliminar") && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(backup.nombre)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        )}

                        {/* Reportes */}
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                            <BarChart3 className="w-12 h-12 text-blue-600 mb-3" />
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Reportes de PQRS</h2>

                            <div className="flex flex-col sm:flex-row space-x-20 w-full justify-center mb-4">
                                <label className="flex flex-col text-sm text-gray-700">
                                    Fecha Inicio
                                    <input
                                        type="date"
                                        value={fechaInicioReporte}
                                        onChange={(e) => setFechaInicioReporte(e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-gray-800"
                                    />
                                </label>
                                <label className="flex flex-col text-sm text-gray-700">
                                    Fecha Fin
                                    <input
                                        type="date"
                                        value={fechaFinReporte}
                                        onChange={(e) => setFechaFinReporte(e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-gray-800"
                                    />
                                </label>
                            </div>

                            <Button
                                onClick={handleGenerarReporte}
                                disabled={descargandoReporte}
                                className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 ${descargandoReporte ? "opacity-70" : ""
                                    }`}
                            >
                                {descargandoReporte ? (
                                    <LoadingSpinner />
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" /> Generar Reporte Excel
                                    </>
                                )}
                            </Button>

                            <p className="text-gray-500 text-xs mt-3 text-center">
                                Exporta todas las PQRS registradas entre las fechas seleccionadas.
                            </p>
                        </div>
                    </div>

                    {/* Logs - Terminal (modo claro) */}
                    <div className="bg-gray-100 rounded-xl shadow-lg mt-8 w-full border border-gray-300 overflow-hidden">
                        <div className="flex items-center bg-gray-200 px-4 py-2 border-b border-gray-300">
                            <h2 className="text-sm text-gray-700 font-mono">Logs del Sistema</h2>
                        </div>

                        <div
                            ref={logsContainerRef}
                            onScroll={handleScroll}
                            className="px-4 py-3 overflow-y-auto max-h-[450px] text-sm font-mono text-gray-800 relative"
                            style={{ overscrollBehavior: "contain", scrollBehavior: "smooth" }}
                        >
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <div key={log.id} className="py-0.5">
                                        <span className="text-gray-500">
                                            [{new Date(log.timestamp).toLocaleString()}]
                                        </span>{" "}
                                        <span className="text-green-600">
                                            {log.username || " sin usuario "}
                                        </span>{" "}
                                        <span className="text-blue-600">{log.method}</span>{" "}
                                        <span className="text-yellow-600">{log.endpoint}</span>{" "}
                                        <span
                                            className={`${log.statusCode >= 400 ? "text-red-600" : "text-green-700"
                                                }`}
                                        >
                                            {log.statusCode}
                                        </span>{" "}
                                        <span className="text-gray-700">{log.action}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">
                                    {loadingLogs
                                        ? "Cargando logs..."
                                        : "No hay logs registrados o que coincidan con la búsqueda."}
                                </p>
                            )}
                            <div ref={logsEndRef} />
                        </div>

                        {/* Terminal prompt (modo claro) */}
                        <div className="bg-gray-200 border-t border-gray-300 px-4 py-3">
                            <div className="flex items-center mb-2">
                                <span className="text-green-600 mr-2">λ</span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && fetchLogs(0, true)}
                                    placeholder="Filtrar por usuario, acción o endpoint... (Enter para buscar)"
                                    className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 outline-none text-gray-800 placeholder-gray-400 text-sm"
                                />
                                <Button
                                    size="sm"
                                    className="ml-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                                    onClick={() => fetchLogs(0, true)}
                                    disabled={loadingLogs}
                                >
                                    Buscar Campos
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStartDate("");
                                        setEndDate("");
                                        fetchLogs(0, true);
                                    }}
                                >
                                    Limpiar
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                                <label className="flex items-center gap-1">
                                    <span className="text-gray-600">Fecha Inicio Logs:</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-xs"
                                    />
                                </label>
                                <label className="flex items-center gap-1">
                                    <span className="text-gray-600">Fecha Fin Logs:</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-xs"
                                    />
                                </label>

                                <Button
                                    size="sm"
                                    className="ml-auto border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                                    onClick={() => fetchLogs(0, true)}
                                    disabled={loadingLogs}
                                >
                                    Buscar por Fecha
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Utilidades;
