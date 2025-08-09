import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./context/PrivateRoute";
import Test from "./pages/Test";
import CrearPQ from "./pages/CrearPQ";
import DashboardLayout from "./layouts/DashboardLayout";
import MostrarPerfil from "./pages/MostrarPerfil";
import DetallePQ from "./pages/DetallePQ";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="login" element={<Login />} />

        {/* Rutas Públicas */}
        <Route path="register" element={<Register />} />

        {/* Rutas Públicas Para Usuarios*/}
        <Route  path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="crear_pq" element={<CrearPQ />} />
          <Route path="mostrar_perfil" element={<MostrarPerfil />} />
          <Route path="detalle_pq/:id" element={<DetallePQ />} />
        </Route>

        {/* Rutas Privadas con Layout */}
        <Route element={<PrivateRoute />}>
          <Route path="test" element={<Test />} />
        </Route>

        <Route path="*" element={<h1>Not Found</h1>} />



      </Routes>
    </Router>
  );
}


