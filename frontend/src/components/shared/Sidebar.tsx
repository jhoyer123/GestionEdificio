import {
  LayoutDashboard,
  Users,
  LogOut,
  Home,
  FolderCog,
  UserCog,
  CalendarCheck,
  Building2,
  ClipboardList,
  CarFront,
  CalendarDays,
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
import { useAuth } from "./AuthContext";

interface propsSidebar {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: propsSidebar) {
  const { logoutUser } = useAuth();
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

  const handleParqueoAdminClick = () => {
    setActiveView("parqueosAdmins");
  };

  const handleMisReservasClick = () => {
    setActiveView("misReservas");
  };

  const handleConceptosClick = () => {
    setActiveView("conceptos");
  };

  const handleFacturasClick = () => {
    setActiveView("facturas");
  };

  const handleFacturasUserClick = () => {
    setActiveView("facturasUser");
  };

  const handlePlanillasAdminClick = () => {
    setActiveView("planillasAdmin");
  };

  const handlePlanillasUserClick = () => {
    setActiveView("planillasUser");
  };

  const handleAnunciosAdminClick = () => {
    setActiveView("anunciosAdmin");
  };

  const handleAnunciosUserClick = () => {
    setActiveView("anunciosUser");
  };

  const navigate = useNavigate();
  const handleCerrarSesionClick = () => {
    logout();
    navigate("/");
    logoutUser();
  };

  return (
    <aside
      className="fixed top-0 left-0 z-40 h-screen w-64 bg-gray-900 text-white border-r border-gray-800 
  flex flex-col transition-transform duration-300 ease-in-out 
  md:translate-x-0 -translate-x-full sm:translate-x-0"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex h-16 items-center justify-center border-b border-gray-700 bg-gray-900/90 backdrop-blur-sm px-6">
          <h1 className="text-lg font-bold text-center tracking-wide">
            Habitat360
          </h1>
        </div>

        {/* Contenido con scroll bonito */}
        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50 hover:scrollbar-thumb-gray-600 transition-all">
          <nav className="grid items-start gap-1 px-2 text-sm font-medium">
            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-700/60 hover:text-white transition-all`}
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
              <CalendarCheck className="mr-2 h-4 w-4" />
              Reservaciones
            </button>
            <button
              onClick={handleAreasComunesAdminClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Gestion de Areas
            </button>
            <button
              onClick={handleReservasClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Gestion de Reservas
            </button>
            <button
              onClick={handleParqueoAdminClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <CarFront className="mr-2 h-4 w-4" />
              Gestion de Parqueos
            </button>
            <button
              onClick={handleMisReservasClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Mis reservas
            </button>
            <button
              onClick={handleFacturasUserClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Mis facturas
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
              >
                <Users className="mr-2 h-4 w-4" />
                Gestion de Facturas
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleConceptosClick}>
                  Conceptos de Facturación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFacturasClick}>
                  Facturas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handlePlanillasUserClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Pagos de Salario
            </button>
            <button
              onClick={handlePlanillasAdminClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Planillas de Pago
            </button>
            <button
              onClick={handleAnunciosAdminClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Gestión de Anuncios
            </button>
            <button
              onClick={handleAnunciosUserClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Anuncios
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
