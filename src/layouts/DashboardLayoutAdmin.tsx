// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavbarAdmin from "../components/Navegacion/NavbarAdmin";

const DashboardLayoutAdmin: React.FC = () => {
    return (
        <div >
            <NavbarAdmin />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayoutAdmin;
