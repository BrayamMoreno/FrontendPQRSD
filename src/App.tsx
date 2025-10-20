import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import { AuthProvider } from "./context/AuthProvider";
import { AlertProvider } from "./context/AlertContext";
import PrivateRoute from "./context/PrivateRoute";
import { crudConfigs } from "./crudConfig";
import GenericCrud from "./components/GenericCrud";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import GestionPqs from "./pages/Admin/GestionPqs";
import GestionResponsablesPqs from "./pages/Admin/GestionResponsablesPqs";
import HistorialEstados from "./pages/Admin/HistorialEstados";
import Utilidades from "./pages/Admin/Utilidades";
import Municipios from "./pages/Admin/GestionMunicipios";

// 📌 Lazy imports
const LandingPage = lazy(() => import("./pages/Auth/LandingPage"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));

const DashboardLayoutUsuarios = lazy(() => import("./layouts/DashboardLayoutUsuarios"));
const DashboardLayoutAdmin = lazy(() => import("./layouts/DashboardLayoutAdmin"));
const DashboardLayoutAsignador = lazy(() => import("./layouts/DashboardLayoutAsignador"));
const DashboardLayoutFuncionario = lazy(() => import("./layouts/DashboardLayoutFuncionario"));

const DashboardUsuarios = lazy(() => import("./pages/Usuario/DashboardUsuarios"));
const DashboardAsignador = lazy(() => import("./pages/Asignador/DashboardAsignador"));
const DashboardAdmin = lazy(() => import("./pages/Admin/DashboardAdmin"));

const PeticionesPendientes = lazy(() => import("./pages/Funcionario/PeticionesPendientes"));
const HistorialPeticiones = lazy(() => import("./pages/Funcionario/HistorialPeticiones"));
import HistorialPeticionesUsuario from "./pages/Asignador/HistorialPeticionesUsuario";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

const GestionUsuarios = lazy(() => import("./pages/Admin/GestionUsuarios"));
const GestionRoles = lazy(() => import("./pages/Admin/GestionRoles"));
const GestionAdjuntos = lazy(() => import("./pages/Admin/GesstionAdjuntos"));

const InicioUsuario = lazy(() => import("./components/Inicio/InicioUsuario"));
const InicioFuncionario = lazy(() => import("./components/Inicio/InicioFuncionario"));
const InicioAsignador = lazy(() => import("./components/Inicio/InicioAsignador"));

const MostrarPerfil = lazy(() => import("./pages/MostrarPerfil"));

export default function App() {
    return (
        <Router>
            <AlertProvider>
                <AuthProvider>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="reset-password" element={<ResetPassword />} />

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

                            {/* Asignador */}
                            <Route element={<PrivateRoute required={[{ tabla: "asignador", accion: "dashboard" }]} />}>
                                <Route path="/asignador" element={<DashboardLayoutAsignador />}>
                                    <Route index element={<Navigate to="inicio" />} />
                                    <Route path="inicio" element={<InicioAsignador />} />
                                    <Route path="peticiones" element={<DashboardAsignador />} />
                                    <Route path="historial_peticiones_usuario" element={<HistorialPeticionesUsuario />} />
                                    <Route path="responsables_pqs" element={<GestionResponsablesPqs />} />
                                    <Route path="perfil" element={<MostrarPerfil />} />
                                </Route>
                            </Route>

                            {/* Contratista */}
                            <Route element={<PrivateRoute required={[{ tabla: "funcionario", accion: "dashboard" }]} />}>
                                <Route path="/funcionario" element={<DashboardLayoutFuncionario />}>
                                    <Route index element={<Navigate to="inicio" />} />
                                    <Route path="inicio" element={<InicioFuncionario />} />
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
                                    <Route
                                        path="usuarios"
                                        element={
                                            <PrivateRoute required={[{ tabla: "usuarios", accion: "leer" }]}>
                                                <GestionUsuarios />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route path="roles" element={
                                        <PrivateRoute required={[{ tabla: "roles", accion: "leer" }]}>
                                            <GestionRoles />
                                        </PrivateRoute>
                                    } />
                                    <Route path="perfil" element={<MostrarPerfil />} />
                                    <Route path="municipios" element={<PrivateRoute required={[{ tabla: "municipios", accion: "leer" }]}>
                                        <Municipios />
                                    </PrivateRoute>} />
                                    <Route path="adjuntos" element={<PrivateRoute required={[{ tabla: "adjuntos_pq", accion: "leer" }]}>
                                        <GestionAdjuntos />
                                    </PrivateRoute>} />
                                    <Route path="gestion_pqs" element={<PrivateRoute required={[{ tabla: "pqs", accion: "leer" }]}>
                                        <GestionPqs />
                                    </PrivateRoute>} />
                                    <Route path="responsables_pqs" element={<PrivateRoute required={[{ tabla: "responsables_pqs", accion: "leer" }]}>
                                        <GestionResponsablesPqs />
                                    </PrivateRoute>} />
                                    <Route path="historial_estados" element={<PrivateRoute required={[{ tabla: "historial_estados", accion: "leer" }]}>
                                        <HistorialEstados />
                                    </PrivateRoute>} />
                                    <Route path="utilidades" element={<PrivateRoute required={[{ tabla: "utilidades", accion: "acceder" }]}>
                                        <Utilidades />
                                    </PrivateRoute>} />

                                    {crudConfigs.map(({ titulo, endpoint, Columns, tabla, accion }) => (
                                        <Route
                                            key={endpoint}
                                            element={
                                                <PrivateRoute required={[{ tabla: tabla!, accion: accion }]} />
                                            }
                                        >
                                            <Route
                                                path={endpoint.replace("/", "")}
                                                element={
                                                    <GenericCrud
                                                        titulo={titulo}
                                                        endpoint={endpoint}
                                                        Columns={Columns}
                                                        tabla={tabla}
                                                        accion={accion}
                                                    />
                                                }
                                            />
                                        </Route>
                                    ))}


                                </Route>
                            </Route>

                        </Route>
                    </Routes>
                </AuthProvider>
            </AlertProvider>
        </Router>
    );
}
