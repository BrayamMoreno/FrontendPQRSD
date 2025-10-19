import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { UserCheck, RefreshCcw } from "lucide-react";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import apiServiceWrapper from "../../api/ApiService";
import { useAuth } from "../../context/AuthProvider";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface Peticion {
    id: number;
    asunto: string;
    fecha: string;
    estado: string;
    responsable: string;
}

const HistorialPeticionesUsuario: React.FC = () => {
    const { user } = useAuth();
    const api = apiServiceWrapper;
    const [peticiones, setPeticiones] = useState<Peticion[]>([]);
    const [selectedPeticion, setSelectedPeticion] = useState<Peticion | null>(null);
    const [responsables, setResponsables] = useState<string[]>([]);
    const [nuevoResponsable, setNuevoResponsable] = useState("");
    const [search, setSearch] = useState("");

    const fetchPeticiones = async () => {
        try {
            const response = await api.getAll(`/pqs/historial/${user?.persona?.id}`);
        } catch (error) {
            console.error("Error cargando historial", error);
        }
    };

    const fetchResponsables = async () => {
        try {
            const response = await api.getAll("/pqs/responsables");
        } catch (error) {
            console.error("Error cargando responsables", error);
        }
    };

    const handleReasignar = async () => {
        if (!selectedPeticion || !nuevoResponsable) return;
        try {
            await api.put(`/pqs/reasignar/${selectedPeticion.id}`, { responsable: nuevoResponsable });
            fetchPeticiones();
            setSelectedPeticion(null);
        } catch (error) {
            console.error("Error reasignando responsable", error);
        }
    };

    useEffect(() => {
        fetchPeticiones();
        fetchResponsables();
    }, []);

    const filtered = peticiones.filter(p =>
        p.asunto.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">
                            Historial de Peticiones
                        </h1>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar por asunto..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64"
                            />
                            <Button onClick={fetchPeticiones} variant="outline">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Actualizar
                            </Button>
                        </div>
                    </div>

                    <Card className="shadow-sm rounded-2xl">
                        <CardContent className="p-0">
                            <table className="min-w-full text-sm text-left border-collapse">
                                <thead className="bg-blue-100 text-blue-900">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Asunto</th>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Responsable</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{p.id}</td>
                                            <td className="px-4 py-2">{p.asunto}</td>
                                            <td className="px-4 py-2">{p.fecha}</td>
                                            <td className="px-4 py-2">{p.estado}</td>
                                            <td className="px-4 py-2">{p.responsable}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedPeticion(p)}
                                                >
                                                    <UserCheck className="w-4 h-4 mr-2" /> Reasignar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-gray-500">
                                                No se encontraron peticiones.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de reasignación */}
            <Dialog open={!!selectedPeticion} onOpenChange={() => setSelectedPeticion(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reasignar responsable</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>
                            Petición <b>{selectedPeticion?.asunto}</b>
                        </p>
                        <Select onValueChange={setNuevoResponsable}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un nuevo responsable" />
                            </SelectTrigger>
                            <SelectContent>
                                {responsables.map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedPeticion(null)}>
                                Cancelar
                            </Button>
                            <Button className="bg-blue-600 text-white" onClick={handleReasignar}>
                                Guardar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HistorialPeticionesUsuario;
