"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Flame, Filter, Loader2, Calendar, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ClientData, Trend } from "@/lib/mock-data";

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

const relevanceConfig = {
  high: { label: "Высокая", color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
  medium: { label: "Средняя", color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
  low: { label: "Низкая", color: "#6B7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" },
};

const platformColors: Record<string, string> = {
  TikTok: "#A78BFA",
  Instagram: "#F472B6",
  LinkedIn: "#38BDF8",
  YouTube: "#EF4444",
};

const allPlatforms = ["Все", "TikTok", "Instagram", "LinkedIn", "YouTube"];

function TrendCard({ trend, index }: { trend: Trend; index: number }) {
  const rel = relevanceConfig[trend.relevance];
  const color = platformColors[trend.platform] ?? "#9CA3AF";

  return (
    <div
      className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4 hover:border-[#2A2A2A] transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.06}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
          >
            {trend.platform}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-medium"
            style={{ background: rel.bg, color: rel.color, border: `1px solid ${rel.border}` }}
          >
            {rel.label} релевантность
          </span>
        </div>
        <span className="text-[9px] text-[#6B7280] whitespace-nowrap flex-shrink-0">{trend.date}</span>
      </div>

      <p className="text-sm font-semibold text-white mb-2 leading-tight">{trend.title}</p>
      <p className="text-xs text-[#9CA3AF] leading-relaxed mb-3">{trend.description}</p>

      <div className="flex items-center justify-between">
        <span
          className="px-2 py-0.5 rounded-md text-[9px] font-medium"
          style={{ background: "rgba(255,255,255,0.05)", color: "#6B7280", border: "1px solid #1E1E1E" }}
        >
          {trend.category}
        </span>
        <span className="text-[9px] text-[#4B5563]">📡 {trend.source}</span>
      </div>
    </div>
  );
}

function getItemsArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return JSON.stringify(item);
        return String(item);
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n+|•|\-|\*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      Array.isArray(item)
        ? item.map((nested) => (typeof nested === "string" ? nested : JSON.stringify(nested)))
        : typeof item === "string"
        ? [item]
        : []
    );
  }

  return [];
}

export function TrendwatcherTab({ data }: { data: ClientData }) {

  const [filter, setFilter] = useState("Все");
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setIsLoadingReports(true);

      const { data: reportsData } = await supabase
        .from("reports")
        .select("id, client_id, client_name, generated_at, status, competitors, trends, scenarios")
        .or(`client_id.eq.${data.client.id},client_name.eq.${data.client.name}`)
        .order("generated_at", { ascending: false });

      if (isMounted) {
        setReports((reportsData as ReportRecord[] | null) ?? []);
        setIsLoadingReports(false);
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.id, data.client.name]);

  const filtered =
    filter === "Все"
      ? data.trends
      : data.trends.filter((t) => t.platform === filter);

  const highCount = data.trends.filter((t) => t.relevance === "high").length;

  const latestReport = reports[0] ?? null;
  const reportTrends = useMemo(() => getItemsArray(latestReport?.trends), [latestReport]);
  const reportCompetitors = useMemo(() => getItemsArray(latestReport?.competitors), [latestReport]);
  const reportScenarios = useMemo(() => getItemsArray(latestReport?.scenarios), [latestReport]);

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Всего трендов", value: data.trends.length, color: "#A78BFA", icon: TrendingUp },
          { label: "Высокая релевантность", value: highCount, color: "#34D399", icon: Flame },
          { label: "Платформ", value: new Set(data.trends.map((t) => t.platform)).size, color: "#38BDF8", icon: Filter },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl p-4 bg-[#161616] border border-[#1E1E1E] animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              </div>
              <p className="text-xl font-bold text-white leading-none mb-1">{stat.value}</p>
              <p className="text-[9px] text-[#6B7280] leading-tight">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#38BDF8]" />
            <h3 className="text-sm font-semibold text-white">Репортс из базы</h3>
          </div>
          {latestReport?.generated_at ? (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#8B93A7]">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(latestReport.generated_at).toLocaleString("ru-RU")}
            </div>
          ) : null}
        </div>

        {isLoadingReports ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
          </div>
        ) : latestReport ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#111111] border border-[#1E1E1E] p-4">
              <p className="text-xs font-semibold text-white mb-3">Тренды</p>
              {reportTrends.length > 0 ? (
                <ul className="space-y-2">
                  {reportTrends.map((item, index) => (
                    <li key={index} className="text-xs text-[#9CA3AF] leading-relaxed">• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#6B7280]">Нет данных</p>
              )}
            </div>

            <div className="rounded-2xl bg-[#111111] border border-[#1E1E1E] p-4">
              <p className="text-xs font-semibold text-white mb-3">Конкуренты</p>
              {reportCompetitors.length > 0 ? (
                <ul className="space-y-2">
                  {reportCompetitors.map((item, index) => (
                    <li key={index} className="text-xs text-[#9CA3AF] leading-relaxed">• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#6B7280]">Нет данных</p>
              )}
            </div>

            <div className="rounded-2xl bg-[#111111] border border-[#1E1E1E] p-4">
              <p className="text-xs font-semibold text-white mb-3">Сценарии</p>
              {reportScenarios.length > 0 ? (
                <ul className="space-y-2">
                  {reportScenarios.map((item, index) => (
                    <li key={index} className="text-xs text-[#9CA3AF] leading-relaxed">• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#6B7280]">Нет данных</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#6B7280] py-6 text-center">Для этого клиента в таблице reports пока нет записей</p>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {allPlatforms.map((p) => {
          const isActive = filter === p;
          const color = platformColors[p] ?? "#9CA3AF";
          return (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={
                isActive
                  ? {
                      background: p === "Все" ? "rgba(255,255,255,0.1)" : `${color}15`,
                      color: p === "Все" ? "#fff" : color,
                      border: `1px solid ${p === "Все" ? "rgba(255,255,255,0.2)" : `${color}30`}`,
                    }
                  : {
                      background: "transparent",
                      color: "#6B7280",
                      border: "1px solid #1E1E1E",
                    }
              }
            >
              {p}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((trend, i) => (
          <TrendCard key={trend.id} trend={trend} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-8 h-8 text-[#2A2A2A] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">Нет трендов для этой платформы</p>
        </div>
      )}
    </div>
  );
}
