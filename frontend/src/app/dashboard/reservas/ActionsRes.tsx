import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type EditState } from "@/components/shared/MainContent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Reserva } from "./ColumnsRes";
//import EditReserva from "./EditReserva";
import GestionEstadoR from "./GestionEstadoR";
//pruebas
import { useNavigate } from "react-router-dom";
import { set } from "date-fns";

interface GestionarRolUsuarioProps {
  data: Reserva;
  refresh: () => void;
  //reservas: any[];
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
}

const ActionsRes = ({
  data,
  refresh,
  setEditState,
}: GestionarRolUsuarioProps) => {
  const [openEditEstado, setOpenEditEstado] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenEditEstado(true)}>
            Gestionar Estado
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              setEditState({
                view: "edit",
                entity: "reserva",
                id: data.idReserva,
              })
            }
          >
            Editar
          </DropdownMenuItem>
          {/* 
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Dialog para gestionar el Estado de la reserva */}
      <Dialog open={openEditEstado} onOpenChange={setOpenEditEstado}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Gestionar Estado</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <GestionEstadoR
            data={data}
            setOpenEditEstado={setOpenEditEstado}
            refresh={refresh}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsRes;
