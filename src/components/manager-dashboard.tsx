"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
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

function CompactCell({
  title,
  subtitle,
  tone = "neutral",
  icon,
  onClick,
  children,
}: {
  title: string;
  subtitle?: string;
  tone?: "green" | "yellow" | "red" | "neutral";
  icon: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const styles = toneStyles(tone);
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`rounded-[26px] border bg-[#161616] p-4 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ${
        onClick ? "transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#191919]" : ""
      }`}
      style={{ borderColor: "#232323" }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border"
          style={{
            color: styles.color,
            background: styles.bg,
            borderColor: styles.border,
          }}
        >
          {icon}
        </div>
        {onClick ? (
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[#6B7280]" />
        ) : null}
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-[#8B93A7]">{subtitle}</p> : null}
      </div>

      {children}
    </Component>
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

  if (company || specialist || attention) {
    return (
      <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-5 animate-fade-in">
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

  const redCompanies = data.companies.filter((item) => item.healthStatus === "red");
  const yellowCompanies = data.companies.filter((item) => item.healthStatus === "yellow");
  const topCompanies = [...data.companies].slice(0, 5);
  const topSpecialists = [...data.specialists].slice(0, 4);
  const topAttention = [...data.attentionItems].slice(0, 4);
  const recentController = [...data.controller.recentControllerActions].slice(0, 4);

  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-5 animate-fade-in">
      <div className="mx-auto max-w-[1700px] space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-[#1E1E1E] bg-[#141821] p-5">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
              <BarChart3 className="h-3.5 w-3.5" />
              Executive overview
            </div>

            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Дашборд руководителя
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#9FB0CC]">
              Вся картина по агентству в одной сетке: риски, специалисты, клиенты и контроллер.
              Нажмите на любую ячейку, чтобы раскрыть детали.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {data.summaryStrip.map((item) => {
                const styles = toneStyles(item.tone);

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[#243042] bg-[#10151D] p-4"
                  >
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p
                      className="mt-2 text-xs font-medium"
                      style={{ color: styles.color }}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-[30px] border p-5"
            style={{
              background: "#171217",
              borderColor:
                redCompanies.length > 0
                  ? "rgba(248,113,113,0.25)"
                  : yellowCompanies.length > 0
                  ? "rgba(251,191,36,0.25)"
                  : "rgba(52,211,153,0.25)",
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F87171]/20 bg-[#F87171]/10 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Главный сигнал
              </div>
              <StatusBadge
                status={redCompanies.length > 0 ? "red" : yellowCompanies.length > 0 ? "yellow" : "green"}
              />
            </div>

            <p className="text-xl font-semibold leading-tight text-white">
              {redCompanies.length > 0
                ? `${redCompanies.length} клиентов требуют срочного внимания`
                : yellowCompanies.length > 0
                ? `${yellowCompanies.length} клиентов требуют ручной проверки`
                : "Критичных отклонений сейчас нет"}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[#D1B5B5]">
              Сначала смотрите красные и жёлтые ячейки — они показывают, где нужен быстрый управленческий ответ.
            </p>
          </div>
        </div>

        <div className="grid gap-4 2xl:grid-cols-[0.95fr_1.1fr_0.95fr]">
          <div className="grid gap-4">
            <CompactCell
              title="KPI агентства"
              subtitle="Краткая метрика по работе"
              tone="neutral"
              icon={<TrendingUp className="h-4 w-4" />}
            >
              <div className="grid grid-cols-2 gap-2">
                {data.kpis.slice(0, 6).map((item) => {
                  const Icon = kpiIcons[item.id as keyof typeof kpiIcons] ?? BarChart3;
                  const styles = toneStyles(item.tone);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#242424] bg-[#111111] p-3"
                    >
                      <div
                        className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border"
                        style={{
                          color: styles.color,
                          background: styles.bg,
                          borderColor: styles.border,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-lg font-semibold text-white">{item.value}</p>
                      <p className="mt-1 text-[11px] leading-tight text-[#8B93A7]">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </CompactCell>

            <CompactCell
              title="Команда"
              subtitle="Нажмите на специалиста"
              tone="green"
              icon={<Users className="h-4 w-4" />}
            >
              <div className="space-y-2">
                {topSpecialists.map((item) => (
                  <button
                    key={item.specialistId}
                    onClick={() => setSelectedCard({ type: "specialist", id: item.specialistId })}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#242424] bg-[#111111] px-3 py-3 text-left transition-colors hover:bg-[#151515]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.specialistName}</p>
                      <p className="mt-1 text-[11px] text-[#8B93A7]">
                        {item.clients.length} клиентов · {item.hoursLabel}
                      </p>
                    </div>
                    <StatusBadge status={item.riskStatus} />
                  </button>
                ))}
              </div>
            </CompactCell>
          </div>

          <div className="grid gap-4">
            <CompactCell
              title="Клиенты"
              subtitle="Общий срез по компаниям"
              tone="neutral"
              icon={<Briefcase className="h-4 w-4" />}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {topCompanies.map((item) => (
                  <button
                    key={item.companyId}
                    onClick={() => setSelectedCard({ type: "company", id: item.companyId })}
                    className="rounded-2xl border border-[#242424] bg-[#111111] p-3 text-left transition-colors hover:bg-[#151515]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.companyName}</p>
                        <p className="mt-1 truncate text-[11px] text-[#8B93A7]">
                          {item.assignedSpecialistName}
                        </p>
                      </div>
                      <StatusBadge status={item.healthStatus} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[10px] text-[#6B7280]">Отчёт</p>
                        <p className="mt-1 text-[11px] font-medium text-white">
                          {item.reportSubmittedToday ? "Есть" : "Нет"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B7280]">План</p>
                        <p className="mt-1 text-[11px] font-medium text-white">
                          {item.weeklyPlanDone}/{item.weeklyPlanTotal}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B7280]">Лиды</p>
                        <p className="mt-1 text-[11px] font-medium text-white">{item.kpi.leads}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CompactCell>

            <CompactCell
              title="Красные и жёлтые зоны"
              subtitle="Самые важные клиенты"
              tone={redCompanies.length > 0 ? "red" : "yellow"}
              icon={<AlertTriangle className="h-4 w-4" />}
            >
              <div className="space-y-2">
                {[...redCompanies, ...yellowCompanies].slice(0, 4).map((item) => (
                  <button
                    key={item.companyId}
                    onClick={() => setSelectedCard({ type: "company", id: item.companyId })}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#242424] bg-[#111111] px-3 py-3 text-left transition-colors hover:bg-[#151515]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.companyName}</p>
                      <p className="mt-1 truncate text-[11px] text-[#8B93A7]">
                        {item.alertReasons[0] ?? "Нужна проверка"}
                      </p>
                    </div>
                    <StatusBadge status={item.healthStatus} />
                  </button>
                ))}
              </div>
            </CompactCell>
          </div>

          <div className="grid gap-4">
            <CompactCell
              title="Контроллер"
              subtitle="Планы и эскалации"
              tone={data.controller.escalationsCount > 0 ? "red" : "neutral"}
              icon={<ClipboardCheck className="h-4 w-4" />}
            >
              {controllerTablesMissing ? (
                <div className="rounded-2xl border border-dashed border-[#333847] bg-[#111318] p-3 text-xs text-[#9FA8BB]">
                  Данные контроллера доступны частично.
                </div>
              ) : null}

              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { label: "Планов", value: data.controller.totalPlans },
                  { label: "Закрыто", value: data.controller.completedPlans },
                  { label: "В работе", value: data.controller.pendingPlans },
                  { label: "Эскалации", value: data.controller.escalationsCount },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#242424] bg-[#111111] p-3"
                  >
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-[11px] text-[#8B93A7]">{item.label}</p>
                  </div>
                ))}
              </div>
            </CompactCell>

            <CompactCell
              title="Последние сигналы"
              subtitle="Нажмите для раскрытия"
              tone={topAttention.length > 0 ? topAttention[0].tone : "neutral"}
              icon={<ShieldAlert className="h-4 w-4" />}
            >
              <div className="space-y-2">
                {topAttention.length > 0 ? (
                  topAttention.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCard({ type: "attention", id: item.id })}
                      className="w-full rounded-2xl border border-[#242424] bg-[#111111] p-3 text-left transition-colors hover:bg-[#151515]"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <StatusBadge status={item.tone} />
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#8B93A7]">
                        {item.description}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-3 text-xs text-[#8B93A7]">
                    Критичных сигналов нет.
                  </div>
                )}
              </div>
            </CompactCell>

            <CompactCell
              title="Последние действия контроллера"
              subtitle="Быстрая история"
              tone="neutral"
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              <div className="space-y-2">
                {recentController.length > 0 ? (
                  recentController.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#242424] bg-[#111111] p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white">{item.companyName}</p>
                        <StatusBadge status={item.tone} />
                      </div>
                      <p className="text-[11px] text-[#C9D1E1]">{item.label}</p>
                      <p className="mt-1 text-[10px] text-[#6B7280]">{item.createdAt}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-3 text-xs text-[#8B93A7]">
                    Пока нет действий.
                  </div>
                )}
              </div>
            </CompactCell>
          </div>
        </div>
      </div>
    </div>
  );
}