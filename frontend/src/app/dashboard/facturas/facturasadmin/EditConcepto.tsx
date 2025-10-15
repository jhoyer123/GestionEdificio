import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { updateConcepto } from "@/services/conceptosServices";
import type { AxiosError } from "axios";
import { type concepto } from "./ColumnsConcepto";
import { toast } from "sonner";
import axios from "axios";

interface EditConceptoProps {
  data: concepto;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

type FormData = {
  titulo: string;
  descripcion: string;
  monto: number;
  frecuencia: string;
};

const EditConcepto = ({
  data: conceptoEnv,
  setOpenEdit,
  refresh,
}: EditConceptoProps) => {
  // ✅ Inicializa los valores del formulario directamente
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      titulo: conceptoEnv.titulo,
      descripcion: conceptoEnv.descripcion || "",
      monto: conceptoEnv.monto,
      frecuencia: conceptoEnv.frecuencia,
    },
  });

  // ✅ Envío del formulario
  const onSubmit = async (data: FormData) => {
    try {
      const response = await updateConcepto(conceptoEnv.idConcepto, data);
      toast.success(response.message || "Concepto actualizado con éxito", {
        duration: 4000,
        position: "top-right",
      });
      setOpenEdit(false);
      refresh();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error al actualizar el concepto",
        { duration: 4000, position: "bottom-left" }
      );
    }
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Título */}
        <Input
          placeholder="Título del concepto"
          className="bg-gray-100"
          {...register("titulo", {
            required: "El título es obligatorio",
            minLength: {
              value: 3,
              message: "Debe tener al menos 3 caracteres",
            },
          })}
        />
        {errors.titulo && (
          <p className="text-red-500 text-sm">{errors.titulo.message}</p>
        )}

        {/* Descripción */}
        <Input
          placeholder="Descripción (opcional)"
          className="bg-gray-100"
          {...register("descripcion")}
        />

        {/* Monto */}
        <Input
          placeholder="Monto"
          type="number"
          step="0.01"
          className="bg-gray-100"
          {...register("monto", {
            required: "El monto es obligatorio",
            min: { value: 0, message: "El monto no puede ser negativo" },
          })}
        />
        {errors.monto && (
          <p className="text-red-500 text-sm">{errors.monto.message}</p>
        )}

        {/* Frecuencia */}
        <Controller
          name="frecuencia"
          control={control}
          rules={{ required: "Debe seleccionar una frecuencia" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-gray-100">
                <SelectValue placeholder="Selecciona la frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Frecuencia</SelectLabel>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="unico">Único</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.frecuencia && (
          <p className="text-red-500 text-sm">{errors.frecuencia.message}</p>
        )}

        {/* Botones */}
        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 cursor-pointer"
            onClick={() => setOpenEdit(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditConcepto;
