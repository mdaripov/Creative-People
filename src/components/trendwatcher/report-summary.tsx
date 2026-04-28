"use client";

import { ArrowUpRight, Link2, Rocket, Sparkles, Target } from "lucide-react";
import type { NormalizedReport } from "@/lib/trendwatcher";

interface ReportSummaryProps {
  report: NormalizedReport;
}

function extractLinks(value: string) {
  return value.match(/https?:\/\/[^\s<]+/g) ?? [];
}

function renderLinkedText(value: string, color: string) {
  const links = extractLinks(value);

  if (links.length === 0) {
    return <p className="text-sm leading-6 text-[#E5E7EB]">{value}</p>;
  }

  const firstLink = links[0];
  const label = value.replace(firstLink, "").trim() || firstLink;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-[#E5E7EB]">{label}</p>
      <a
        href={firstLink}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:opacity-85"
        style={{
          color,
          background: `${color}12`,
          borderColor: `${color}28`,
        }}
      >
        <Link2 className="h-3.5 w-3.5" />
        <span className="max-w-[280px] truncate">{firstLink}</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
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
  return (
    <div className="rounded-[28px] border border-[#2A3548] bg-[#10151F] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border"
          style={{
            color,
            background: `${color}14`,
            borderColor: `${color}28`,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
              {label}
            </p>
          </div>

          <div className="rounded-2xl border border-[#202938] bg-[#121822] p-4">
            {renderLinkedText(value, color)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const topAction =
    report.scenarios.find((item) => item.status === "ready")?.title ||
    report.trends.find((item) => item.priority === "high")?.title ||
    report.summary.primaryFocus;

  return (
    <div className="rounded-[32px] border border-[#273246] bg-[#141B28] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
      <div className="max-w-5xl">
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