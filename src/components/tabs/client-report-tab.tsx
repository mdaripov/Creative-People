"use client";

import { FileText } from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

export function ClientReportTab({ data }: { data: ClientData }) {
  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#151515] p-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl border border-[#F472B6]/20 bg-[#F472B6]/10 text-[#F472B6]">
            <FileText className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Отчёт для {data.client.name}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-[#C9D1E1] sm:text-base">
            Отчёт появится в заданный срок.
          </p>
        </section>
      </div>
    </div>
  );
}