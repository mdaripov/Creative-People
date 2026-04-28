"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Database,
  FileJson,
  Loader2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import fallbackReports from "@/lib/reports_rows.json";
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

function normalizeValue(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function dedupeReports(reports: ReportRecord[]) {
  const map = new Map<string, ReportRecord>();

  reports.forEach((report) => {
    const key = report.id || `${report.client_id}-${report.client_name}-${report.generated_at}`;
    if (!map.has(key)) {
      map.set(key, report);
    }
  });

  return Array.from(map.values());
}

function getClientReports(reports: ReportRecord[], clientName: string, clientId: string) {
  const normalizedName = normalizeValue(clientName);
  const normalizedId = normalizeValue(clientId);

  const exactMatches = reports.filter((report) => {
    const reportName = normalizeValue(report.client_name);
    const reportId = normalizeValue(report.client_id);

    return (
      reportName === normalizedName ||
      reportId === normalizedId ||
      reportName === normalizedId ||
      reportId === normalizedName
    );
  });

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const containsMatches = reports.filter((report) => {
    const reportName = normalizeValue(report.client_name);
    const reportId = normalizeValue(report.client_id);

    return (
      (reportName && reportName.includes(normalizedName)) ||
      (reportId && reportId.includes(normalizedId)) ||
      (normalizedName && reportName && normalizedName.includes(reportName)) ||
      (normalizedId && reportId && normalizedId.includes(reportId))
    );
  });

  if (containsMatches.length > 0) {
    return containsMatches;
  }

  return [];
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

function DebugReportState({
  report,
  clientName,
  clientId,
  totalReports,
  matchedReports,
  availableClientNames,
}: {
  report?: ReportRecord;
  clientName: string;
  clientId: string;
  totalReports: number;
  matchedReports: number;
  availableClientNames: string[];
}) {
  const preview = report
    ? JSON.stringify(
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
      )
    : null;

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Диагностика загрузки отчётов</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">
              Показываю, что именно открыто сейчас и какие имена клиентов реально есть в reports.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#242424] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Открытый client.name</p>
            <p className="mt-2 text-sm font-medium text-white break-words">{clientName}</p>
          </div>

          <div className="rounded-2xl border border-[#242424] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Открытый client.id</p>
            <p className="mt-2 text-sm font-medium text-white break-words">{clientId}</p>
          </div>

          <div className="rounded-2xl border border-[#242424] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Всего reports</p>
            <p className="mt-2 text-sm font-medium text-white">{totalReports}</p>
          </div>

          <div className="rounded-2xl border border-[#242424] bg-[#101010] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">Совпало записей</p>
            <p className="mt-2 text-sm font-medium text-white">{matchedReports}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">client_name из reports</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">
              Ниже реальные имена клиентов, которые пришли из базы и локального файла.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableClientNames.length > 0 ? (
            availableClientNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-[#2A2A2A] bg-[#101010] px-3 py-1.5 text-xs text-[#D1D5DB]"
              >
                {name}
              </span>
            ))
          ) : (
            <p className="text-sm text-[#8B93A7]">В reports не найдено ни одного client_name.</p>
          )}
        </div>
      </div>

      {preview ? (
        <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Пример сырой записи</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">
                Первая найденная запись для выбранного клиента.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#242424] bg-[#101010] p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#D1D5DB]">
              {preview}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [allReports, setAllReports] = useState<ReportRecord[]>([]);
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

      const supabaseRows = (reportsData as ReportRecord[] | null) ?? [];
      const localRows = (fallbackReports as ReportRecord[]) ?? [];
      const mergedReports = dedupeReports([...supabaseRows, ...localRows]);
      const matchedReports = getClientReports(mergedReports, data.client.name, data.client.id);

      setAllReports(mergedReports);
      setReports(matchedReports);
      setIsLoadingReports(false);
    };

    void fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.id, data.client.name]);

  const normalizedReports = useMemo(() => {
    return reports.map((report) => normalizeReport(report, "Данные из reports"));
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

  const availableClientNames = useMemo(() => {
    return Array.from(
      new Set(
        allReports
          .map((report) => report.client_name?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b, "ru"));
  }, [allReports]);

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
        <DebugReportState
          clientName={data.client.name}
          clientId={data.client.id}
          totalReports={allReports.length}
          matchedReports={reports.length}
          availableClientNames={availableClientNames}
        />
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
        <DebugReportState
          report={activeRawReport}
          clientName={data.client.name}
          clientId={data.client.id}
          totalReports={allReports.length}
          matchedReports={reports.length}
          availableClientNames={availableClientNames}
        />
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