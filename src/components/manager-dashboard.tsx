"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { useManagerDashboard } from "@/hooks/use-manager-dashboard";
import { ManagerHero } from "@/components/manager/manager-hero";
import { ManagerDetailPanel } from "@/components/manager/manager-detail-panel";
import { StatusBadge } from "@/components/manager/status-badge";

interface ManagerDashboardProps {
  onOpenClient: (id: string) => void;
}

type DashboardCard =
  | { type: "company"; id: string }
  | { type: "specialist"; id: string }
  | { type: "attention"; id: string };

function toneStyles(tone: "green" | "yellow" | "red" | "neutral") {
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

const kpiIcons = {
  "active-companies": Briefcase,
  "specialists-working": Users,
  "without-report": FileText,
  "yellow-red-zone": AlertTriangle,
  "plan-fact": TrendingUp,
  "controller-escalations": ClipboardCheck,
};

export function ManagerDashboard({ onOpenClient }: ManagerDashboardProps) {
  const { data, loading, controllerTablesMissing } = useManagerDashboard();
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [specialistFilter, setSpecialistFilter] = useState("all");
  const [search, setSearch] = useState("");

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

  const specialistNames = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.companies.map((item) => item.assignedSpecialistName))).filter(Boolean);
  }, [data]);

  const filteredCompanies = useMemo(() => {
    if (!data) return [];

    const items = data.companies.filter((item) => {
      const matchesStatus = companyFilter === "all" || item.healthStatus === companyFilter;
      const matchesSpecialist =
        specialistFilter === "all" || item.assignedSpecialistName === specialistFilter;
      const matchesSearch =
        item.companyName.toLowerCase().includes(search.toLowerCase()) ||
        item.assignedSpecialistName.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSpecialist && matchesSearch;
    });

    const weight = { red: 0, yellow: 1, green: 2 };
    return [...items].sort((a, b) => weight[a.healthStatus] - weight[b.healthStatus]);
  }, [companyFilter, data, search, specialistFilter]);

  const hasDetail = Boolean(company || specialist || attention);

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

  if (hasDetail) {
    return (
      <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
        <div className="mx-auto max-w-[1400px]">
          <ManagerDetailPanel
            company={company}
            specialist={specialist}
            attention={attention}
            onBack={() => setSelectedCard(null)}
            onOpenClient={onOpenClient}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <ManagerHero hero={data.hero} />

        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                <BarChart3 className="h-3.5 w-3.5" />
                Ключевые KPI
              </div>
              <h2 className="text-xl font-semibold text-white">Что происходит прямо сейчас</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {data.kpis.map((item) => {
              const Icon = kpiIcons[item.id as keyof typeof kpiIcons] ?? BarChart3;
              const styles = toneStyles(item.tone);

              return (
                <div
                  key={item.id}
                  className="rounded-[28px] border border-[#232323] bg-[#181818] p-5"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
                    style={{
                      color: styles.color,
                      background: styles.bg,
                      borderColor: styles.border,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight text-white">{item.value}</p>
                  <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#8B93A7]">{item.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[32px] border border-[#3A2222] bg-[#181314] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F87171]/25 bg-[#F87171]/10 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Требует внимания
              </div>
              <h2 className="text-xl font-semibold text-white">Критичные сигналы</h2>
            </div>
            <span className="text-sm text-[#D1B5B5]">{data.attentionItems.length}</span>
          </div>

          {data.attentionItems.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
              {data.attentionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCard({ type: "attention", id: item.id })}
                  className="rounded-3xl border border-[#42282A] bg-[#141010] p-4 text-left transition-all duration-200 hover:border-[#F87171]/30 hover:bg-[#1B1415]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F87171]/20 bg-[#F87171]/10 text-[#F87171]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <StatusBadge status={item.tone} />
                  </div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#C9B3B5]">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#121212] p-6 text-sm text-[#8B93A7]">
              Критичных сигналов сейчас нет.
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
              <Users className="h-3.5 w-3.5" />
              Команда
            </div>
            <h2 className="text-xl font-semibold text-white">Кто стабилен, кто в риске и кто перегружен</h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {data.specialists.map((item) => (
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
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Клиенты</p>
                    <p className="mt-2 text-sm font-medium text-white">{item.clients.length}</p>
                  </div>
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Отчёты</p>
                    <p className="mt-2 text-sm font-medium text-white">{item.reportsTodayCount}</p>
                  </div>
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Часы</p>
                    <p className="mt-2 text-sm font-medium text-white">{item.hoursLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Задачи</p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {item.weeklyTasksDone}/{item.weeklyTasksTotal}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
                    <span>План-факт недели</span>
                    <span>{item.weeklyTasksTotal ? Math.round((item.weeklyTasksDone / item.weeklyTasksTotal) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.weeklyTasksTotal ? Math.round((item.weeklyTasksDone / item.weeklyTasksTotal) * 100) : 0}%`,
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

                <div className="mt-4 space-y-2">
                  {item.alertReasons.slice(0, 2).map((reason) => (
                    <div
                      key={reason}
                      className="rounded-2xl border border-[#252525] bg-[#111111] px-3 py-2.5 text-sm text-[#D1D5DB]"
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                <Briefcase className="h-3.5 w-3.5" />
                Клиенты под контролем
              </div>
              <h2 className="text-xl font-semibold text-white">Где проблемы по клиентам и кому они назначены</h2>
              <p className="mt-1 text-sm text-[#8B93A7]">
                Список автоматически отсортирован по риску, с быстрыми фильтрами и поиском.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:w-[760px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск клиента или специалиста"
                className="h-11 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
              />

              <select
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                className="h-11 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="red">Красная зона</option>
                <option value="yellow">Жёлтая зона</option>
                <option value="green">Зелёная зона</option>
              </select>

              <select
                value={specialistFilter}
                onChange={(event) => setSpecialistFilter(event.target.value)}
                className="h-11 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
              >
                <option value="all">Все специалисты</option>
                {specialistNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredCompanies.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredCompanies.map((item) => (
                <button
                  key={item.companyId}
                  onClick={() => setSelectedCard({ type: "company", id: item.companyId })}
                  className="rounded-[28px] border border-[#232323] bg-[#181818] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/30 hover:bg-[#191C22]"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.companyName}</p>
                      <p className="mt-2 text-sm text-[#B6C0D4]">{item.assignedSpecialistName}</p>
                    </div>
                    <StatusBadge status={item.healthStatus} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Отчёт за сегодня</p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {item.reportSubmittedToday ? "Есть отчёт" : "Нет отчёта"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Дисциплина</p>
                      <p className="mt-2 text-sm font-medium text-white">{item.disciplineLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
                      <span>План-факт недели</span>
                      <span>{item.weeklyPlanDone}/{item.weeklyPlanTotal}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.weeklyPlanTotal ? Math.round((item.weeklyPlanDone / item.weeklyPlanTotal) * 100) : 0}%`,
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Охват</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {item.kpi.reach.toLocaleString("ru-RU")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Рост</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        +{item.kpi.growth.toLocaleString("ru-RU")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Лиды</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.kpi.leads}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {item.alertReasons.slice(0, 2).map((reason) => (
                      <div
                        key={reason}
                        className="rounded-2xl border border-[#252525] bg-[#111111] px-3 py-2.5 text-sm text-[#D1D5DB]"
                      >
                        {reason}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#111111] p-8 text-center text-sm text-[#8B93A7]">
              По выбранным фильтрам компании не найдены.
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#15161A] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Контроллер
              </div>
              <h2 className="text-xl font-semibold text-white">План, замечания и эскалации</h2>
            </div>
          </div>

          {controllerTablesMissing ? (
            <div className="mb-4 rounded-3xl border border-dashed border-[#333847] bg-[#111318] p-5 text-sm text-[#9FA8BB]">
              Таблицы контроллера доступны частично, поэтому здесь показана неполная сводка.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-4">
            {[
              {
                label: "Планов на неделю",
                value: data.controller.totalPlans,
                color: "#38BDF8",
                icon: TrendingUp,
              },
              {
                label: "Закрыто",
                value: data.controller.completedPlans,
                color: "#34D399",
                icon: CheckCircle2,
              },
              {
                label: "В работе",
                value: data.controller.pendingPlans,
                color: "#FBBF24",
                icon: ClipboardCheck,
              },
              {
                label: "Эскалации",
                value: data.controller.escalationsCount,
                color: "#F87171",
                icon: ShieldAlert,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[#232734] bg-[#101218] p-4"
                >
                  <div
                    className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}25`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-[#9FA8BB]">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-[#232734] bg-[#101218] p-4">
              <p className="mb-3 text-sm font-semibold text-white">Компании с замечаниями</p>
              {data.controller.flaggedCompanies.length > 0 ? (
                <div className="space-y-3">
                  {data.controller.flaggedCompanies.slice(0, 4).map((companyItem) => (
                    <button
                      key={companyItem.companyId}
                      onClick={() => setSelectedCard({ type: "company", id: companyItem.companyId })}
                      className="flex w-full items-start justify-between gap-3 rounded-2xl border border-[#282D3A] bg-[#141923] px-4 py-3 text-left transition-colors hover:bg-[#171D29]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{companyItem.companyName}</p>
                        <p className="mt-1 text-xs text-[#9FA8BB]">{companyItem.assignedSpecialistName}</p>
                        <p className="mt-2 text-sm text-[#D1D5DB]">
                          {companyItem.alertReasons[0] ?? "Есть управленческий риск"}
                        </p>
                      </div>
                      <StatusBadge status={companyItem.healthStatus} />
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
              <p className="mb-3 text-sm font-semibold text-white">Последние действия</p>
              {data.controller.recentControllerActions.length > 0 ? (
                <div className="space-y-3">
                  {data.controller.recentControllerActions.slice(0, 4).map((action) => (
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
      </div>
    </div>
  );
}