//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActionFacturas from "./ActionFacturas";

interface concepto {
  idConcepto: number;
  titulo: string;
  monto: number;
  frecuencia: string;
  descripcion: string;
}

export interface facturas {
  idFactura: number;
  nroFactura: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number;
  estado: string;
  departamentoId: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  telefonoUsuario: string;
  conceptos: concepto[];
  reservaId: number | null;
  tipoFactura: string;
}

const myCustomFilterFn: FilterFn<facturas> = (
  row: Row<facturas>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  /* if (row.original.email.includes(filterValue)) {
    return true;
  } */
  if (row.original.nroFactura.includes(filterValue)) {
    return true;
  }
  return false;
};

interface ActionFacturasProps {
  refresh: () => Promise<void>;
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
}

//Columnas de la tabla
export const columnsFacturas = ({
  refresh,
  setEditState,
}: ActionFacturasProps): ColumnDef<facturas>[] => [
  {
    accessorKey: "nombreUsuario",
    filterFn: myCustomFilterFn,
    header: "Nombre de Usuario",
  },
  {
    accessorKey: "nroFactura",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nro. Factura
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "tipoFactura",
    header: "Tipo de Factura",
    filterFn: myCustomFilterFn,
    //mostrar en formato de badge
    cell: ({ row }) => {
      if (row.original.tipoFactura === "mantenimiento") {
        return (
          <Badge className="bg-blue-600 font-bold">
            {row.original.tipoFactura}
          </Badge>
        );
      }
      return (
        <Badge className="bg-gray-600 font-bold">
          {row.original.tipoFactura}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fechaEmision",
    header: "Fecha y hora de Emisión",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "montoTotal",
    header: "Monto Total",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "estado",
    header: "Estado Factura",
    filterFn: myCustomFilterFn,
    cell: ({ row }) => {
      if (row.original.estado === "pagada") {
        return (
          <Badge className="bg-green-600 font-bold">
            {row.original.estado}
          </Badge>
        );
      }
      if (row.original.estado === "vencida") {
        return (
          <Badge className="bg-red-600 font-bold">{row.original.estado}</Badge>
        );
      }
      return (
        <Badge className="bg-orange-600 font-bold">{row.original.estado}</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const factura = row.original;
      return (
        <ActionFacturas
          data={factura}
          /* refresh={refresh} */ setEditState={setEditState}
        />
      );
    },
  },
];
