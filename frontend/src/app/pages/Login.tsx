// app/pages/Login.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, NavLink } from "react-router-dom";
import { login } from "@/services/authService";
import { toast } from "sonner";
import { useState } from "react";
import axios from "axios";
import { Label } from "@radix-ui/react-label";

type FormData = {
  email: string;
  password: string;
  remember: boolean;
  token?: string; // nuevo, para 2FA
};

export default function Login() {
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState("");

  //localStorage.clear();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      // Si estamos en paso 2FA, añadimos el token
      const payload = {
        ...data,
        token: twoFactorRequired ? twoFAToken : undefined,
      };

      const response = await login(payload);

      // Si el backend indica que requiere 2FA
      if (response.twoFactorRequired) {
        setTwoFactorRequired(true);
        toast.info("Ingresa tu código 2FA", { duration: 4000 });
        return; // no continuar hasta que se ingrese token
      }

      // Login completo
      const usuario = response.usuario;
      localStorage.setItem("user", JSON.stringify(usuario));
      toast.success(response.message, { duration: 4000, position: "top-left" });
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error en el login",
        {
          duration: 4000,
          position: "bottom-left",
        }
      );
      console.log("Error del backend:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
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
                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Separador */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-700"></div>
                <span className="px-3 text-gray-400 text-sm">*</span>
                <div className="flex-grow h-px bg-gray-700"></div>
              </div>

              {/* Campo 2FA, solo si es requerido */}
              {twoFactorRequired && (
                <div className="mt-4">
                  <Label className="mb-2 block text-sm font-medium text-gray-300">
                    Ingrese su código 2FA
                  </Label>
                  <Input
                    type="text"
                    placeholder="Código 6 dígitos 2FA"
                    maxLength={6}
                    value={twoFAToken}
                    onChange={(e) => setTwoFAToken(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              )}

              {/* Botón principal */}
              <Button
                type="submit"
                size="custom"
                className="w-full py-2 px-10 font-medium bg-blue-600 hover:bg-blue-700  text-white"
              >
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha (Imagen) */}
      <div className="w-1/2">
        <img
          src="https://i.pinimg.com/736x/28/2b/2f/282b2f988040ffd5dd30544b0f946880.jpg" // Reemplaza con tu imagen (la que subiste)
          alt="imagen representativa"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
