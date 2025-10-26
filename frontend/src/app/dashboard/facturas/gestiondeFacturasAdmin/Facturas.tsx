import { DataTable } from "@/components/shared/DataTable";
import { useEffect, useState } from "react";
import { type facturas } from "./ColumnsFacturas";
import { getFacturas } from "@/services/facturas.services";
import { columnsFacturas } from "./ColumnsFacturas";

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

export const Facturas: React.FC<Props> = ({ setEditState }) => {
  const [facturas, setFacturas] = useState<facturas[]>([]);

  const fetchData = async () => {
    const data = await getFacturas();
    setFacturas(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto py-1">
      <h2 className="text-3xl font-bold mb-3">Gestión de Facturas</h2>
       <h3 className="mt-3 border-l">Lista de Facturas</h3>
      <DataTable columns={columnsFacturas({ refresh: fetchData, setEditState })} data={facturas} />
    </div>
  );
};
