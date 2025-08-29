import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/DashboardUsuarios";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./context/PrivateRoute";

import MostrarPerfil from "./pages/MostrarPerfil";
import { AuthProvider } from "./context/AuthProvider";
import AdminDashboard from "./pages/DashboardAdmin";
import DashboardLayoutUsuarios from "./layouts/DashboardLayoutUsuarios";
import DashboardLayoutAdmin from "./layouts/DashboardLayoutAdmin";
import GestionUsuarios from "./pages/GestionUsuarios";
import GestionRoles from "./pages/GestionRoles";
import DashboardLayoutRadicador from "./layouts/DashboardLayoutRadicador";
import DashboardRadicador from "./pages/DashboardRadicador";
import DashboardLayoutContratistas from "./layouts/DashboardLayoutContratistas";
import DashboardContratista from "./pages/DashboardContratistas";
import GenericCrud from "./components/GenericCrud";
import GestionPersonas from "./pages/GestionPersonas";
import SelectorDashboard from "./components/SelectDashboard";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="login" element={<Login />} />

          {/* Rutas Públicas */}
          <Route path="register" element={<Register />} />
          {/* Dashboard selector */}
          <Route path="selector_dashboard" element={<SelectorDashboard />} />

          {/* Rutas Públicas Para Usuarios*/}
          <Route path="/usuario/dashboard" element={<DashboardLayoutUsuarios />}>
            <Route index element={<Dashboard />} />
            <Route path="mostrar_perfil" element={<MostrarPerfil />} />
          </Route>


          {/* Rutas Públicas Para Administrador*/}
          <Route path="/admin/dashboard" element={<DashboardLayoutAdmin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="gestion_personas" element={<GestionPersonas />} />
            <Route path="gestion_usuarios" element={<GestionUsuarios />} />
            <Route path="roles" element={<GestionRoles />} />
            <Route path="mostrar_perfil" element={<MostrarPerfil />} />

            {/* CRUD Genericos*/}
            <Route
              path="/admin/dashboard/tipos_documentos"
              element={
                <GenericCrud
                  titulo="Tipos de Documentos"
                  endpoint="/tipos_documentos"
                  Columns={[
                    { key: "id", label: "ID" },
                    { key: "nombre", label: "Nombre" },
                  ]}
                />
              }
            />
            <Route
              path="/admin/dashboard/tipos_personas"
              element={
                <GenericCrud
                  titulo="Tipos de Personas"
                  endpoint="/tipos_personas"
                  Columns={[
                    { key: "id", label: "ID" },
                    { key: "nombre", label: "Tipo de Persona" },

                  ]}
                />
              }
            />
            <Route
              path="/admin/dashboard/generos"
              element={
                <GenericCrud
                  titulo="Generos"
                  endpoint="/generos"
                  Columns={[
                    { key: "id", label: "ID" },
                    { key: "nombre", label: "Genero" },

                  ]}
                />
              }
            />
            <Route
              path="/admin/dashboard/tipos_solicitudes"
              element={
                <GenericCrud
                  titulo="Tipos de Solicitudes"
                  endpoint="/tipos_pqs"
                  Columns={[
                    { key: "id", label: "ID" },
                    { key: "nombre", label: "Tipo de Solicitud" },
                    { key: "diasHabilesRespuesta", label: "Dias Habiles Para Respuesta" }
                  ]}
                />
              }
            />
            <Route
              path="/admin/dashboard/areas_responsables"
              element={
                <GenericCrud
                  titulo="Areas Responsables"
                  endpoint="/departamentos_responsables"
                  Columns={[
                    { key: "id", label: "ID" },
                    { key: "codigoDep", label: "Codigo de Area" },
                    { key: "nombre", label: "Nombre del Area" }
                  ]}
                />
              }
            />

          </Route>



          <Route path="/radicador/dashboard" element={<DashboardLayoutRadicador />}>
            <Route index element={<DashboardRadicador />} />
            <Route path="gestion_usuarios" element={<GestionUsuarios />} />
            <Route path="roles" element={<GestionRoles />} />
            <Route path="mostrar_perfil" element={<MostrarPerfil />} />
          </Route>

          <Route path="/contratista/dashboard" element={<DashboardLayoutContratistas />}>
            <Route index element={<DashboardContratista />} />
            <Route path="gestion_usuarios" element={<GestionUsuarios />} />
            <Route path="roles" element={<GestionRoles />} />
            <Route path="mostrar_perfil" element={<MostrarPerfil />} />
          </Route>

          {/* Rutas Privadas con Layout */}
          <Route element={<PrivateRoute />}>
          </Route>

          <Route path="*" element={<h1>Not Found</h1>} />



        </Routes>
      </AuthProvider>
    </Router>
  );
}


