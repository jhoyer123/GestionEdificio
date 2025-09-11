import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  User,
  Flag,
} from "lucide-react"; // Importa iconos

function ProfilePage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna de Perfil (Izquierda) */}
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center p-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src="https://example.com/your-profile-pic.jpg"
                  alt="Felecia Burke"
                />
                <AvatarFallback>FB</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold mb-1">Felecia Burke</h2>
              <Button className="mb-4 bg-blue-500 hover:bg-blue-600 text-white">
                <DollarSign className="mr-2 h-4 w-4" /> Balance: $5,000
              </Button>
              <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-2">
                <MapPin className="mr-2 h-4 w-4" /> Hong Kong, China
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-2">
                <Mail className="mr-2 h-4 w-4" /> example@mail.com
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                <Phone className="mr-2 h-4 w-4" /> +1 (070) 123-4567
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columnas de Detalles (Derecha) */}
        <div className="md:col-span-2 space-y-6">
          {/* Tarjeta de Detalles de la Cuenta */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">
                Account Details
              </CardTitle>
              {/* Aquí podrías añadir un botón de edición si lo necesitas */}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500 dark:text-gray-400">
                  First Name
                </div>
                <div>Felecia</div>
                <div className="text-gray-500 dark:text-gray-400">
                  Last Name
                </div>
                <div>Burke</div>
                <div className="text-gray-500 dark:text-gray-400">
                  Date of Birth
                </div>
                <div>10 June, 1990</div>
                <div className="text-gray-500 dark:text-gray-400">Gender</div>
                <div>Female</div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Dirección de Envío */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">
                Shipping Address
              </CardTitle>
              {/* Aquí podrías añadir un botón de edición si lo necesitas */}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500 dark:text-gray-400">Address</div>
                <div>898 Joanne Lane Street</div>
                <div className="text-gray-500 dark:text-gray-400">City</div>
                <div>Boston</div>
                <div className="text-gray-500 dark:text-gray-400">Country</div>
                <div>United States</div>
                <div className="text-gray-500 dark:text-gray-400">State</div>
                <div>Massachusetts</div>
                <div className="text-gray-500 dark:text-gray-400">Zip Code</div>
                <div>02110</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
