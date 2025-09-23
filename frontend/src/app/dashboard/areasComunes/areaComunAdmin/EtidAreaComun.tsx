import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  type AreaComun,
  getAreaById,
  updateAreaComun, // 👉 necesitas crear este service en tu API (PUT/PATCH)
} from "@/services/areasServices";
import { type EditState } from "@/components/shared/MainContent";
import { toast } from "sonner";
import axios from "axios";

interface Props {
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  areaComunId: number | null;
}

export const EditAreaComun = ({ setEditState, areaComunId }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AreaComun>();

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // 👉 Traer datos del área desde el backend
  const fetchAreaData = async () => {
    if (!areaComunId) return;
    try {
      const areaComun = await getAreaById(areaComunId.toString());

      // ✅ Precargar valores en el formulario
      setValue("nombreAreaComun", areaComun.nombreAreaComun);
      setValue("descripcion", areaComun.descripcion || "");
      setValue("capacidadMaxima", areaComun.capacidadMaxima);
      setValue("costoPorHora", areaComun.costoPorHora);
      setValue("horarioInicio", areaComun.horarioInicio);
      setValue("horarioFin", areaComun.horarioFin);
      setValue("requiereAprobacion", areaComun.requiereAprobacion);

      // ✅ Mostrar imagen actual si existe
      if (areaComun.imageUrl) {
        // Usa tu base de URL del backend (ej. import.meta.env.VITE_API_URL)
        setPreview(
          `${import.meta.env.VITE_API_URL}/uploads/${areaComun.imageUrl}`
        );
      }
    } catch (error) {
      console.error("Error cargando área:", error);
      toast.error("No se pudo cargar el área común");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAreaData();
  }, [areaComunId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      // Si quieres que react-hook-form lo maneje:
      setValue("imageUrl", file as any);
    }
  };

  const onSubmit = async (data: AreaComun) => {
    if (!areaComunId) return;

    const formData = new FormData();
    formData.append("nombreAreaComun", data.nombreAreaComun);
    formData.append("descripcion", data.descripcion || "");
    formData.append("capacidadMaxima", data.capacidadMaxima.toString());
    formData.append("costoPorHora", data.costoPorHora.toString());
    formData.append("horarioInicio", data.horarioInicio);
    formData.append("horarioFin", data.horarioFin);
    formData.append("requiereAprobacion", String(data.requiereAprobacion));

    // ✅ Solo enviar imagen si el usuario seleccionó una nueva
    if (selectedFile) {
      formData.append("imagen", selectedFile);
    }

    try {
      const response = await updateAreaComun(areaComunId.toString(), formData);
      const message =
        response.message || "Área común actualizada correctamente";
      toast.success(message, { duration: 4000, position: "top-left" });
      setEditState({ view: "areasComunesAdmin", entity: "", id: null });
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error al actualizar el área común",
        { duration: 4000, position: "bottom-left" }
      );
      console.log("Error del backend:", error);
    }
  };

  if (loadingData) {
    return <p className="text-center p-4">Cargando datos...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold p-4 text-center">
        Editar Datos de Área Común
      </h2>
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
          {/* Nombre */}
          <div>
            <Input
              type="text"
              placeholder="Nombre del área común"
              className="bg-gray-50 border border-gray-300"
              {...register("nombreAreaComun", {
                required: "El nombre es obligatorio",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
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
              className="bg-gray-50 border border-gray-300"
              {...register("descripcion")}
            />
          </div>

          {/* Capacidad */}
          <div>
            <Input
              type="number"
              placeholder="Capacidad máxima"
              className="bg-gray-50 border border-gray-300"
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

          {/* Costo */}
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Costo por hora"
              className="bg-gray-50 border border-gray-300"
              {...register("costoPorHora", {
                required: "El costo por hora es obligatorio",
                min: { value: 0, message: "No puede ser negativo" },
              })}
            />
            {errors.costoPorHora && (
              <p className="text-red-500 text-sm">
                {errors.costoPorHora.message}
              </p>
            )}
          </div>

          {/* Horario inicio */}
          <div>
            <Input
              type="time"
              className="bg-gray-50 border border-gray-300"
              {...register("horarioInicio", {
                required: "El horario de inicio es obligatorio",
              })}
            />
            {errors.horarioInicio && (
              <p className="text-red-500 text-sm">
                {errors.horarioInicio.message}
              </p>
            )}
          </div>

          {/* Horario fin */}
          <div>
            <Input
              type="time"
              className="bg-gray-50 border border-gray-300"
              {...register("horarioFin", {
                required: "El horario de fin es obligatorio",
              })}
            />
            {errors.horarioFin && (
              <p className="text-red-500 text-sm">
                {errors.horarioFin.message}
              </p>
            )}
          </div>

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
