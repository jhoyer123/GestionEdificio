import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { getReservas } from "@/services/reservaServices";
import { columnsRes, type Reserva } from "./ColumnsRes";

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

//Creando la tabla
export const Reservas: React.FC<Props> = ({ setEditState }) => {
  const [reserva, setReservas] = useState<Reserva[]>([]);

  const fetchData = async () => {
    const data = await getReservas();
    setReservas(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-1">Gestión de Reservas</h2>
      <DataTable columns={columnsRes(fetchData)} data={reserva} />
    </div>
  );
};
