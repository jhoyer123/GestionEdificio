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
import { type AreaComun, deleteAreaComun } from "@/services/areasServices";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type EditState } from "@/components/shared/MainContent";
import { toast } from "sonner";

interface ActionsAreasProps {
  data: AreaComun;
  refresh: () => void;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
}

const ActionsAreas = ({ data, refresh, setEditState }: ActionsAreasProps) => {
  const [openDelete, setOpenDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteAreaComun(data.idAreaComun);
      setOpenDelete(false);
      refresh();
      toast.success("Área común eliminada con éxito", { position: "top-left", duration: 4000 });
    } catch (error) {
      console.error("Error al eliminar área común:", error);
    }
  };

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
          <DropdownMenuItem
            onClick={() =>
              setEditState({
                view: "edit",
                entity: "areaComun",
                id: data.idAreaComun,
              })
            }
          >
            Editar Area
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar Area
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Dialog para eliminar area */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Eliminar Area</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta área?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between gap-16">
            <DialogClose asChild>
              <Button className="flex-1 cursor-pointer">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="flex-1 cursor-pointer"
              onClick={() => handleDelete()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsAreas;
