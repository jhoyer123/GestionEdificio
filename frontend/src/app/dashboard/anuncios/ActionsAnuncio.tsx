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
import { type Anuncio } from "./Anuncios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import ModalCreateAnuncio from "./ModalCreateAnuncio";

import { deleteAnuncio } from "@/services/anunciosServices";
import { toast } from "sonner";

interface ActionsAnunciosProps {
  data: Anuncio;
  refresh: () => void;
}

const ActionsAnuncios = ({ data, refresh }: ActionsAnunciosProps) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  //eliminar anuncio
  const handleDelete = async () => {
    try {
      const response = await deleteAnuncio(data.idAnuncio);
      toast.success(response.message || "Anuncio eliminado con éxito", {
        duration: 4000,
        position: "top-left",
      });
      setOpenDelete(false);
      refresh();
    } catch (error) {
      console.error("Error al eliminar el anuncio:", error);
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
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            Editar Anuncio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar Anuncio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Dialog para actualizar anuncio */}
      <ModalCreateAnuncio
        open={openEdit}
        setOpen={setOpenEdit}
        refresh={refresh}
        dataAnuncio={data}
      />
      {/* AlertDialog para eliminar anuncio */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Estas seguro de eliminar este anuncio?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el anuncio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 cursor-pointer"
              onClick={handleDelete}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActionsAnuncios;
