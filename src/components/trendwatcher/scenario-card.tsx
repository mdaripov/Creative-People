"use client";

import { CheckCircle2, ClipboardPen, Layers3, Megaphone, Rocket, WandSparkles } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedScenarioItem, ViewMode } from "@/lib/trendwatcher";

interface ScenarioCardProps {
  item: NormalizedScenarioItem;
  viewMode: ViewMode;
  featured?: boolean;
}

const statusConfig = {
  ready: {
    label: "Готов к тесту",
    color: "#34D399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.26)",
    icon: CheckCircle2,
  },
  adapt: {
    label: "Нужна адаптация",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.26)",
    icon: WandSparkles,
  },
  raw: {
    label: "Сырой инсайт",
    color: "#9CA3AF",
    bg: "rgba(156,163,175,0.10)",
    border: "rgba(156,163,175,0.22)",
    icon: ClipboardPen,
  },
};

export function ScenarioCard({ item, viewMode, featured = false }: ScenarioCardProps) {
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="rounded-[26px] border bg-[#131A25] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.015)]"
      style={{
        borderColor: featured ? status.border : "#263245",
      }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#34D399]/22 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
              {item.platform}
            </span>
            <span className="rounded-full border border-[#2A3548] bg-[#171E2A] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
              {item.format}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-white">{item.title}</h4>
        </div>

        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
          style={{
            color: status.color,
            background: status.bg,
            borderColor: status.border,
          }}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      {item.hook ? (
        <div className="mb-3 rounded-2xl bg-[#10151F] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
            <Megaphone className="h-3.5 w-3.5" />
            Hook
          </div>
          <FormattedRichText text={item.hook} accent="#A78BFA" compact />
        </div>
      ) : null}

      <div className="grid gap-3">
        <div className="rounded-2xl bg-[#171E2A] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
            <Layers3 className="h-3.5 w-3.5" />
            Структура
          </div>
          <FormattedRichText text={item.structure} accent="#34D399" compact />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#10151F] p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              CTA
            </p>
            <FormattedRichText
              text={item.cta || "Добавить явный следующий шаг"}
              accent="#38BDF8"
              compact
            />
          </div>

          <div className="rounded-2xl bg-[#10151F] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              <Rocket className="h-3.5 w-3.5 text-[#FBBF24]" />
              Эффект
            </div>
            <FormattedRichText
              text={item.expectedEffect || "Оценить после первого теста"}
              accent="#FBBF24"
              compact
            />
          </div>
        </div>

        {item.bullets.length > 0 ? (
          <div className="rounded-2xl bg-[#171E2A] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              Checklist
            </p>
            <div className="space-y-2">
              {item.bullets.map((bullet, index) => (
                <div
                  key={`${item.id}-bullet-${index}`}
                  className="rounded-2xl bg-[#121822] px-3 py-3"
                >
                  <FormattedRichText text={bullet} accent="#34D399" compact />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#263245] bg-[#10151F] p-4">
          <FormattedRichText text={item.rawText} accent="#34D399" compact />
        </div>
      ) : null}
    </div>
  );
}