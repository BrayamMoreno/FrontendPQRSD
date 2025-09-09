// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import SlidebarAdmin from "../components/Navegacion/SlidebarAdmin";

const DashboardLayoutAdmin: React.FC = () => {
    return (
        <div className="flex">
            <SlidebarAdmin />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayoutAdmin;
