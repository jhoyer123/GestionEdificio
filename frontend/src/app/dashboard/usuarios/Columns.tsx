//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import ActionsUsuarios from "./useUsuarios/ActionsUsuarios";

export interface propsUsuarios {
  idUsuario: number;
  nombre: string;
  email: string;
  estado: string;
  roles: { idRol: number; rol: string }[];
  refresh: () => void;
}

const myCustomFilterFn: FilterFn<propsUsuarios> = (
  row: Row<propsUsuarios>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void,
) => {
  if (row.original.email.includes(filterValue)) {
    return true;
  }
  if (row.original.nombre.includes(filterValue)) {
    return true;
  }
  return false;
};

//Columnas de la tabla
export const columns = (refresh: () => void): ColumnDef<propsUsuarios>[] => [
  {
    accessorKey: "nombre",
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
    accessorKey: "email",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Rol/es",
    filterFn: myCustomFilterFn,
    cell: ({ row }) => {
      // Obtenemos el array de roles de la fila actual
      const roles = row.getValue("roles");
      // Es buena práctica verificar si 'roles' es un array antes de mapearlo
      if (!Array.isArray(roles)) {
        return null; // O muestra un guion, o lo que prefieras
      }

      // 3. Mapeamos el array y renderizamos un Badge por cada rol
      return (
        <div className="flex flex-wrap gap-1">
          {" "}
          {/* Un div para alinear los badges */}
          {roles.map((rol) => {
            if (!rol.rol) return null; // Verificamos que 'rol.rol' exista
            if (rol.rol === "administrador") {
              return <Badge key={rol.idRol}>{rol.rol}</Badge>;
            }
            if (rol.rol === "residente") {
              return (
                <Badge
                  key={rol.idRol}
                  className="capitalize bg-blue-600 text-white"
                >
                  {rol.rol}
                </Badge>
              );
            }
            if (rol.rol === "personal") {
              return (
                <Badge
                  key={rol.idRol}
                  variant={"outline"}
                  className="bg-green-600 text-white"
                >
                  {rol.rol}
                </Badge>
              );
            }
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const usuario = row.original;
      return <ActionsUsuarios data={usuario} refresh={refresh} />;
    },
  },
];
