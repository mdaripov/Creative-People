"use client";

import { ArrowUpRight, Rocket, Sparkles, Target } from "lucide-react";
import type { NormalizedReport } from "@/lib/trendwatcher";

interface ReportSummaryProps {
  report: NormalizedReport;
}

function cleanLinkTarget(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/https?:\/\/[^\s<]+/);
  return match?.[0] ?? null;
}

function SummaryLinkCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const href = cleanLinkTarget(value);
  const content = (
    <div className="group rounded-3xl border border-[#2A3548] bg-[#10151F] p-4 transition-all duration-200 hover:border-[#3A4660] hover:bg-[#121925]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
        {label}
      </p>
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border"
          style={{
            color,
            background: `${color}14`,
            borderColor: `${color}28`,
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6 text-[#E5E7EB] break-words">{value}</p>
          {href ? (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity group-hover:opacity-80" style={{ color }}>
              Открыть ссылку
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="block">
        {content}
      </a>
    );
  }

  return content;
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const topAction =
    report.scenarios.find((item) => item.status === "ready")?.title ||
    report.trends.find((item) => item.priority === "high")?.title ||
    report.summary.primaryFocus;

  return (
    <div className="rounded-[32px] border border-[#273246] bg-[#141B28] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
      <div className="max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/24 bg-[#38BDF8]/12 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
            <Sparkles className="h-3.5 w-3.5" />
            {report.summary.sourceLabel}
          </span>
          <span className="inline-flex rounded-full border border-[#A78BFA]/24 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
            {report.status}
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
          ИИ Трендвотчер для {report.title}
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SummaryLinkCard
            label="Сначала смотреть"
            value={report.summary.primaryFocus}
            icon={<Target className="h-4 w-4" />}
            color="#38BDF8"
          />

          <SummaryLinkCard
            label="Что запускать первым"
            value={topAction}
            icon={<Rocket className="h-4 w-4" />}
            color="#34D399"
          />
        </div>
      </div>
    </div>
  );
}