import { getResidentes } from "@/services/residenteServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./ColumnsR";
import { type propsResidente } from "./ColumnsR";

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

//Creando la tabla
export const Residente: React.FC<Props> = ({ setEditState }) => {
  const [residente, setResidente] = useState<propsResidente[]>([]);

  const fetchData = async () => {
    const data = await getResidentes();
    setResidente(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto py-1">
      <h2 className="text-3xl font-bold">Gestión de Residentes</h2>
      <h3 className="mt-3 border-l">Lista de Residentes</h3>
      <DataTable columns={columns(fetchData)} data={residente} />
    </div>
  );
};
