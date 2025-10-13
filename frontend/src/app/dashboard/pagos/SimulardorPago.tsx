import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { obtenerPagoPorId } from "@/services/pagosServices";
import axios from "axios";
import { toast } from "sonner";

interface Pago {
  idPago: number;
  usuarioId: number;
  facturaId: number;
  monto: number;
  estado: string;
}

export default function SimuladorPago() {
  const { idPago } = useParams();
  const id = idPago ? parseInt(idPago, 10) : undefined;

  const [pago, setPago] = useState<Pago | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPago = async () => {
      const data = await obtenerPagoPorId(id);
      setPago(data);
    };
    fetchPago();
  }, [id]);

  const confirmarPago = async () => {
    if (!id) return;
    try {
      const response = await axios.put(
        `http://localhost:3000/api/pagos/confirmar/${id}`
      );
      toast.success(response.data.message || "Pago confirmado correctamente", {
        duration: 4000,
        position: "top-right",
      });
      if (pago) setPago({ ...pago, estado: "pagado" });
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "❌ Error al confirmar el pago",
        {
          duration: 4000,
          position: "top-right",
        }
      );
    }
  };

  if (!pago)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Simulador de Pago
        </h2>

        <div className="space-y-2 text-center mb-4">
          <p>
            <span className="font-semibold">Factura:</span> #{pago.facturaId}
          </p>
          <p>
            <span className="font-semibold">Monto:</span> Bs. {pago.monto}
          </p>
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            <span
              className={`font-bold ${
                pago.estado === "pendiente"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {pago.estado}
            </span>
          </p>
        </div>

        {pago.estado === "pendiente" && (
          <button
            onClick={confirmarPago}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
          >
            Confirmar pago
          </button>
        )}
      </div>
    </div>
  );
}
