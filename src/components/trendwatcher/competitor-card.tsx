"use client";

import { Compass, CopyMinus, Lightbulb, Telescope } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedCompetitorItem, ViewMode } from "@/lib/trendwatcher";

interface CompetitorCardProps {
  item: NormalizedCompetitorItem;
  viewMode: ViewMode;
}

export function CompetitorCard({ item, viewMode }: CompetitorCardProps) {
  return (
    <div className="rounded-3xl border border-[#2A2A2A] bg-[#121212] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.015)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#38BDF8]/24 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
              {item.platform}
            </span>
            <span className="rounded-full border border-[#2A2A2A] bg-[#171717] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
              benchmark
            </span>
          </div>
          <h4 className="text-base font-semibold text-white">{item.name}</h4>
          <p className="mt-1 text-sm text-[#8EA0BE] break-words">{item.source}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#38BDF8]">
            <Telescope className="h-3.5 w-3.5" />
            Наблюдение
          </div>
          <p className="text-sm leading-7 text-[#E5E7EB]">{item.observation}</p>
        </div>

        <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
            <Lightbulb className="h-3.5 w-3.5" />
            Что сработало
          </div>
          <p className="text-sm leading-7 text-[#E5E7EB]">{item.insight}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
              <Compass className="h-3.5 w-3.5" />
              Что адаптировать
            </div>
            <p className="text-sm leading-7 text-[#E5E7EB]">{item.recommendation}</p>
          </div>

          <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBBF24]">
              <CopyMinus className="h-3.5 w-3.5" />
              Риск копирования
            </div>
            <p className="text-sm leading-7 text-[#E5E7EB]">{item.differentiation}</p>
          </div>
        </div>
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#242424] bg-[#161616] p-4">
          <FormattedRichText text={item.rawText} accent="#38BDF8" compact />
        </div>
      ) : null}
    </div>
  );
}