import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  // Traer el usuario del localStorage
  const usuarioGuardado = localStorage.getItem("user");
  let usuario = null;

  if (usuarioGuardado) {
    usuario = JSON.parse(usuarioGuardado);
  }

  const nombre = usuario?.nombre || "Usuario";

  return (
    <header className="flex h-16 items-center border-b bg-gray-400 px-6 shrink-0 dark:bg-gray-800">
      <div className="ml-auto flex items-center gap-4">
        <div>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {nombre}
          </span>
        </div>
        <div>
          <Avatar className="h-9 w-9">
            <AvatarImage
              src="https://i.pinimg.com/736x/fd/a0/3f/fda03ff25d6db235e66c75a5068377da.jpg"
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
