import Header from "../components/shared/Header";
import MainContent from "../components/shared/MainContent";
import Sidebar from "../components/shared/Sidebar";
import { useState } from "react";

export default function Layout() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Sidebar estático a la izquierda */}
      <Sidebar activeView={activeView} setActiveView={setActiveView}/>

      {/* Contenedor principal que se flexiona para ocupar el espacio restante */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header estático en la parte superior del contenido */}
        <Header />

        {/* Área de contenido principal con scroll vertical */}
        <main className="flex-1 overflow-y-auto p-6">
          <MainContent activeView={activeView}/>
        </main>
      </div>
    </div>
  );
}
