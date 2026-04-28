"use client";

import { Compass, CopyMinus, ExternalLink, Lightbulb, Telescope } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedCompetitorItem, ViewMode } from "@/lib/trendwatcher";

interface CompetitorCardProps {
  item: NormalizedCompetitorItem;
  viewMode: ViewMode;
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

export function CompetitorCard({ item, viewMode }: CompetitorCardProps) {
  const sourceIsUrl = isUrl(item.source);

  return (
    <div className="rounded-[26px] border border-[#263245] bg-[#131A25] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.015)]">
      <div className="mb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#38BDF8]/22 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
            {item.platform}
          </span>
          <span className="rounded-full border border-[#2A3548] bg-[#171E2A] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
            benchmark
          </span>
        </div>

        <h4 className="text-lg font-semibold text-white">{item.name}</h4>

        {sourceIsUrl ? (
          <div className="mt-2">
            <a
              href={item.source}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 break-all text-sm text-[#7DD3FC] underline decoration-1 underline-offset-4 hover:opacity-80"
            >
              <span>{item.source}</span>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            </a>
          </div>
        ) : (
          <p className="mt-2 break-words text-sm text-[#8EA0BE]">{item.source}</p>
        )}
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl bg-[#10151F] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#38BDF8]">
            <Telescope className="h-3.5 w-3.5" />
            Наблюдение
          </div>
          <FormattedRichText text={item.observation} accent="#38BDF8" compact />
        </div>

        <div className="rounded-2xl bg-[#171E2A] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
            <Lightbulb className="h-3.5 w-3.5" />
            Что сработало
          </div>
          <FormattedRichText text={item.insight} accent="#A78BFA" compact />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#171E2A] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
              <Compass className="h-3.5 w-3.5" />
              Что адаптировать
            </div>
            <FormattedRichText text={item.recommendation} accent="#34D399" compact />
          </div>

          <div className="rounded-2xl bg-[#171E2A] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBBF24]">
              <CopyMinus className="h-3.5 w-3.5" />
              Чем отличаться
            </div>
            <FormattedRichText text={item.differentiation} accent="#FBBF24" compact />
          </div>
        </div>
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#263245] bg-[#10151F] p-4">
          <FormattedRichText text={item.rawText} accent="#38BDF8" compact />
        </div>
      ) : null}
    </div>
  );
}