// app/pages/Login.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/authService";
import { toast } from "sonner";
import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

type FormData = {
  email: string;
  password: string;
  remember: boolean;
  token?: string; // 2FA
  recaptchaToken?: string; // reCAPTCHA
};

export default function Login() {
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        token: twoFactorRequired ? twoFAToken : undefined,
      };
      const response = await login(payload);

      if (response.twoFactorRequired) {
        setTwoFactorRequired(true);
        toast.info("Ingresa tu código 2FA", { duration: 4000 });
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.usuario));
      toast.success(response.message, { duration: 4000, position: "top-left" });
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error en el login",
        { duration: 4000, position: "bottom-left" }
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <Card className="w-full max-w-md border-none bg-gray-900 text-white shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                <img
                  src="https://i.pinimg.com/736x/92/fd/b0/92fdb00d64061d527d71235ac42712bf.jpg"
                  alt="Logo"
                  className="rounded-full w-16 h-16"
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              Bienvenido de nuevo
            </CardTitle>
            <p className="text-gray-400 mt-1">Inicia sesión para acceder</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
                {...register("email", { required: "El email es obligatorio" })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}

              <Input
                type="password"
                placeholder="Contraseña"
                className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              {/* reCAPTCHA (solo renderizar si está configurado) */}
              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                <div className="mt-2">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string}
                    onChange={(token: string | null) =>
                      setValue("recaptchaToken", token ?? undefined, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {errors.recaptchaToken && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.recaptchaToken.message}
                    </p>
                  )}
                </div>
              )}

              {/* 2FA */}
              {twoFactorRequired && (
                <Input
                  type="text"
                  placeholder="Código 2FA"
                  maxLength={6}
                  value={twoFAToken}
                  onChange={(e) => setTwoFAToken(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 mt-2"
                />
              )}

              <Button
                type="submit"
                size="custom"
                className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Imagen */}
      <div className="hidden md:block w-1/2">
        <img
          src="https://i.pinimg.com/736x/28/2b/2f/282b2f988040ffd5dd30544b0f946880.jpg"
          alt="Imagen decorativa"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
