// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navegacion/Navbar";
import Footer from "../components/Navegacion/Footer";

const DashboardLayoutRadicador: React.FC = () => {
  return (
    <div >
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayoutRadicador;
