"use client";

import {
  Eye,
  ListFilter,
  PanelTop,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
} from "lucide-react";
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
  { value: "all", label: "Все" },
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
      className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200"
      style={{
        color: active ? "#FFFFFF" : "#B8C2D6",
        background: active ? color : "#121821",
        borderColor: active ? color : "#263245",
        boxShadow: active ? `0 0 0 1px ${color}` : "none",
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
    <div className="rounded-[20px] border border-[#202A39] bg-[#111722] px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:px-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold text-white">Управление просмотром</h3>
            </div>
          </div>

          <div className="inline-flex w-full rounded-full border border-[#263245] bg-[#0F141C] p-1 xl:w-auto">
            <button
              onClick={() => onViewModeChange("overview")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all xl:flex-none"
              style={{
                color: viewMode === "overview" ? "#FFFFFF" : "#B8C2D6",
                background: viewMode === "overview" ? "#A78BFA" : "transparent",
              }}
            >
              <PanelTop className="h-3.5 w-3.5" />
              Обзор
            </button>
            <button
              onClick={() => onViewModeChange("detailed")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all xl:flex-none"
              style={{
                color: viewMode === "detailed" ? "#FFFFFF" : "#B8C2D6",
                background: viewMode === "detailed" ? "#38BDF8" : "transparent",
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Детально
            </button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F8CA3]">
              <Rows3 className="h-3.5 w-3.5 text-[#38BDF8]" />
              Тип
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {types.map((type) => (
                <ChipButton
                  key={type.value}
                  active={type.value === selectedType}
                  label={type.label}
                  color="#1E40AF"
                  onClick={() => onTypeChange(type.value)}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F8CA3]">
              <ListFilter className="h-3.5 w-3.5 text-[#A78BFA]" />
              Платформа
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {platforms.map((platform) => (
                <ChipButton
                  key={platform}
                  active={platform === selectedPlatform}
                  label={platform}
                  color="#6D28D9"
                  onClick={() => onPlatformChange(platform)}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F8CA3]">
              <ListFilter className="h-3.5 w-3.5 text-[#34D399]" />
              Приоритет
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {priorities.map((priority) => (
                <ChipButton
                  key={priority.value}
                  active={priority.value === selectedPriority}
                  label={priority.label}
                  color="#047857"
                  onClick={() => onPriorityChange(priority.value)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                onClick={onReset}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#263245] bg-[#0F141C] px-4 text-xs font-semibold text-[#D1D9E8] transition-colors hover:bg-[#151C28]"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#FBBF24]" />
                Сбросить
              </button>
            ) : (
              <div className="h-10" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}