import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Swords, BarChart3, User, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/missoes", label: "Missões", icon: Swords },
  { path: "/progresso", label: "Progresso", icon: BarChart3 },
  { path: "/perfil", label: "Perfil", icon: User },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="font-display text-lg font-bold text-glow-purple text-primary">SOLO LIFE</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground p-2">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            className={`fixed top-0 left-0 h-full z-40 bg-sidebar border-r border-sidebar-border flex flex-col w-64 
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300`}
          >
            <div className="p-6 border-b border-sidebar-border hidden lg:block">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                <h1 className="font-display text-xl font-bold text-glow-purple text-primary tracking-wider">SOLO LIFE</h1>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">Sistema de Evolução Pessoal</p>
            </div>

            <nav className="flex-1 p-4 pt-20 lg:pt-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body text-base font-semibold transition-all
                      ${isActive
                        ? "bg-primary/15 text-primary glow-purple border border-primary/30"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
              <div className="text-xs text-muted-foreground font-body text-center">
                v1.0 — Arise, Hunter
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
