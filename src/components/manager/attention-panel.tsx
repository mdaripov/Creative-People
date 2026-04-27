"use client";

import { AlertTriangle, ArrowRight, Siren } from "lucide-react";
import type { HealthStatus, ManagerDashboardData } from "@/lib/manager-dashboard";
import { StatusBadge } from "@/components/manager/status-badge";

interface AttentionPanelProps {
  items: ManagerDashboardData["attentionItems"];
  onOpenCompany: (companyId: string) => void;
  onFocusSpecialist: (specialistId: string) => void;
}

function getToneTitle(tone: HealthStatus) {
  if (tone === "red") return "Срочно";
  if (tone === "yellow") return "Внимание";
  return "Под контролем";
}

export function AttentionPanel({
  items,
  onOpenCompany,
  onFocusSpecialist,
}: AttentionPanelProps) {
  return (
    <section className="rounded-[32px] border border-[#3A2222] bg-[#181314] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F87171]/25 bg-[#F87171]/10 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]">
            <Siren className="h-3.5 w-3.5" />
            Требует внимания
          </div>
          <h2 className="text-xl font-semibold text-white">Самые важные сигналы по агентству</h2>
          <p className="mt-1 text-sm text-[#D1B5B5]">
            Здесь собраны компании и специалисты, где требуется реакция руководителя.
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-[#42282A] bg-[#141010] p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F87171]/20 bg-[#F87171]/10 text-[#F87171]">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <StatusBadge status={item.tone} label={getToneTitle(item.tone)} />
              </div>

              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#C9B3B5]">{item.description}</p>

              {item.companyId ? (
                <button
                  onClick={() => onOpenCompany(item.companyId!)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#FCA5A5] transition-opacity hover:opacity-80"
                >
                  Открыть компанию
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : item.specialistId ? (
                <button
                  onClick={() => onFocusSpecialist(item.specialistId!)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#FCA5A5] transition-opacity hover:opacity-80"
                >
                  Показать специалиста
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#2B2B2B] bg-[#121212] p-6 text-sm text-[#8B93A7]">
          Сейчас нет критичных сигналов — агентство выглядит стабильно.
        </div>
      )}
    </section>
  );
}