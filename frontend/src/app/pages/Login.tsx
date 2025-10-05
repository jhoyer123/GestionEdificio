// app/pages/Login.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/services/authService";
import { toast } from "sonner";
import { useState, useRef } from "react"; // Importa useRef de react
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
// NUEVAS IMPORTACIONES: Iconos para la UI
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

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

  // --- NUEVO ESTADO PARA VISIBILIDAD DE CONTRASEÑA ---
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  // TU LÓGICA onSubmit NO SE TOCA, SE MANTIENE INTACTA
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
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.intentosRestantes !== undefined
      ) {
        const intentosRestantes = error.response.data.intentosRestantes;
        if (intentosRestantes <= 2) {
          setShowRecaptcha(true);
        }
      }
      recaptchaRef.current?.reset();
      setValue("recaptchaToken", "", { shouldValidate: false });
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error en el login",
        { duration: 4000, position: "bottom-left" }
      );
    }
  };

  // --- NUEVA ESTRUCTURA JSX PARA EL DISEÑO MEJORADO ---
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/8e/ff/86/8eff8648a0340025ebb66660b3fdc6ce.jpg')",
      }}
    >
      <Card className="w-full max-w-md rounded-2xl border-none bg-black/50 text-white shadow-2xl backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/80">
            <img
              src="https://i.pinimg.com/736x/92/fd/b0/92fdb00d64061d527d71235ac42712bf.jpg"
              alt="Logo"
              className="h-14 w-14 rounded-full"
            />
          </div>
          <CardTitle className="text-3xl font-bold">
            Bienvenido de nuevo
          </CardTitle>
          <p className="mt-1 text-gray-300">Inicia sesión para acceder</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* --- Email con Icono --- */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                className="bg-gray-800/80 py-6 pl-10 border border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                {...register("email", { required: "El email es obligatorio" })}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm -mt-4">
                {errors.email.message}
              </p>
            )}

            {/* --- Password con Icono y "Ojito" --- */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"} // Tipo dinámico
                placeholder="Contraseña"
                className="bg-gray-800/80 py-6 pl-10 pr-10 border border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm -mt-4">
                {errors.password.message}
              </p>
            )}

            {showRecaptcha && import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center pt-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string}
                  onChange={(token: string | null) =>
                    setValue("recaptchaToken", token ?? "", {
                      shouldValidate: true,
                    })
                  }
                  theme="dark" // Añadido para que combine con el diseño
                />
                {errors.recaptchaToken && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.recaptchaToken.message}
                  </p>
                )}
              </div>
            )}

            {twoFactorRequired && (
              <Input
                type="text"
                placeholder="Código 2FA"
                maxLength={6}
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
                className="bg-gray-800/80 py-6 border border-gray-700 text-white placeholder:text-gray-400 mt-2"
              />
            )}

            <Button
              type="submit"
              size="custom"
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Iniciar sesión
            </Button>

            <div className="text-center">
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
  );
}
