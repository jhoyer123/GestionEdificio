import { AreasComunesGest } from "@/app/dashboard/areasComunes/areaComunAdmin/AreasComunesG";
import AreaDetailPage from "@/app/dashboard/areasComunes/AreaDetailPage";
import AreasComunes from "@/app/dashboard/areasComunes/AreasComunes";
import Departamento from "@/app/dashboard/departamento/Departamento";
import DetalleDepartamento from "@/app/dashboard/departamento/DetalleDepartamento";
import { Principal } from "@/app/dashboard/maindashboard/Principal";
import { Personal } from "@/app/dashboard/personal/Personal";
import CreateResidente from "@/app/dashboard/residente/CreateResidente";
import { Residente } from "@/app/dashboard/residente/Residente";
import CreateUsuario from "@/app/dashboard/usuarios/CreateUsuario";
import PerfilUsuario from "@/app/dashboard/usuarios/PerfilUsuario";
import { Usuarios } from "@/app/dashboard/usuarios/Usuarios";
import { CrearAreaComun } from "@/app/dashboard/areasComunes/areaComunAdmin/CrearAreaComun";
import { EditAreaComun } from "@/app/dashboard/areasComunes/areaComunAdmin/EtidAreaComun";
import { Reservas } from "@/app/dashboard/reservas/Reservas";
export type EditState = {
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
    //seccion de usuarios ***
    case "residentes":
      return <Residente setEditState={setEditState} />;
    case "usuarios":
      return <Usuarios setEditState={setEditState} />;
    case "personal":
      return <Personal setEditState={setEditState} />;
    case "perfil":
      return <PerfilUsuario />;

    //seccion de departamentos ***
    case "departamentos":
      return <Departamento setEditState={setEditState} />;
    case "detalleDepartamento":
      return (
        <DetalleDepartamento
          setEditState={setEditState}
          idDepartamento={editState.id}
        />
      );

    //seccion de areas comunes ***
    case "areasComunes":
      return <AreasComunes setEditState={setEditState} />;
    case "reservas":
      return (
        <AreaDetailPage setEditState={setEditState} idParams={editState.id} />
      );
    case "areasComunesAdmin":
      return <AreasComunesGest setEditState={setEditState} />;

    //seccion de reservas admin ***
    case "reservasAdmin":
      return <Reservas setEditState={setEditState} />;

    //seccion de creacion y edicion de entidades ***
    case "edit":
      if (editState.entity === "areaComun") {
        return (
          <EditAreaComun
            setEditState={setEditState}
            areaComunId={editState.id}
          />
        );
      }
      /* if (editState.entity === "personal") {
        return (
          <EditPersonal setEditState={setEditState} personalId={editState.id} />
        );
      }
      if (editState.entity === "residente") {
        return <EditResidente setEditState={setEditState} />;
      } */
      // Aquí puedes agregar otros componentes de edición para otras entidades
      return <p>Selecciona una entidad para editar</p>;
    case "create":
      if (editState.entity === "residente") {
        return <CreateResidente setEditState={setEditState} />;
      }
      if (editState.entity === "usuario") {
        return <CreateUsuario setEditState={setEditState} />;
      }
      if (editState.entity === "areaComun") {
        return <CrearAreaComun setEditState={setEditState} />;
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
