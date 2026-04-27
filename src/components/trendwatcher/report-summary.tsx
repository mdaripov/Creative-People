"use client";

import { Calendar, ClipboardList, Flame, Sparkles, Target } from "lucide-react";
import type { NormalizedReport } from "@/lib/trendwatcher";

interface ReportSummaryProps {
  report: NormalizedReport;
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const metrics = [
    {
      label: "Всего инсайтов",
      value: report.summary.totalInsights,
      note: "по всем секциям",
      color: "#A78BFA",
      icon: ClipboardList,
    },
    {
      label: "Приоритетных",
      value: report.summary.priorityInsights,
      note: "нужно смотреть первым",
      color: "#38BDF8",
      icon: Flame,
    },
    {
      label: "Готовых к тесту",
      value: report.summary.readyToTest,
      note: "сценарии для команды",
      color: "#34D399",
      icon: Sparkles,
    },
  ];

  return (
    <div className="rounded-[32px] border border-[#2A2A2A] bg-[#151A24] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/24 bg-[#38BDF8]/12 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
              <ClipboardList className="h-3.5 w-3.5" />
              {report.summary.sourceLabel}
            </span>
            <span className="inline-flex rounded-full border border-[#A78BFA]/24 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
              {report.status}
            </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Инсайты для {report.title}
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#2A2A2A] bg-[#101010] p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
                Сначала смотреть
              </p>
              <div className="flex items-start gap-2">
                <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#38BDF8]" />
                <p className="text-sm leading-6 text-[#E5E7EB]">{report.summary.primaryFocus}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#2A2A2A] bg-[#101010] p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
                Обновление
              </p>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#34D399]" />
                <p className="text-sm leading-6 text-[#E5E7EB]">{report.summary.updatedLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[440px]">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="rounded-3xl border border-[#2A2A2A] bg-[#101010] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.015)]"
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
      </div>
    </div>
  );
}