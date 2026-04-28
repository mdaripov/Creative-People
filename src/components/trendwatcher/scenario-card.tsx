"use client";

import { CheckCircle2, ClipboardPen, Layers3, Megaphone, Send, WandSparkles } from "lucide-react";
import { toast } from "sonner";
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
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.26)",
    icon: CheckCircle2,
  },
  adapt: {
    label: "Нужна адаптация",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
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
} satisfies Record<
  NormalizedScenarioItem["status"],
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof CheckCircle2;
  }
>;

function isMeaningfulValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return Boolean(normalized) && normalized !== "все платформы" && normalized !== "не указан";
}

function getDraftStorageKey(clientId: string) {
  return `dyad-smm-draft:${clientId}`;
}

function buildScenarioDraft(item: NormalizedScenarioItem) {
  const lines = [
    "Улучши и доработай этот сценарий для публикации.",
    "",
    item.title,
    isMeaningfulValue(item.format) ? `Формат: ${item.format}` : "",
    isMeaningfulValue(item.platform) ? `Платформа: ${item.platform}` : "",
    item.hook ? `Хук: ${item.hook}` : "",
    item.structure ? `Сценарий: ${item.structure}` : "",
    item.cta ? `CTA: ${item.cta}` : "",
    item.expectedEffect ? `Почему сработает: ${item.expectedEffect}` : "",
    item.bullets.length > 0 ? item.bullets.join("\n") : "",
  ];

  return lines.filter((line) => line.trim().length > 0).join("\n");
}

export function ScenarioCard({ item, viewMode, featured = false }: ScenarioCardProps) {
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;
  const showPlatform = isMeaningfulValue(item.platform);
  const showFormat = isMeaningfulValue(item.format);

  const handleSendToSmm = () => {
    if (typeof window === "undefined") return;

    const workspace = document.querySelector("[data-client-workspace='true']");
    const clientId = workspace?.getAttribute("data-client-id");

    if (!clientId) {
      toast.error("Не удалось определить текущего клиента");
      return;
    }

    window.localStorage.setItem(getDraftStorageKey(clientId), buildScenarioDraft(item));
    window.dispatchEvent(
      new CustomEvent("dyad:open-smm-chat", {
        detail: { clientId },
      })
    );
    toast.success("Весь сценарий перенесён в ИИ СММ для доработки");
  };

  return (
    <div
      className="rounded-[24px] border bg-[#141A23] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] sm:p-5"
      style={{ borderColor: featured ? status.border : "#253041" }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {(showPlatform || showFormat) && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {showPlatform ? (
                <span className="rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-semibold text-[#86EFAC]">
                  {item.platform}
                </span>
              ) : null}
              {showFormat ? (
                <span className="rounded-full border border-[#253041] bg-[#101620] px-3 py-1 text-[11px] font-semibold text-[#C5CEE0]">
                  {item.format}
                </span>
              ) : null}
            </div>
          )}
          <h4 className="text-base font-semibold text-white sm:text-lg">{item.title}</h4>
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

      <div className="space-y-3">
        {item.hook ? (
          <div className="rounded-2xl border border-[#212C3B] bg-[#101620] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
              <Megaphone className="h-3.5 w-3.5" />
              Hook
            </div>
            <FormattedRichText text={item.hook} accent="#A78BFA" compact />
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34D399]">
            <Layers3 className="h-3.5 w-3.5" />
            Сценарий
          </div>
          <FormattedRichText text={item.structure} accent="#34D399" compact />
        </div>

        {(item.cta || item.expectedEffect) && (
          <div className="rounded-2xl border border-[#212C3B] bg-[#101620] p-4">
            <div className="space-y-3">
              {item.cta ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#38BDF8]">
                    CTA
                  </p>
                  <FormattedRichText text={item.cta} accent="#38BDF8" compact />
                </div>
              ) : null}

              {item.expectedEffect ? (
                <div className={item.cta ? "border-t border-[#212C3B] pt-3" : ""}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBBF24]">
                    Почему сработает
                  </p>
                  <FormattedRichText text={item.expectedEffect} accent="#FBBF24" compact />
                </div>
              ) : null}
            </div>
          </div>
        )}

        {item.bullets.length > 0 ? (
          <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7F8CA3]">
              Checklist
            </p>
            <div className="space-y-2">
              {item.bullets.map((bullet, index) => (
                <div
                  key={`${item.id}-bullet-${index}`}
                  className="rounded-2xl border border-[#202938] bg-[#121822] px-3 py-3"
                >
                  <FormattedRichText text={bullet} accent="#34D399" compact />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <button
          onClick={handleSendToSmm}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 px-4 py-3 text-sm font-semibold text-[#C4B5FD] transition-all duration-200 hover:bg-[#A78BFA]/20"
        >
          <Send className="h-4 w-4" />
          Отправить весь сценарий в ИИ СММ для доработки
        </button>
      </div>

      {viewMode === "detailed" ? (
        <div className="mt-4 rounded-2xl border border-[#253041] bg-[#0F141C] p-4">
          <FormattedRichText text={item.rawText} accent="#34D399" compact />
        </div>
      ) : null}
    </div>
  );
}