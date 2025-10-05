import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/usuarios/send-reset-password-email`,
        { email }
      );
      toast.success(
        "Se ha enviado el correo de restablecimiento de contraseña."
      );
      setTimeout(() => navigate("/"), 3000); // redirige al login
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error enviando correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-900 shadow-lg rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-blue-50">
            Recuperar Contraseña
          </CardTitle>
          <p className="text-gray-400 mt-1">
            Ingresa tu email para enviar el enlace
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
          //botton de volvear al login
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm text-blue-400 hover:underline"
            >
              Volver al login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
