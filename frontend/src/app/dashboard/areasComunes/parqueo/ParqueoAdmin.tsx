import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getCajas,
  createCaja,
  deleteCaja,
} from "@/services/parqueoCajasServices";

export default function ParqueoAdmin() {
  const [nuevoNumero, setNuevoNumero] = useState("");

  const [cajas, setCajas] = useState<any[]>([]); // ya es array

  const fetchCajas = async () => {
    try {
      const cajas = await getCajas();
      // res.data debe ser array, si no, usa res.data.cajas o similar según tu API
      setCajas(Array.isArray(cajas) ? cajas: []);
    } catch (err) {
      toast.error("Error al cargar cajones");
      setCajas([]); // asegurar array vacío
    }
  };
  useEffect(() => {
    fetchCajas();
  }, []);

  // Crear nueva caja
  const handleCrear = async () => {
    if (!nuevoNumero) return toast.error("Ingresa un número de caja");
    try {
      await createCaja({ numeroCaja: nuevoNumero });
      toast.success("Caja creada");
      setNuevoNumero("");
      fetchCajas();
    } catch {
      toast.error("Error al crear la caja");
    }
  };

  // Eliminar caja
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta caja?")) return;
    try {
      await deleteCaja(id);
      toast.success("Caja eliminada");
      fetchCajas();
    } catch {
      toast.error("Error al eliminar la caja");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Administrar Cajones de Parqueo</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Número de caja"
          value={nuevoNumero}
          onChange={(e) => setNuevoNumero(e.target.value)}
        />
        <Button onClick={handleCrear}>Agregar</Button>
      </div>

      <ul className="space-y-2">
        {cajas.map((caja: any) => (
          <li
            key={caja.idParqueoCaja}
            className="flex justify-between items-center p-2 border rounded"
          >
            <span>
              Cajon de Estacionamiento Nro. {caja.numeroCaja}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleEliminar(caja.idParqueoCaja)}
            >
              Eliminar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
