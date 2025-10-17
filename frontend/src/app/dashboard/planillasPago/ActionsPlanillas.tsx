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
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { type Planilla } from "@/app/dashboard/planillasPago/ColumnsPlanillas";
import PagoPlanilla from "./PagoPlanilla";

interface ActionsPlanillasProps {
  data: Planilla;
  refresh: () => void;
}

const ActionsPlanillas = ({ data, refresh }: ActionsPlanillasProps) => {
  const [openPago, setOpenPago] = useState(false);
  return (
    <>
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
          <DropdownMenuItem onClick={() => setOpenPago(true)}>
            Realizar Pago
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Dialog para realizar pago */}
      <Dialog open={openPago} onOpenChange={setOpenPago}>
        <DialogContent forceMount={undefined}>
          <DialogHeader>
            <DialogTitle>Realizar Pago</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <PagoPlanilla
            data={data}
            refresh={refresh}
            setOpenPago={setOpenPago}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsPlanillas;
