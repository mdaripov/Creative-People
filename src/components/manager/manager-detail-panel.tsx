"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import {
  formatTrackedTime,
  getProgressPercent,
  type ManagerCompanyStatus,
  type ManagerDashboardData,
  type ManagerSpecialistStatus,
} from "@/lib/manager-dashboard";
import { StatusBadge } from "@/components/manager/status-badge";

interface ManagerDetailPanelProps {
  company: ManagerCompanyStatus | null;
  specialist: ManagerSpecialistStatus | null;
  attention: ManagerDashboardData["attentionItems"][number] | null;
  onBack: () => void;
  onOpenClient: (id: string) => void;
}

export function ManagerDetailPanel({
  company,
  specialist,
  attention,
  onBack,
  onOpenClient,
}: ManagerDetailPanelProps) {
  return (
    <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 text-sm font-semibold text-[#C9D1E1] transition-colors hover:bg-[#1A1A1A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к dashboard
        </button>

        {company?.companyId ? (
          <button
            onClick={() => onOpenClient(company.companyId)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 py-3 text-sm font-semibold text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20"
          >
            Открыть workspace
            <ArrowUpRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {company ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                <Briefcase className="h-3.5 w-3.5" />
                Карточка клиента
              </div>
              <h2 className="text-2xl font-semibold text-white">{company.companyName}</h2>
              <p className="mt-2 text-sm text-[#8B93A7]">
                Ответственный: {company.assignedSpecialistName}
              </p>
            </div>
            <StatusBadge status={company.healthStatus} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Отчёт сегодня</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {company.reportSubmittedToday ? "Есть" : "Нет"}
              </p>
            </div>
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">План-факт</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {company.weeklyPlanDone}/{company.weeklyPlanTotal}
              </p>
            </div>
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Дисциплина</p>
              <p className="mt-2 text-sm font-semibold text-white">{company.disciplineLabel}</p>
            </div>
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Последний апдейт</p>
              <p className="mt-2 text-sm font-semibold text-white">{company.lastUpdate}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
              <span>Прогресс недели</span>
              <span>{getProgressPercent(company.weeklyPlanDone, company.weeklyPlanTotal)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${getProgressPercent(company.weeklyPlanDone, company.weeklyPlanTotal)}%`,
                  background:
                    company.healthStatus === "green"
                      ? "#34D399"
                      : company.healthStatus === "yellow"
                      ? "#FBBF24"
                      : "#F87171",
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Ключевые причины статуса</p>
              <div className="space-y-2">
                {(company.alertReasons.length > 0
                  ? company.alertReasons
                  : ["Критичных замечаний нет"]
                ).map((reason) => (
                  <div
                    key={reason}
                    className="rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-sm text-[#D1D5DB]"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
              <p className="mb-3 text-sm font-semibold text-white">KPI по клиенту</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Охват</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {company.kpi.reach.toLocaleString("ru-RU")}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Рост</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    +{company.kpi.growth.toLocaleString("ru-RU")}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Лиды</p>
                  <p className="mt-2 text-lg font-semibold text-white">{company.kpi.leads}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Контроллер</p>
                  <p className="mt-2 text-sm text-white">
                    {company.controllerEscalation
                      ? "Есть эскалация"
                      : company.controllerFlag
                      ? "Есть предупреждение"
                      : "Сигналов нет"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : specialist ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
                <Users className="h-3.5 w-3.5" />
                Карточка специалиста
              </div>
              <h2 className="text-2xl font-semibold text-white">{specialist.specialistName}</h2>
              <p className="mt-2 text-sm text-[#8B93A7]">{specialist.roleLabel}</p>
            </div>
            <StatusBadge status={specialist.riskStatus} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Клиенты</p>
              <p className="mt-2 text-lg font-semibold text-white">{specialist.clients.length}</p>
            </div>
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Отчёты сегодня</p>
              <p className="mt-2 text-lg font-semibold text-white">{specialist.reportsTodayCount}</p>
            </div>
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Часы</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatTrackedTime(specialist.totalTrackedMinutes)}
              </p>
            </div>
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Задачи недели</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {specialist.weeklyTasksDone}/{specialist.weeklyTasksTotal}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
              <span>Прогресс недели</span>
              <span>{getProgressPercent(specialist.weeklyTasksDone, specialist.weeklyTasksTotal)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${getProgressPercent(specialist.weeklyTasksDone, specialist.weeklyTasksTotal)}%`,
                  background:
                    specialist.riskStatus === "green"
                      ? "#34D399"
                      : specialist.riskStatus === "yellow"
                      ? "#FBBF24"
                      : "#F87171",
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Причины статуса</p>
              <div className="space-y-2">
                {specialist.alertReasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-sm text-[#D1D5DB]"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Закреплённые клиенты</p>
              <div className="grid gap-3">
                {specialist.clients.length > 0 ? (
                  specialist.clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => onOpenClient(client.id)}
                      className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-left transition-colors hover:border-[#38BDF8]/30 hover:bg-[#191C22]"
                    >
                      <span className="text-sm font-medium text-white">{client.name}</span>
                      <StatusBadge status={client.healthStatus} />
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#2A2A2A] bg-[#171717] p-4 text-sm text-[#8B93A7]">
                    У специалиста пока нет закреплённых клиентов.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : attention ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F87171]/20 bg-[#F87171]/10 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Сигнал внимания
              </div>
              <h2 className="text-2xl font-semibold text-white">{attention.title}</h2>
              <p className="mt-2 text-sm text-[#D1B5B5]">{attention.description}</p>
            </div>
            <StatusBadge status={attention.tone} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-[#3A2426] bg-[#191214] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Что произошло</p>
              <p className="text-sm leading-relaxed text-[#E7D3D5]">
                Этот сигнал попал в приоритетный блок, потому что система увидела проблему в отчёте, плане недели, дисциплине специалиста или в логике контроллера.
              </p>
            </div>

            <div className="rounded-3xl border border-[#3A2426] bg-[#191214] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Быстрое действие</p>
              {attention.companyId ? (
                <button
                  onClick={() => onOpenClient(attention.companyId!)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm font-semibold text-[#FCA5A5] transition-colors hover:bg-[#F87171]/20"
                >
                  Открыть клиента
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-sm text-[#E7D3D5]">
                  Вернитесь на обзор и откройте нужную карточку специалиста или клиента.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#111111] p-8 text-center text-sm text-[#8B93A7]">
          Выберите карточку на dashboard, чтобы увидеть детали.
        </div>
      )}
    </section>
  );
}