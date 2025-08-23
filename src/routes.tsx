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
import GestionUsuarios from "./pages/GestionUsuario";
import GestionRoles from "./pages/GestionRoles";
import DashboardLayoutRadicador from "./layouts/DashboardLayoutRadicador";
import DashboradRadicador from "./pages/DashboardRadicador";
import DashboardLayoutContratistas from "./layouts/DashboardLayoutContratistas";
import DashboardContratista from "./pages/DashboardContratistas";
import GenericCrud from "./components/GenericCrud";

export default function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="login" element={<Login />} />

        {/* Rutas Públicas */}
        <Route path="register" element={<Register />} />

        {/* Rutas Públicas Para Usuarios*/}
        <Route  path="/usuario/dashboard" element={<DashboardLayoutUsuarios />}>
          <Route index element={<Dashboard />} />
          <Route path="mostrar_perfil" element={<MostrarPerfil />} />
        </Route>


        {/* Rutas Públicas Para Administrador*/}
        <Route  path="/admin/dashboard" element={<DashboardLayoutAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gestion_usuarios" element={<GestionUsuarios />} />
          <Route path="roles" element={<GestionRoles   />} />
          <Route path="mostrar_perfil" element={<MostrarPerfil />} />
          <Route
              path="/admin/dashboard/roles"
              element={
                <GenericCrud
                  titulo="CRUD Roles"
                  endpoint="/roles"
                  columns={[
                    { key: "id", label: "ID" },
                    { key: "nombre", label: "Rol" },
                  ]}
                />
              }
            />

            <Route
              path="/admin/dashboard/tipos_documentos"
              element={
                <GenericCrud
                  titulo="CRUD Tipos de Documentos"
                  endpoint="/tipos_documentos"
                  columns={[
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
                  titulo="CRUD Tipos de Personas"
                  endpoint="/tipos_personas"
                  columns={[
                    { key: "id", label: "ID" },
                    { key: "nombre", label: "Tipo de Persona" },
                  ]}
                />
              }
            />
        </Route>


        <Route  path="/radicador/dashboard" element={<DashboardLayoutRadicador />}>
          <Route index element={<DashboradRadicador />} />
          <Route path="gestion_usuarios" element={<GestionUsuarios />} />
          <Route path="roles" element={<GestionRoles   />} />
          <Route path="mostrar_perfil" element={<MostrarPerfil />} />
        </Route>

        <Route  path="/contratista/dashboard" element={<DashboardLayoutContratistas />}>
          <Route index element={<DashboardContratista />} />
          <Route path="gestion_usuarios" element={<GestionUsuarios />} />
          <Route path="roles" element={<GestionRoles   />} />
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


