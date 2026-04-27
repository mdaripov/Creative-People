"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { createClientData } from "@/lib/mock-data";
import { ReportsTab } from "@/components/cabinet/reports-tab";

interface PersonalCabinetProps {
  assignedClientIds: string[];
  allClients: Array<{ id: string; name: string }>;
  onOpenClient: (id: string, name?: string) => void;
}

type CabinetTab = "overview" | "reports";

export function PersonalCabinet({
  assignedClientIds,
  allClients,
  onOpenClient,
}: PersonalCabinetProps) {
  const [activeTab, setActiveTab] = useState<CabinetTab>("overview");

  const assignedClients = useMemo(
    () =>
      assignedClientIds
        .map((id) => allClients.find((client) => client.id === id))
        .filter((client): client is { id: string; name: string } => Boolean(client)),
    [assignedClientIds, allClients]
  );

  if (activeTab === "reports") {
    return (
      <div className="h-full overflow-hidden bg-[#0F0F0F] animate-fade-in">
        <div className="border-b border-[#1A1A1A] px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#151515] px-4 py-2.5 text-xs font-semibold text-[#C9D1E1] transition-all hover:bg-[#181818]"
            >
              <UserCircle2 className="h-3.5 w-3.5" />
              Обзор
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 py-2.5 text-xs font-semibold text-[#38BDF8]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Отчёты
            </button>
          </div>
        </div>
        <ReportsTab clients={allClients} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-2.5 text-xs font-semibold text-[#34D399]"
          >
            <UserCircle2 className="h-3.5 w-3.5" />
            Обзор
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#151515] px-4 py-2.5 text-xs font-semibold text-[#C9D1E1] transition-all hover:bg-[#181818]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Отчёты
          </button>
        </div>

        <div className="rounded-[28px] border border-[#1E1E1E] bg-[#131313] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
                <UserCircle2 className="h-8 w-8" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-medium text-[#34D399]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Личный кабинет SMM специалиста
                </div>
                <h2 className="text-2xl font-semibold text-white">Моё рабочее пространство</h2>
                <p className="mt-1 text-sm text-[#8B93A7]">
                  Здесь собраны закреплённые за вами клиенты и ваш быстрый доступ к работе.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-4 py-2 text-sm font-medium text-[#38BDF8]">
              <Briefcase className="h-4 w-4" />
              Клиентов в кабинете: {assignedClients.length}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#38BDF8]" />
              <h3 className="text-sm font-semibold text-white">Мои клиенты</h3>
            </div>

            {assignedClients.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#121212] p-6 text-center">
                <p className="text-sm text-[#8B93A7]">
                  Пока нет выбранных клиентов. Отметьте их в боковой панели, чтобы добавить сюда.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {assignedClients.map((client) => {
                  const clientData = createClientData(client.id, client.name);

                  return (
                    <button
                      key={client.id}
                      onClick={() => onOpenClient(client.id, client.name)}
                      className="rounded-3xl border border-[#222222] bg-[#121212] p-4 text-left transition-all duration-200 hover:border-[#38BDF8]/30 hover:bg-[#151922]"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
                          style={{ backgroundColor: clientData.client.avatarColor }}
                        >
                          {client.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{client.name}</p>
                          <p className="truncate text-xs text-[#8B93A7]">{clientData.client.industry}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {clientData.client.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="rounded-full border border-[#2A2A2A] bg-[#171717] px-2.5 py-1 text-[11px] text-[#C9D1E1]"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
              <h3 className="text-sm font-semibold text-white">Профиль специалиста</h3>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-[#222222] bg-[#121212] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Роль</p>
                <p className="mt-2 text-sm font-medium text-white">SMM Specialist</p>
              </div>

              <div className="rounded-3xl border border-[#222222] bg-[#121212] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Основной фокус</p>
                <p className="mt-2 text-sm text-[#D1D5DB]">
                  Управление контентом, координация клиентов и работа с ИИ-наставником.
                </p>
              </div>

              <div className="rounded-3xl border border-[#222222] bg-[#121212] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Закреплено клиентов</p>
                <p className="mt-2 text-2xl font-semibold text-white">{assignedClients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}