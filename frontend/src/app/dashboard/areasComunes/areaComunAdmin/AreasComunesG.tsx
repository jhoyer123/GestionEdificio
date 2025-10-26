import { DataTable } from "@/components/shared/DataTable";
import { useEffect, useState } from "react";
import { columnsAC } from "./ColumnsAC";
import { type AreaComun, getAreasComunes } from "@/services/areasServices";
import { Button } from "@/components/ui/button";

//Creando la tabla

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

export const AreasComunesGest: React.FC<Props> = ({ setEditState }) => {
  const [areasComunes, setAreasComunes] = useState<AreaComun[]>([]);

  const fetchData = async () => {
    const data = await getAreasComunes();
    setAreasComunes(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto py-1">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mb-6">Gestión de Áreas Comunes</h2>
        <Button
          className="bg-amber-300 hover:bg-amber-400 cursor-pointer"
          variant={"outline"}
          onClick={() =>
            setEditState({ view: "create", entity: "areaComun", id: null })
          }
        >
          Agregar Area Común
        </Button>
      </div>
      <h3 className="border-l">Lista de Áreas Comunes</h3>
      <DataTable
        columns={columnsAC({ refresh: fetchData, setEditState })}
        data={areasComunes}
      />
    </div>
  );
};
