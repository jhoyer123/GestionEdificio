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
import { type propsPersonal } from "../ColumnsP";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditPersonal from "../EditPersonal";
import DeletePersonal from "../DeletePersonal";

interface ActionsPersonalProps {
  data: propsPersonal;
  refresh: () => void;
}

const ActionsPersonal = ({ data, refresh }: ActionsPersonalProps) => {
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
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            Editar Personal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar Personal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Dialog para editar personal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Editar Personal</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <EditPersonal data={data} setOpenEdit={setOpenEdit} refresh={refresh} />
        </DialogContent>
      </Dialog>
      {/* Dialog para eliminar personal */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Eliminar Personal</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DeletePersonal data={data} setOpenDelete={setOpenDelete} refresh={refresh} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsPersonal;
