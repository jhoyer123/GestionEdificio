import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type AreaComun } from "@/services/areasServices";

interface Props {
  area: AreaComun;
  onReservar: (area: AreaComun) => void;
}
const API_URL = import.meta.env.VITE_API_URL;

export function AreaCard({ area, onReservar }: Props) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition">
      <div className="h-40 bg-gray-200">
        <img
          src={`${API_URL}/uploads/${area.imageUrl}`}
          alt={area.nombreAreaComun}
          className="w-full h-full object-cover"
        />
      </div>

      <CardHeader>
        <h3 className="text-lg font-semibold">{area.nombreAreaComun}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {area.descripcion}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 text-sm">
        <div>
          {area.tipoArea === "gimnasio" ? (
            <span className="font-medium">Costo:{area.costoBase} Bs/dia</span>
          ) : (
            <span className="font-medium">Costo:{area.costoBase} Bs/hora</span>
          )}{" "}
        </div>
        <div>
          {area.tipoArea === "parqueo" ? (
            <span className="font-medium">
              Abierto
            </span>
          ) : (
            <span className="font-medium">
              Horario:{area.horarioApertura} - {area.horarioCierre}{" "}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button className="w-full cursor-pointer" onClick={() => onReservar(area)}>
          Reservar
        </Button>
      </CardFooter>
    </Card>
  );
}
