import { DataTable } from "@/components/shared/DataTable";
import { useEffect, useState } from "react";
import { createPlanillas, getPlanillas } from "@/services/planillasServices";
import { columnsPlanillas } from "./ColumnsPlanillas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Planillas</h1>
        <Button
          className="bg-amber-700 text-white text-2xl cursor-pointer"
          onClick={handleCreatePlanillas}
        >
          Crear Planillas
        </Button>
      </div>
      <DataTable data={planillas} columns={columnsPlanillas(fetchPlanillas)} />
    </div>
  );
};
