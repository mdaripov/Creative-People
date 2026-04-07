"use client";

import { useState } from "react";
import { ClientSidebar } from "@/components/client-sidebar";
import { EmptyState } from "@/components/empty-state";
import { ClientWorkspace } from "@/components/client-workspace";
import { MentorChatView } from "@/components/mentor-chat-view";
import { allClientsData } from "@/lib/mock-data";
import { Menu, Sparkles } from "lucide-react";

type MainView = "mentor" | "clients";

export default function Home() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainView, setMainView] = useState<MainView>("clients");

  const selectedData =
    selectedClientId && selectedClientId in allClientsData
      ? allClientsData[selectedClientId as keyof typeof allClientsData]
      : null;

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setMainView("clients");
    setSidebarOpen(false);
  };

  const handleOpenMentor = () => {
    setMainView("mentor");
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
          <div className="border-b border-[#1E1E1E] p-3">
            <button
              onClick={handleOpenMentor}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                mainView === "mentor"
                  ? "border-[#A78BFA]/40 bg-[#A78BFA]/12 text-white"
                  : "border-[#222222] bg-[#151515] text-[#C9D1E1] hover:border-[#A78BFA]/25 hover:bg-[#191919]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    mainView === "mentor"
                      ? "border-[#A78BFA]/30 bg-[#A78BFA]/12 text-[#A78BFA]"
                      : "border-[#2A2A2A] bg-[#1A1A1A] text-[#A78BFA]"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">ИИ СММ наставник</p>
                  <p className="text-[11px] text-[#8B93A7]">
                    Чат с наставником по SMM
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <ClientSidebar
              selectedClientId={mainView === "clients" ? selectedClientId : null}
              onSelectClient={handleSelectClient}
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
              : selectedData
              ? selectedData.client.name
              : "SMM Agency"}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {mainView === "mentor" ? (
            <MentorChatView />
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