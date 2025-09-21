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

  const fetchData = async () => {
    const data = await getPersonales();
    setPersonal(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns(fetchData)} data={personal} />
    </div>
  );
};
