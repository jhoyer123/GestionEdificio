import { getResidentes } from "@/services/residenteServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./ColumnsR";
import { type propsResidente } from "./ColumnsR";
import { Button } from "@/components/ui/button";

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

//Creando la tabla
export const Residente: React.FC<Props> = ({ setEditState }) => {
  const [residente, setResidente] = useState<propsResidente[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getResidentes();
      setResidente(data);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      {/* <DataTable columns={columns} data={usuarios} /> */}
      <Button
        className="bg-amber-300 hover:bg-amber-400 cursor-pointer"
        variant="outline"
        onClick={() =>
          setEditState({ view: "create", entity: "residente", id: null })
        }
      >
        Agregar Residente
      </Button>
      <DataTable columns={columns} data={residente} />
    </div>
  );
};
