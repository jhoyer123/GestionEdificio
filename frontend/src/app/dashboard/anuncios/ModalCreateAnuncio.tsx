import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createAnuncio, updateAnuncio } from "@/services/anunciosServices"; // asegúrate que exista
import { useAuth } from "@/components/shared/AuthContext";
import { toast } from "sonner";

interface FormData {
  usuarioId?: number;
  titulo: string;
  descripcion: string;
  visiblePara: string;
  fechaExpiracion: string;
}

interface CrearAnuncioModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
  dataAnuncio?: any;
}

export default function ModalCreateAnuncio({
  open,
  setOpen,
  refresh,
  dataAnuncio,
}: CrearAnuncioModalProps) {
  //uso de estado global user
  const { user } = useAuth();

  // Función para convertir "dd/mm/yyyy" → "yyyy-mm-dd"
  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return "";
    const [dia, mes, año] = fecha.split("/");
    return `${año}-${mes}-${dia}`; // formato compatible con <input type="date" />
  };

  //react-hook-form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      usuarioId: user?.id,
      titulo: dataAnuncio?.titulo || "",
      descripcion: dataAnuncio?.descripcion || "",
      visiblePara: dataAnuncio?.visiblePara || "todos",
      fechaExpiracion: formatearFecha(dataAnuncio?.fechaExpiracion) || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      let response;
      // Llamada al servicio que crea el anuncio (ajusta según tu API)
      if (!dataAnuncio) {
        response = await createAnuncio({
          usuarioId: user?.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          visiblePara: data.visiblePara,
          fechaExpiracion: data.fechaExpiracion,
        });
        toast.success(response.message || "Anuncio creado con éxito", {
          duration: 4000,
          position: "top-left",
        });
      } else {
        response = await updateAnuncio(dataAnuncio.idAnuncio, {
          usuarioId: user?.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          visiblePara: data.visiblePara,
          fechaExpiracion: data.fechaExpiracion,
        });
        toast.success(response.message || "Anuncio actualizado con éxito", {
          duration: 4000,
          position: "top-left",
        });
      }
      // cerrar modal y resetear formulario
      setOpen(false);
      reset();
      // refrescar lista en el padre si lo necesita
      refresh();
    } catch (error) {
      console.error("Error creando anuncio:", error);
      // aquí podrías mostrar un toast o mensaje de error
      toast.error("Error creando anuncio", {
        duration: 4000,
        position: "top-left",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear anuncio</DialogTitle>
          <DialogDescription>
            Completa los datos para publicar un anuncio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              placeholder="Ej. Informe mensual de administración"
              {...register("titulo", { required: "El título es obligatorio" })}
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.titulo.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              className="h-32 resize-none overflow-y-auto break-all"
              {...register("descripcion", {
                required: "La descripción es obligatoria",
              })}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* Visible para - usando Controller */}
          <div>
            <Label>Visible para</Label>
            <Controller
              control={control}
              name="visiblePara"
              rules={{ required: "Selecciona el público" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="residente">Residentes</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.visiblePara && (
              <p className="text-red-500 text-sm mt-1">
                {errors.visiblePara.message as string}
              </p>
            )}
          </div>

          {/* Fecha de expiración */}
          <div>
            <Label htmlFor="fechaExpiracion">Fecha de expiración</Label>
            <Input
              id="fechaExpiracion"
              type="date"
              {...register("fechaExpiracion", {
                required: "La fecha es obligatoria",
                validate: (value) => {
                  const today = new Date();
                  const selectedDate = new Date(value);
                  return selectedDate > today || "La fecha debe ser futura";
                },
              })}
            />
            {errors.fechaExpiracion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fechaExpiracion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <div className="flex justify-between m-0 p-0 w-full">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
              </DialogClose>

              <Button
                type="submit"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600"
              >
                Guardar anuncio
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
