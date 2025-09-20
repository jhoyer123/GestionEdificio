import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
  idDepartamento: number | null;
};

export default function DetalleDepartamento({ setEditState, idDepartamento }: Props) {
  //mostrar el id que esta llegando de la vista departamentos en setEditState
  console.log(idDepartamento);

  // Datos de prueba (mock)
  const facturas = [
    {
      id: "F001",
      mes: "Septiembre 2025",
      fecha: "01/09/2025",
      monto: 350,
      estado: "Pendiente",
    },
    {
      id: "F002",
      mes: "Agosto 2025",
      fecha: "01/08/2025",
      monto: 350,
      estado: "Pagada",
    },
    {
      id: "F003",
      mes: "Julio 2025",
      fecha: "01/07/2025",
      monto: 350,
      estado: "Vencida",
    },
  ];

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Pagada":
        return "bg-green-500";
      case "Pendiente":
        return "bg-yellow-500";
      case "Vencida":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Departamento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Departamento 101</CardTitle>
            <p className="text-sm text-muted-foreground">
              Residente: Juan Pérez
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              console.log(setEditState);
            }}
          >
            Enviar Recordatorio
          </Button>
        </CardHeader>
      </Card>

      {/* Resumen de Facturas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Facturas</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pagadas</p>
            <p className="text-2xl font-bold text-green-600">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-red-600">4</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell>{factura.id}</TableCell>
                  <TableCell>{factura.mes}</TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>${factura.monto}</TableCell>
                  <TableCell>
                    <Badge className={getBadgeColor(factura.estado)}>
                      {factura.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
