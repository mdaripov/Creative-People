"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Database,
  FileJson,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReportSummary } from "@/components/trendwatcher/report-summary";
import { ReportSwitcher } from "@/components/trendwatcher/report-switcher";
import { FilterBar } from "@/components/trendwatcher/filter-bar";
import { TrendCard } from "@/components/trendwatcher/trend-card";
import { CompetitorCard } from "@/components/trendwatcher/competitor-card";
import { ScenarioCard } from "@/components/trendwatcher/scenario-card";
import {
  getPlatformOptions,
  normalizeReport,
  type ReportRecord,
  type TrendPriority,
  type ViewMode,
} from "@/lib/trendwatcher";
import type { ClientData } from "@/lib/mock-data";

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"'’”“?<>@+|[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value: string) {
  return normalizeSearchValue(value)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function matchesClientReport(report: ReportRecord, clientName: string, clientId: string) {
  const reportClientId = normalizeSearchValue(report.client_id ?? "");
  const reportClientName = normalizeSearchValue(report.client_name ?? "");
  const normalizedClientName = normalizeSearchValue(clientName);
  const normalizedClientId = normalizeSearchValue(clientId);

  const haystack = [reportClientId, reportClientName].filter(Boolean).join(" ");

  if (!haystack) return false;

  if (
    haystack === normalizedClientName ||
    haystack === normalizedClientId ||
    haystack.includes(normalizedClientName) ||
    normalizedClientName.includes(haystack) ||
    haystack.includes(normalizedClientId) ||
    normalizedClientId.includes(haystack)
  ) {
    return true;
  }

  const clientTokens = [
    ...getSearchTokens(normalizedClientName),
    ...getSearchTokens(normalizedClientId),
  ];

  const uniqueTokens = Array.from(new Set(clientTokens));
  const matchedTokens = uniqueTokens.filter((token) => haystack.includes(token));

  if (matchedTokens.length >= 2) {
    return true;
  }

  if (
    normalizedClientName === "merkez kehillat herzliya" &&
    (haystack.includes("merkez") ||
      haystack.includes("kehillat") ||
      haystack.includes("herzliya"))
  ) {
    return true;
  }

  return false;
}

function SectionShell({
  title,
  subtitle,
  icon,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{ background: `${accent}16`, borderColor: `${accent}32`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function DebugReportState({ report }: { report: ReportRecord }) {
  const preview = JSON.stringify(
    {
      client_id: report.client_id,
      client_name: report.client_name,
      generated_at: report.generated_at,
      status: report.status,
      competitors: report.competitors,
      trends: report.trends,
      scenarios: report.scenarios,
    },
    null,
    2
  );

  return (
    <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]">
          <FileJson className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Отчёт найден, но секции пустые</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">
            Запись из базы найдена, но её содержимое пока не разобралось в карточки.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#242424] bg-[#101010] p-4">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#7DD3FC]">
          <Database className="h-3.5 w-3.5" />
          Сырые данные из reports
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#D1D5DB]">
          {preview}
        </pre>
      </div>
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState("Все платформы");
  const [selectedPriority, setSelectedPriority] = useState<"all" | TrendPriority>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setIsLoadingReports(true);

      const { data: reportsData } = await supabase
        .from("reports")
        .select("id, client_id, client_name, generated_at, status, competitors, trends, scenarios")
        .order("generated_at", { ascending: false });

      if (!isMounted) return;

      const allReports = (reportsData as ReportRecord[] | null) ?? [];
      const matchedReports = allReports.filter((report) =>
        matchesClientReport(report, data.client.name, data.client.id)
      );

      setReports(matchedReports);
      setIsLoadingReports(false);
    };

    void fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.id, data.client.name]);

  const normalizedReports = useMemo(() => {
    return reports.map((report) => normalizeReport(report, "Данные из Supabase"));
  }, [reports]);

  useEffect(() => {
    if (!normalizedReports.length) {
      setSelectedReportId("");
      return;
    }

    setSelectedReportId((current) =>
      normalizedReports.some((report) => report.id === current) ? current : normalizedReports[0].id
    );
  }, [normalizedReports]);

  const activeReport = useMemo(
    () => normalizedReports.find((report) => report.id === selectedReportId) ?? normalizedReports[0],
    [normalizedReports, selectedReportId]
  );

  const activeRawReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? reports[0],
    [reports, selectedReportId]
  );

  const platformOptions = useMemo(
    () => (activeReport ? getPlatformOptions(activeReport) : ["Все платформы"]),
    [activeReport]
  );

  const filteredTrends = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.trends.filter((item) => {
      const matchesPlatform =
        selectedPlatform === "Все платформы" || item.platform === selectedPlatform;
      const matchesPriority =
        selectedPriority === "all" || item.priority === selectedPriority;

      return matchesPlatform && matchesPriority;
    });
  }, [activeReport, selectedPlatform, selectedPriority]);

  const filteredCompetitors = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.competitors.filter((item) => {
      return selectedPlatform === "Все платформы" || item.platform === selectedPlatform;
    });
  }, [activeReport, selectedPlatform]);

  const filteredScenarios = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.scenarios.filter((item) => {
      return selectedPlatform === "Все платформы" || item.platform === selectedPlatform;
    });
  }, [activeReport, selectedPlatform]);

  if (isLoadingReports) {
    return (
      <div className="animate-fade-in space-y-5 p-4 sm:p-6">
        <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#9AA4B8]" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeReport || !activeRawReport) {
    return (
      <div className="animate-fade-in space-y-5 p-4 sm:p-6">
        <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#4B5563]" />
          <p className="mt-3 text-sm text-[#C5CEE0]">Для этого клиента пока нет оформленных инсайтов.</p>
        </div>
      </div>
    );
  }

  const hasVisibleSections =
    activeReport.trends.length > 0 ||
    activeReport.competitors.length > 0 ||
    activeReport.scenarios.length > 0;

  if (!hasVisibleSections) {
    return (
      <div className="animate-fade-in space-y-5 p-4 sm:p-6">
        <ReportSwitcher
          reports={normalizedReports}
          selectedReportId={activeReport.id}
          onSelectReport={setSelectedReportId}
        />
        <DebugReportState report={activeRawReport} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 p-4 sm:p-6">
      <ReportSummary report={activeReport} />

      <ReportSwitcher
        reports={normalizedReports}
        selectedReportId={activeReport.id}
        onSelectReport={setSelectedReportId}
      />

      <FilterBar
        platforms={platformOptions}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <SectionShell
        title="Тренды"
        subtitle="Что происходит сейчас, почему это важно и что стоит запускать первым."
        icon={<TrendingUp className="h-5 w-5" />}
        accent="#A78BFA"
      >
        {filteredTrends.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredTrends.map((item) => (
              <TrendCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#B6C0D4]">По текущим фильтрам тренды не найдены.</p>
        )}
      </SectionShell>

      <SectionShell
        title="Конкуренты"
        subtitle="Быстрый benchmark: что у других сработало и как это адаптировать без прямого копирования."
        icon={<Target className="h-5 w-5" />}
        accent="#38BDF8"
      >
        {filteredCompetitors.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredCompetitors.map((item) => (
              <CompetitorCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#B6C0D4]">По текущим фильтрам конкуренты не найдены.</p>
        )}
      </SectionShell>

      <SectionShell
        title="Сценарии"
        subtitle="Production-ready заготовки для команды: формат, hook, структура и ожидаемый эффект."
        icon={<Sparkles className="h-5 w-5" />}
        accent="#34D399"
      >
        {filteredScenarios.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredScenarios.map((item) => (
              <ScenarioCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#B6C0D4]">По текущим фильтрам сценарии не найдены.</p>
        )}
      </SectionShell>
    </div>
  );
}