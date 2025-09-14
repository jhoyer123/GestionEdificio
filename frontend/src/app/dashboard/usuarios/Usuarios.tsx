import { getUsuarios } from "@/services/usuariosServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./Columns";
import { type propsUsuarios } from "./Columns";
import { Button } from "@/components/ui/button";

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

//Creando la tabla
export const Usuarios: React.FC<Props> = ({ setEditState }) => {
  const [usuarios, setUsuarios] = useState<propsUsuarios[]>([]);

  const fetchData = async () => {
    const data = await getUsuarios();
    setUsuarios(data);
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
          setEditState({ view: "create", entity: "usuario", id: null })
        }
      >
        Agregar Usuario
      </Button>
      {/* <DataTable columns={columns} data={usuarios} /> */}
      <DataTable
        columns={columns(fetchData)}
        data={usuarios}
      />
    </div>
  );
};
