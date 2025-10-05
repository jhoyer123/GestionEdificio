// src/components/reservas/reserva-actions.tsx
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState } from "react";

interface ReservaActionsProps {
  idReserva: number;
}

export function ReservaActions({ idReserva }: ReservaActionsProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Lógica para modificar la reserva
  const handleModify = () => {
    // Redirige a la página de edición con el ID de la reserva
  };

  // Lógica para cancelar la reserva
  const handleCancel = async () => {
    console.log(`Cancelando reserva ${idReserva}...`);
    // Lógica de API para cambiar el estado a "cancelada"
    // Ejemplo:
    /*
    try {
      await fetch(`/api/reservas/${idReserva}/cancelar`, { method: 'POST' });
      // Refrescar datos o mostrar un toast de éxito
      router.refresh(); 
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      // Mostrar un toast de error
    }
    */
    setIsCancelDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleModify}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Modificar Reserva</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Cancelar Reserva</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu reserva será cancelada
              permanentemente. Verifica las políticas de cancelación antes de
              proceder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
