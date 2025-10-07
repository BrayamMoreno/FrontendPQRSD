import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./context/PrivateRoute";
import { crudConfigs } from "./crudConfig";
import GenericCrud from "./components/GenericCrud";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// 📌 Lazy imports
const LandingPage = lazy(() => import("./pages/Auth/LandingPage"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));

const DashboardLayoutUsuarios = lazy(() => import("./layouts/DashboardLayoutUsuarios"));
const DashboardLayoutAdmin = lazy(() => import("./layouts/DashboardLayoutAdmin"));
const DashboardLayoutRadicador = lazy(() => import("./layouts/DashboardLayoutRadicador"));
const DashboardLayoutContratistas = lazy(() => import("./layouts/DashboardLayoutContratistas"));

const DashboardUsuarios = lazy(() => import("./pages/Usuario/DashboardUsuarios"));
const DashboardRadicador = lazy(() => import("./pages/Radicador/DashboardRadicador"));
const DashboardAdmin = lazy(() => import("./pages/Admin/DashboardAdmin"));

const PeticionesPendientes = lazy(() => import("./pages/Contratista/PeticionesPendientes"));
const HistorialPeticiones = lazy(() => import("./pages/Contratista/HistorialPeticiones"));
const HistorialPeticionesUsuario = lazy(() => import("./pages/Radicador/HistorialPeticionesUsuario"));

const GestionUsuarios = lazy(() => import("./pages/Admin/GestionUsuarios"));
const GestionRoles = lazy(() => import("./pages/Admin/GestionRoles"));
const GestionPersonas = lazy(() => import("./pages/Admin/GestionPersonas"));
const GestionAdjuntos = lazy(() => import("./pages/Admin/GesstionAdjuntos"));

const InicioUsuario = lazy(() => import("./components/Inicio/InicioUsuario"));
const InicioContratista = lazy(() => import("./components/Inicio/InicioContratista"));
const InicioRadicador = lazy(() => import("./components/Inicio/InicioRadicador"));

const MostrarPerfil = lazy(() => import("./pages/MostrarPerfil"));

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />

                    {/* Unauthorized */}
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />

                    {/* Rutas privadas */}
                    <Route element={<PrivateRoute />}>
                        {/* Usuario */}
                        {/* Usuario */}
                        <Route element={<PrivateRoute required={[{ tabla: "usuario", accion: "dashboard" }]} />}>
                            <Route path="/usuario" element={<DashboardLayoutUsuarios />}>
                                <Route index element={<Navigate to="inicio" />} />
                                <Route path="inicio" element={<InicioUsuario />} />
                                <Route path="peticiones" element={<DashboardUsuarios />} />
                                <Route path="perfil" element={<MostrarPerfil />} />
                            </Route>
                        </Route>

                        {/* Radicador */}
                        <Route element={<PrivateRoute required={[{ tabla: "radicador", accion: "dashboard" }]} />}>
                            <Route path="/radicador" element={<DashboardLayoutRadicador />}>
                                <Route index element={<Navigate to="inicio" />} />
                                <Route path="inicio" element={<InicioRadicador />} />
                                <Route path="peticiones" element={<DashboardRadicador />} />
                                <Route path="historial_peticiones_usuario" element={<HistorialPeticionesUsuario />} />
                                <Route path="perfil" element={<MostrarPerfil />} />
                            </Route>
                        </Route>

                        {/* Contratista */}
                        <Route element={<PrivateRoute required={[{ tabla: "contratista", accion: "dashboard" }]} />}>
                            <Route path="/contratista" element={<DashboardLayoutContratistas />}>
                                <Route index element={<Navigate to="inicio" />} />
                                <Route path="inicio" element={<InicioContratista />} />
                                <Route path="peticiones_pendientes" element={<PeticionesPendientes />} />
                                <Route path="historial_peticiones" element={<HistorialPeticiones />} />
                                <Route path="perfil" element={<MostrarPerfil />} />
                            </Route>
                        </Route>

                        {/* Administrador */}
                        <Route element={<PrivateRoute required={[{ tabla: "admin", accion: "dashboard" }]} />}>
                            <Route path="/admin" element={<DashboardLayoutAdmin />}>
                                <Route index element={<Navigate to="inicio" />} />
                                <Route path="inicio" element={<DashboardAdmin />} />
                                <Route path="personas" element={<GestionPersonas />} />
                                <Route path="usuarios" element={<GestionUsuarios />} />
                                <Route path="roles" element={<GestionRoles />} />
                                <Route path="perfil" element={<MostrarPerfil />} />
                                <Route path="adjuntos" element={<GestionAdjuntos />} />

                                {/* CRUDs dinámicos */}
                                {crudConfigs.map(({ titulo, endpoint, Columns }) => (
                                    <Route
                                        key={endpoint}
                                        path={endpoint.replace("/", "")}
                                        element={<GenericCrud titulo={titulo} endpoint={endpoint} Columns={Columns} />}
                                    />
                                ))}
                            </Route>
                        </Route>

                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}
