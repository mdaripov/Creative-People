"use client";

import { CheckCircle2, ClipboardPen, Layers3, Megaphone, WandSparkles } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import type { NormalizedScenarioItem, ViewMode } from "@/lib/trendwatcher";

interface ScenarioCardProps {
  item: NormalizedScenarioItem;
  viewMode: ViewMode;
}

const statusConfig = {
  ready: {
    label: "Готов к тесту",
    color: "#34D399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.24)",
    icon: CheckCircle2,
  },
  adapt: {
    label: "Нужна адаптация",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.24)",
    icon: WandSparkles,
  },
  raw: {
    label: "Сырой инсайт",
    color: "#9CA3AF",
    bg: "rgba(156,163,175,0.10)",
    border: "rgba(156,163,175,0.24)",
    icon: ClipboardPen,
  },
};

export function ScenarioCard({ item, viewMode }: ScenarioCardProps) {
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;

  return (
    <div className="rounded-3xl border border-[#2A2A2A] bg-[#121212] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.015)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#34D399]/24 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
              {item.platform}
            </span>
            <span className="rounded-full border border-[#2A2A2A] bg-[#171717] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
              {item.format}
            </span>
          </div>
          <h4 className="text-base font-semibold text-white">{item.title}</h4>
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

      <div className="grid gap-3">
        {item.hook ? (
          <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
              <Megaphone className="h-3.5 w-3.5" />
              Hook
            </div>
            <p className="text-sm leading-7 text-[#E5E7EB]">{item.hook}</p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
            <Layers3 className="h-3.5 w-3.5" />
            Структура
          </div>
          <p className="text-sm leading-7 text-[#E5E7EB]">{item.structure}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              CTA
            </p>
            <p className="text-sm leading-7 text-[#E5E7EB]">{item.cta || "Добавить явный следующий шаг"}</p>
          </div>

          <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              Ожидаемый эффект
            </p>
            <p className="text-sm leading-7 text-[#E5E7EB]">
              {item.expectedEffect || "Оценить после первого теста"}
            </p>
          </div>
        </div>

        {item.bullets.length > 0 ? (
          <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              Шаги и детали
            </p>
            <div className="space-y-2">
              {item.bullets.map((bullet, index) => (
                <div key={`${item.id}-bullet-${index}`} className="rounded-2xl border border-[#202020] bg-[#121212] px-3 py-3">
                  <FormattedRichText text={bullet} accent="#34D399" compact />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#242424] bg-[#161616] p-4">
          <FormattedRichText text={item.rawText} accent="#34D399" compact />
        </div>
      ) : null}
    </div>
  );
}