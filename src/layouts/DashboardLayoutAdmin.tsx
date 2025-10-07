// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavbarAdmin from "../components/Navegacion/NavbarAdmin";
import Footer from "../components/Navegacion/Footer";

const DashboardLayoutAdmin: React.FC = () => {
    return (
        <div>
            <NavbarAdmin />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default DashboardLayoutAdmin;
