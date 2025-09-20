import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
//import { verifyCode } from "@/services/authService";
import { toast } from "sonner";

type FormData = {
  code: string;
};

export default function VerifyCode() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const onSubmit = async (data: FormData) => {
    try {
      //const response = await verifyCode({ userId, code: data.code });
      //localStorage.setItem("user", JSON.stringify(response.usuario));
      toast.success("Autenticación correcta", {
        duration: 4000,
        position: "top-left",
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Código inválido", { duration: 4000, position: "top-left" });
      console.log("Error:", (error as Error).message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
      <Card className="w-full max-w-sm border-none bg-gray-900 text-white shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Verificación 2FA</CardTitle>
          <p className="text-gray-400 mt-1">Introduce el código enviado</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              type="text"
              placeholder="Código de verificación"
              className="bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500"
              {...register("code", { required: "El código es obligatorio" })}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
            <Button
              type="submit"
              className="w-full py-2 px-10 font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              Verificar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
