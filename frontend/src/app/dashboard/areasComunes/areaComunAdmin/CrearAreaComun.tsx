import { Form, useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { crearAreaComun, type AreaComun } from "@/services/areasServices";
import { type EditState } from "@/components/shared/MainContent";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import axios from "axios";

interface Props {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
}

export const CrearAreaComun = ({ setEditState }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AreaComun>();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const tipoArea = watch("tipoArea");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setValue("imageUrl", file as any);
    }
  };

  const onSubmit = async (data: AreaComun) => {
    if (!selectedFile) {
      alert("Debes seleccionar una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("nombreAreaComun", data.nombreAreaComun);
    formData.append("descripcion", data.descripcion || "");
    formData.append("capacidadMaxima", data.capacidadMaxima.toString());
    formData.append("costoBase", data.costoBase.toString());
    formData.append("tipoArea", data.tipoArea);
    formData.append("horarioApertura", data.horarioApertura || "");
    formData.append("horarioCierre", data.horarioCierre || "");
    formData.append("requiereAprobacion", String(data.requiereAprobacion));
    formData.append("imagen", selectedFile);
    console.log(formData.get("tipoArea"));
    try {
      const response = await crearAreaComun(formData);
      toast.success(response.message || "Área común creada correctamente", {
        duration: 4000,
        position: "top-left",
      });
      setEditState({ view: "areasComunesAdmin", entity: "", id: null });
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error al crear el área común",
        { duration: 4000, position: "bottom-left" }
      );
      console.log("Error del backend:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold p-4 text-center">Crear Área Común</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Columna Izquierda - Imagen */}
        <div className="flex flex-col items-center justify-center border rounded-lg p-4 bg-gray-50">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            className="bg-white border border-gray-300 cursor-pointer"
            onChange={handleImageChange}
          />
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="space-y-4">
          {/* Tipo de área */}
          <div>
            <select
              {...register("tipoArea", {
                required: "Debes seleccionar un tipo de área",
              })}
              className="bg-gray-50 border border-gray-300 w-full p-2 rounded"
            >
              <option value="">Seleccione el tipo de area...</option>
              <option value="salones">Salón</option>
              <option value="gimnasio">Gimnasio</option>
              <option value="parqueo">Parqueo</option>
            </select>
            {errors.tipoArea && (
              <p className="text-red-500 text-sm">{errors.tipoArea.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <Input
              type="text"
              placeholder="Nombre del área común"
              {...register("nombreAreaComun", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 3,
                  message: "El nombre debe tener al menos 3 caracteres",
                },
              })}
            />
            {errors.nombreAreaComun && (
              <p className="text-red-500 text-sm">
                {errors.nombreAreaComun.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <Input
              type="text"
              placeholder="Descripción (opcional)"
              {...register("descripcion")}
            />
          </div>

          <div>
            <Input
              type="number"
              placeholder="Capacidad máxima"
              {...register("capacidadMaxima", {
                required: "La capacidad es obligatoria",
                min: { value: 1, message: "Debe ser al menos 1 persona" },
              })}
            />
            {errors.capacidadMaxima && (
              <p className="text-red-500 text-sm">
                {errors.capacidadMaxima.message}
              </p>
            )}
          </div>

          {/* Costo Base */}
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Costo base"
              {...register("costoBase", {
                required: "El costo base es obligatorio",
                min: { value: 0, message: "No puede ser negativo" },
              })}
            />
            {errors.costoBase && (
              <p className="text-red-500 text-sm">{errors.costoBase.message}</p>
            )}
          </div>

          {/* Horarios (solo si no es parqueo) */}
          {tipoArea !== "parqueo" && (
            <>
              <div>
                <Input
                  type="time"
                  placeholder="Horario apertura"
                  {...register("horarioApertura", {
                    required: "Horario de apertura obligatorio",
                  })}
                />
                {errors.horarioApertura && (
                  <p className="text-red-500 text-sm">
                    {errors.horarioApertura.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="time"
                  placeholder="Horario cierre"
                  {...register("horarioCierre", {
                    required: "Horario de cierre obligatorio",
                  })}
                />
                {errors.horarioCierre && (
                  <p className="text-red-500 text-sm">
                    {errors.horarioCierre.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Requiere aprobación */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4"
              {...register("requiereAprobacion")}
            />
            <label className="text-sm">
              ¿Requiere aprobación del administrador?
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-x-6 mt-8">
            <Button
              type="button"
              className="flex-1 cursor-pointer"
              onClick={() =>
                setEditState({
                  view: "areasComunesAdmin",
                  entity: "",
                  id: null,
                })
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
