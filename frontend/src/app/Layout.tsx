import Header from "../components/shared/Header";
import MainContent from "../components/shared/MainContent";
import Sidebar from "../components/shared/Sidebar";
import { useState } from "react";

export default function Layout() {
  const [editState, setEditState] = useState<{ view: string, entity: string, id: number | null }>({
    view: "dashboard",
    entity: "",
    id: null
  });

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Sidebar estático a la izquierda */}
  <Sidebar activeView={editState.view} setActiveView={view => setEditState(state => ({ ...state, view }))}/>

      {/* Contenedor principal que se flexiona para ocupar el espacio restante */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header estático en la parte superior del contenido */}
        <Header />

        {/* Área de contenido principal con scroll vertical */}
        <main className="flex-1 overflow-y-auto p-6 h-full relative">
          <MainContent 
            editState={editState}
            setEditState={setEditState}
          />
        </main>
      </div>
    </div>
  );
}
