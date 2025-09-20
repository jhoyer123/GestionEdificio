// app/pages/CrearDepartamento.tsx
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { crearDepartamento } from "@/services/departamentosServices";
import { ref } from "process";

type FormData = {
  numero: number;
  descripcion: string;
  piso: number;
  alquilerPrecio: number;
};

type CreateDepartamentoProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
};

export const CreateDepartamento = ({
  setOpen,
  refresh,
}: CreateDepartamentoProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await crearDepartamento(data);
      const message = response.message;
      toast.success(message, {
        position: "top-left",
      });
      setOpen(false);
      refresh();
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error en el login",
        {
          duration: 4000,
          position: "top-left",
        }
      );
      console.log("Error del backend:", error);
    }
  };

  return (
    <>
      <CardContent className="p-0 m-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Número */}
          <div>
            <Input
              type="number"
              placeholder="Número de departamento"
              className="bg-gray-50 border border-gray-300"
              {...register("numero", {
                required: "El número es obligatorio",
              })}
            />
            {errors.numero && (
              <p className="text-red-500 text-sm">{errors.numero.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <Input
              type="text"
              placeholder="Descripción (opcional)"
              className="bg-gray-50 border border-gray-300"
              {...register("descripcion")}
            />
          </div>

          {/* Piso */}
          <div>
            <Input
              type="number"
              placeholder="Piso"
              className="bg-gray-50 border border-gray-300"
              {...register("piso", { required: "El piso es obligatorio" })}
            />
            {errors.piso && (
              <p className="text-red-500 text-sm">{errors.piso.message}</p>
            )}
          </div>

          {/* Precio de alquiler */}
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Precio de alquiler"
              className="bg-gray-50 border border-gray-300"
              {...register("alquilerPrecio", {
                required: "El precio es obligatorio",
              })}
            />
            {errors.alquilerPrecio && (
              <p className="text-red-500 text-sm">
                {errors.alquilerPrecio.message}
              </p>
            )}
          </div>

          <div className="flex gap-x-28 mt-8">
            {/* Botón */}
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 cursor-pointer"
            >
              Cancelar
            </Button>

            {/* Botón */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};
