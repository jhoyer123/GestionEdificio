import { getPersonales } from "@/services/personalServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./ColumnsP";
import { type propsPersonal } from "./ColumnsP";
 
//Creando la tabla
export const Personal = () => {
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
      {/* <DataTable columns={columns} data={usuarios} /> */}
      <DataTable columns={columns} data={personal} />
    </div>
  );
};
