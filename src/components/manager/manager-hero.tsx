"use client";

import { Activity, Briefcase, Sparkles, Users } from "lucide-react";
import type { ManagerHeroSummary } from "@/lib/manager-dashboard";

interface ManagerHeroProps {
  hero: ManagerHeroSummary;
}

function toneStyles(tone: "green" | "yellow" | "red" | "neutral") {
  if (tone === "green") {
    return {
      color: "#34D399",
      bg: "rgba(52,211,153,0.10)",
      border: "rgba(52,211,153,0.24)",
    };
  }

  if (tone === "yellow") {
    return {
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.24)",
    };
  }

  if (tone === "red") {
    return {
      color: "#F87171",
      bg: "rgba(248,113,113,0.10)",
      border: "rgba(248,113,113,0.24)",
    };
  }

  return {
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.24)",
  };
}

const iconMap = {
  clients: Briefcase,
  specialists: Users,
  "risk-zones": Activity,
};

export function ManagerHero({ hero }: ManagerHeroProps) {
  const highlightStyles = toneStyles(hero.highlight.tone);

  return (
    <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141821] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-4 py-1.5 text-[11px] font-semibold text-[#7DD3FC]">
            <Sparkles className="h-3.5 w-3.5" />
            Executive overview
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {hero.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#9FB0CC] sm:text-base">
            {hero.subtitle}
          </p>

          <div className="mt-5 inline-flex rounded-full border border-[#2A3342] bg-[#10141C] px-4 py-2 text-sm text-[#D7E0EF]">
            {hero.snapshotLabel}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {hero.summaryLine.map((item) => {
              const Icon = iconMap[item.id as keyof typeof iconMap] ?? Activity;
              const styles = toneStyles(item.tone);

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#243042] bg-[#10151D] p-4"
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border"
                    style={{
                      color: styles.color,
                      background: styles.bg,
                      borderColor: styles.border,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-[#9FB0CC]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-[28px] border p-5"
          style={{
            background: "#10141C",
            borderColor: highlightStyles.border,
          }}
        >
          <div
            className="mb-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
            style={{
              color: highlightStyles.color,
              background: highlightStyles.bg,
              borderColor: highlightStyles.border,
            }}
          >
            {hero.highlight.label}
          </div>

          <p className="text-2xl font-semibold leading-tight text-white">
            {hero.highlight.value}
          </p>

          <div className="mt-5 rounded-3xl border border-[#253042] bg-[#151B26] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA0BE]">
              Что важно сейчас
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#D7E0EF]">
              Сначала смотрите блоки внимания и рисковые карточки ниже — они ведут прямо в нужные детали по клиенту или специалисту.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}