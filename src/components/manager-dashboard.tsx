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
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-5 animate-fade-in">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <ManagerHero hero={data.hero} />

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-[#1E1E1E] bg-[#141414] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Ключевые KPI
                </div>
                <h2 className="text-lg font-semibold text-white">Сводка</h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.kpis.map((item) => {
                const Icon = kpiIcons[item.id as keyof typeof kpiIcons] ?? BarChart3;
                const styles = toneStyles(item.tone);

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[#232323] bg-[#181818] p-4"
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border"
                      style={{
                        color: styles.color,
                        background: styles.bg,
                        borderColor: styles.border,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-white">{item.value}</p>
                    <p className="mt-1 text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#8B93A7]">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#3A2222] bg-[#181314] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F87171]/25 bg-[#F87171]/10 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Внимание
                </div>
                <h2 className="text-lg font-semibold text-white">Критичные сигналы</h2>
              </div>
              <span className="text-sm text-[#D1B5B5]">{data.attentionItems.length}</span>
            </div>

            {data.attentionItems.length > 0 ? (
              <div className="space-y-3">
                {data.attentionItems.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCard({ type: "attention", id: item.id })}
                    className="w-full rounded-3xl border border-[#42282A] bg-[#141010] p-4 text-left transition-all duration-200 hover:border-[#F87171]/30 hover:bg-[#1B1415]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <StatusBadge status={item.tone} />
                    </div>
                    <p className="text-sm leading-relaxed text-[#C9B3B5]">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#121212] p-5 text-sm text-[#8B93A7]">
                Критичных сигналов сейчас нет.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
          <div className="rounded-[28px] border border-[#1E1E1E] bg-[#141414] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
            <div className="mb-4">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
                <Users className="h-3.5 w-3.5" />
                Команда
              </div>
              <h2 className="text-lg font-semibold text-white">Статус специалистов</h2>
            </div>

            <div className="space-y-3">
              {data.specialists.map((item) => (
                <button
                  key={item.specialistId}
                  onClick={() => setSelectedCard({ type: "specialist", id: item.specialistId })}
                  className="w-full rounded-3xl border border-[#232323] bg-[#181818] p-4 text-left transition-all duration-200 hover:border-[#34D399]/30 hover:bg-[#191E1B]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.specialistName}</p>
                      <p className="mt-1 text-xs text-[#8B93A7]">{item.roleLabel}</p>
                    </div>
                    <StatusBadge status={item.riskStatus} />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Клиенты", value: item.clients.length },
                      { label: "Отчёты", value: item.reportsTodayCount },
                      { label: "Часы", value: item.hoursLabel },
                      { label: "План", value: `${item.weeklyTasksDone}/${item.weeklyTasksTotal}` },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-[#242424] bg-[#111111] p-3"
                      >
                        <p className="text-[10px] text-[#6B7280]">{stat.label}</p>
                        <p className="mt-1 text-sm font-medium text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1E1E1E] bg-[#141414] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
            <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
                  <Briefcase className="h-3.5 w-3.5" />
                  Клиенты
                </div>
                <h2 className="text-lg font-semibold text-white">Компании под контролем</h2>
              </div>

              <div className="grid gap-2 md:grid-cols-3 xl:w-[620px]">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск"
                  className="h-10 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
                />

                <select
                  value={companyFilter}
                  onChange={(event) => setCompanyFilter(event.target.value)}
                  className="h-10 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
                >
                  <option value="all">Все статусы</option>
                  <option value="red">Красная зона</option>
                  <option value="yellow">Жёлтая зона</option>
                  <option value="green">Зелёная зона</option>
                </select>

                <select
                  value={specialistFilter}
                  onChange={(event) => setSpecialistFilter(event.target.value)}
                  className="h-10 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
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
              <div className="grid gap-3 xl:grid-cols-2">
                {filteredCompanies.slice(0, 6).map((item) => (
                  <button
                    key={item.companyId}
                    onClick={() => setSelectedCard({ type: "company", id: item.companyId })}
                    className="rounded-3xl border border-[#232323] bg-[#181818] p-4 text-left transition-all duration-200 hover:border-[#38BDF8]/30 hover:bg-[#191C22]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.companyName}</p>
                        <p className="mt-1 text-xs text-[#B6C0D4]">{item.assignedSpecialistName}</p>
                      </div>
                      <StatusBadge status={item.healthStatus} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Отчёт",
                          value: item.reportSubmittedToday ? "Есть" : "Нет",
                        },
                        {
                          label: "План",
                          value: `${item.weeklyPlanDone}/${item.weeklyPlanTotal}`,
                        },
                        {
                          label: "Лиды",
                          value: item.kpi.leads,
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-[#242424] bg-[#111111] p-3"
                        >
                          <p className="text-[10px] text-[#6B7280]">{stat.label}</p>
                          <p className="mt-1 text-sm font-medium text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-[#D1D5DB]">
                      {item.alertReasons[0] ?? "Критичных замечаний нет"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#111111] p-8 text-center text-sm text-[#8B93A7]">
                По выбранным фильтрам компании не найдены.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#1E1E1E] bg-[#15161A] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Контроллер
              </div>
              <h2 className="text-lg font-semibold text-white">Короткая сводка контроллера</h2>
            </div>
          </div>

          {controllerTablesMissing ? (
            <div className="mb-4 rounded-3xl border border-dashed border-[#333847] bg-[#111318] p-4 text-sm text-[#9FA8BB]">
              Таблицы контроллера доступны частично, поэтому здесь показана неполная сводка.
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-4">
            {[
              {
                label: "Планов",
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
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}25`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-[#9FA8BB]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}