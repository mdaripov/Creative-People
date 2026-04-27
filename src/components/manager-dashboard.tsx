"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  ShieldAlert,
  Siren,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { useManagerDashboard } from "@/hooks/use-manager-dashboard";
import {
  formatTrackedTime,
  getProgressPercent,
  type HealthStatus,
} from "@/lib/manager-dashboard";
import { StatusBadge } from "@/components/manager/status-badge";

interface ManagerDashboardProps {
  onOpenClient: (id: string) => void;
}

type DashboardCard =
  | { type: "company"; id: string }
  | { type: "specialist"; id: string }
  | { type: "attention"; id: string };

function toneStyles(tone: HealthStatus | "neutral") {
  if (tone === "green") {
    return {
      color: "#34D399",
      bg: "rgba(52,211,153,0.10)",
      border: "rgba(52,211,153,0.24)",
    };
  }

  if (tone === "yellow") {
    return {
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.24)",
    };
  }

  if (tone === "red") {
    return {
      color: "#F87171",
      bg: "rgba(248,113,113,0.10)",
      border: "rgba(248,113,113,0.24)",
    };
  }

  return {
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.24)",
  };
}

function KpiTile({
  label,
  value,
  note,
  tone,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  tone: HealthStatus | "neutral";
  icon: React.ReactNode;
}) {
  const styles = toneStyles(tone);

  return (
    <div className="rounded-[28px] border border-[#242424] bg-[#151515] p-5">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
        style={{
          color: styles.color,
          background: styles.bg,
          borderColor: styles.border,
        }}
      >
        {icon}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#8B93A7]">{note}</p>
    </div>
  );
}

export function ManagerDashboard({ onOpenClient }: ManagerDashboardProps) {
  const { data, loading, controllerTablesMissing } = useManagerDashboard();
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);

  const company = useMemo(() => {
    if (!data || selectedCard?.type !== "company") return null;
    return data.companies.find((item) => item.companyId === selectedCard.id) ?? null;
  }, [data, selectedCard]);

  const specialist = useMemo(() => {
    if (!data || selectedCard?.type !== "specialist") return null;
    return data.specialists.find((item) => item.specialistId === selectedCard.id) ?? null;
  }, [data, selectedCard]);

  const attention = useMemo(() => {
    if (!data || selectedCard?.type !== "attention") return null;
    return data.attentionItems.find((item) => item.id === selectedCard.id) ?? null;
  }, [data, selectedCard]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F0F0F]">
        <Loader2 className="h-7 w-7 animate-spin text-[#8B93A7]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F0F0F] p-6">
        <div className="rounded-[32px] border border-[#1E1E1E] bg-[#151515] p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-[#6B7280]" />
          <p className="mt-3 text-sm text-[#8B93A7]">
            Пока нет данных для управленческого dashboard.
          </p>
        </div>
      </div>
    );
  }

  const hasDetail = Boolean(company || specialist || attention);

  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="rounded-[32px] border border-[#1E1E1E] bg-[#13151A] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-4 py-1.5 text-[11px] font-semibold text-[#7DD3FC]">
                <BarChart3 className="h-3.5 w-3.5" />
                Executive overview
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Единый dashboard руководителя
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#9FA8BB] sm:text-base">
                Один экран для быстрого контроля агентства: важные сигналы, компании, команда и статус контроллера.
                Нажмите на любую карточку, чтобы провалиться в детали.
              </p>
            </div>

            {hasDetail ? (
              <button
                onClick={() => setSelectedCard(null)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 text-sm font-semibold text-[#C9D1E1] transition-colors hover:bg-[#1A1A1A]"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад к dashboard
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-2 text-sm font-medium text-[#34D399]">
                <Sparkles className="h-4 w-4" />
                Нажмите на карточку для деталей
              </div>
            )}
          </div>
        </div>

        {!hasDetail ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <KpiTile
                label={data.kpis[0]?.label ?? "Активных компаний"}
                value={data.kpis[0]?.value ?? 0}
                note={data.kpis[0]?.note ?? ""}
                tone={data.kpis[0]?.tone ?? "neutral"}
                icon={<Briefcase className="h-5 w-5" />}
              />
              <KpiTile
                label={data.kpis[1]?.label ?? "В зелёной зоне"}
                value={data.kpis[1]?.value ?? 0}
                note={data.kpis[1]?.note ?? ""}
                tone={data.kpis[1]?.tone ?? "green"}
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
              <KpiTile
                label={data.kpis[2]?.label ?? "В зоне риска"}
                value={data.kpis[2]?.value ?? 0}
                note={data.kpis[2]?.note ?? ""}
                tone={data.kpis[2]?.tone ?? "yellow"}
                icon={<Siren className="h-5 w-5" />}
              />
              <KpiTile
                label={data.kpis[3]?.label ?? "SMM в работе"}
                value={data.kpis[3]?.value ?? 0}
                note={data.kpis[3]?.note ?? ""}
                tone={data.kpis[3]?.tone ?? "neutral"}
                icon={<Users className="h-5 w-5" />}
              />
              <KpiTile
                label={data.kpis[4]?.label ?? "Без отчёта за сегодня"}
                value={data.kpis[4]?.value ?? 0}
                note={data.kpis[4]?.note ?? ""}
                tone={data.kpis[4]?.tone ?? "red"}
                icon={<FileText className="h-5 w-5" />}
              />
              <KpiTile
                label={data.kpis[5]?.label ?? "Эскалации контроллера"}
                value={data.kpis[5]?.value ?? 0}
                note={data.kpis[5]?.note ?? ""}
                tone={data.kpis[5]?.tone ?? "red"}
                icon={<ClipboardCheck className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F87171]/20 bg-[#F87171]/10 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Важные сигналы
                    </div>
                    <h2 className="text-xl font-semibold text-white">Требует внимания</h2>
                  </div>
                  <span className="text-sm text-[#8B93A7]">{data.attentionItems.length}</span>
                </div>

                {data.attentionItems.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {data.attentionItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedCard({ type: "attention", id: item.id })}
                        className="rounded-3xl border border-[#2A2020] bg-[#161111] p-4 text-left transition-all duration-200 hover:border-[#F87171]/30 hover:bg-[#1B1415]"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F87171]/20 bg-[#F87171]/10 text-[#F87171]">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                          <StatusBadge status={item.tone} />
                        </div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-[#CBAFB2]">
                          {item.description}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#FCA5A5]">
                          Открыть детали
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#121212] p-6 text-sm text-[#8B93A7]">
                    Критичных сигналов сейчас нет.
                  </div>
                )}
              </section>

              <section className="rounded-[32px] border border-[#1E1E1E] bg-[#14161A] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      Контроллер
                    </div>
                    <h2 className="text-xl font-semibold text-white">Сводка контроллера</h2>
                  </div>
                </div>

                {controllerTablesMissing ? (
                  <div className="rounded-3xl border border-dashed border-[#303545] bg-[#101318] p-5 text-sm text-[#9FA8BB]">
                    Таблицы контроллера доступны частично, поэтому здесь показана неполная сводка.
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Планов на неделю",
                      value: data.controller.totalPlans,
                      color: "#38BDF8",
                      icon: <TrendingUp className="h-4 w-4" />,
                    },
                    {
                      label: "Закрыто",
                      value: data.controller.completedPlans,
                      color: "#34D399",
                      icon: <CheckCircle2 className="h-4 w-4" />,
                    },
                    {
                      label: "В работе",
                      value: data.controller.pendingPlans,
                      color: "#FBBF24",
                      icon: <Sparkles className="h-4 w-4" />,
                    },
                    {
                      label: "Эскалации",
                      value: data.controller.escalationsCount,
                      color: "#F87171",
                      icon: <ShieldAlert className="h-4 w-4" />,
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{
                          background: `${item.color}15`,
                          border: `1px solid ${item.color}25`,
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </div>
                      <p className="text-2xl font-semibold text-white">{item.value}</p>
                      <p className="mt-1 text-sm text-[#9FA8BB]">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {data.controller.recentControllerActions.slice(0, 3).map((action) => (
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
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                    <Briefcase className="h-3.5 w-3.5" />
                    Компании
                  </div>
                  <h2 className="text-xl font-semibold text-white">Карточки компаний</h2>
                </div>
                <span className="text-sm text-[#8B93A7]">{data.companies.length}</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                {data.companies.map((item) => {
                  const progress = getProgressPercent(item.weeklyPlanDone, item.weeklyPlanTotal);

                  return (
                    <button
                      key={item.companyId}
                      onClick={() => setSelectedCard({ type: "company", id: item.companyId })}
                      className="rounded-[28px] border border-[#232323] bg-[#181818] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/30 hover:bg-[#191C22]"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.companyName}</p>
                          <div className="mt-2 inline-flex items-center gap-2 text-sm text-[#B6C0D4]">
                            <UserRound className="h-4 w-4 text-[#38BDF8]" />
                            {item.assignedSpecialistName}
                          </div>
                        </div>
                        <StatusBadge status={item.healthStatus} />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            Отчёт
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {item.reportSubmittedToday ? "Есть" : "Нет"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            План
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {item.weeklyPlanDone}/{item.weeklyPlanTotal}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            Лиды
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">{item.kpi.leads}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
                          <span>Прогресс недели</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              background:
                                item.healthStatus === "green"
                                  ? "#34D399"
                                  : item.healthStatus === "yellow"
                                  ? "#FBBF24"
                                  : "#F87171",
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#38BDF8]">
                        Провалиться в карточку
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
                    <Users className="h-3.5 w-3.5" />
                    Команда
                  </div>
                  <h2 className="text-xl font-semibold text-white">Карточки специалистов</h2>
                </div>
                <span className="text-sm text-[#8B93A7]">{data.specialists.length}</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {data.specialists.map((item) => {
                  const progress = getProgressPercent(item.weeklyTasksDone, item.weeklyTasksTotal);

                  return (
                    <button
                      key={item.specialistId}
                      onClick={() => setSelectedCard({ type: "specialist", id: item.specialistId })}
                      className="rounded-[28px] border border-[#232323] bg-[#181818] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#34D399]/30 hover:bg-[#191E1B]"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.specialistName}</p>
                          <p className="mt-1 text-sm text-[#8B93A7]">{item.roleLabel}</p>
                        </div>
                        <StatusBadge status={item.riskStatus} />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            Клиенты
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">{item.clients.length}</p>
                        </div>
                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            Отчёты
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">{item.reportsTodayCount}</p>
                        </div>
                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            Часы
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {formatTrackedTime(item.totalTrackedMinutes)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                            Задачи
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {item.weeklyTasksDone}/{item.weeklyTasksTotal}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
                          <span>Прогресс недели</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              background:
                                item.riskStatus === "green"
                                  ? "#34D399"
                                  : item.riskStatus === "yellow"
                                  ? "#FBBF24"
                                  : "#F87171",
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#34D399]">
                        Провалиться в карточку
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        ) : company ? (
          <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                  <Briefcase className="h-3.5 w-3.5" />
                  Карточка компании
                </div>
                <h2 className="text-2xl font-semibold text-white">{company.companyName}</h2>
                <p className="mt-2 text-sm text-[#8B93A7]">
                  Назначенный SMM: {company.assignedSpecialistName}
                </p>
              </div>
              <StatusBadge status={company.healthStatus} />
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Отчёт сегодня</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {company.reportSubmittedToday ? "Есть" : "Нет"}
                </p>
              </div>
              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">План недели</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {company.weeklyPlanDone}/{company.weeklyPlanTotal}
                </p>
              </div>
              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Охват</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {company.kpi.reach.toLocaleString("ru-RU")}
                </p>
              </div>
              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Лиды</p>
                <p className="mt-2 text-lg font-semibold text-white">{company.kpi.leads}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
                <p className="mb-3 text-sm font-semibold text-white">Что влияет на статус</p>
                <div className="space-y-3">
                  {company.alertReasons.map((reason) => (
                    <div
                      key={reason}
                      className="rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-sm text-[#D1D5DB]"
                    >
                      {reason}
                    </div>
                  ))}
                  {company.alertReasons.length === 0 ? (
                    <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-sm text-[#D1D5DB]">
                      Критичных замечаний нет.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
                <p className="mb-3 text-sm font-semibold text-white">Контроллер и апдейты</p>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Последнее обновление
                    </p>
                    <p className="mt-2 text-sm text-white">{company.lastUpdate}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Флаг контроллера
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {company.controllerEscalation
                        ? "Есть эскалация"
                        : company.controllerFlag
                        ? "Есть предупреждение"
                        : "Замечаний нет"}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenClient(company.companyId)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 py-3 text-sm font-semibold text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20"
                  >
                    Открыть workspace клиента
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : specialist ? (
          <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

            <div className="grid gap-4 lg:grid-cols-4">
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

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-[#242424] bg-[#111111] p-5">
                <p className="mb-3 text-sm font-semibold text-white">Причины статуса</p>
                <div className="space-y-3">
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
                <p className="mb-3 text-sm font-semibold text-white">Закреплённые компании</p>
                <div className="grid gap-3">
                  {specialist.clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => onOpenClient(client.id)}
                      className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-left transition-colors hover:border-[#38BDF8]/30 hover:bg-[#191C22]"
                    >
                      <span className="text-sm font-medium text-white">{client.name}</span>
                      <StatusBadge status={client.healthStatus} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : attention ? (
          <section className="rounded-[32px] border border-[#1E1E1E] bg-[#161112] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                  Этот сигнал попал в верхний приоритет управленческого dashboard, потому что система
                  увидела риск по отчётности, выполнению плана или сигналу от контроллера.
                </p>
              </div>

              <div className="rounded-3xl border border-[#3A2426] bg-[#191214] p-5">
                <p className="mb-3 text-sm font-semibold text-white">Быстрое действие</p>
                {attention.companyId ? (
                  <button
                    onClick={() => onOpenClient(attention.companyId!)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm font-semibold text-[#FCA5A5] transition-colors hover:bg-[#F87171]/20"
                  >
                    Открыть компанию
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 py-3 text-sm text-[#E7D3D5]">
                    Откройте карточку специалиста из общей сетки, чтобы продолжить анализ.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}