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
import { type propsUsuarios } from "../Columns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GestionarRolUsuario } from "./GestionarRolUsuario";
import EditUsuario from "../EditUsuario";


interface GestionarRolUsuarioProps {
  data: propsUsuarios;
  refresh: () => void;
}

const ActionsUsuarios = ({ data, refresh }: GestionarRolUsuarioProps) => {
  const [openEditRol, setOpenEditRol] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
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
          <DropdownMenuItem onClick={() => setOpenEditRol(true)}>
            Gestionar Rol
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>Editar Usuario</DropdownMenuItem>
          <DropdownMenuItem>Eliminar Usuario</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Dialog para gestionar el rol del usuario */}
      <Dialog open={openEditRol} onOpenChange={setOpenEditRol}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Gestionar Rol</DialogTitle>
            <DialogDescription>
              Aquí puedes gestionar el rol del usuario.
            </DialogDescription>
          </DialogHeader>
          <GestionarRolUsuario
            data={data}
            setOpenEdit={setOpenEditRol}
            refresh={refresh}
          >
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </GestionarRolUsuario>
        </DialogContent>
      </Dialog>
      {/* Dialog para gestionar el update del usuario */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Gestionar Datos</DialogTitle>
            <DialogDescription>
              Actualizar datos del usuario
            </DialogDescription>
          </DialogHeader>
          <EditUsuario
            data={data}
            setOpenEdit={setOpenEdit}
            refresh={refresh}
          >
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </EditUsuario>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsUsuarios;
