"use client";

import { Calendar, Layers3 } from "lucide-react";
import type { NormalizedReport } from "@/lib/trendwatcher";

interface ReportSwitcherProps {
  reports: NormalizedReport[];
  selectedReportId: string;
  onSelectReport: (reportId: string) => void;
}

export function ReportSwitcher({
  reports,
  selectedReportId,
  onSelectReport,
}: ReportSwitcherProps) {
  if (reports.length <= 1) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Layers3 className="h-4 w-4 text-[#38BDF8]" />
        <h3 className="text-sm font-semibold text-white">Выбор отчёта</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {reports.map((report, index) => {
          const isSelected = report.id === selectedReportId;
          const label =
            index === 0 ? "Текущий отчёт" : index === 1 ? "Предыдущий отчёт" : `Дополнительный #${index + 1}`;

          return (
            <button
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              className="min-w-[240px] rounded-3xl border p-4 text-left transition-all duration-200"
              style={{
                background: isSelected ? "rgba(56,189,248,0.10)" : "#101010",
                borderColor: isSelected ? "rgba(56,189,248,0.30)" : "#2A2A2A",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
                {label}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{report.title}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#B6C0D4]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{report.summary.updatedLabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}