//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionsAreas from "./ActionsAreas";
import { type AreaComun } from "@/services/areasServices";
import { type EditState } from "@/components/shared/MainContent"; 

const myCustomFilterFn: FilterFn<AreaComun> = (
  row: Row<AreaComun>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  if (row.original.nombreAreaComun.includes(filterValue)) {
    return true;
  }
  if (row.original.capacidadMaxima.toString().includes(filterValue)) {
    return true;
  }
  return false;
};

interface ColumnsACProps {
  refresh: () => void;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
}

//Columnas de la tabla
export const columnsAC = ({refresh, setEditState}: ColumnsACProps): ColumnDef<AreaComun>[] => [
  {
    accessorKey: "nombreAreaComun",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          className="text-right m-auto"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "capacidadMaxima",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Capacidad Máxima
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "costoPorHora",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Capacidad Máxima
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "horarioInicio",
    header: "Horario Inicio",
  },
  {
    accessorKey: "horarioFin",
    header: "Horario Fin",
  },
  {
    accessorKey: "requiereAprobacion",
    header: "Requiere Aprobación",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const areaComun = row.original;
      return <ActionsAreas data={areaComun} refresh={refresh} setEditState={setEditState} />;
    },
  },
];
