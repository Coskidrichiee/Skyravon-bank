
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../css/admin-layout.css";

function AdminLayout({ children, title = "Dashboard", subtitle = "Welcome to Richiee Bank" }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-layout">
            <Sidebar
                open={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
            />

            <div className="admin-main">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    title={title}
                    subtitle={subtitle}
                />

                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
