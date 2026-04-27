"use client";

import { Eye, ListFilter, PanelTop } from "lucide-react";
import type { TrendPriority, ViewMode } from "@/lib/trendwatcher";

interface FilterBarProps {
  platforms: string[];
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  selectedPriority: "all" | TrendPriority;
  onPriorityChange: (priority: "all" | TrendPriority) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const priorities: Array<{ value: "all" | TrendPriority; label: string }> = [
  { value: "all", label: "Все приоритеты" },
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
];

export function FilterBar({
  platforms,
  selectedPlatform,
  onPlatformChange,
  selectedPriority,
  onPriorityChange,
  viewMode,
  onViewModeChange,
}: FilterBarProps) {
  return (
    <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-[#A78BFA]" />
            <h3 className="text-sm font-semibold text-white">Фильтры просмотра</h3>
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
                    color: isSelected ? "#38BDF8" : "#C5CEE0",
                    background: isSelected ? "rgba(56,189,248,0.10)" : "#111111",
                    borderColor: isSelected ? "rgba(56,189,248,0.28)" : "#2A2A2A",
                  }}
                >
                  {platform}
                </button>
              );
            })}
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
                    background: isSelected ? "rgba(52,211,153,0.10)" : "#111111",
                    borderColor: isSelected ? "rgba(52,211,153,0.28)" : "#2A2A2A",
                  }}
                >
                  {priority.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-[#2A2A2A] bg-[#101010] p-1">
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
    </div>
  );
}