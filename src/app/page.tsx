"use client";

import { useState } from "react";
import { ClientSidebar } from "@/components/client-sidebar";
import { EmptyState } from "@/components/empty-state";
import { ClientWorkspace } from "@/components/client-workspace";
import { allClientsData } from "@/lib/mock-data";
import { Menu, X } from "lucide-react";

export default function Home() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedData = selectedClientId
    ? allClientsData[selectedClientId]
    : null;

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-30 lg:z-auto
          h-full w-72 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <ClientSidebar
          selectedClientId={selectedClientId}
          onSelectClient={handleSelectClient}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A] lg:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg bg-[#161616] border border-[#1E1E1E] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white">
            {selectedData ? selectedData.client.name : "SMM Agency"}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedData ? (
            <ClientWorkspace data={selectedData} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
