import { DataTable } from "@/components/shared/DataTable";
import { useEffect, useState } from "react";
import { createPlanillas, getPlanillas } from "@/services/planillasServices";
import { columnsPlanillas } from "./ColumnsPlanillas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

// 🔹 Importamos componentes del AlertDialog de shadcn
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Planilla {
  idPlanilla: number;
  mes: number;
  anio: number;
  tipo: string;
  pagado: boolean;
  idPersonal: number;
  nombrePersonal: string;
  telefonoPersonal: string;
  emailPersonal: string;
  funcion: string;
  qrPersonal?: string;
}

export const Planillas = () => {
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [isOpen, setIsOpen] = useState(false); // controla el estado del modal

  const fetchPlanillas = async () => {
    try {
      const response = await getPlanillas();
      setPlanillas(response);
    } catch (error) {
      console.error("Error al obtener las planillas:", error);
    }
  };

  useEffect(() => {
    fetchPlanillas();
  }, []);

  const handleCreatePlanillas = async () => {
    try {
      const newPlanillas = await createPlanillas("sueldos");
      console.log("Planillas creadas:", newPlanillas);
      fetchPlanillas(); // Refrescar la lista de planillas después de crear nuevas
      toast.success(newPlanillas.message || "Planillas creadas exitosamente");
    } catch (error) {
      axios.isAxiosError(error)
        ? toast.error(
            error.response?.data?.message || "Error al crear las planillas",
            { position: "top-right", duration: 4000 }
          )
        : toast.error("Error al crear las planillas");
      console.error("Error al crear las planillas:", error);
    }
  };

  // 🔹 Fecha actual formateada
  const fechaActual = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Planillas</h1>

        {/* 🔹 Modal de Confirmación */}
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-red-600 hover:bg-red-500 text-white text-2xl cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              Crear Planillas
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                ¿Deseas generar las planillas correspondientes al mes de{" "}
                <strong>{fechaActual}</strong>?
                <br />
                Esta acción creará las planillas de sueldos para todo el
                personal.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                className="text-lg cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-blue-700 hover:bg-blue-800 text-white text-lg cursor-pointer"
                onClick={() => {
                  handleCreatePlanillas();
                  setIsOpen(false);
                }}
              >
                Sí, generar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <DataTable data={planillas} columns={columnsPlanillas(fetchPlanillas)} />
    </div>
  );
};
