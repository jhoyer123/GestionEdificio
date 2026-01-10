import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteFuncion } from "@/services/funcionServices";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  idFuncion: number;
  onSuccess?: () => void;
}

const DeleteFuncionAlert: React.FC<Props> = ({ open, setOpen, idFuncion, onSuccess }) => {
  const handleDelete = async () => {
    try {
      await deleteFuncion(idFuncion);
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      console.error("Error al eliminar la función:", err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar función</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro que quieres eliminar esta función? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancelar</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFuncionAlert;
