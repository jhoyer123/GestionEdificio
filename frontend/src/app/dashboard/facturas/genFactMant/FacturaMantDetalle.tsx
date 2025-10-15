"use client";
import React, { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FacturaMantPDF } from "./FacturaMantPDF";
import { getFacturaById } from "@/services/facturas.services";
import { Button } from "@/components/ui/button";

interface FacturaPageProps {
  id: number | null;
}

export const FacturaPage = ({ id }: FacturaPageProps) => {
  const [facturaEnviada, setFacturaEnviada] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const f = await getFacturaById(id);
      setFacturaEnviada(f);
    };
    fetch();
  }, [id]);

  const handleOpenInNewWindow = async () => {
    if (!facturaEnviada) return;
    try {
      const doc = <FacturaMantPDF factura={facturaEnviada} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // opcional: liberar el object URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    } catch (err) {
      console.error("Error generando PDF:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Factura #{facturaEnviada?.nroFactura || "Cargando..."}
      </h1>

      {facturaEnviada ? (
        <>
          <div className="flex gap-2">
            <Button onClick={handleOpenInNewWindow}>
              Abrir factura en nueva ventana
            </Button>
          </div>
        </>
      ) : (
        <p>Cargando datos de la factura...</p>
      )}
    </div>
  );
};
