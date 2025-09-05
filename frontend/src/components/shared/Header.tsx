import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Asegúrate que la ruta sea correcta
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Asegúrate que la ruta sea correcta

export default function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-white px-6 shrink-0 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h2>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-lg bg-gray-100 dark:bg-gray-700"
          />
        </div>
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}