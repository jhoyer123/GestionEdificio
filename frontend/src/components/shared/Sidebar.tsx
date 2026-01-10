import {
  LayoutDashboard,
  Users,
  LogOut,
  UserCog,
  CalendarCheck,
  ClipboardList,
  CalendarDays,
  Bot,
  Building,
  Briefcase,
  Map,
  Calendar,
  Car,
  Receipt,
  FileStack,
  Banknote,
  Megaphone,
  Bell,
} from "lucide-react";
import { logout } from "@/services/authService";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface propsSidebar {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ setActiveView }: propsSidebar) {
  const { logoutUser, user } = useAuth();
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

  const handleChatbotClick = () => {
    setActiveView("chatbot");
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
            {user?.rol.some((r) => r.rol === "administrador") && (
              <>
                {/* dashboard */}
                <button
                  onClick={handleDashboardClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-700/60 hover:text-white transition-all`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </button>
                {/* agente IA */}
                <button
                  onClick={handleChatbotClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-700/60 hover:text-white transition-all`}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Agente IA
                </button>
                {/* usuarios */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                {/* departamentos */}
                <button
                  onClick={handleDepartamentoClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Departamentos
                </button>
                {/* funciones del personal */}
                <button
                  onClick={handleFuncionClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Funciones De Personal
                </button>
                {/* Gestión de Areas Comunes */}
                <button
                  onClick={handleAreasComunesAdminClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700 text-start`}
                >
                  <Map className="mr-2 h-4 w-4" />
                  Gestión de Areas Comunes
                </button>
                {/* Gestión de Reservas */}
                <button
                  onClick={handleReservasClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Gestión de Reservas
                </button>
                {/* gestión de parqueos */}
                <button
                  onClick={handleParqueoAdminClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Gestión de parqueos
                </button>
                {/* Gestión de facturas */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                  >
                    <FileStack className="mr-2 h-4 w-4" />
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
                {/* Gestión de planillas de pago */}
                <button
                  onClick={handlePlanillasAdminClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700 text-start`}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Gestión de planillas de Pago
                </button>
                {/* gestión de anuncios */}
                <button
                  onClick={handleAnunciosAdminClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Gestión de Anuncios
                </button>
              </>
            )}

            {/* perfil */}
            <button
              onClick={handlePerfilClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Perfil
            </button>

            {user?.rol.some((r) => r.rol === "residente") && (
              <>
                {/* reservaciones */}
                <button
                  onClick={handleAreaComunClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Reservar Area Común
                </button>
                {/* Mis reservas */}
                <button
                  onClick={handleMisReservasClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Mis reservas
                </button>
                {/* Mis facturas */}
                <button
                  onClick={handleFacturasUserClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Mis facturas
                </button>
              </>
            )}

            {user?.rol.some((r) => r.rol === "personal") && (
              <>
                {/* Mis planillas de pago */}
                <button
                  onClick={handlePlanillasUserClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Mis planillas de pago
                </button>
              </>
            )}

            {/*mis anuncios */}
            <button
              onClick={handleAnunciosUserClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700`}
            >
              <Bell className="mr-2 h-4 w-4" />
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
