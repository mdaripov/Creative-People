"use client";

import { useEffect, useMemo, useState } from "react";
import { ClientSidebar } from "@/components/client-sidebar";
import { DashboardNav } from "@/components/dashboard-nav";
import { EmptyState } from "@/components/empty-state";
import { ClientWorkspace } from "@/components/client-workspace";
import { MentorChatView } from "@/components/mentor-chat-view";
import { PersonalCabinet } from "@/components/personal-cabinet";
import { allClientsData, createClientData } from "@/lib/mock-data";
import { useSpecialistClients } from "@/hooks/use-specialist-clients";
import { Menu } from "lucide-react";

type MainView = "mentor" | "clients" | "cabinet";

export default function Home() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainView, setMainView] = useState<MainView>("clients");
  const { assignedClientIds, toggleClient } = useSpecialistClients();

  useEffect(() => {
    if (!selectedClientId && !selectedClientName) return;

    const clientStillInDemoSet = selectedClientId ? selectedClientId in allClientsData : false;
    if (clientStillInDemoSet) return;

    setSelectedClientId((prev) => prev);
  }, [selectedClientId, selectedClientName]);

  const selectedData = useMemo(() => {
    if (!selectedClientId && !selectedClientName) return null;

    if (selectedClientId && selectedClientId in allClientsData) {
      return allClientsData[selectedClientId as keyof typeof allClientsData];
    }

    if (selectedClientName) {
      return createClientData(selectedClientId ?? selectedClientName, selectedClientName);
    }

    return null;
  }, [selectedClientId, selectedClientName]);

  const allClients = useMemo(() => {
    const demoClients = Object.values(allClientsData).map((item) => ({
      id: item.client.id,
      name: item.client.name,
    }));

    return demoClients;
  }, []);

  const handleSelectClient = (id: string, name?: string) => {
    setSelectedClientId(id);
    setSelectedClientName(name ?? null);
    setMainView("clients");
    setSidebarOpen(false);
  };

  const handleOpenMentor = () => {
    setMainView("mentor");
    setSidebarOpen(false);
  };

  const handleOpenClients = () => {
    setMainView("clients");
    setSidebarOpen(false);
  };

  const handleOpenCabinet = () => {
    setMainView("cabinet");
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-30 lg:z-auto
          h-full w-72 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-full flex-col bg-[#111111] border-r border-[#1E1E1E]">
          <div className="min-h-0 flex-1">
            <ClientSidebar
              selectedClientId={mainView === "clients" ? selectedClientId : null}
              onSelectClient={handleSelectClient}
              assignedClientIds={assignedClientIds}
              onToggleAssignClient={toggleClient}
            />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A] lg:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg bg-[#161616] border border-[#1E1E1E] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white">
            {mainView === "mentor"
              ? "ИИ СММ наставник"
              : mainView === "cabinet"
              ? "Личный кабинет"
              : selectedData
              ? selectedData.client.name
              : selectedClientName ?? "SMM Agency"}
          </span>
        </div>

        <DashboardNav
          mainView={mainView}
          onClientsClick={handleOpenClients}
          onMentorClick={handleOpenMentor}
          onCabinetClick={handleOpenCabinet}
        />

        <div className="flex-1 overflow-hidden">
          {mainView === "mentor" ? (
            <MentorChatView />
          ) : mainView === "cabinet" ? (
            <PersonalCabinet
              assignedClientIds={assignedClientIds}
              allClients={allClients}
              onOpenClient={handleSelectClient}
            />
          ) : selectedData ? (
            <ClientWorkspace data={selectedData} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}