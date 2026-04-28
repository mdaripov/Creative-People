"use client";

import { RotateCcw, SearchX } from "lucide-react";

interface EmptyFilterStateProps {
  title: string;
  description: string;
  onReset: () => void;
}

export function EmptyFilterState({
  title,
  description,
  onReset,
}: EmptyFilterStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#2A3548] bg-[#111722] p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#38BDF8]/24 bg-[#38BDF8]/10 text-[#38BDF8]">
        <SearchX className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#B6C0D4]">
        {description}
      </p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#2A3548] bg-[#10151F] px-4 py-2 text-xs font-semibold text-[#D1D9E8] transition-colors hover:bg-[#131B27]"
      >
        <RotateCcw className="h-3.5 w-3.5 text-[#FBBF24]" />
        Сбросить фильтры
      </button>
    </div>
  );
}