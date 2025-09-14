import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { changePassword } from "@/services/usuariosServices";
import axios from "axios";

type ProfileForm = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function PerfilUsuario() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>();

  // desde localstorage traer el nombre y el email
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { nombre, email } = user;

  const onSubmit = async (data: ProfileForm) => {
    try {
      const response = await changePassword(data);
      console.log("Respuesta:", response.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error cambiando la contraseña:",
          error.response?.data?.message
        );
      } else {
        console.error("Error cambiando la contraseña:", error);
      }
    }
  };

  return (
    <div className="h-full flex justify-center items-center bg-stone-100">
      <Card className="w-full max-w-4xl bg-white border border-stone-300 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Columna Izquierda */}
          <div className="flex flex-col items-center justify-center text-center space-y-2 p-6 border-b md:border-b-0 md:border-r border-stone-200">
            <Avatar className="w-28 h-28">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-stone-800">{nombre}</h2>
            {/* <span className="text-stone-500 text-sm">Usuario Premium</span> */}
          </div>

          {/* Columna Derecha */}
          <div className="md:col-span-2 p-6 space-y-6">
            {/* Info básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stone-700">
                Información personal
              </h3>
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  defaultValue={nombre}
                  placeholder="Juan Pérez"
                  {...register("name", {
                    required: "El nombre es obligatorio",
                  })}
                  className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={email}
                  placeholder="correo@ejemplo.com"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Correo no válido",
                    },
                  })}
                  className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="button"
                className="rounded-lg w-full bg-stone-700 hover:bg-stone-800"
              >
                Actualizar datos
              </Button>
            </div>

            {/* Cambio de contraseña */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stone-700">
                Cambiar contraseña
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("currentPassword", {
                      required: "La contraseña actual es obligatoria",
                    })}
                    className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("newPassword", {
                      required: "La nueva contraseña es obligatoria",
                      minLength: {
                        value: 6,
                        message: "Debe tener al menos 6 caracteres",
                      },
                    })}
                    className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmar nueva contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Confirma la contraseña",
                      validate: (value) =>
                        value === watch("newPassword") ||
                        "Las contraseñas no coinciden",
                    })}
                    className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-stone-700 hover:bg-stone-800"
                >
                  Guardar cambios
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
