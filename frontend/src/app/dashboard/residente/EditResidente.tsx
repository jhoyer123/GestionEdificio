import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import type { propsResidente } from "./ColumnsR";
import axios from "axios";
import { toast } from "sonner";
import { updateResidente } from "@/services/residenteServices";

interface GestionarDatosUsuarioProps {
  data: propsResidente;
  children?: React.ReactNode;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

type FormData = {
  telefono: string;
  tipoResidencia: "propietario" | "alquiler";
};

export default function EditUsuario({
  data,
  children,
  setOpenEdit,
  refresh,
}: GestionarDatosUsuarioProps) {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (defaultValue: FormData) => {
    try {
      console.log(data);
      const response = await updateResidente(data.idResidente, defaultValue);
      const message = response.message;
      toast.success(message, { duration: 4000, position: "top-left" });
      setOpenEdit(false);
      refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message, {
          duration: 4000,
          position: "top-left",
        });
      } else {
        console.error("Error actualizando:", error);
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Aqui mostraremos el nombre del usuario a actualizar */}
      <h2 className="text-lg font-medium">
        Editando datos de: {data.nombre}
      </h2>
      {/* Teléfono */}
      <Input
        defaultValue={data.telefono}
        placeholder="Teléfono"
        type="tel"
        {...register("telefono", {
          required: "Obligatorio",
          pattern: {
            value: /^[0-9]{8,15}$/,
            message: "Número de teléfono inválido",
          },
        })}
      />
      {errors.telefono && (
        <p className="text-red-500">{errors.telefono.message}</p>
      )}

      {/* Tipo Residencia (Select de shadcn) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Tipo Residencia
        </label>
        <Select
          onValueChange={(val) => {
            setValue("tipoResidencia", val as "propietario" | "alquiler", {
              shouldValidate: true,
            });
            clearErrors("tipoResidencia");
          }}
          defaultValue={data.departamento.tipoResidencia || ""}
        >
          <SelectTrigger
            className={`w-full bg-gray-100 ${
              errors.tipoResidencia ? "border-red-500 focus:border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Selecciona un tipo de residencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="propietario">Propietario</SelectItem>
            <SelectItem value="alquiler">Alquiler</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipoResidencia && (
          <p className="text-red-500">{errors.tipoResidencia.message}</p>
        )}
      </div>

      {children}
    </form>
  );
}
