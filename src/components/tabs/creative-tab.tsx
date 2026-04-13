"use client";

import { TrendingUp, ExternalLink } from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  Instagram: { bg: "rgba(167,139,250,0.1)", text: "#A78BFA", border: "rgba(167,139,250,0.2)" },
  TikTok: { bg: "rgba(251,191,36,0.1)", text: "#FBBF24", border: "rgba(251,191,36,0.2)" },
  LinkedIn: { bg: "rgba(56,189,248,0.1)", text: "#38BDF8", border: "rgba(56,189,248,0.2)" },
};

const relevanceConfig = {
  high: { label: "Высокий", color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
  medium: { label: "Средний", color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
  low: { label: "Низкий", color: "#6B7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" },
};

interface CreativeTabProps {
  data: ClientData;
}

export function CreativeTab({ data }: CreativeTabProps) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
          <h3 className="text-sm font-semibold text-white">Актуальные тренды</h3>
          <span className="ml-auto text-xs text-[#6B7280]">{data.trends.length} трендов</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
          {data.trends.map((trend, i) => {
            const platform = platformColors[trend.platform] || platformColors.Instagram;
            const relevance = relevanceConfig[trend.relevance];

            return (
              <div
                key={trend.id}
                className="flex-shrink-0 w-64 rounded-2xl p-4 bg-[#161616] border border-[#1E1E1E] hover:border-[#2A2A2A] transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                    style={{ background: platform.bg, color: platform.text, borderColor: platform.border }}
                  >
                    {trend.platform}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                    style={{ background: relevance.bg, color: relevance.color, borderColor: relevance.border }}
                  >
                    {relevance.label}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-1.5 leading-tight">{trend.title}</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-3">{trend.description}</p>

                <div className="flex items-center justify-between text-[10px] text-[#4B5563] gap-3">
                  <span className="truncate">{trend.source}</span>
                  <span className="whitespace-nowrap">{trend.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#A78BFA] flex-shrink-0">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Legacy creative tab</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#8B93A7]">
              Эта вкладка оставлена для совместимости сборки. Основной сценарий работы перенесён во вкладки
              «ИИ Трендвотчер», «ИИ СММ», «ИИ СММ (утверждено)», «LinkedIn» и «Контроллер».
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
