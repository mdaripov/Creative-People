"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Sparkles } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";

interface AnalysisPanelProps {
  analysis: string;
  summary: string;
}

export function AnalysisPanel({ analysis, summary }: AnalysisPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <section
      id="analysis"
      className="rounded-[28px] border border-[#2A3548] bg-[#171E2A] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F472B6]/24 bg-[#F472B6]/10 text-[#F472B6]">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">Deep Dive / Full Analysis</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">
            Полный аналитический слой спрятан ниже, чтобы сначала вести к решениям и действиям.
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[#2A3548] bg-[#10151F] p-4">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F472B6]">
          <Sparkles className="h-3.5 w-3.5" />
          Короткий AI summary
        </div>
        <p className="text-sm leading-6 text-[#E5E7EB]">{summary}</p>
      </div>

      <button
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-[#2A3548] bg-[#10151F] px-4 py-2 text-xs font-semibold text-[#D1D9E8] transition-colors hover:bg-[#131B27]"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? "Скрыть полный анализ" : "Читать полный анализ"}
      </button>

      {open ? (
        <div className="mt-4 rounded-3xl border border-[#2A3548] bg-[#10151F] p-4 sm:p-5">
          <FormattedRichText text={analysis} accent="#F472B6" />
        </div>
      ) : null}
    </section>
  );
}