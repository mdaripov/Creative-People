"use client";

import { useState } from "react";
import {
  TrendingUp,
  Lightbulb,
  Video,
  MapPin,
  Scissors,
  Sparkles,
  Loader2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  Instagram: { bg: "rgba(167,139,250,0.1)", text: "#A78BFA", border: "rgba(167,139,250,0.2)" },
  TikTok: { bg: "rgba(251,191,36,0.1)", text: "#FBBF24", border: "rgba(251,191,36,0.2)" },
  LinkedIn: { bg: "rgba(56,189,248,0.1)", text: "#38BDF8", border: "rgba(56,189,248,0.2)" },
};

const relevanceConfig = {
  high: { label: "Высокий", color: "text-[#34D399]", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
  medium: { label: "Средний", color: "text-[#FBBF24]", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
  low: { label: "Низкий", color: "text-[#6B7280]", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" },
};

const accordionSections = [
  {
    id: "ideas",
    icon: Lightbulb,
    color: "#FBBF24",
    title: "Идеи на съёмочный день",
    key: "ideas" as const,
  },
  {
    id: "videographer",
    icon: Video,
    color: "#A78BFA",
    title: "ТЗ для видеографа",
    key: "videographer" as const,
  },
  {
    id: "locations",
    icon: MapPin,
    color: "#38BDF8",
    title: "Рекомендации по локациям",
    key: "locations" as const,
  },
  {
    id: "editor",
    icon: Scissors,
    color: "#34D399",
    title: "ТЗ для монтажёра",
    key: "editor" as const,
  },
];

interface CreativeTabProps {
  data: ClientData;
}

export function CreativeTab({ data }: CreativeTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [packageGenerated, setPackageGenerated] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2200));
    setIsGenerating(false);
    setPackageGenerated(true);
    setOpenSection("ideas");
  };

  const renderSectionContent = (key: string) => {
    const { preproduction } = data;
    switch (key) {
      case "ideas":
        return (
          <ul className="space-y-2">
            {preproduction.ideas.map((idea, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#D1D5DB]">
                <span className="w-5 h-5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[10px] font-bold text-[#FBBF24] flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {idea}
              </li>
            ))}
          </ul>
        );
      case "videographer":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Концепция</p>
              <p className="text-sm text-[#D1D5DB] leading-relaxed">{preproduction.videographerBrief.concept}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Раскадровка</p>
              <ul className="space-y-1.5">
                {preproduction.videographerBrief.storyboard.map((frame, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#D1D5DB]">
                    <span className="text-[#A78BFA] font-mono text-xs mt-0.5">→</span>
                    {frame}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Референсы</p>
              <ul className="space-y-1.5">
                {preproduction.videographerBrief.references.map((ref, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#A78BFA]">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20">
              <span className="text-xs text-[#6B7280]">Длительность:</span>
              <span className="text-xs text-[#A78BFA] font-medium">{preproduction.videographerBrief.duration}</span>
            </div>
          </div>
        );
      case "locations":
        return (
          <ul className="space-y-2">
            {preproduction.locationRecommendations.map((loc, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#D1D5DB]">
                <MapPin className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                {loc}
              </li>
            ))}
          </ul>
        );
      case "editor":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Стиль монтажа</p>
              <p className="text-sm text-[#D1D5DB] leading-relaxed">{preproduction.editorBrief.style}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Переходы</p>
              <div className="flex flex-wrap gap-2">
                {preproduction.editorBrief.transitions.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#34D399]/10 border border-[#34D399]/20 text-xs text-[#34D399]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Музыка</p>
              <p className="text-sm text-[#D1D5DB]">{preproduction.editorBrief.music}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Цветокоррекция</p>
              <p className="text-sm font-mono text-[#34D399] bg-[#34D399]/5 px-3 py-2 rounded-lg border border-[#34D399]/10">
                {preproduction.editorBrief.colorGrading}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Trends section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
          <h3 className="text-sm font-semibold text-white">Актуальные тренды</h3>
          <span className="ml-auto text-xs text-[#6B7280]">{data.trends.length} трендов</span>
        </div>

        {/* Horizontal scroll */}
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
                <div className="flex items-center justify-between mb-3">
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
                <div className="flex items-center justify-between text-[10px] text-[#4B5563]">
                  <span>{trend.source}</span>
                  <span>{trend.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preproduction package */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            <h3 className="text-sm font-semibold text-white">Препродакшен-пакет</h3>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[#A78BFA] text-xs font-medium hover:bg-[#A78BFA]/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {packageGenerated ? "Обновить пакет" : "Сгенерировать пакет"}
              </>
            )}
          </button>
        </div>

        {!packageGenerated && !isGenerating && (
          <div className="rounded-2xl border border-dashed border-[#2A2A2A] p-10 text-center">
            <Sparkles className="w-8 h-8 text-[#2A2A2A] mx-auto mb-3" />
            <p className="text-sm text-[#6B7280]">
              Нажмите «Сгенерировать пакет», чтобы AI создал полный препродакшен-пакет для съёмочного дня
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 p-10 text-center">
            <Loader2 className="w-8 h-8 text-[#A78BFA] mx-auto mb-3 animate-spin" />
            <p className="text-sm text-[#A78BFA]">AI анализирует тренды и генерирует пакет...</p>
            <p className="text-xs text-[#6B7280] mt-1">Это займёт несколько секунд</p>
          </div>
        )}

        {packageGenerated && !isGenerating && (
          <div className="space-y-2 animate-fade-in">
            {accordionSections.map((section) => {
              const Icon = section.icon;
              const isOpen = openSection === section.id;
              return (
                <div
                  key={section.id}
                  className="rounded-2xl border border-[#1E1E1E] bg-[#161616] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${section.color}15`, border: `1px solid ${section.color}25` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: section.color }} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-white">{section.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#1E1E1E] animate-fade-in">
                      {renderSectionContent(section.key)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
