"use client";

import { Clock3, Database, FileText, Sparkles } from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

export function ClientReportTab({ data }: { data: ClientData }) {
  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#151515] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F472B6]/20 bg-[#F472B6]/10 px-4 py-1.5 text-[11px] font-medium text-[#F9A8D4]">
            <FileText className="h-3.5 w-3.5" />
            Отчёт клиенту
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#222222] bg-[#121212] p-5 sm:col-span-2">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Отчёты для {data.client.name} появятся в заявленный срок
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8B93A7] sm:text-base">
                Пока в базе данных нет информации для клиентского отчёта, поэтому здесь показывается
                временный экран. Как только данные появятся, эта заглушка автоматически исчезнет.
              </p>
            </div>

            <div className="rounded-3xl border border-[#F472B6]/20 bg-[#F472B6]/10 p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F472B6]/20 bg-[#F472B6]/10 text-[#F472B6]">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-white">Экран ожидает данные</p>
              <p className="mt-2 text-sm leading-relaxed text-[#C9D1E1]">
                Как только база будет заполнена, здесь откроется реальный отчёт для клиента.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#222222] bg-[#121212] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Источник данных</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8B93A7]">
                Этот раздел будет заполняться только реальной информацией из базы данных без демо-контента.
              </p>
            </div>

            <div className="rounded-3xl border border-[#222222] bg-[#121212] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
                <Clock3 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Когда появится отчёт</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8B93A7]">
                Отчёт появится здесь в заявленный срок, когда нужные данные будут доступны в базе.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}