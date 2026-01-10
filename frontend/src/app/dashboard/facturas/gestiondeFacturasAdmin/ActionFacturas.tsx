"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { FacturaMantPDF } from "../genFactMant/FacturaMantPDF";
import { FacturaReservaPDF } from "../genFactMant/FacturaReservaPDF";
import type { facturas } from "./ColumnsFacturas";
import { useEffect } from "react";
import { getReservaById } from "@/services/reservaServices";

interface FacturasProps {
  data: facturas;
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
}

const ActionsPersonal = ({ data }: FacturasProps) => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [reserva, setReserva] = useState<any | null>(null);

  useEffect(() => {
    const fetchReserva = async () => {
      if (data.reservaId) {
        const reservaData = await getReservaById(data.reservaId);
        setReserva(reservaData);
      }
    };
    fetchReserva();
  }, [data.reservaId]);

  const handleOpenPdf = async () => {
    try {
      setLoadingPdf(true);

      let doc = <FacturaMantPDF factura={data} />;
      if (!data.fechaVencimiento) {
        doc = <FacturaReservaPDF factura={data} reservaData={reserva} />;
      }
      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Error generando/abriendo PDF:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOpenPdf()}>
          {loadingPdf ? "Generando PDF..." : "Ver Mas Detalles"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsPersonal;
