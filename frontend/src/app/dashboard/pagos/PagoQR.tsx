import { useState } from "react";
import axios from "axios";
import { crearPago } from "@/services/pagosServices";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { promises } from "dns";
import { getFacturasByUsuario } from "@/services/facturas.services";

interface PagoQRProps {
  usuarioId: number;
  facturaId: number;
  monto: number;
  setFacturas: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function PagoQR({
  usuarioId,
  facturaId,
  monto,
  setFacturas,
}: PagoQRProps) {
  const [qr, setQr] = useState<string | null>(null);
  const [idPago, setIdPago] = useState<number | null>(null);
  const [estado, setEstado] = useState("pendiente");

  const registrarPago = async () => {
    try {
      const res = await crearPago({
        usuarioId,
        facturaId,
        monto,
      });
      setQr(res.qr);
      setIdPago(res.idPago);
    } catch (error) {
      console.error(error);
      alert("Error al registrar el pago");
    }
  };

  const confirmarPago = async () => {
    if (!idPago) return;
    try {
      const response = await axios.put(
  `${import.meta.env.VITE_API_URL}/api/pagos/confirmar/${idPago}`
      );
      setEstado("confirmado");
      toast.success(response.data.message || "Pago confirmado correctamente", {
        duration: 4000,
        position: "top-right",
      });
      // Actualizar la lista de facturas después de confirmar el pago
      const facturasActualizadas = await getFacturasByUsuario(usuarioId);
      setFacturas(facturasActualizadas)
    } catch (error) {
      console.error(error);
      toast.error("Error al confirmar el pago", {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Simulador de Pago</h2>
      <p className="mb-4">
        Factura #{facturaId} — Monto: <b>Bs. {monto}</b>
      </p>

      {!qr && (
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded cursor-pointer"
          onClick={registrarPago}
        >
          Generar QR de pago
        </Button>
      )}

      {qr && (
        <div className="flex flex-col items-center mt-4">
          <img
            src={qr}
            alt="QR Pago"
            className="w-64 h-64 mb-4 border p-2 bg-white shadow-md"
          />
          <p className="mb-4 text-lg">
            Estado: <b>{estado}</b>
          </p>
          {estado === "pendiente" && (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded cursor-pointer"
              onClick={confirmarPago}
            >
              Confirmar el pago
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
