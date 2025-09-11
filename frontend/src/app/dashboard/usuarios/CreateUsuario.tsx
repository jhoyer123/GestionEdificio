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
import { getDepartamentos } from "@/services/departamentosServices";
import { createUsuario } from "@/services/usuariosServices";
import type { AxiosError } from "axios";

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
  departamentoId?: number; // solo si es residente
  tipoResidencia?: string; // solo si es residente
};

interface Funcion {
  idFuncion: number;
  cargo: string;
}
interface createResidentProps {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
}

interface DepartamentoProps {
  idDepartamento: number;
  numero: number;
  descripcion: string;
  piso: number;
}

export default function CreateUsuario({ setEditState }: createResidentProps) {
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
  //Aqui traer las departamentos
  const [departamentos, setDepartamentos] = useState<DepartamentoProps[]>([]);

  const rolSeleccionado = watch("rol"); // 👈 para renderizar condicional

  useEffect(() => {
    const fetchFunciones = async () => {
      const funciones = await getFunciones();
      setFunciones(funciones);
      const departamentos = await getDepartamentos();
      setDepartamentos(departamentos);
    };
    fetchFunciones();
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log("Datos enviados:", data);
    // Aquí mandas al backend
    // Aquí puedes manejar el envío del formulario, como llamar a una API para crear el personal
    try {
      const response = await createUsuario(data);
      console.log("mensage del backend:", response.message);
      //Aqui redigir a la vista de usuarios
      setEditState({ view: "usuarios", entity: "", id: null });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response) {
        console.error(
          "Este es el mensaje del backend:",
          err.response.data.message
        ); // <-- tu mensaje del backend
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 m-auto text-center">
        Crear Nuevo Usuario
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Datos generales de Usuario */}
        <Input
          placeholder="Nombre"
          {...register("nombre", {
            required: "Obligatorio",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
          })}
        />
        {errors.nombre && (
          <p className="text-red-500">{errors.nombre.message}</p>
        )}

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
            validate: (value) =>
              value === watch("password") || "Las contraseñas no coinciden",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword.message}</p>
        )}

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
            <Input
              placeholder="Teléfono"
              {...register("telefono", { required: "Obligatorio" })}
            />
            {/* Select tipoResidencia */}
            <Select
              onValueChange={(val) => {
                setValue("tipoResidencia", val, { shouldValidate: true });
                clearErrors("tipoResidencia");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de residencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="propietario">Propietario</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register("tipoResidencia", {
                required: "Debe seleccionar un tipo de residencia",
              })}
            />
            {errors.tipoResidencia && (
              <p className="text-red-500">{errors.tipoResidencia.message}</p>
            )}
            <Controller
              name="departamentoId"
              control={control}
              rules={{ required: "Debes seleccionar un departamento" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString() ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departamentos</SelectLabel>
                      {departamentos.map((d) => (
                        <SelectItem
                          key={d.idDepartamento}
                          value={`${d.idDepartamento}`}
                        >
                          Departamento Nro. {d.numero} ubicacion piso {d.piso}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </>
        )}

        {rolSeleccionado === "administrador" && (
          <>
            <p className="text-gray-500">
              No necesita datos extra (solo usuario y rol).
            </p>
          </>
        )}
        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 cursor-pointer
            "
            onClick={() =>
              setEditState({ view: "usuarios", entity: "", id: null })
            }
          >
            Cancelar y volver
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
          >
            Crear Usuario
          </Button>
        </div>
      </form>
    </div>
  );
}
