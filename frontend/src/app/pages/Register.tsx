// app/pages/Login.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

type FormData = {
  email: string;
  password: string;
  remember: boolean;
};

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Datos enviados:", data);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Columna derecha (Imagen) */}
      <div className="w-1/2">
        <img
          src="https://i.pinimg.com/736x/28/2b/2f/282b2f988040ffd5dd30544b0f946880.jpg" // Reemplaza con tu imagen (la que subiste)
          alt="imagen representativa"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Columna izquierda (Formulario) */}
      <div className="w-1/2 flex items-center justify-center p-12">
        <Card className="w-full max-w-sm border-none bg-gray-900 text-white shadow-lg">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                {/* Aquí va el logo SVG real */}
                <img
                  src="https://i.pinimg.com/736x/92/fd/b0/92fdb00d64061d527d71235ac42712bf.jpg"
                  alt=""
                  className="rounded-full"
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              Bienvenido de nuevo
            </CardTitle>
            <p className="text-gray-400 mt-1">Inicia sesión para acceder</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
                  {...register("email", {
                    required: "El email es obligatorio",
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Botón principal */}
              <Button
                type="submit"
                size="custom"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Iniciar sesión
              </Button>
            </form>

            {/* Separador */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-700"></div>
              <span className="px-3 text-gray-400 text-sm">o</span>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "w-full text-center text-lg py-2 px-4 rounded-md text-white bg-blue-800 block"
                  : "w-full text-center text-lg py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 block "
              }
            >
              Ya tengo una cuenta
            </NavLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
