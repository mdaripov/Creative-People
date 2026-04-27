"use client";

import { Calendar, Layers3, Lightbulb, Rocket, Signal } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedTrendItem, ViewMode } from "@/lib/trendwatcher";

interface TrendCardProps {
  item: NormalizedTrendItem;
  viewMode: ViewMode;
}

const priorityConfig = {
  high: {
    label: "Высокий приоритет",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.24)",
  },
  medium: {
    label: "Средний приоритет",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.24)",
  },
  low: {
    label: "Низкий приоритет",
    color: "#9CA3AF",
    bg: "rgba(156,163,175,0.10)",
    border: "rgba(156,163,175,0.24)",
  },
};

export function TrendCard({ item, viewMode }: TrendCardProps) {
  const priority = priorityConfig[item.priority];

  return (
    <div className="rounded-3xl border border-[#2A2A2A] bg-[#121212] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.015)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#A78BFA]/24 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-semibold text-[#C4B5FD]">
              {item.platform}
            </span>
            <span className="rounded-full border border-[#2A2A2A] bg-[#171717] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
              {item.category}
            </span>
          </div>
          <h4 className="text-base font-semibold leading-snug text-white">{item.title}</h4>
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

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#222222] bg-[#171717] p-3">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8EA0BE]">
            <Calendar className="h-3.5 w-3.5" />
            Свежесть
          </div>
          <p className="text-sm text-[#E5E7EB]">{item.freshness}</p>
        </div>

        <div className="rounded-2xl border border-[#222222] bg-[#171717] p-3">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8EA0BE]">
            <Layers3 className="h-3.5 w-3.5" />
            Источник
          </div>
          <p className="text-sm text-[#E5E7EB] break-words">{item.source}</p>
        </div>

        <div className="rounded-2xl border border-[#222222] bg-[#171717] p-3">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8EA0BE]">
            <Rocket className="h-3.5 w-3.5" />
            Действие
          </div>
          <p className="text-sm text-[#E5E7EB]">{item.action}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
          <Lightbulb className="h-3.5 w-3.5" />
          Почему это важно
        </div>
        <p className="text-sm leading-7 text-[#E5E7EB]">{item.whyItMatters}</p>
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#242424] bg-[#161616] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7DD3FC]">
            <Signal className="h-3.5 w-3.5" />
            Полный разбор
          </div>
          <FormattedRichText text={item.rawText} accent="#A78BFA" compact />
        </div>
      ) : null}
    </div>
  );
}