import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import type { Responsable } from "../../models/Responsable";

interface DetalleResponsablePqProps {
    isOpen: boolean;
    responsable: Responsable | null;
    onClose: () => void;
}

export default function DetalleResponsablePq({ isOpen, responsable, onClose }: DetalleResponsablePqProps) {
    if (!isOpen || !responsable) return null;

    const persona = responsable.personaResponsable;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Encabezado */}
                <div className="flex justify-between items-center bg-blue-900 text-white px-6 py-4 rounded-t-xl">
                    <h1 className="text-xl font-semibold">Detalle del Responsable PQs</h1>
                </div>

                {/* Contenido */}
                <Card className="shadow-none border-0">
                    <CardContent className="p-6 space-y-6">
                        {/* --- Información general --- */}
                        <section>
                            <h2 className="text-lg font-semibold text-blue-700 mb-2">
                                Información General
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p>
                                    <span className="font-semibold">ID:</span> {responsable.id}
                                </p>
                                <p>
                                    <span className="font-semibold">Fecha de Asignación:</span>{" "}
                                    {responsable.fechaAsignacion
                                        ? new Date(responsable.fechaAsignacion).toLocaleDateString()
                                        : "Sin fecha"}
                                </p>
                            </div>
                        </section>

                        {/* --- Área asignada --- */}
                        <section>
                            <h2 className="text-lg font-semibold text-blue-700 mb-2">
                                Área Asignada
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p>
                                    <span className="font-semibold">Código Área:</span>{" "}
                                    {responsable.area?.codigoDep || "Sin código"}
                                </p>
                                <p>
                                    <span className="font-semibold">Nombre Área:</span>{" "}
                                    {responsable.area?.nombre || "Sin área"}
                                </p>
                            </div>
                        </section>

                        {/* --- Persona Responsable --- */}
                        <section>
                            <h2 className="text-lg font-semibold text-blue-700 mb-2">
                                Persona Responsable
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p>
                                    <span className="font-semibold">Nombre:</span>{" "}
                                    {persona?.nombre} {persona?.apellido}
                                </p>
                                <p>
                                    <span className="font-semibold">Correo:</span>{" "}
                                    {persona?.correoUsuario || "No registrado"}
                                </p>
                                <p>
                                    <span className="font-semibold">Documento:</span>{" "}
                                    {persona?.dni || "No registrado"}
                                </p>
                                <p>
                                    <span className="font-semibold">Teléfono:</span>{" "}
                                    {persona?.telefono || "No registrado"}
                                </p>
                            </div>
                        </section>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
