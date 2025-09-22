import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./context/PrivateRoute";
import { Navigate } from "react-router-dom";

// Layouts
import DashboardLayoutUsuarios from "./layouts/DashboardLayoutUsuarios";
import DashboardLayoutAdmin from "./layouts/DashboardLayoutAdmin";
import DashboardLayoutRadicador from "./layouts/DashboardLayoutRadicador";
import DashboardLayoutContratistas from "./layouts/DashboardLayoutContratistas";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MostrarPerfil from "./pages/MostrarPerfil";
import InicioContratista from "./components/Inicio/InicioContratista";

// Dashboards
import DashboardUsuarios from "./pages/DashboardUsuarios";
import AdminDashboard from "./pages/DashboardAdmin";
import DashboardRadicador from "./pages/DashboardRadicador";
import PeticionesPendientes from "./pages/PeticionesPendientes";

// Admin modules
import GestionUsuarios from "./pages/GestionUsuarios";
import GestionRoles from "./pages/GestionRoles";
import GestionPersonas from "./pages/GestionPersonas";
import GestionAdjuntos from "./pages/GesstionAdjuntos";

// Generic CRUD
import GenericCrud from "./components/GenericCrud";
import InicioUsuario from "./components/Inicio/InicioUsuario";
import DashboardAdmin from "./pages/DashboardAdmin";
import InicioRadicador from "./components/Inicio/InicioRadicador";
import HistorialPeticiones from "./pages/HistorialPeticiones";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 📌 Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* 📌 Rutas privadas protegidas */}
          <Route element={<PrivateRoute />}>
            {/* Usuario */}
            <Route path="/usuario" element={<DashboardLayoutUsuarios />}>
              <Route index element={<Navigate to="inicio" />} />
              <Route path="inicio" element={<InicioUsuario />} />
              <Route path="peticiones" element={<DashboardUsuarios />} />
              <Route path="perfil" element={<MostrarPerfil />} />
            </Route>

            {/* Radicador */}
            <Route path="/radicador" element={<DashboardLayoutRadicador />}>
              <Route index element={<Navigate to="inicio" />} />
              <Route path="inicio" element={<InicioRadicador />} />
              <Route path="peticiones" element={<DashboardRadicador />} />
              <Route path="perfil" element={<MostrarPerfil />} />
            </Route>

            {/* Contratistas */}
            <Route path="/contratista" element={<DashboardLayoutContratistas />}>
              <Route index element={<Navigate to="inicio" />} />
              {/* Inicio con subrutas */}
              <Route path="inicio" element={<InicioContratista />} />
              <Route path="peticiones_pendientes" element={<PeticionesPendientes />} />
              <Route path="historial_peticiones" element={<HistorialPeticiones />} />
              <Route path="perfil" element={<MostrarPerfil />} />
            </Route>

            {/* Administrador */}
            <Route path="/admin" element={<DashboardLayoutAdmin />}>
              <Route index element={<Navigate to="inicio" />} />
              <Route path="inicio" element={<DashboardAdmin />} />
              <Route path="personas" element={<GestionPersonas />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="roles" element={<GestionRoles />} />
              <Route path="perfil" element={<MostrarPerfil />} />
              <Route path="adjuntos" element={<GestionAdjuntos />} />
              {/* CRUDs genéricos */}
              <Route >
                <Route
                  path="tipos_documentos"
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
                  path="tipos_personas"
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
                  path="generos"
                  element={
                    <GenericCrud
                      titulo="Géneros"
                      endpoint="/generos"
                      Columns={[
                        { key: "id", label: "ID" },
                        { key: "nombre", label: "Género" },
                      ]}
                    />
                  }
                />
                <Route
                  path="tipos_solicitudes"
                  element={
                    <GenericCrud
                      titulo="Tipos de Solicitudes"
                      endpoint="/tipos_pqs"
                      Columns={[
                        { key: "id", label: "ID" },
                        { key: "nombre", label: "Tipo de Solicitud" },
                        { key: "diasHabilesRespuesta", label: "Días Hábiles Para Respuesta" },
                      ]}
                    />
                  }
                />
                <Route
                  path="areas_responsables"
                  element={
                    <GenericCrud
                      titulo="Áreas Responsables"
                      endpoint="/departamentos_responsables"
                      Columns={[
                        { key: "id", label: "ID" },
                        { key: "codigoDep", label: "Código de Área" },
                        { key: "nombre", label: "Nombre del Área" },
                      ]}
                    />
                  }
                />
                <Route
                  path="departamentos"
                  element={
                    <GenericCrud
                      titulo="Departamentos"
                      endpoint="/departamentos"
                      Columns={[
                        { key: "id", label: "ID" },
                        { key: "nombre", label: "Nombre" },
                        { key: "codigoDane", label: "Código DANE" },
                      ]}
                    />
                  }
                />
                <Route
                  path="estados_peticiones"
                  element={
                    <GenericCrud
                      titulo="Estados de las Peticiones"
                      endpoint="/estados_pqs"
                      Columns={[
                        { key: "id", label: "ID" },
                        { key: "nombre", label: "Nombre" },
                        { key: "color", label: "Color", type: "color" },
                        { key: "descripcion", label: "Descripción" },
                      ]}
                    />
                  }
                />

                <Route
                  path="historial_estados"
                  element={
                    <GenericCrud
                      titulo="Historial de Estados"
                      endpoint="/historial_estados"
                      Columns={[
                        { key: "id", label: "ID" },
                        { key: "estado.nombre", label: "Estado" },
                        { key: "fechaCambio", label: "Fecha de Asignación", type: "date" },
                        { key: "usuario.persona.nombre", label: "Usuario Modificador" },
                      ]}
                    />
                  }
                />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
