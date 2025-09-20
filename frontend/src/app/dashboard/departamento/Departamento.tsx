import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDepartamentosConUsuarios } from "@/services/departamentosServices";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Departamento {
  idDepartamento: number;
  numero: number;
  descripcion: string;
  nombre: string | null;
}

type Props = {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
};

export default function Departamento({ setEditState }: Props) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await getDepartamentosConUsuarios();
        setDepartamentos(response);
      } catch (error) {
        console.error("Error fetching departamentos:", error);
      }
    };

    fetchDepartamentos();
  }, []);

  const filteredDepartamentos = departamentos
    .filter(
      (dpto) =>
        dpto.numero.toString().includes(search) ||
        dpto.nombre?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.numero - b.numero);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Button
          className="bg-amber-300 hover:bg-amber-400 cursor-pointer"
          variant={"outline"}
        >
          Agregar Departamento
        </Button>

        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar por número o residente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64 bg-white"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold">Departamentos</h2>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDepartamentos.map((dpto) => {
          const disponible = dpto.nombre === null;
          return (
            <Card
              key={dpto.idDepartamento}
              className={`border transition-transform hover:scale-105 ${
                disponible
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Depto {dpto.numero}</span>
                  <Badge
                    className={`text-white ${
                      disponible ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {disponible ? "Disponible" : "Ocupado"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {dpto.nombre ? (
                    <span>👤 {dpto.nombre}</span>
                  ) : (
                    <span className="italic">Sin residente</span>
                  )}
                </p>
                {/* 🔹 Botón de detalles */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setEditState({
                      view: "detalleDepartamento",
                      entity: "departamento",
                      id: dpto.idDepartamento,
                    })
                  }
                >
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
