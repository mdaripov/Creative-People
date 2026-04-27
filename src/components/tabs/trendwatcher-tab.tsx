"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Calendar, Loader2, Flame, Target, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ClientData } from "@/lib/mock-data";

type ReportRecord = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  generated_at: string | null;
  status: string | null;
  competitors: unknown;
  trends: unknown;
  scenarios: unknown;
};

function getItemsArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const objectItem = item as Record<string, unknown>;
          return (
            objectItem.title ??
            objectItem.topic ??
            objectItem.name ??
            objectItem.format ??
            JSON.stringify(item)
          ) as string;
        }
        return String(item);
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        return getItemsArray(JSON.parse(trimmed));
      } catch {
        return trimmed
          .split(/\n+|•/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return trimmed
      .split(/\n+|•/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      Array.isArray(item)
        ? item.map((nested) => {
            if (typeof nested === "string") return nested;
            if (nested && typeof nested === "object") {
              const objectItem = nested as Record<string, unknown>;
              return (
                objectItem.title ??
                objectItem.topic ??
                objectItem.name ??
                objectItem.format ??
                JSON.stringify(nested)
              ) as string;
            }
            return String(nested);
          })
        : typeof item === "string"
        ? [item]
        : []
    );
  }

  return [];
}

function ReportColumn({
  title,
  icon,
  accent,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-[#1E1E1E] bg-[#111111] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-2xl border"
          style={{ background: `${accent}15`, borderColor: `${accent}25`, color: accent }}
        >
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-2xl border border-[#1B1B1B] bg-[#161616] px-3 py-3 text-sm leading-relaxed text-[#D1D5DB]"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6B7280]">Нет данных</p>
      )}
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setIsLoadingReports(true);

      const { data: reportsData } = await supabase
        .from("reports")
        .select("id, client_id, client_name, generated_at, status, competitors, trends, scenarios")
        .order("generated_at", { ascending: false });

      const normalizedName = data.client.name.trim().toLowerCase();
      const matchedReports = ((reportsData as ReportRecord[] | null) ?? []).filter((report) => {
        const reportClientId = (report.client_id ?? "").trim().toLowerCase();
        const reportClientName = (report.client_name ?? "").trim().toLowerCase();
        return reportClientId === normalizedName || reportClientName === normalizedName;
      });

      if (isMounted) {
        setReports(matchedReports);
        setIsLoadingReports(false);
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.name]);

  const latestReport = reports[0] ?? null;
  const reportTrends = useMemo(() => getItemsArray(latestReport?.trends), [latestReport]);
  const reportCompetitors = useMemo(() => getItemsArray(latestReport?.competitors), [latestReport]);
  const reportScenarios = useMemo(() => getItemsArray(latestReport?.scenarios), [latestReport]);

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
              <ClipboardList className="h-3.5 w-3.5" />
              Данные из reports
            </div>
            <h3 className="text-lg font-semibold text-white">ИИ Трендвотчер</h3>
            <p className="mt-1 text-sm text-[#8B93A7]">
              Во вкладке отображаются только реальные данные из таблицы reports для текущего клиента.
            </p>
          </div>

          {latestReport?.generated_at ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#222222] bg-[#111111] px-4 py-2 text-xs text-[#8B93A7]">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(latestReport.generated_at).toLocaleString("ru-RU")}
            </div>
          ) : null}
        </div>
      </div>

      {isLoadingReports ? (
        <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
          </div>
        </div>
      ) : latestReport ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ReportColumn
            title="Тренды"
            icon={<Flame className="h-4 w-4" />}
            accent="#A78BFA"
            items={reportTrends}
          />
          <ReportColumn
            title="Конкуренты"
            icon={<Target className="h-4 w-4" />}
            accent="#38BDF8"
            items={reportCompetitors}
          />
          <ReportColumn
            title="Сценарии"
            icon={<Lightbulb className="h-4 w-4" />}
            accent="#34D399"
            items={reportScenarios}
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-10 text-center space-y-3">
          <ClipboardList className="w-8 h-8 text-[#2A2A2A] mx-auto" />
          <p className="text-sm text-[#6B7280]">Для этого клиента в таблице reports пока нет записей</p>
          <div className="rounded-2xl border border-[#222222] bg-[#111111] p-4 text-left max-w-xl mx-auto">
            <p className="text-xs text-[#8B93A7] mb-1">Текущий клиент</p>
            <p className="text-sm text-white break-all">name: {data.client.name}</p>
            <p className="text-sm text-white break-all">id: {data.client.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
