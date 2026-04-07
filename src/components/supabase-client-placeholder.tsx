"use client";

import { Database, Sparkles, Users } from "lucide-react";

interface SupabaseClientPlaceholderProps {
  clientName: string;
}

export function SupabaseClientPlaceholder({
  clientName,
}: SupabaseClientPlaceholderProps) {
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-10 animate-fade-in">
      <div className="w-full max-w-3xl rounded-[28px] border border-[#1E1E1E] bg-[#121212] p-6 sm:p-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]">
          <Database className="h-7 w-7" />
        </div>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-medium text-[#A78BFA]">
            <Sparkles className="h-3.5 w-3.5" />
            Клиент загружен из Supabase
          </div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            {clientName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8B93A7] sm:text-base">
            Клиент появился в списке и успешно выбран. Для него пока не создано
            детальное рабочее пространство, поэтому здесь показывается временный экран.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Клиент найден</h3>
            <p className="mt-2 text-sm text-[#8B93A7]">
              Значит подключение к таблице работает и данные реально приходят из базы.
            </p>
          </div>

          <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Можно расширить дальше</h3>
            <p className="mt-2 text-sm text-[#8B93A7]">
              Следующим шагом можно привязать для таких клиентов отдельные вкладки, аналитику и чат.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}