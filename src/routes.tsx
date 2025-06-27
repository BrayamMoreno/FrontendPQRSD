import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./context/PrivateRoute";
import Test from "./pages/Test";
import RegisterTest from "./pages/RegisterTest";
import CrearPQ from "./pages/CrearPQ";
import DashboardLayout from "./layouts/DashboardLayout";

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


