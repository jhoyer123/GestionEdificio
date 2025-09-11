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
import { createUsuario } from "@/services/usuariosServices";
import type { AxiosError } from "axios";
import { getPersonalById } from "@/services/personalServices";

interface EditPersonalProps {
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >;
  personalId: number | null;
}

type FormData = {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  genero: string;
  rol: string;
  funcionId: number;
  confirmPassword?: string; // Campo para confirmar la contraseña
};

interface Funcion {
  idFuncion: number;
  cargo: string;
  descripcion: string;
  salario: string;
}

interface propsPersonal {
  idPersonal: number;
  telefono: string;
  direccion: string;
  genero: string;
  fechaNacimiento: string;
  funcionId: number;
  cargo: string;
  usuarioId: number;
  nombre: string;
  email: string;
  estado: boolean;
}

const EditPersonal = ({ setEditState, personalId }: EditPersonalProps) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { confirmPassword, ...rest } = data;
    //agregar el dato rolId aqui
    rest.rol = "personal"; // Asignar un valor de rolId
    console.log(rest);
    // Aquí puedes manejar el envío del formulario, como llamar a una API para crear el personal
    try {
      const response = await createUsuario(rest);
      console.log("Personal creado:", response.usuario);
      console.log("Mensaje:", response.message);
      // Después de crear el personal, puedes volver a la vista de lista
      setEditState({ view: "personal", entity: "", id: null });
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

  //Aqui traer las funciones
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [personalData, setPersonalData] = useState<propsPersonal | null>(null);

  useEffect(() => {
    const fetchFunciones = async () => {
      try {
        const data = await getFunciones();
        setFunciones(data);
        const personalData = await getPersonalById(personalId);
        console.log(personalData);
        setPersonalData(personalData);
        // Rellenar los campos del formulario con los datos obtenidos
        setValue("nombre", personalData.nombre);
        setValue("email", personalData.email);
        setValue("telefono", personalData.telefono);
        setValue("direccion", personalData.direccion);
        setValue("fechaNacimiento", personalData.fechaNacimiento);
        setValue("genero", personalData.genero);
        setValue("funcionId", personalData.funcionId);
      } catch (error) {
        console.error("Error al obtener las funciones:", error);
      }
    };

    fetchFunciones();
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 text-center">
      <h2 className="text-2xl font-bold mb-6">Editar Datos del Personal</h2>
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
        <Controller
          name="genero"
          control={control}
          rules={{ required: "Debe seleccionar un género" }}
          render={({ field }) => (
            <Select
              onValueChange={(val) => {
                field.onChange(val);
                clearErrors("genero");
              }}
              value={field.value || ""} // 👈 RHF controla el valor
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
          )}
        />
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

        <Input
          placeholder="direccion"
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
          <p className="text-red-500 text-sm mt-1">
            {errors.direccion.message}
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
              <SelectTrigger className="w-fit">
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
          <p className="text-red-500 text-sm">{errors.funcionId.message}</p>
        )}
        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50"
            onClick={() =>
              setEditState({ view: "personal", entity: "personal", id: null })
            }
          >
            Cancelar y volver
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Actualizar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPersonal;
