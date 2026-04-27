"use client";

import { ArrowUpRight, Briefcase, Clock3, FileText, ShieldAlert, Users } from "lucide-react";
import {
  formatTrackedTime,
  getProgressPercent,
  type ManagerSpecialistStatus,
} from "@/lib/manager-dashboard";
import { StatusBadge } from "@/components/manager/status-badge";

interface TeamOverviewProps {
  specialists: ManagerSpecialistStatus[];
  onOpenCompany: (companyId: string) => void;
}

export function TeamOverview({
  specialists,
  onOpenCompany,
}: TeamOverviewProps) {
  return (
    <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
      <div className="mb-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
          <Users className="h-3.5 w-3.5" />
          Команда SMM
        </div>
        <h2 className="text-xl font-semibold text-white">Кто перегружен, кто стабилен, где риски</h2>
        <p className="mt-1 text-sm text-[#8B93A7]">
          Экран отвечает на вопрос, кто закрывает задачи, кто недодаёт отчёты и у кого компании в риске.
        </p>
      </div>

      {specialists.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {specialists.map((specialist) => {
            const progress = getProgressPercent(
              specialist.weeklyTasksDone,
              specialist.weeklyTasksTotal
            );

            return (
              <div
                key={specialist.specialistId}
                className="rounded-[28px] border border-[#232323] bg-[#181818] p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{specialist.specialistName}</p>
                    <p className="mt-1 text-sm text-[#8B93A7]">{specialist.roleLabel}</p>
                  </div>
                  <StatusBadge
                    status={specialist.riskStatus}
                    label={
                      specialist.riskStatus === "green"
                        ? "Стабильно"
                        : specialist.riskStatus === "yellow"
                        ? "Нагрузка / внимание"
                        : "Риск"
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#8B93A7]">
                      <Briefcase className="h-4 w-4 text-[#38BDF8]" />
                      Компании
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {specialist.clients.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#8B93A7]">
                      <FileText className="h-4 w-4 text-[#A78BFA]" />
                      Отчёты сегодня
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {specialist.reportsTodayCount}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#8B93A7]">
                      <Clock3 className="h-4 w-4 text-[#FBBF24]" />
                      Часы
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {formatTrackedTime(specialist.totalTrackedMinutes)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#8B93A7]">
                      <ShieldAlert className="h-4 w-4 text-[#34D399]" />
                      Записей
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {specialist.totalReportEntries}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
                    <span>Недельные задачи</span>
                    <span>
                      {specialist.weeklyTasksDone}/{specialist.weeklyTasksTotal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
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

                <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B93A7]">
                    Закреплённые компании
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specialist.clients.length > 0 ? (
                      specialist.clients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => onOpenCompany(client.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#171717] px-3 py-1.5 text-xs text-[#D1D5DB] transition-colors hover:border-[#38BDF8]/30 hover:text-white"
                        >
                          <span>{client.name}</span>
                          <span
                            className={`h-2 w-2 rounded-full ${
                              client.healthStatus === "green"
                                ? "bg-[#34D399]"
                                : client.healthStatus === "yellow"
                                ? "bg-[#FBBF24]"
                                : "bg-[#F87171]"
                            }`}
                          />
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-[#8B93A7]">Нет закреплённых компаний</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {specialist.alertReasons.map((reason) => (
                    <div
                      key={reason}
                      className="rounded-2xl border border-[#252525] bg-[#111111] px-3 py-2.5 text-sm text-[#D1D5DB]"
                    >
                      {reason}
                    </div>
                  ))}
                </div>

                {specialist.clients.some((client) => client.healthStatus !== "green") ? (
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#38BDF8]">
                    Есть проблемные компании
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#111111] p-8 text-center text-sm text-[#8B93A7]">
          Пока нет данных по SMM-специалистам.
        </div>
      )}
    </section>
  );
}