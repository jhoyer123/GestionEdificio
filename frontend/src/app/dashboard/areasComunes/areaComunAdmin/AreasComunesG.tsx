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
    <div className="container mx-auto py-10">
      <Button
        className="bg-amber-300 hover:bg-amber-400 cursor-pointer"
        variant={"outline"}
        onClick={() =>
          setEditState({ view: "create", entity: "areaComun", id: null })
        }
      >
        Agregar Area Común
      </Button>
      <DataTable columns={columnsAC(fetchData)} data={areasComunes} />
    </div>
  );
};
