"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ClientSidebar } from "@/components/client-sidebar";
import { ClientsOverview } from "@/components/clients-overview";
import { DashboardNav } from "@/components/dashboard-nav";
import { EmptyState } from "@/components/empty-state";
import { ClientWorkspace } from "@/components/client-workspace";
import { LoginScreen } from "@/components/login-screen";
import { MentorChatView } from "@/components/mentor-chat-view";
import { PersonalCabinet } from "@/components/personal-cabinet";
import { useSession } from "@/components/session-provider";
import { allClientsData, createClientData } from "@/lib/mock-data";
import { useSpecialistClients } from "@/hooks/use-specialist-clients";

type MainView = "home" | "mentor" | "clients" | "cabinet";

export default function Home() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainView, setMainView] = useState<MainView>("home");
  const [clientSourceView, setClientSourceView] = useState<"clients" | "cabinet">("clients");
  const [supabaseClients, setSupabaseClients] = useState<Array<{ id: string; name: string }>>([]);
  const { session, profile, loading, signOut } = useSession();
  const { assignedClientIds, toggleClient } = useSpecialistClients(
    session?.user.id ?? null,
    profile?.role ?? null
  );

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
    return supabaseClients;
  }, [supabaseClients]);

  const handleClientsLoaded = useCallback((clients: Array<{ id: string; name: string }>) => {
    setSupabaseClients(clients);
  }, []);

  const handleSelectClient = (
    id: string,
    name?: string,
    sourceView: "clients" | "cabinet" = "clients"
  ) => {
    setSelectedClientId(id);
    setSelectedClientName(name ?? null);
    setClientSourceView(sourceView);
    setMainView(sourceView);
    setSidebarOpen(false);
  };

  const handleOpenMentor = () => {
    setSelectedClientId(null);
    setSelectedClientName(null);
    setMainView("mentor");
    setSidebarOpen(false);
  };

  const handleOpenClients = () => {
    setSelectedClientId(null);
    setSelectedClientName(null);
    setMainView("clients");
    setClientSourceView("clients");
    setSidebarOpen(false);
  };

  const handleOpenCabinet = () => {
    setSelectedClientId(null);
    setSelectedClientName(null);
    setMainView("cabinet");
    setClientSourceView("cabinet");
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0F0F]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-[#A78BFA]" />
      </div>
    );
  }

  if (!session || !profile) {
    return <LoginScreen />;
  }

  const showCabinetSidebar = mainView === "cabinet" || (selectedData && clientSourceView === "cabinet");

  return (
    <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-30 lg:z-auto
          h-full flex-shrink-0
          transform transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-20" : "w-72"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="relative flex h-full flex-col border-r border-[#1E1E1E] bg-[#111111]">
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="absolute right-3 top-3 z-10 hidden h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#161616] text-[#9CA3AF] transition-colors hover:text-white lg:flex"
            aria-label={sidebarCollapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"}
            title={sidebarCollapsed ? "Развернуть" : "Свернуть"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <div className="min-h-0 flex-1">
            <ClientSidebar
              selectedClientId={selectedClientId}
              onSelectClient={(id, name) =>
                handleSelectClient(id, name, showCabinetSidebar ? "cabinet" : "clients")
              }
              assignedClientIds={assignedClientIds}
              onToggleAssignClient={toggleClient}
              onClientsLoaded={handleClientsLoaded}
              mode={showCabinetSidebar ? "cabinet" : "default"}
              onOpenMentor={handleOpenMentor}
              collapsed={sidebarCollapsed}
            />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#1A1A1A] px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E1E1E] bg-[#161616] text-[#9CA3AF] transition-colors hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-white">
            {mainView === "mentor"
              ? "ИИ СММ наставник"
              : showCabinetSidebar && selectedData
              ? selectedData.client.name
              : mainView === "cabinet"
              ? "Личный кабинет"
              : mainView === "clients" && selectedData
              ? selectedData.client.name
              : mainView === "clients"
              ? "Все клиенты"
              : "Главный дашборд"}
          </span>
        </div>

        <DashboardNav
          mainView={mainView === "home" ? "clients" : mainView}
          onClientsClick={handleOpenClients}
          onMentorClick={handleOpenMentor}
          onCabinetClick={handleOpenCabinet}
          onSignOut={() => {
            void signOut();
          }}
        />

        <div className="flex-1 overflow-hidden">
          {mainView === "home" ? (
            <EmptyState onSelectView={(view) => setMainView(view)} />
          ) : mainView === "mentor" ? (
            <MentorChatView />
          ) : mainView === "cabinet" && !selectedData ? (
            <PersonalCabinet
              assignedClientIds={assignedClientIds}
              allClients={allClients}
              onOpenClient={(id, name) => handleSelectClient(id, name, "cabinet")}
              userId={session.user.id}
              profile={profile}
              role={profile.role}
            />
          ) : selectedData ? (
            <ClientWorkspace data={selectedData} userId={session.user.id} role={profile.role} />
          ) : (
            <ClientsOverview
              clients={allClients}
              onOpenClient={(id, name) => handleSelectClient(id, name, "clients")}
            />
          )}
        </div>
      </main>
    </div>
  );
}