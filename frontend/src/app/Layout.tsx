import Header from "../components/shared/Header";
import MainContent from "../components/shared/MainContent";
import Sidebar from "../components/shared/Sidebar";
import { useState } from "react";

export default function Layout() {
  const [editState, setEditState] = useState<{
    view: string;
    entity: string;
    id: number | null;
  }>({
    view: "dashboard",
    entity: "",
    id: null,
  });

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <Sidebar
        activeView={editState.view}
        setActiveView={(view) => setEditState((state) => ({ ...state, view }))}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto h-full relative md:ml-64 transition-all duration-300 p-4">
          <MainContent editState={editState} setEditState={setEditState} />
        </main>
      </div>
    </div>
  );
}
