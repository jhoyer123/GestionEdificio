import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { pagarPlanilla, confirmarPagoPlanilla } from "@/services/pagosServices";

export interface PlanillaPersonal {
  idPlanilla: number;
  mes?: number;
  anio?: number;
  fechaGeneracion?: string;
  tipo: string;
  pagado: boolean;
  idPersonal: number;
  nombrePersonal: string;
  telefonoPersonal: string;
  emailPersonal: string;
  funcion: string;
  salario?: string;
  qrPersonal?: string;
  qrPersonalId?: number;
}

interface PagoPlanillaProps {
  data: PlanillaPersonal;
  refresh: () => void;
  setOpenPago: (open: boolean) => void;
}

const PagoPlanilla = ({ data, refresh, setOpenPago }: PagoPlanillaProps) => {
  const [comprobante, setComprobante] = useState<File | null>(null);

  // Traer la URL del backend
  const baseURL = import.meta.env.VITE_API_URL;
  const URL = `${baseURL.endsWith("/") ? baseURL : baseURL + "/"}${
    data.qrPersonal || ""
  }`;

  console.log("URL del QR:", URL);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprobante(file);
      toast.success(`Comprobante "${file.name}" cargado correctamente`);
    }
  };

  const handlePagoPlanilla = async () => {
    try {
      if (!comprobante) {
        toast.error(
          "Por favor, sube una imagen de comprobante antes de confirmar."
        );
        return;
      }
      const usuarioId = localStorage.getItem("user");
      //convertir a json
      const usuario = usuarioId ? JSON.parse(usuarioId) : null;
      const idUsuario = usuario ? usuario.id : 0;
      //primero crear el pago
      const pagoResponse = await pagarPlanilla(
        idUsuario,
        data.salario ? parseFloat(data.salario) : 0,
        data.idPlanilla
      );

      const confirmResponse = await confirmarPagoPlanilla(
        pagoResponse.pago.idPago,
        comprobante
      );

      toast.success(confirmResponse.message, {
        position: "top-right",
        duration: 4000,
      });

      setOpenPago(false);
      refresh();
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Error al procesar el pago", {
        position: "top-right",
        duration: 4000,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <CardTitle>
          Pago de planilla para el personal:{" "}
          <span className="font-semibold text-blue-600">
            {data.nombrePersonal}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {data.qrPersonal ? (
          <img
            src={URL}
            alt="QR de pago"
            className="mx-auto my-4 w-40 h-40 object-contain border rounded-lg shadow"
          />
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            No hay QR disponible de este personal
          </p>
        )}

        <ul className="text-left text-sm space-y-1 mb-4">
          <li>
            <strong>Función:</strong> {data.funcion}
          </li>
          <li>
            <strong>Salario:</strong> {data.salario || "—"}
          </li>
          <li>
            <strong>Mes/Año:</strong> {data.mes}/{data.anio}
          </li>
        </ul>

        {/* Subir comprobante */}
        <div className="my-4">
          <label
            htmlFor="comprobante"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Subir comprobante de pago:
          </label>
          <input
            id="comprobante"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {comprobante && (
            <p className="text-xs text-gray-500 mt-1">
              Archivo seleccionado: {comprobante.name}
            </p>
          )}
        </div>

        <Button
          onClick={handlePagoPlanilla}
          className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
        >
          Confirmar Pago
        </Button>
      </CardContent>
    </div>
  );
};

export default PagoPlanilla;
