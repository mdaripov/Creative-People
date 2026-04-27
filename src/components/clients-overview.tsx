"use client";

import { ArrowRight, Briefcase, Sparkles } from "lucide-react";
import { createClientData } from "@/lib/mock-data";

interface ClientsOverviewProps {
  clients: Array<{ id: string; name: string }>;
  onOpenClient: (id: string, name?: string) => void;
}

export function ClientsOverview({ clients, onOpenClient }: ClientsOverviewProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-[#1E1E1E] bg-[#131313] p-6 sm:p-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-4 py-1.5 text-[11px] font-medium text-[#7DD3FC]">
              <Briefcase className="h-3.5 w-3.5" />
              Все клиенты
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Рабочее пространство по всем клиентам
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#8B93A7] sm:text-base">
              Открывайте нужного клиента, переходите в его рабочую область и управляйте контентом,
              трендами, LinkedIn, отчётами и задачами из одной системы.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client, index) => {
            const clientData = createClientData(client.id, client.name);

            return (
              <button
                key={client.id}
                onClick={() => onOpenClient(client.id, client.name)}
                className="rounded-[28px] border border-[#222222] bg-[#151515] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#38BDF8]/30 hover:bg-[#171B22] animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.06}s`,
                  opacity: 0,
                }}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-3xl text-sm font-bold text-white"
                    style={{ backgroundColor: clientData.client.avatarColor }}
                  >
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-medium text-[#34D399]">
                    <Sparkles className="h-3 w-3" />
                    Активный workspace
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white">{client.name}</h3>
                <p className="mt-2 text-sm text-[#8B93A7]">{clientData.client.industry}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {clientData.client.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-[11px] text-[#C9D1E1]"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">
                    Последняя активность: {clientData.client.lastActive}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#38BDF8]">
                    Открыть
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}