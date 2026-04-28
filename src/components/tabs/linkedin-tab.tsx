"use client";

import { Linkedin, Sparkles } from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

export function LinkedInTab({ data }: { data: ClientData }) {
  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[32px] border border-[#1E1E1E] bg-[#151A24] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </div>

          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            LinkedIn для {data.client.name}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8B93A7] sm:text-base">
            Для этого клиента пока нет реальных данных LinkedIn, поэтому раздел сейчас пуст.
          </p>

          <div className="mt-6 rounded-3xl border border-[#1E1E1E] bg-[#11161E] p-5 sm:p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#A78BFA]">
              <Sparkles className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-semibold text-white sm:text-base">
              Что появится здесь позже
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#8B93A7]">
              Когда подключите реальные публикации, адаптацию контента или автопостинг для LinkedIn,
              этот блок начнёт показывать живые данные вместо демо-контента.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}