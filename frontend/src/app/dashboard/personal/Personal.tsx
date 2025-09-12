import { getPersonales } from "@/services/personalServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./ColumnsP";
import { type propsPersonal } from "./ColumnsP";
import { Button } from "@/components/ui/button";

//Creando la tabla

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

export const Personal: React.FC<Props> = ({ setEditState }) => {
  const [personal, setPersonal] = useState<propsPersonal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPersonales();
      setPersonal(data);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      {/* <Button
        className="bg-amber-300 hover:bg-amber-400 cursor-pointer"
        variant={"outline"}
        onClick={() =>
          setEditState({ view: "create", entity: "personal", id: null })
        }
      >
        Agregar Personal
      </Button> */}
      <DataTable
        columns={columns(
          (id: number) =>setEditState({ view: "edit", entity: "personal", id }),
          (id: number) =>setEditState({ view: "perfil", entity: "personal", id })
        )}
        data={personal}
      />
    </div>
  );
};
