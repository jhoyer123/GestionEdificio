import React, { useState } from "react";
import { Briefcase, DollarSign, Info, Eye, Edit3, Trash2 } from "lucide-react";
import { type IFuncion } from "./Funciones";
import { Button } from "@/components/ui/button";
import FuncionesFormDialog from "./FuncionesFormDialog";
import DeleteFuncionAlert from "./DeleteFuncionAlert";

interface FuncionCardProps {
  funcion: IFuncion;
}

const FuncionCard: React.FC<FuncionCardProps> = ({ funcion }) => {
  const salarioFormateado = new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
  }).format(funcion.salario);

  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("view");
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div
      className="
        w-full
        rounded-xl
        border
        bg-background
        p-4
        shadow-sm
        transition
        hover:shadow-md
        sm:p-5
      "
    >
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-md border p-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
          </div>

          <h3 className="truncate text-base font-semibold">{funcion.cargo}</h3>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMode("view");
              setOpenDialog(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMode("edit");
              setOpenDialog(true);
            }}
          >
            <Edit3 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {funcion.descripcion}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          mt-4
          flex
          flex-col
          gap-2
          border-t
          pt-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Salario base</span>
        </div>

        <span className="text-base font-semibold">{salarioFormateado}</span>
      </div>

      {/* DIALOGS */}
      <FuncionesFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        mode={mode}
        initialData={funcion}
        onSuccess={() => {}}
      />

      <DeleteFuncionAlert
        open={openDelete}
        setOpen={setOpenDelete}
        idFuncion={funcion.idFuncion}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default FuncionCard;
