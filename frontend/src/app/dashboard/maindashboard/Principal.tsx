export const Principal = () => {
  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gray-200 rounded-lg">
        <p className="text-lg font-medium text-gray-700">
          Aquí solo iría texto
        </p>
      </div>

      {/* Contenido de relleno para forzar el scroll */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold">$23,902</p>
            <p className="text-sm text-green-500">+4.2% from last month</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm h-96">
        <h3 className="text-lg font-semibold">Gráfico de Ejemplo</h3>
        <div className="flex items-center justify-center h-full text-gray-400">
          Contenido del gráfico aquí...
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm h-96">
        <h3 className="text-lg font-semibold">Tabla de Ejemplo</h3>
        <div className="flex items-center justify-center h-full text-gray-400">
          Contenido de la tabla aquí...
        </div>
      </div>
    </div>
  );
};
