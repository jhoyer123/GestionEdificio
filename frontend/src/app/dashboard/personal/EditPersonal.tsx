import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFunciones } from "@/services/funcionServices";
import { useEffect, useState } from "react";
import type { propsPersonal } from "./ColumnsP";
import axios from "axios";
import { toast } from "sonner";
import { updatePersonal } from "@/services/personalServices";

interface EditPersonalProps {
  data: propsPersonal;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

type FormData = {
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  genero: string;
  funcionId: number;
};

interface Funcion {
  idFuncion: number;
  cargo: string;
  descripcion: string;
  salario: string;
}

export default function EditPersonal({
  data,
  setOpenEdit,
  refresh,
}: EditPersonalProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      telefono: data.telefono,
      direccion: data.direccion,
      fechaNacimiento: data.fechaNacimiento?.slice(0, 10) || "",
      genero: data.genero,
      funcionId: data.funcionId,
    },
  });

  const [funciones, setFunciones] = useState<Funcion[]>([]);

  useEffect(() => {
    const fetchFunciones = async () => {
      try {
        const data = await getFunciones();
        setFunciones(data);
      } catch (error) {
        console.error("Error al obtener las funciones:", error);
      }
    };
    fetchFunciones();
  }, []);

  const onSubmit = async (formData: FormData) => {
    try {
      console.log(formData);
      console.log(data);
      const response = await updatePersonal(data.usuarioId, formData);
      const message = response.message;
      toast.success(message, {
        duration: 4000,
        position: "top-left",
      });
      setOpenEdit(false);
      refresh();
    } catch (error) {
      toast.error("Error al actualizar el personal", {
        duration: 4000,
        position: "top-left",
      });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-lg font-medium">Actualizar datos de: {data.nombre}</h2>

      {/* Teléfono */}
      <label className="block text-sm font-medium mb-2">Teléfono</label>
      <Input
        placeholder="Teléfono"
        className="bg-gray-100"
        {...register("telefono", {
          required: "El teléfono es obligatorio",
          pattern: {
            value: /^\+?[0-9\s\-()]{7,15}$/,
            message: "El teléfono no es válido",
          },
        })}
      />
      {errors.telefono && (
        <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
      )}

      {/* Dirección */}
      <label className="block text-sm font-medium mb-2">Dirección</label>
      <Input
        placeholder="Dirección"
        className="bg-gray-100"
        {...register("direccion", {
          required: "La dirección es obligatoria",
          minLength: {
            value: 5,
            message: "La dirección debe tener al menos 5 caracteres",
          },
        })}
      />
      {errors.direccion && (
        <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>
      )}

      {/* Fecha de nacimiento */}
      <label className="block text-sm font-medium mb-2">Fecha de nacimiento</label>
      <Input
        type="date"
        className="bg-gray-100"
        {...register("fechaNacimiento", {
          required: "La fecha de nacimiento es obligatoria",
          validate: (value) => {
            if (!value) return "La fecha es obligatoria";
            const hoy = new Date();
            const fecha = new Date(value);
            if (fecha > hoy) return "La fecha no puede ser en el futuro";
            return true;
          },
        })}
      />
      {errors.fechaNacimiento && (
        <p className="text-red-500 text-sm mt-1">
          {errors.fechaNacimiento.message}
        </p>
      )}

      {/* Género */}
      <div>
        <label className="block text-sm font-medium mb-2">Género</label>
        <Select
          onValueChange={(val) => {
            setValue("genero", val, { shouldValidate: true });
            clearErrors("genero");
          }}
          defaultValue={data.genero || ""}
        >
          <SelectTrigger
            className={`w-full bg-gray-100 ${
              errors.genero ? "border-red-500 focus:border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Selecciona un género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="femenino">Femenino</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="hidden"
          {...register("genero", {
            required: "Debe seleccionar un género",
          })}
        />
        {errors.genero && (
          <p className="text-red-500 text-sm mt-1">{errors.genero.message}</p>
        )}
      </div>

      {/* Función */}
      <div>
        <label className="block text-sm font-medium mb-2">Cargo</label>
        <Controller
          name="funcionId"
          control={control}
          rules={{ required: "Debes seleccionar un cargo" }}
          render={({ field }) => (
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value?.toString() ?? ""}
            >
              <SelectTrigger
                className={`w-full bg-gray-100 ${
                  errors.funcionId ? "border-red-500 focus:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Selecciona el cargo del personal" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Funciones</SelectLabel>
                  {funciones.map((funcion) => (
                    <SelectItem
                      key={funcion.idFuncion}
                      value={`${funcion.idFuncion}`}
                    >
                      {funcion.cargo}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.funcionId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.funcionId.message}
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setOpenEdit(false)}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
        >
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
