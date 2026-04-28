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

function ChipButton({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
      style={{
        color: active ? color : "#C5CEE0",
        background: active ? `${color}18` : "#111722",
        borderColor: active ? `${color}40` : "#2A3548",
      }}
    >
      {label}
    </button>
  );
}

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
    <div className="sticky top-0 z-20 -mx-4 border-b border-[#253042]/70 bg-[#0F141C]/88 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="rounded-[24px] border border-[#263245] bg-[#151C27]/95 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#A78BFA]" />
                <h3 className="text-sm font-semibold text-white">Управление просмотром</h3>
              </div>
              <p className="mt-1 text-[11px] text-[#8EA0BE]">
                Быстрые фильтры для чтения отчёта без перегруза.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[#2A3548] bg-[#10151F] p-1">
              <button
                onClick={() => onViewModeChange("overview")}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
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
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
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

          <div className="grid gap-3 xl:grid-cols-[1.1fr_1.1fr_0.9fr_auto]">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
                <Rows3 className="h-3.5 w-3.5 text-[#38BDF8]" />
                Тип
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {types.map((type) => (
                  <ChipButton
                    key={type.value}
                    active={type.value === selectedType}
                    label={type.label}
                    color="#38BDF8"
                    onClick={() => onTypeChange(type.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
                <ListFilter className="h-3.5 w-3.5 text-[#A78BFA]" />
                Платформа
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {platforms.map((platform) => (
                  <ChipButton
                    key={platform}
                    active={platform === selectedPlatform}
                    label={platform}
                    color="#A78BFA"
                    onClick={() => onPlatformChange(platform)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
                <ListFilter className="h-3.5 w-3.5 text-[#34D399]" />
                Приоритет
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {priorities.map((priority) => (
                  <ChipButton
                    key={priority.value}
                    active={priority.value === selectedPriority}
                    label={priority.label}
                    color="#34D399"
                    onClick={() => onPriorityChange(priority.value)}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2A3548] bg-[#10151F] px-4 py-2 text-xs font-semibold text-[#D1D9E8] transition-colors hover:bg-[#131B27]"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#FBBF24]" />
                  Сбросить
                </button>
              ) : (
                <div className="h-9" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}