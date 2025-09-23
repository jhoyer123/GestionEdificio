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
    <div className="container mx-auto py-10">
      <DataTable columns={columns(fetchData)} data={residente} />
    </div>
  );
};
