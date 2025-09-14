import AreasComunes from "@/app/dashboard/areasComunes/AreasComunes";
import Departamento from "@/app/dashboard/departamento/Departamento";
import { Principal } from "@/app/dashboard/maindashboard/Principal";
import CreatePersonal from "@/app/dashboard/personal/CreatePersonal";
import EditPersonal from "@/app/dashboard/personal/EditPersonal";
import { Personal } from "@/app/dashboard/personal/Personal";
import CreateResidente from "@/app/dashboard/residente/CreateResidente";
import EditResidente from "@/app/dashboard/residente/EditResidente";
import { Residente } from "@/app/dashboard/residente/Residente";
import CreateUsuario from "@/app/dashboard/usuarios/CreateUsuario";
import PerfilUsuario from "@/app/dashboard/usuarios/PerfilUsuario";
import { Usuarios } from "@/app/dashboard/usuarios/Usuarios";

type EditState = {
  view: string;
  entity: string;
  id: number | null;
};

type MainContentProps = {
  editState: EditState;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
};

export default function MainContent({
  editState,
  setEditState,
}: MainContentProps) {
  switch (editState.view) {
    case "dashboard":
      return <Principal />;
    case "residentes":
      return <Residente setEditState={setEditState} />;
    case "usuarios":
      return <Usuarios setEditState={setEditState} />;
    case "perfil":
      return <PerfilUsuario />;
    case "personal":
      return <Personal setEditState={setEditState} />;
    case "departamentos":
      return <Departamento />;
    case "areasComunes":
      return <AreasComunes />;
    case "edit":
      if (editState.entity === "personal") {
        return (
          <EditPersonal setEditState={setEditState} personalId={editState.id} />
        );
      }
      if (editState.entity === "residente") {
        return <EditResidente setEditState={setEditState} />;
      }
      // Aquí puedes agregar otros componentes de edición para otras entidades
      return <p>Selecciona una entidad para editar</p>;
    case "create":
      if (editState.entity === "personal") {
        return <CreatePersonal setEditState={setEditState} />;
      }
      if (editState.entity === "residente") {
        return <CreateResidente setEditState={setEditState} />;
      }
      if (editState.entity === "usuario") {
        return <CreateUsuario setEditState={setEditState} />;
      }
      // Aquí puedes agregar otros componentes de edición para otras entidades
      return <p>Selecciona una entidad para editar</p>;
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
