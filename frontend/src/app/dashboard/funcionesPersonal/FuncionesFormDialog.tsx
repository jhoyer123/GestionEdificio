import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFuncion, updateFuncion } from "@/services/funcionServices";
import type { IFuncion } from "./Funciones";
import { useForm } from "react-hook-form";

type Mode = "create" | "edit" | "view";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  mode: Mode;
  initialData?: IFuncion | null;
  onSuccess?: () => void;
}

type FormValues = {
  cargo: string;
  descripcion: string;
  salario: number | "";
};

const FuncionesFormDialog: React.FC<Props> = ({
  open,
  setOpen,
  mode,
  initialData = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialData ?? { cargo: "", descripcion: "", salario: "" },
  });

  const isView = mode === "view";

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const payload = {
        cargo: data.cargo.trim(),
        descripcion: data.descripcion.trim(),
        salario: Number(data.salario) || 0,
      };

      if (mode === "create") {
        await createFuncion(payload);
      } else if (mode === "edit" && initialData) {
        await updateFuncion(initialData.idFuncion, payload);
      }

      onSuccess?.();
      setOpen(false);
    } catch (err) {
      console.error("Error al guardar la función:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Crear Función"
              : mode === "edit"
              ? "Editar Función"
              : "Ver Función"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 mt-2">
          <div className="grid gap-2">
            <Label>Cargo</Label>
            <Input
              placeholder="Ingrese el cargo"
              disabled={isView}
              {...register("cargo", { required: "El cargo es requerido" })}
            />
            {errors.cargo && (
              <span className="text-sm text-destructive">
                {errors.cargo.message}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Textarea
              className="w-full h-28 resize-none placeholder-slate-400"
              placeholder="Ingrese la descripción"
              disabled={isView}
              {...register("descripcion", {
                required: "La descripción es requerida",
              })}
            />
            {errors.descripcion && (
              <span className="text-sm text-destructive">
                {errors.descripcion.message}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Salario</Label>
            <Input
              type="number"
              placeholder="Ingrese el salario"
              disabled={isView}
              {...register("salario", {
                setValueAs: (v) => (v === "" ? "" : Number(v)),
                required: "El salario es requerido",
                validate: (v) =>
                  v === "" ||
                  !Number.isNaN(Number(v)) ||
                  "El salario debe ser un número",
              })}
            />
            {errors.salario && (
              <span className="text-sm text-destructive">
                {errors.salario.message}
              </span>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-end w-full gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>
              {!isView && (
                <Button type="submit" disabled={loading}>
                  {mode === "create" ? "Crear" : "Guardar cambios"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FuncionesFormDialog;
