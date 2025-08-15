import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/DashboardUsuarios";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./context/PrivateRoute";
import CrearPQ from "./pages/CrearPQ";
import MostrarPerfil from "./pages/MostrarPerfil";
import { AuthProvider } from "./context/AuthProvider";
import AdminDashboard from "./pages/DashboardAdmin";
import DashboardLayoutUsuarios from "./layouts/DashboardLayoutUsuarios";
import DashboardLayoutAdmin from "./layouts/DashboardLayoutAdmin";
import GestionUsuarios from "./pages/GestionUsuario";
import GestionRoles from "./pages/GestionRoles";

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
          <Route path="crear_pq" element={<CrearPQ />} />
          <Route path="mostrar_perfil" element={<MostrarPerfil />} />
        </Route>


        {/* Rutas Públicas Para Administrador*/}
        <Route  path="/admin/dashboard" element={<DashboardLayoutAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gestion_usuarios" element={<GestionUsuarios />} />
          <Route path="roles" element={<GestionRoles   />} />
          <Route path="crear_pq" element={<CrearPQ />} />
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


