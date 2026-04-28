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
      className="rounded-[32px] border border-[#263245] bg-[#141B27] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#F472B6]/24 bg-[#F472B6]/10 text-[#F472B6]">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F472B6]/18 bg-[#F472B6]/8 px-3 py-1 text-[11px] font-semibold text-[#F9A8D4]">
              <Sparkles className="h-3.5 w-3.5" />
              Deep Dive / Full Analysis
            </div>

            <h3 className="text-lg font-semibold text-white sm:text-xl">
              Полный аналитический разбор
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#AEB9CC]">
              Сначала — короткий вывод, ниже — полный разбор в едином спокойном стиле без визуального шума.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#2A3548] bg-[#10151F] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F472B6]">
            <Sparkles className="h-3.5 w-3.5" />
            Короткий вывод
          </div>
          <div className="rounded-2xl border border-[#202938] bg-[#121822] p-4">
            <p className="text-sm leading-7 text-[#E8ECF3] sm:text-[15px]">{summary}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#2A3548] bg-[#10151F] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {open ? "Полный анализ открыт" : "Открыть полный анализ"}
              </p>
              <p className="mt-1 text-xs text-[#8EA0BE]">
                {open
                  ? "Весь текст ниже показан как единая аккуратная читательская область."
                  : "Нажмите, чтобы развернуть полный аналитический текст."}
              </p>
            </div>

            <button
              onClick={() => setOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-[#314056] bg-[#141B27] px-4 py-2 text-xs font-semibold text-[#D7DEEA] transition-colors hover:bg-[#182131]"
            >
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {open ? "Скрыть" : "Развернуть"}
            </button>
          </div>
        </div>

        {open ? (
          <div className="rounded-[28px] border border-[#2A3548] bg-[#10151F] p-3 sm:p-4">
            <div className="rounded-[24px] border border-[#202938] bg-[#121822] p-5 sm:p-6">
              <div className="mx-auto max-w-4xl">
                <FormattedRichText text={analysis} accent="#F472B6" compact />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}