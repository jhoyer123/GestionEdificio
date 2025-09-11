import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDepartamentosConUsuarios } from "@/services/departamentosServices";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Departamento {
  idDepartamento: number;
  numero: number;
  descripcion: string;
  nombre: string | null;
}

export default function Departamento() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  // Aquí podrías usar useEffect para cargar los datos desde la API
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

  return (
    <div className="p-6">
      <Button
        className="bg-amber-300 hover:bg-amber-400 cursor-pointer"
        variant={"outline"}
        
      >
        Agregar Departamento
      </Button>
      <h2 className="text-2xl font-bold mb-4">Departamentos</h2>

      {/* Grid de 4 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {departamentos
          .sort((a, b) => a.numero - b.numero) // ordenados por número
          .map((dpto) => (
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
                      ${
                        dpto.nombre === null
                          ? "bg-green-600"
                          : "bg-red-600"
                      }
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
