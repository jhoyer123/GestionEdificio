import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { changePassword } from "@/services/usuariosServices";
import axios from "axios";
import { toast } from "sonner";
import { generate2FA, verify2FA } from "@/services/authService";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  const { nombre, email, two_factor_enabled } = user;

  const onSubmit = async (data: ProfileForm) => {
    try {
      const response = await changePassword(data);
      console.log("Respuesta:", response.message);
      toast.success(response.message, { duration: 4000, position: "top-left" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error cambiando la contraseña:",
          error.response?.data?.message
        );
        toast.error(error.response?.data?.message, {
          duration: 4000,
          position: "top-left",
        });
      } else {
        console.error("Error cambiando la contraseña:", error);
      }
    }
  };

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false); // si el usuario ya tiene 2FA
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // URL del QR generado
  const [secretBase32, setSecretBase32] = useState(""); // secreto temporal
  const [twoFAToken, setTwoFAToken] = useState(""); // el código de 6 dígitos que ingresa el usuario
  const [showConfirm2FA, setShowConfirm2FA] = useState(false); // mostrar input de confirmación

  useEffect(() => {
    setTwoFAEnabled(two_factor_enabled);
  }, [two_factor_enabled]);

  const handleGenerate2FA = async () => {
    try {
      const response = await generate2FA(email);
      setQrCodeUrl(response.qrCodeImageUrl);
      setSecretBase32(response.secretBase32);
      toast.success("QR generado, escanéalo con tu app de Authenticator", {
        duration: 4000,
        position: "top-left",
      });
    } catch (error) {
      console.error("Error generando QR 2FA:", error);
      toast.error("No se pudo generar el QR de 2FA", {
        duration: 4000,
        position: "top-left",
      });
    }
  };

  const handleConfirm2FA = async () => {
    try {
      if (!twoFAToken || !secretBase32) {
        toast.error("Ingresa el código de 6 dígitos", { duration: 4000 });
        return;
      }

      const response = await verify2FA(user.id, twoFAToken, secretBase32);

      if (response.message === "2FA activado correctamente") {
        toast.success("2FA activado ✅", { duration: 4000 });
        setTwoFAEnabled(true);
        setShowConfirm2FA(false);
        setQrCodeUrl(""); // opcional, ocultar QR
      }
    } catch (error) {
      console.error("Error confirmando 2FA:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error activando 2FA",
        { duration: 4000 }
      );
    }
  };

  return (
    <div className="flex justify-center items-center bg-stone-100">
      <Card className="w-full max-w-4xl bg-white border border-stone-300 rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Columna Izquierda: Perfil */}
          <div className="flex flex-col items-center justify-center text-center space-y-2 p-8 border-b md:border-b-0 md:border-r border-stone-200 bg-stone-50">
            <Avatar className="w-28 h-28">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-stone-800 pt-2">
              {nombre}
            </h2>
            <span className="text-stone-500 text-sm">{email}</span>
          </div>

          {/* Columna Derecha: Formularios */}
          <div className="md:col-span-2 p-8 space-y-8">
            {/* Sección 1: Información personal */}
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                className="rounded-lg w-full bg-stone-700 hover:bg-stone-800 cursor-pointer"
              >
                Actualizar datos
              </Button>
            </div>

            {/* Separador Visual */}
            <hr className="border-stone-200" />

            {/* Sección 2: Cambio de contraseña */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stone-700">
                Cambiar contraseña
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Contraseña actual */}
                <div>
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("currentPassword", {
                        required: "La contraseña actual es obligatoria",
                      })}
                      className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowCurrent(!showCurrent)}
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* Nueva contraseña */}
                <div>
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("newPassword", {
                        required: "La nueva contraseña es obligatoria",
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.,?":{}|<>]).{8,}$/,
                          message:
                            "Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.",
                        },
                      })}
                      className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirmar nueva contraseña */}
                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmar nueva contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Confirma la contraseña",
                        validate: (value) =>
                          value === watch("newPassword") ||
                          "Las contraseñas no coinciden",
                      })}
                      className="mt-1 bg-stone-50 border-stone-300 text-stone-700"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-stone-700 hover:bg-stone-800 cursor-pointer"
                >
                  Guardar cambios
                </Button>
              </form>
            </div>

            {/* Separador Visual */}
            <hr className="border-stone-200" />

            {/* Sección 3: Autenticación 2FA */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stone-700">
                Autenticación de dos factores (2FA)
              </h3>

              {twoFAEnabled ? (
                <p className="text-green-600 font-medium">
                  La autenticación 2FA está activada en tu cuenta.
                </p>
              ) : (
                <div className="flex flex-col items-start space-y-4">
                  <p className="text-sm text-stone-600">
                    Añade una capa extra de seguridad a tu cuenta.
                  </p>
                  <Button
                    onClick={handleGenerate2FA}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    disabled={!!qrCodeUrl} // Deshabilita si el QR ya se generó
                  >
                    Activar 2FA
                  </Button>

                  {qrCodeUrl && (
                    <div className="mt-2 p-4 border border-stone-200 rounded-lg w-full space-y-4">
                      <p className="text-sm font-medium">
                        1. Escanea este código con tu app de autenticación (ej.
                        Google Authenticator, Authy).
                      </p>
                      <img
                        src={qrCodeUrl}
                        alt="Código QR para 2FA"
                        className="w-48 h-48 rounded-md"
                      />
                      <div className="w-full">
                        <Label htmlFor="twoFAToken">
                          Ingresa el código de 6 dígitos
                        </Label>
                        <Input
                          id="twoFAToken"
                          type="text"
                          maxLength={6}
                          value={twoFAToken}
                          onChange={(e) => setTwoFAToken(e.target.value)}
                          placeholder="123456"
                          className="mt-1 bg-stone-50 border-stone-300 text-stone-700 w-32"
                        />
                      </div>
                      <Button
                        onClick={handleConfirm2FA}
                        className="rounded-lg bg-green-600 hover:bg-green-700"
                      >
                        Verificar y Activar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
