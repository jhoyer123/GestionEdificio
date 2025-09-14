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

export default function Departamento() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [search, setSearch] = useState(""); // 🔹 Estado del buscador

  // Cargar datos desde la API
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

  // 🔹 Filtro de departamentos según búsqueda
  const filteredDepartamentos = departamentos
    .filter(
      (dpto) =>
        dpto.numero.toString().includes(search) || // busca por número
        dpto.nombre?.toLowerCase().includes(search.toLowerCase()) // busca por nombre
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

        {/* 🔹 Input de búsqueda */}
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

      {/* Grid de 4 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDepartamentos.map((dpto) => (
          <Card
            key={dpto.idDepartamento}
            className={`border-2 transition-transform hover:scale-105 cursor-pointer
              ${
                dpto.nombre === null
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }
            `}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Depto {dpto.numero}</span>
                <Badge
                  className={`text-white px-2 py-1 rounded-full text-xs
                    ${dpto.nombre === null ? "bg-green-600" : "bg-red-600"}
                  `}
                >
                  {dpto.nombre === null ? "Disponible" : "Ocupado"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                {dpto.nombre ? (
                  <span>👤 {dpto.nombre}</span>
                ) : (
                  <span className="italic text-gray-500">Sin residente</span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
