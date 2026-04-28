"use client";

import {
  Compass,
  CopyMinus,
  ExternalLink,
  Globe,
  Instagram,
  Lightbulb,
  Telescope,
} from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedCompetitorItem, ViewMode } from "@/lib/trendwatcher";

interface CompetitorCardProps {
  item: NormalizedCompetitorItem;
  viewMode: ViewMode;
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function detectLinkLabel(url: string) {
  const value = url.toLowerCase();

  if (value.includes("instagram.com")) return "Instagram";
  if (value.includes("tiktok.com")) return "TikTok";
  if (value.includes("linkedin.com")) return "LinkedIn";
  return "Website";
}

function detectLinkIcon(url: string) {
  const value = url.toLowerCase();

  if (value.includes("instagram.com")) return Instagram;
  return Globe;
}

export function CompetitorCard({ item, viewMode }: CompetitorCardProps) {
  const sourceIsUrl = isUrl(item.source);
  const LinkIcon = sourceIsUrl ? detectLinkIcon(item.source) : Globe;
  const linkLabel = sourceIsUrl ? detectLinkLabel(item.source) : item.source;

  return (
    <div className="rounded-[26px] border border-[#253041] bg-[#141A23] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
              {item.platform}
            </span>
            <span className="rounded-full border border-[#253041] bg-[#101620] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
              benchmark
            </span>
          </div>

          <h4 className="text-base font-semibold leading-snug text-white sm:text-lg">
            {item.name}
          </h4>
        </div>

        {sourceIsUrl ? (
          <a
            href={item.source}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/25 bg-[#38BDF8]/10 px-3 py-2 text-xs font-semibold text-[#7DD3FC] transition-colors hover:bg-[#38BDF8]/15"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>{linkLabel}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#253041] bg-[#101620] px-3 py-2 text-xs font-semibold text-[#C5CEE0]">
            <Globe className="h-3.5 w-3.5" />
            {linkLabel}
          </span>
        )}
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-[#212C3B] bg-[#101620] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#38BDF8]">
            <Telescope className="h-3.5 w-3.5" />
            Наблюдение
          </div>
          <FormattedRichText text={item.observation} accent="#38BDF8" compact />
        </div>

        <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
            <Lightbulb className="h-3.5 w-3.5" />
            Почему это работает
          </div>
          <FormattedRichText text={item.insight} accent="#A78BFA" compact />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
              <Compass className="h-3.5 w-3.5" />
              Что можно взять
            </div>
            <FormattedRichText text={item.recommendation} accent="#34D399" compact />
          </div>

          <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBBF24]">
              <CopyMinus className="h-3.5 w-3.5" />
              Как отличаться
            </div>
            <FormattedRichText text={item.differentiation} accent="#FBBF24" compact />
          </div>
        </div>
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#253041] bg-[#0F141C] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
            Полный исходный текст
          </div>
          <FormattedRichText text={item.rawText} accent="#38BDF8" compact />
        </div>
      ) : null}
    </div>
  );
}