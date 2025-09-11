import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDepartamentos } from "@/services/departamentosServices";
import { useEffect, useState } from "react";

import { createUsuario } from "@/services/usuariosServices";
import type { AxiosError } from "axios";
// interface par los datos del formulario
type FormData = {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  rol: string;
  tipoResidencia: string;
  departamentoId: string;
  confirmPassword?: string; // Campo para confirmar la contraseña
};

interface DepartamentoProps {
  idDepartamento: number;
  numero: number;
  descripcion: string;
  piso: number;
}

interface createResidentProps {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
}
const CreateResidente = ({ setEditState }: createResidentProps) => {
  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { confirmPassword, ...rest } = data;
    //agregar el dato rolId aqui
    rest.rol = "residente"; // Asignar un valor de rolId
    // Aquí puedes manejar el envío del formulario, como llamar a una API para crear el personal
    try {
      const response = await createUsuario(rest);
      console.log("mensage del backend:", response.message);
      //Aqui redigir a la vista de residentes
      setEditState({ view: "residentes", entity: "", id: null });
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
  //Aqui traer las departamentos
  const [departamentos, setDepartamentos] = useState<DepartamentoProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDepartamentos();
      setDepartamentos(data);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 m-auto text-center">
        Crear Nuevo Residente
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Nombre"
          className="bg-gray-100"
          type="text"
          {...register("nombre", {
            required: "El nombre es obligatorio",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 caracteres",
            },
            maxLength: {
              value: 50,
              message: "El nombre no puede exceder los 50 caracteres",
            },
            pattern: {
              value: /^[A-Za-z\s]+$/,
              message: "El nombre solo puede contener letras y espacios",
            },
          })}
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
        )}
        <Input
          placeholder="Email"
          className="bg-gray-100"
          type="email"
          {...register("email", {
            required: "El email es obligatorio",
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
        <Input
          placeholder="contraseña"
          className="bg-gray-100"
          type="password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
        {/* Para confirmar la contraseña solo en el front sin añadirlo al formulario data */}
        <Input
          placeholder="Confirmar contraseña"
          className="bg-gray-100"
          type="password"
          {...register("confirmPassword", {
            required: "Debes confirmar la contraseña",
            validate: (value) =>
              value === watch("password") || "Las contraseñas no coinciden",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
        <Input
          placeholder="telefono"
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

        {/* Opción más simple sin Controller */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo Residencia
          </label>

          <Select
            onValueChange={(val) => {
              setValue("tipoResidencia", val, { shouldValidate: true });
              clearErrors("tipoResidencia");
            }}
            defaultValue="" // ✅ Valor por defecto para el Select
          >
            <SelectTrigger
              className={`w-full bg-gray-100 ${
                errors.tipoResidencia
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
            >
              <SelectValue placeholder="Selecciona un tipo de residencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="propietario">Propietario</SelectItem>
              <SelectItem value="alquiler">Alquiler</SelectItem>
            </SelectContent>
          </Select>

          {/* Input hidden para react-hook-form */}
          <input
            type="hidden"
            {...register("tipoResidencia", {
              required: "Debe seleccionar un tipo de residencia",
            })}
          />

          {errors.tipoResidencia && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tipoResidencia.message}
            </p>
          )}
        </div>

        {/* Select de unidad */}
        <div>
          <label className="block text-sm font-medium mb-2">Unidad</label>
          <Select
            onValueChange={(val) =>
              setValue("departamentoId", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full bg-gray-100">
              <SelectValue placeholder="Selecciona una unidad" />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((u) => (
                <SelectItem
                  key={u.idDepartamento}
                  value={u.idDepartamento.toString()}
                >
                  Departamento Nro. {u.numero} - Ubicacion Piso {u.piso}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.departamentoId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.departamentoId.message}
            </p>
          )}
          <input
            type="hidden"
            {...register("departamentoId", {
              required: "La unidad es obligatoria",
            })}
          />
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50"
            onClick={() =>
              setEditState({ view: "residentes", entity: "", id: null })
            }
          >
            Cancelar y volver
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Crear
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateResidente;
