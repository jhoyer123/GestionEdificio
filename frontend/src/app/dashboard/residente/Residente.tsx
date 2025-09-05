import { getResidentes } from "@/services/ResidenteServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./ColumnsR";
import { type propsResidente } from "./ColumnsR";
 
//Creando la tabla
export const Residente = () => {
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
      <DataTable columns={columns} data={residente} />
    </div>
  );
};
