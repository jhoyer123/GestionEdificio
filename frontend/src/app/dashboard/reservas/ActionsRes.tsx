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
import EditReserva from "./EditReserva";
import GestionEstadoR from "./GestionEstadoR";

interface GestionarRolUsuarioProps {
  data: Reserva;
  refresh: () => void;
}

const ActionsRes = ({ data, refresh }: GestionarRolUsuarioProps) => {
  const [openEditEstado, setOpenEditEstado] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
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
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
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
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          <GestionEstadoR
            data={data}
            setOpenEditEstado={setOpenEditEstado}
            refresh={refresh}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog para gestionar el update del usuario */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Editar</DialogTitle>
            <DialogDescription>
              Actualizar datos de la reserva
            </DialogDescription>
          </DialogHeader>
          <EditReserva
            data={data}
            setOpenEdit={setOpenEdit}
            refresh={refresh}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsRes;
