// app/pages/Login.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/services/authService";
import { toast } from "sonner";
import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

type FormData = {
  email: string;
  password: string;
  token?: string; // 2FA
  recaptchaToken: string; // siempre requerido
};

export default function Login() {
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const recaptchaRef = useRef<any>(null);

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
        token: twoFactorRequired ? twoFAToken : null,
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
      // Si es un error de credenciales
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.intentosRestantes !== undefined
      ) {
        const intentosRestantes = error.response.data.intentosRestantes;

        // Mostrar captcha si quedaban menos de 2 intentos (3er fallo)
        if (intentosRestantes <= 2) {
          setShowRecaptcha(true);
        }
      }
      recaptchaRef.current?.reset();
      // Limpiar el token en el form
      setValue("recaptchaToken", "", { shouldValidate: false });
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
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md border-none bg-gray-900 text-white shadow-lg rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <img
                src="https://i.pinimg.com/736x/92/fd/b0/92fdb00d64061d527d71235ac42712bf.jpg"
                alt="Logo"
                className="rounded-full w-16 h-16 shadow-md"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              Bienvenido de nuevo
            </CardTitle>
            <p className="text-gray-400 mt-1">Inicia sesión para acceder</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <Input
                type="email"
                placeholder="Email"
                className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
                {...register("email", { required: "El email es obligatorio" })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}

              {/* Password */}
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

              {showRecaptcha && import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                <div className="mt-2 flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string}
                    onChange={(token: string | null) =>
                      setValue("recaptchaToken", token ?? "", {
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
                className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Iniciar sesión
              </Button>

              {/* Recuperar contraseña */}
              <div className="text-center mt-4">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Imagen */}
      <div className="hidden md:block md:w-3/5 relative">
        <img
          src="https://i.pinimg.com/736x/28/2b/2f/282b2f988040ffd5dd30544b0f946880.jpg"
          alt="Imagen decorativa"
          className="h-full w-full object-cover brightness-75"
        />
        {/* capa semitransparente para que no opaque */}
      </div>
    </div>
  );
}
