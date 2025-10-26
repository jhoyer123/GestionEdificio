import { DataTable } from "@/components/shared/DataTable";
import { useEffect, useState } from "react";
import { type concepto } from "./ColumnsConcepto";
import { Button } from "@/components/ui/button";
import { getConceptos } from "@/services/conceptosServices";
import { columnsConcepto } from "./ColumnsConcepto";
import { createFactura } from "@/services/facturas.services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import CrearConcepto from "./CrearConcepto";
import { toast } from "sonner";
import { set } from "date-fns";
//Creando la tabla

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

export const Concepto: React.FC<Props> = ({ setEditState }) => {
  const [concepto, setConcepto] = useState<concepto[]>([]);
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchData = async () => {
    const data = await getConceptos();
    setConcepto(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    // Lógica para eliminar el concepto
    try {
      const response = await createFactura();
      setOpenCreate(false);
      toast.success(response.message || "Facturas generadas con éxito", {
        duration: 4000,
        position: "top-right",
      });
    } catch (error: any) {
      toast.error(error.response.data.message, {
        duration: 5000,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <div className="mx-auto py-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold mb-3">Gestión de Conceptos</h2>
          <div className="flex gap-2"> 
            <Button
              className="bg-red-500 text-white hover:bg-red-600 cursor-pointer text-sm text-2xl"
              onClick={() => setOpenCreate(true)}
            >
              Generar Facturas
            </Button>
            <Button
              className="bg-amber-300 text-black hover:bg-amber-400 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              Agregar Concepto
            </Button>
          </div>
        </div>
        <h3 className="mt-3 border-l">Lista de Conceptos</h3>
        <DataTable columns={columnsConcepto(fetchData)} data={concepto} />
      </div>

      {/* Dialog para editar personal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Crear Concepto</DialogTitle>
            <DialogDescription>
              Llenar todos los datos del Concepto
            </DialogDescription>
          </DialogHeader>
          <CrearConcepto setOpen={setOpen} refresh={fetchData} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog open={openCreate} onOpenChange={setOpenCreate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-red-600 text-lg">
              Esta accion va a generar todas las facturas de los residentes
              correspondientes a los conceptos actuales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white cursor-pointer"
            >
              Sí, Generar Facturas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
