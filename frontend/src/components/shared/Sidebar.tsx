import {
  LayoutDashboard,
  Users,
  LogOut,
  Home,
  FolderCog,
  UserCog,
} from "lucide-react";
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
import { set } from "date-fns";

interface propsSidebar {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: propsSidebar) {
  const handleDashboardClick = () => {
    setActiveView("dashboard");
  };

  const handleResidentesClick = () => {
    setActiveView("residentes");
  };

  const handlePersonalClick = () => {
    setActiveView("personal");
  };

  const handleDepartamentoClick = () => {
    setActiveView("departamentos");
  };

  const handleFuncionClick = () => {
    setActiveView("funciones");
  };

  const handleUsuarioClick = () => {
    setActiveView("usuarios");
  };

  const handleAreaComunClick = () => {
    setActiveView("areasComunes");
  };

  const handleAreasComunesAdminClick = () => {
    setActiveView("areasComunesAdmin");
  };

  const handlePerfilClick = () => {
    setActiveView("perfil");
  };

  const handleReservasClick = () => {
    setActiveView("reservasAdmin");
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
            <button
              onClick={handlePerfilClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Perfil
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
              >
                <Users className="mr-2 h-4 w-4" />
                Usuarios
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={handleUsuarioClick}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleResidentesClick}>
                  Residentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePersonalClick}>
                  Personal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleDepartamentoClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <Home className="mr-2 h-4 w-4" />
              Departamentos
            </button>
            <button
              onClick={handleFuncionClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <FolderCog className="mr-2 h-4 w-4" />
              Funciones De Personal
            </button>
            <button
              onClick={handleAreaComunClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <FolderCog className="mr-2 h-4 w-4" />
              Reservar Areas Comunes
            </button>
            <button
              onClick={handleAreasComunesAdminClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Gestion Areas Comunes
            </button>
            <button
              onClick={handleReservasClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Gestion de Reservas
            </button>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="mt-4 grid items-start text-sm font-medium">
            <button
              onClick={handleCerrarSesionClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <LogOut />
              Cerrar Sesion
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
