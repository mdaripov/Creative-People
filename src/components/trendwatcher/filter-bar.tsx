"use client";

import { Eye, ListFilter, PanelTop, RotateCcw, Rows3, SlidersHorizontal } from "lucide-react";
import type { TrendPriority, ViewMode } from "@/lib/trendwatcher";

interface FilterBarProps {
  platforms: string[];
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  selectedPriority: "all" | TrendPriority;
  onPriorityChange: (priority: "all" | TrendPriority) => void;
  selectedType: "all" | "trends" | "competitors" | "scenarios";
  onTypeChange: (type: "all" | "trends" | "competitors" | "scenarios") => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}

const priorities: Array<{ value: "all" | TrendPriority; label: string }> = [
  { value: "all", label: "Все приоритеты" },
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
];

const types: Array<{
  value: "all" | "trends" | "competitors" | "scenarios";
  label: string;
}> = [
  { value: "all", label: "Все" },
  { value: "trends", label: "Тренды" },
  { value: "competitors", label: "Конкуренты" },
  { value: "scenarios", label: "Сценарии" },
];

export function FilterBar({
  platforms,
  selectedPlatform,
  onPlatformChange,
  selectedPriority,
  onPriorityChange,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onReset,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-y border-[#253042]/80 bg-[#0F141C]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="rounded-[28px] border border-[#2A3548] bg-[#171E2A]/95 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold text-white">Управление просмотром</h3>
            </div>
            <p className="mt-1 text-xs text-[#8EA0BE]">
              Отфильтруйте ленту и быстро переключайтесь между обзором и деталями.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-[#2A3548] bg-[#10151F] p-1">
            <button
              onClick={() => onViewModeChange("overview")}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all"
              style={{
                color: viewMode === "overview" ? "#A78BFA" : "#C5CEE0",
                background: viewMode === "overview" ? "rgba(167,139,250,0.10)" : "transparent",
              }}
            >
              <PanelTop className="h-3.5 w-3.5" />
              Обзор
            </button>
            <button
              onClick={() => onViewModeChange("detailed")}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all"
              style={{
                color: viewMode === "detailed" ? "#38BDF8" : "#C5CEE0",
                background: viewMode === "detailed" ? "rgba(56,189,248,0.10)" : "transparent",
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Детали
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              <Rows3 className="h-3.5 w-3.5 text-[#38BDF8]" />
              Тип материалов
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {types.map((type) => {
                const isSelected = type.value === selectedType;

                return (
                  <button
                    key={type.value}
                    onClick={() => onTypeChange(type.value)}
                    className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      color: isSelected ? "#38BDF8" : "#C5CEE0",
                      background: isSelected ? "rgba(56,189,248,0.10)" : "#111722",
                      borderColor: isSelected ? "rgba(56,189,248,0.28)" : "#2A3548",
                    }}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
              <ListFilter className="h-3.5 w-3.5 text-[#A78BFA]" />
              Платформы
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {platforms.map((platform) => {
                const isSelected = platform === selectedPlatform;

                return (
                  <button
                    key={platform}
                    onClick={() => onPlatformChange(platform)}
                    className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      color: isSelected ? "#A78BFA" : "#C5CEE0",
                      background: isSelected ? "rgba(167,139,250,0.10)" : "#111722",
                      borderColor: isSelected ? "rgba(167,139,250,0.28)" : "#2A3548",
                    }}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
                <ListFilter className="h-3.5 w-3.5 text-[#34D399]" />
                Приоритет
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {priorities.map((priority) => {
                  const isSelected = priority.value === selectedPriority;

                  return (
                    <button
                      key={priority.value}
                      onClick={() => onPriorityChange(priority.value)}
                      className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                      style={{
                        color: isSelected ? "#34D399" : "#C5CEE0",
                        background: isSelected ? "rgba(52,211,153,0.10)" : "#111722",
                        borderColor: isSelected ? "rgba(52,211,153,0.28)" : "#2A3548",
                      }}
                    >
                      {priority.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasActiveFilters ? (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 rounded-full border border-[#2A3548] bg-[#10151F] px-4 py-2 text-xs font-semibold text-[#D1D9E8] transition-colors hover:bg-[#131B27]"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#FBBF24]" />
                Сбросить фильтры
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}