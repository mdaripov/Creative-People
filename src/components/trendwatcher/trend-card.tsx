"use client";

import { Calendar, Layers3, Lightbulb, Rocket, Signal } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedTrendItem, ViewMode } from "@/lib/trendwatcher";

interface TrendCardProps {
  item: NormalizedTrendItem;
  viewMode: ViewMode;
  featured?: boolean;
}

const priorityConfig = {
  high: {
    label: "Высокий приоритет",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.26)",
    rail: "#FBBF24",
  },
  medium: {
    label: "Средний приоритет",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.24)",
    rail: "#38BDF8",
  },
  low: {
    label: "Низкий приоритет",
    color: "#9CA3AF",
    bg: "rgba(156,163,175,0.10)",
    border: "rgba(156,163,175,0.22)",
    rail: "#6B7280",
  },
};

export function TrendCard({ item, viewMode, featured = false }: TrendCardProps) {
  const priority = priorityConfig[item.priority];

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border bg-[#141A23] p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.16)]"
      style={{
        borderColor: featured ? priority.border : "#253041",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: priority.rail }}
      />

      <div className="pl-1">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
                {item.platform}
              </span>
              <span className="rounded-full border border-[#253041] bg-[#101620] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
                {item.category}
              </span>
            </div>
            <h4 className="text-base font-semibold leading-snug text-white sm:text-lg">
              {item.title}
            </h4>
          </div>

          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold"
            style={{
              color: priority.color,
              background: priority.bg,
              borderColor: priority.border,
            }}
          >
            {priority.label}
          </span>
        </div>

        <div className="mb-4 rounded-2xl border border-[#253041] bg-[#0F141C] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7F8CA3]">
            Что происходит
          </p>
          <p className="text-sm leading-6 text-[#E5E7EB]">
            {item.whyItMatters.split("\n")[0]}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
              <Lightbulb className="h-3.5 w-3.5" />
              Почему важно
            </div>
            <FormattedRichText text={item.whyItMatters} accent="#A78BFA" compact />
          </div>

          <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
              <Rocket className="h-3.5 w-3.5" />
              Что делать
            </div>
            <p className="text-sm leading-6 text-[#E5E7EB]">{item.action}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#212C3B] bg-[#101620] p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7F8CA3]">
              <Calendar className="h-3.5 w-3.5" />
              Свежесть
            </div>
            <p className="text-sm text-[#E5E7EB]">{item.freshness}</p>
          </div>

          <div className="rounded-2xl border border-[#212C3B] bg-[#101620] p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7F8CA3]">
              <Layers3 className="h-3.5 w-3.5" />
              Источник
            </div>
            <p className="break-words text-sm text-[#E5E7EB]">{item.source}</p>
          </div>
        </div>

        {viewMode === "detailed" ? (
          <div className="mt-4 rounded-2xl border border-[#253041] bg-[#0F141C] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7DD3FC]">
              <Signal className="h-3.5 w-3.5" />
              Полный разбор
            </div>
            <FormattedRichText text={item.rawText} accent="#A78BFA" compact />
          </div>
        ) : null}
      </div>
    </div>
  );
}