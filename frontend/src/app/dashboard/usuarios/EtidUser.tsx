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
import { useEffect, useState } from "react";
import { getFunciones } from "@/services/funcionServices";

type FormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rol: string; // 👈 campo rol obligatorio
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero?: string;
  funcionId?: number; // solo si es personal
  nroDepartamento?: number; // solo si es residente
};

interface Funcion {
  idFuncion: number;
  cargo: string;
}

export default function CrearUsuario() {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [funciones, setFunciones] = useState<Funcion[]>([]);

  const rolSeleccionado = watch("rol"); // 👈 para renderizar condicional

  useEffect(() => {
    const fetchFunciones = async () => {
      const data = await getFunciones();
      setFunciones(data);
    };
    fetchFunciones();
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log("Datos enviados:", data);
    // Aquí mandas al backend
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Datos generales de Usuario */}
      <Input
        placeholder="Nombre"
        {...register("nombre", { required: "Obligatorio" })}
      />
      {errors.nombre && <p className="text-red-500">{errors.nombre.message}</p>}

      <Input
        placeholder="Email"
        type="email"
        {...register("email", { required: "Obligatorio" })}
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <Input
        placeholder="Contraseña"
        type="password"
        {...register("password", { required: "Obligatorio" })}
      />
      <Input
        placeholder="Confirmar contraseña"
        type="password"
        {...register("confirmPassword", {
          validate: (value) => value === watch("password") || "No coincide",
        })}
      />

      {/* Select Rol */}
      <Select
        onValueChange={(val) => {
          setValue("rol", val, { shouldValidate: true });
          clearErrors("rol");
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="residente">Residente</SelectItem>
          <SelectItem value="administrador">Administrador</SelectItem>
        </SelectContent>
      </Select>
      <input
        type="hidden"
        {...register("rol", { required: "Debe seleccionar un rol" })}
      />
      {errors.rol && <p className="text-red-500">{errors.rol.message}</p>}

      {/* Campos extra según el rol */}
      {rolSeleccionado === "personal" && (
        <>
          <Input
            placeholder="Teléfono"
            {...register("telefono", { required: "Obligatorio" })}
          />
          <Input placeholder="Dirección" {...register("direccion")} />
          <Controller
            name="funcionId"
            control={control}
            rules={{ required: "Debes seleccionar un cargo" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString() ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el cargo del personal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Funciones</SelectLabel>
                    {funciones.map((f) => (
                      <SelectItem key={f.idFuncion} value={`${f.idFuncion}`}>
                        {f.cargo}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </>
      )}

      {rolSeleccionado === "residente" && (
        <>
          <Input placeholder="Teléfono" {...register("telefono")} />
          <Input
            placeholder="Nro Departamento"
            type="number"
            {...register("nroDepartamento", { required: "Obligatorio" })}
          />
          <Input placeholder="Dirección" {...register("direccion")} />
        </>
      )}

      {rolSeleccionado === "administrador" && (
        <>
          <p className="text-gray-500">
            No necesita datos extra (solo usuario y rol).
          </p>
        </>
      )}

      <Button type="submit" className="w-full bg-orange-500 text-white">
        Crear Usuario
      </Button>
    </form>
  );
}
