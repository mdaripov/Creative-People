"use client";

import { ArrowUpRight, ClipboardCheck, ShieldAlert, Sparkles, Target } from "lucide-react";
import type { ManagerControllerStatus } from "@/lib/manager-dashboard";
import { StatusBadge } from "@/components/manager/status-badge";

interface ControllerOverviewProps {
  controller: ManagerControllerStatus;
  onOpenCompany: (companyId: string) => void;
  controllerTablesMissing?: boolean;
}

export function ControllerOverview({
  controller,
  onOpenCompany,
  controllerTablesMissing = false,
}: ControllerOverviewProps) {
  return (
    <section className="rounded-[32px] border border-[#1E1E1E] bg-[#15161A] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Контроллер
          </div>
          <h2 className="text-xl font-semibold text-white">Панель контроля качества и выполнения</h2>
          <p className="mt-1 text-sm text-[#9FA8BB]">
            Контроллер здесь — источник управленческой оценки: планы, замечания, эскалации и проблемные компании.
          </p>
        </div>
      </div>

      {controllerTablesMissing ? (
        <div className="rounded-3xl border border-dashed border-[#333847] bg-[#111318] p-6 text-sm text-[#9FA8BB]">
          Таблицы контроллера пока доступны не полностью, поэтому панель показывает частичный обзор без ошибок.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]">
            <Target className="h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold text-white">{controller.totalPlans}</p>
          <p className="mt-1 text-sm text-[#9FA8BB]">Планов на неделю</p>
        </div>

        <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold text-white">{controller.completedPlans}</p>
          <p className="mt-1 text-sm text-[#9FA8BB]">Планов закрыто</p>
        </div>

        <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FBBF24]/20 bg-[#FBBF24]/10 text-[#FBBF24]">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold text-white">{controller.pendingPlans}</p>
          <p className="mt-1 text-sm text-[#9FA8BB]">Планов в работе</p>
        </div>

        <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F87171]/20 bg-[#F87171]/10 text-[#F87171]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold text-white">{controller.escalationsCount}</p>
          <p className="mt-1 text-sm text-[#9FA8BB]">Эскалаций</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
          <p className="mb-3 text-sm font-semibold text-white">Компании с замечаниями и риском</p>
          {controller.flaggedCompanies.length > 0 ? (
            <div className="space-y-3">
              {controller.flaggedCompanies.map((company) => (
                <button
                  key={company.companyId}
                  onClick={() => onOpenCompany(company.companyId)}
                  className="flex w-full items-start justify-between gap-3 rounded-2xl border border-[#282D3A] bg-[#141923] px-4 py-3 text-left transition-colors hover:bg-[#171D29]"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{company.companyName}</p>
                    <p className="mt-1 text-xs text-[#9FA8BB]">{company.assignedSpecialistName}</p>
                    <p className="mt-2 text-sm text-[#D1D5DB]">
                      {company.alertReasons[0] ?? "Есть управленческий риск"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={company.healthStatus} />
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7DD3FC]">
                      Открыть
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2C3240] bg-[#131821] p-5 text-sm text-[#9FA8BB]">
              Контроллер не видит активных замечаний по компаниям.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
          <p className="mb-3 text-sm font-semibold text-white">Последние действия контроллера</p>
          {controller.recentControllerActions.length > 0 ? (
            <div className="space-y-3">
              {controller.recentControllerActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-2xl border border-[#282D3A] bg-[#141923] p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{action.companyName}</p>
                      <p className="mt-1 text-xs text-[#9FA8BB]">{action.specialistName}</p>
                    </div>
                    <StatusBadge status={action.tone} />
                  </div>
                  <p className="text-sm text-[#D1D5DB]">{action.label}</p>
                  <p className="mt-2 text-xs text-[#7C879C]">{action.createdAt}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2C3240] bg-[#131821] p-5 text-sm text-[#9FA8BB]">
              Пока нет последних действий контроллера.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}