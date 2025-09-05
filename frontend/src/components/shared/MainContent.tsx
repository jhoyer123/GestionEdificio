import { Principal } from "@/app/dashboard/maindashboard/Principal";
import { Personal } from "@/app/dashboard/personal/Personal";
import { Residente } from "@/app/dashboard/residente/Residente";

type MainContentProps = {
  activeView: string;
};

export default function MainContent({ activeView }: MainContentProps) {
  switch (activeView) {
    case "dashboard":
      return <Principal />;
    case "residentes":
      return <Residente />;
    case "personal":
      return <Personal />;
    case "students":
      return (
        <div>
          <h2 className="text-2xl font-bold">Estudiantes</h2>
          <p>Listado de estudiantes aquí...</p>
        </div>
      );
    default:
      return <p>Selecciona una opción del menú</p>;
  }
}
