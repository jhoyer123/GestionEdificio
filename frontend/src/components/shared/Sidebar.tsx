import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart2,
  BookOpen,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Asegúrate que la ruta sea correcta
import type { ComponentType, ReactNode } from "react";
import { logout } from "@/services/authService";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";

interface propsSidebar {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: propsSidebar) {
  const handleNavLinkClick = (view: string) => {
    setActiveView(view);
  };

  const handleDashboardClick = () => {
    setActiveView("dashboard");
  };

  const handleResidentesClick = () => {
    setActiveView("residentes");
  };

  const handlePersonalClick = () => {
    setActiveView("personal");
  };

  const navigate = useNavigate();
  const handleCerrarSesionClick = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-gray-900 text-white sm:flex">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b border-gray-700 px-6">
          <h1 className="text-lg font-bold">Skillset</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium">
            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
              >
                <Users className="mr-2 h-4 w-4" />
                Usuarios
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResidentesClick}>
                  Residentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePersonalClick}>
                  Personal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="mt-4 grid items-start text-sm font-medium">
            <button
              onClick={handleCerrarSesionClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <LogOut />Cerrar Sesion
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
