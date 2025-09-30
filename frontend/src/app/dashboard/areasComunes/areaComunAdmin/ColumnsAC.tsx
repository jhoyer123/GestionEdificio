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
export const columnsAC = ({
  refresh,
  setEditState,
}: ColumnsACProps): ColumnDef<AreaComun>[] => [
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
    accessorKey: "costoBase",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Costo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      if( row.original.tipoArea === "parqueo"){
        return `$${row.original.costoBase} p/hora`;
      }
      if( row.original.tipoArea === "gimnasio"){
        return `$${row.original.costoBase} p/día`;
      }else{
        return `$${row.original.costoBase} p/hora`;
      }
    },
  },
  {
    accessorKey: "horarioApertura",
    header: "Horario Apertura",
    cell: ({ row }) =>
      row.original.horarioApertura ? row.original.horarioApertura : "siempre abierto",
  },
  {
    accessorKey: "horarioCierre",
    header: "Horario Cierre",
    cell: ({ row }) =>
      row.original.horarioCierre ? row.original.horarioCierre : "siempre abierto",
  },
  {
    accessorKey: "requiereAprobacion",
    header: "Requiere Aprobación",
    cell: ({ row }) => (row.original.requiereAprobacion ? "Sí" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const areaComun = row.original;
      return (
        <ActionsAreas
          data={areaComun}
          refresh={refresh}
          setEditState={setEditState}
        />
      );
    },
  },
];
