"use client";

import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Flame,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import type { NormalizedReport } from "@/lib/trendwatcher";

interface ReportSummaryProps {
  report: NormalizedReport;
}

function getSignalTone(updatedLabel: string) {
  const timestamp = Date.parse(updatedLabel);

  if (Number.isNaN(timestamp)) {
    return {
      label: "Нужна проверка свежести",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.24)",
    };
  }

  const hoursAgo = Math.abs(Date.now() - timestamp) / (1000 * 60 * 60);

  if (hoursAgo <= 24) {
    return {
      label: "Свежий сигнал",
      color: "#34D399",
      bg: "rgba(52,211,153,0.10)",
      border: "rgba(52,211,153,0.24)",
    };
  }

  if (hoursAgo <= 72) {
    return {
      label: "Актуально",
      color: "#38BDF8",
      bg: "rgba(56,189,248,0.10)",
      border: "rgba(56,189,248,0.24)",
    };
  }

  return {
    label: "Архивный сигнал",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.24)",
  };
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const signal = getSignalTone(report.summary.updatedLabel);
  const topAction =
    report.scenarios.find((item) => item.status === "ready")?.title ||
    report.trends.find((item) => item.priority === "high")?.title ||
    report.summary.primaryFocus;

  const aiSummary =
    report.analysis.split("\n").find((line) => line.trim()) ||
    report.trends[0]?.whyItMatters ||
    report.scenarios[0]?.structure ||
    "Сначала смотрите самые приоритетные инсайты и сценарии, готовые к тесту.";

  const metrics = [
    {
      label: "Всего инсайтов",
      value: report.summary.totalInsights,
      note: "по всему отчёту",
      color: "#A78BFA",
      icon: ClipboardList,
    },
    {
      label: "Приоритетных",
      value: report.summary.priorityInsights,
      note: "важно смотреть первым",
      color: "#FBBF24",
      icon: Flame,
    },
    {
      label: "Готовых к тесту",
      value: report.summary.readyToTest,
      note: "можно отдавать в работу",
      color: "#34D399",
      icon: Rocket,
    },
  ];

  return (
    <div className="rounded-[32px] border border-[#273246] bg-[#141B28] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/24 bg-[#38BDF8]/12 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
              <Sparkles className="h-3.5 w-3.5" />
              {report.summary.sourceLabel}
            </span>
            <span className="inline-flex rounded-full border border-[#A78BFA]/24 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
              {report.status}
            </span>
            <span
              className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{
                color: signal.color,
                background: signal.bg,
                borderColor: signal.border,
              }}
            >
              {signal.label}
            </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            ИИ Трендвотчер для {report.title}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#B9C5D9] sm:text-base">
            {aiSummary}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#2A3548] bg-[#10151F] p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
                Сначала смотреть
              </p>
              <div className="flex items-start gap-2">
                <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#38BDF8]" />
                <p className="text-sm leading-6 text-[#E5E7EB]">{report.summary.primaryFocus}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#2A3548] bg-[#10151F] p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
                Что запускать первым
              </p>
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#34D399]" />
                <p className="text-sm leading-6 text-[#E5E7EB]">{topAction}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-[#2A3548] bg-[#10151F] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
              <Calendar className="h-3.5 w-3.5 text-[#34D399]" />
              Обновление
            </div>
            <p className="text-sm text-[#E5E7EB]">{report.summary.updatedLabel}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-[#2A3548] bg-[#10151F] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.015)]"
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{
                      background: `${metric.color}15`,
                      border: `1px solid ${metric.color}25`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: metric.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs font-medium text-[#D1D9E8]">{metric.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#8EA0BE]">{metric.note}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-[#2A3548] bg-[#10151F] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
              <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
              AI summary
            </div>
            <p className="text-sm leading-6 text-[#E5E7EB]">
              Отчёт помогает быстро пройти путь scan → focus → act: сначала увидеть ключевой фокус, затем отфильтровать полезное и быстро передать сильные сценарии в работу.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}