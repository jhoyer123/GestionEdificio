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

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type FormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero?: string;
  funcionId?: number;
  departamentoId?: number;
  tipoResidencia?: string;
};

interface Funcion {
  idFuncion: number;
  cargo: string;
}
interface createUserProps {
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

export default function CreateUsuario({ setEditState }: createUserProps) {
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

  const [departamentos, setDepartamentos] = useState<DepartamentoProps[]>([]);

  const rolSeleccionado = watch("rol");

  useEffect(() => {
    const fetchFunciones = async () => {
      const funciones = await getFunciones();
      setFunciones(funciones);
      const departamentos = await getDepartamentos();
      setDepartamentos(departamentos);
    };
    fetchFunciones();
  }, []);

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    console.log("Datos enviados:", data);
    try {
      setLoading(true);
      const response = await createUsuario(data);
      const message = response.message || "Usuario creado exitosamente";
      toast.success(message, {
        duration: 4000,
        position: "bottom-left",
      });
      setEditState({ view: "usuarios", entity: "", id: null });
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error en el login",
        { duration: 4000, position: "bottom-left" }
      );
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 m-auto text-center">
        Crear Nuevo Usuario
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

        <div className="space-y-4">
          {/* Campo contraseña */}
          <div className="relative">
            <Input
              placeholder="Contraseña"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 8,
                  message: "Debe tener al menos 8 caracteres",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.,?":{}|<>]).{8,}$/,
                  message:
                    "Debe incluir mayúscula, minúscula, número y carácter especial",
                },
              })}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          {/* Campo confirmar contraseña */}
          <div className="relative">
            <Input
              placeholder="Confirmar contraseña"
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword", {
                validate: (value) =>
                  value === watch("password") || "Las contraseñas no coinciden",
              })}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
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
              {...register("telefono", {
                required: "campo obligatorio",
                minLength: { value: 7, message: "Mínimo 7 caracteres" },
              })}
            />
            {errors.telefono && (
              <p className="text-red-500">{errors.telefono.message}</p>
            )}
            <Input
              placeholder="Dirección"
              {...register("direccion", {
                required: "campo obligatorio",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
            />
            <div>
              <Select
                onValueChange={(val) => {
                  setValue("genero", val, { shouldValidate: true });
                  clearErrors("genero");
                }}
                defaultValue="" // ✅ Valor por defecto para el Select
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

              {/* Input hidden para react-hook-form */}
              <input
                type="hidden"
                {...register("genero", {
                  required: "Debe seleccionar un género",
                })}
              />

              {errors.genero && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.genero.message}
                </p>
              )}
            </div>
            <Input
              placeholder="Fecha de nacimiento"
              className="bg-gray-100"
              type="date"
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
            {errors.departamentoId && (
              <p className="text-red-500">{errors.departamentoId.message}</p>
            )}
          </>
        )}

        {rolSeleccionado === "administrador" && (
          <>
            <p className="text-gray-500">
              No necesita datos extra (solo usuario y rol).
            </p>
          </>
        )}
        <div className="flex gap-x-40 mt-8">
          <Button
            type="button"
            className="flex-1 cursor-pointer"
            onClick={() =>
              setEditState({ view: "usuarios", entity: "", id: null })
            }
            disabled={loading}
          >
            Cancelar y volver
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Creando..." : "Crear Usuario"}{" "}
          </Button>
        </div>
      </form>
    </div>
  );
}
