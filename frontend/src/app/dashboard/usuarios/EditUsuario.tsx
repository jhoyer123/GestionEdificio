import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import type { propsUsuarios } from "./Columns";

interface GestionarDatosUsuarioProps {
  data: propsUsuarios;
  children?: React.ReactNode;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

type FormData = {
  nombre: string;
  email: string;
};

export default function EditUsuario({
  data,
  children,
  setOpenEdit,
  refresh,
}: GestionarDatosUsuarioProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log("Datos enviados:", data);
    setOpenEdit(false);
    refresh();
    // Aquí mandas al backend
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Datos generales de Usuario */}
      <Input
        defaultValue={data.nombre}
        placeholder="Nombre"
        {...register("nombre", { required: "Obligatorio" })}
      />
      {errors.nombre && <p className="text-red-500">{errors.nombre.message}</p>}

      <Input
        defaultValue={data.email}
        placeholder="Email"
        type="email"
        {...register("email", { required: "Obligatorio" })}
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      {children}
    </form>
  );
}
