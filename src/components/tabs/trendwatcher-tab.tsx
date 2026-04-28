"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Database,
  FileText,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import fallbackReports from "@/lib/reports_rows.json";
import { supabase } from "@/integrations/supabase/client";
import { FormattedRichText } from "@/components/formatted-rich-text";
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

function normalizeLoose(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"'’”“?<>@+|[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getClientReports(reports: ReportRecord[], clientName: string, clientId: string) {
  const normalizedClientName = normalizeLoose(clientName);
  const normalizedClientId = normalizeLoose(clientId);

  const exactMatches = reports.filter((report) => {
    return report.client_id === clientId || report.client_name === clientName;
  });

  if (exactMatches.length > 0) {
    return exactMatches.sort((a, b) =>
      (b.generated_at ?? "").localeCompare(a.generated_at ?? "")
    );
  }

  const normalizedMatches = reports.filter((report) => {
    const reportClientName = normalizeLoose(report.client_name);
    const reportClientId = normalizeLoose(report.client_id);

    return (
      reportClientId === normalizedClientId ||
      reportClientName === normalizedClientName ||
      reportClientId === normalizedClientName ||
      reportClientName === normalizedClientId
    );
  });

  return normalizedMatches.sort((a, b) =>
    (b.generated_at ?? "").localeCompare(a.generated_at ?? "")
  );
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

function ReportsDebugPanel({
  clientName,
  clientId,
  reports,
  matchedCount,
}: {
  clientName: string;
  clientId: string;
  reports: ReportRecord[];
  matchedCount: number;
}) {
  return (
    <section className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-4 sm:p-5">
      <div className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#38BDF8]/25 bg-[#38BDF8]/10 text-[#38BDF8]">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Проверка загрузки reports</p>
          <p className="text-xs text-[#8B93A7]">
            Всего загружено: {reports.length} · Совпало для клиента: {matchedCount}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
            Выбранный клиент
          </p>
          <p className="mt-2 text-sm text-white">name: {clientName}</p>
          <p className="mt-1 text-sm text-[#B6C0D4]">id: {clientId}</p>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA0BE]">
            Записи из reports
          </p>
          <div className="mt-2 space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-[#242424] bg-[#151515] px-3 py-3"
              >
                <p className="text-sm font-medium text-white">
                  {report.client_name || "Без client_name"}
                </p>
                <p className="mt-1 text-xs text-[#8B93A7]">
                  client_id: {report.client_id || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyReportState({
  clientName,
  matchedCount,
  totalCount,
}: {
  clientName: string;
  matchedCount: number;
  totalCount: number;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#38BDF8]/25 bg-[#38BDF8]/10 text-[#38BDF8]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Отчёт пока не найден</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B6C0D4]">
              Для клиента {clientName} не найдено совпадающих записей в reports.
            </p>
            <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4 text-sm text-[#8B93A7]">
              <p>Всего загружено отчётов: {totalCount}</p>
              <p>Совпадений для этого клиента: {matchedCount}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [matchedReports, setMatchedReports] = useState<ReportRecord[]>([]);
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
        .select("id, client_id, client_name, generated_at, status, analysis, competitors, trends, scenarios")
        .order("generated_at", { ascending: false });

      if (!isMounted) return;

      const supabaseRows = (reportsData as ReportRecord[] | null) ?? [];
      const sourceRows = supabaseRows.length > 0 ? supabaseRows : ((fallbackReports as ReportRecord[]) ?? []);
      const mergedReports = dedupeReports(sourceRows);
      const nextMatchedReports = getClientReports(mergedReports, data.client.name, data.client.id);

      setReports(mergedReports);
      setMatchedReports(nextMatchedReports);
      setIsLoadingReports(false);
    };

    void fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.id, data.client.name]);

  const normalizedReports = useMemo(() => {
    return matchedReports.map((report) => normalizeReport(report, "Данные из reports"));
  }, [matchedReports]);

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

  if (!activeReport) {
    return (
      <div className="animate-fade-in space-y-5 p-4 sm:p-6">
        <ReportsDebugPanel
          clientName={data.client.name}
          clientId={data.client.id}
          reports={reports}
          matchedCount={matchedReports.length}
        />

        <EmptyReportState
          clientName={data.client.name}
          matchedCount={matchedReports.length}
          totalCount={reports.length}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 p-4 sm:p-6">
      <ReportsDebugPanel
        clientName={data.client.name}
        clientId={data.client.id}
        reports={reports}
        matchedCount={matchedReports.length}
      />

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

      {activeReport.analysis ? (
        <SectionShell
          title="Общий анализ"
          subtitle="Основной текст аналитики из поля analysis в таблице reports."
          icon={<FileText className="h-5 w-5" />}
          accent="#F472B6"
        >
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#111111] p-4 sm:p-5">
            <FormattedRichText text={activeReport.analysis} accent="#F472B6" />
          </div>
        </SectionShell>
      ) : null}

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