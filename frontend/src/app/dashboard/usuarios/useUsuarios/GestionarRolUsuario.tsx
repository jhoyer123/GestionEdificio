import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type propsUsuarios } from "../Columns";
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
import { getRoles } from "../../../../services/rolServices";
import { getFunciones } from "../../../../services/funcionServices";
import {
  createPersonal,
  deletePersonalRol,
} from "../../../../services/personalServices";
import { useEffect, useState, useMemo } from "react";
import { set } from "date-fns";
import { getDepartamentos } from "@/services/departamentosServices";
import { createResidente, deleteResidente } from "@/services/residenteServices";
import type { AxiosError } from "axios";

interface GestionarRolUsuarioProps {
  data: propsUsuarios;
  children?: React.ReactNode;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

type FormValues = {
  accion: "agregar" | "quitar";
  rol: string;
  telefono?: string;
  genero?: string;
  fechaNacimiento?: string;
  direccion?: string;
  funcionId?: number;
  idRol?: number;
  usuarioId?: number;
  tipoResidencia?: string;
  departamentoId?: string;
};

export function GestionarRolUsuario({
  data,
  children,
  setOpenEdit,
  refresh,
}: GestionarRolUsuarioProps) {
  const rolesUsuario = data.roles ?? [];

  const [todosLosRoles, setTodosLosRoles] = useState<
    { idRol: number; rol: string }[]
  >([]);
  const [funciones, setFunciones] = useState<
    { idFuncion: number; cargo: string; descripcion: string; salario: string }[]
  >([]);
  const [departamentos, setDepartamentos] = useState<
    {
      idDepartamento: number;
      numero: number;
      descripcion: string;
      piso: number;
    }[]
  >([]);

  // estados optimizados en vez de watch
  const [accion, setAccion] = useState<"agregar" | "quitar">("agregar");
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("");

  // cargar roles al inicio
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getRoles();
        setTodosLosRoles(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // cargar funciones solo si se elige personal
  useEffect(() => {
    if (rolSeleccionado === "personal" && funciones.length === 0) {
      getFunciones()
        .then(setFunciones)
        .catch((err) => console.error("Error fetching funciones:", err));
    }
    if (rolSeleccionado === "residente" && departamentos.length === 0) {
      getDepartamentos()
        .then(setDepartamentos)
        .catch((err) => console.error("Error fetching departamentos:", err));
    }
  }, [rolSeleccionado]);

  // memorizar funciones
  const funcionesOptions = useMemo(
    () =>
      funciones.map((funcion) => (
        <SelectItem key={funcion.idFuncion} value={`${funcion.idFuncion}`}>
          {funcion.cargo}
        </SelectItem>
      )),
    [funciones]
  );

  const departamentosOptions = useMemo(
    () =>
      departamentos.map((u) => (
        <SelectItem key={u.idDepartamento} value={`${u.idDepartamento}`}>
          Departamento Nro. {u.numero}: Ubicacion {u.piso}
        </SelectItem>
      )),
    [departamentos]
  );

  // roles dinámicos
  const rolesParaAgregar = todosLosRoles.filter(
    (r) => !rolesUsuario.map((rol) => rol.rol).includes(r.rol)
  );
  const rolesParaQuitar = rolesUsuario;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      accion: "agregar",
      rol: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    values.usuarioId = data.idUsuario;
    const rolObj = todosLosRoles.find((r) => r.rol === values.rol);
    if (rolObj) values.idRol = rolObj.idRol;
    try {
      if (values.accion === "agregar") {
        if (values.rol === "personal") {
          const response = await createPersonal(values);
          const message = response.message;
          console.log("Respuesta del servidor:", message);
        }
        if (values.rol === "residente") {
          // Lógica para agregar rol
          const response = await createResidente(values);
          const message = response.message;
          console.log("Respuesta del servidor:", message);
          //console.log("Datos del form:", values);
        }
      }
      if (values.accion === "quitar") {
        if (values.rol === "personal") {
          // Lógica para quitar rol
          const response = await deletePersonalRol(data.idUsuario, {
            idRol: values.idRol,
          });
          const message = response.message;
          console.log("Respuesta del servidor:", message);
          //console.log("Datos del form:", values);
        }
        if (values.rol === "residente") {
          const response = await deleteResidente(data.idUsuario, {
            idRol: values.idRol,
          });
          const message = response.message;
          console.log("Respuesta del servidor:", message);
          //console.log("Datos del form:", values);
        }
      }
      //console.log("Usuario:", data);
      //console.log("Acción:", values.accion);
      //console.log("Datos del form:", values);
      setOpenEdit(false);
      refresh();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre */}
      <div className="grid gap-3">
        <Label>Nombre</Label>
        <span className="font-medium bg-amber-200">{data.nombre}</span>
      </div>

      {/* Acción */}
      <div className="grid gap-3">
        <Label>Acción</Label>
        <Select
          onValueChange={(value) => {
            setAccion(value as "agregar" | "quitar");
            setValue("accion", value as "agregar" | "quitar");
          }}
          defaultValue="agregar"
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agregar">Agregar Rol</SelectItem>
            <SelectItem value="quitar">Quitar Rol</SelectItem>
          </SelectContent>
        </Select>
        {errors.accion && (
          <p className="text-red-500 text-sm">La acción es obligatoria</p>
        )}
      </div>

      {/* Rol dinámico */}
      {accion === "agregar" && (
        <div className="grid gap-3">
          <Label>Selecciona rol a agregar</Label>
          <Select
            onValueChange={(value) => {
              setRolSeleccionado(value);
              setValue("rol", value);
            }}
            disabled={rolesParaAgregar.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Elige un rol" />
            </SelectTrigger>
            <SelectContent>
              {rolesParaAgregar.map((rol) => (
                <SelectItem key={rol.idRol} value={rol.rol}>
                  {rol.rol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {rolesParaAgregar.length === 0 && (
            <p className="text-yellow-500 text-sm">
              El usuario ya tiene todos los roles
            </p>
          )}
          {errors.rol && (
            <p className="text-red-500 text-sm">Debes seleccionar un rol</p>
          )}
        </div>
      )}

      {/* Campos extra para personal */}
      {rolSeleccionado === "personal" && (
        <div className="max-w-2xl rounded-xl text-center space-y-3">
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
            <p className="text-red-500 text-sm">{errors.telefono.message}</p>
          )}

          <div>
            <Select
              onValueChange={(val) => {
                setValue("genero", val, { shouldValidate: true });
                clearErrors("genero");
              }}
            >
              <SelectTrigger
                className={`w-full bg-gray-100 ${
                  errors.genero ? "border-red-500" : ""
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
              <p className="text-red-500 text-sm">{errors.genero.message}</p>
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
            <p className="text-red-500 text-sm">
              {errors.fechaNacimiento.message}
            </p>
          )}

          <Input
            placeholder="Dirección"
            className="bg-gray-100"
            {...register("direccion", {
              required: "La dirección es obligatoria",
              minLength: { value: 5, message: "Mínimo 5 caracteres" },
            })}
          />
          {errors.direccion && (
            <p className="text-red-500 text-sm">{errors.direccion.message}</p>
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
                    {funcionesOptions}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.funcionId && (
            <p className="text-red-500 text-sm">{errors.funcionId.message}</p>
          )}
        </div>
      )}

      {rolSeleccionado === "residente" && (
        <div className="rounded space-y-3">
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
            <p className="text-red-500 text-sm mt-1">
              {errors.telefono.message}
            </p>
          )}

          {/* Opción más simple sin Controller */}
          <div>
            {/* <label className="block text-sm font-medium mb-2">
              Tipo Residencia
            </label> */}

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
            {/* <label className="block text-sm font-medium mb-2">Unidad</label> */}
            <Select
              onValueChange={(val) =>
                setValue("departamentoId", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full bg-gray-100">
                <SelectValue placeholder="Selecciona una unidad" />
              </SelectTrigger>
              <SelectContent>{departamentosOptions}</SelectContent>
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
        </div>
      )}

      {/* Quitar rol */}
      {accion === "quitar" && (
        <div className="grid gap-3">
          <Label>Selecciona rol a quitar</Label>
          {rolesParaQuitar.length > 1 ? (
            <Select onValueChange={(value) => setValue("rol", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un rol" />
              </SelectTrigger>
              <SelectContent>
                {rolesParaQuitar.map((rol) => (
                  <SelectItem key={rol.idRol} value={rol.rol}>
                    {rol.rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-red-500 text-sm">
              No se puede quitar el único rol del usuario
            </p>
          )}
          {errors.rol && (
            <p className="text-red-500 text-sm">Debes seleccionar un rol</p>
          )}
        </div>
      )}

      {/* Botones */}
      {children}
    </form>
  );
}
