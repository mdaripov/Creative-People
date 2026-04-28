"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Database,
  ExternalLink,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReportSummary } from "@/components/trendwatcher/report-summary";
import { ReportSwitcher } from "@/components/trendwatcher/report-switcher";
import { TrendCard } from "@/components/trendwatcher/trend-card";
import { CompetitorCard } from "@/components/trendwatcher/competitor-card";
import { ScenarioCard } from "@/components/trendwatcher/scenario-card";
import { AnalysisPanel } from "@/components/trendwatcher/analysis-panel";
import { EmptyFilterState } from "@/components/trendwatcher/empty-filter-state";
import { normalizeReport, type ReportRecord, type TrendPriority, type ViewMode } from "@/lib/trendwatcher";
import type { ClientData } from "@/lib/mock-data";

type FeedType = "all" | "trends" | "competitors" | "scenarios";

interface TrendwatcherDebugInfo {
  totalReports: number;
  matchedReports: number;
  currentClientId: string;
  currentClientName: string;
  sampleReportClients: Array<{
    client_id: string | null;
    client_name: string | null;
  }>;
}

function normalizeValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
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

function SectionShell({
  id,
  title,
  subtitle,
  icon,
  accent,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[28px] border border-[#2A3548] bg-[#171E2A] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-5"
    >
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

function CompetitorHighlightCard({
  name,
  source,
  observation,
  insight,
}: {
  name: string;
  source: string;
  observation: string;
  insight: string;
}) {
  const isUrl = /^https?:\/\//i.test(source);

  return (
    <div className="rounded-[24px] border border-[#253041] bg-[#121821] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{name}</p>
          <p className="mt-1 text-xs text-[#8EA0BE]">Конкурент / ориентир</p>
        </div>

        {isUrl ? (
          <a
            href={source}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#38BDF8]/25 bg-[#38BDF8]/10 px-3 py-1.5 text-[11px] font-semibold text-[#7DD3FC] transition-colors hover:bg-[#38BDF8]/15"
          >
            Ссылка
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="rounded-full border border-[#2A3548] bg-[#10151F] px-3 py-1.5 text-[11px] font-semibold text-[#B6C0D4]">
            {source || "Источник не указан"}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-[#212C3B] bg-[#10151F] p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#38BDF8]">
            Что делает
          </p>
          <p className="text-sm leading-6 text-[#E5E7EB]">{observation}</p>
        </div>

        <div className="rounded-2xl border border-[#212C3B] bg-[#171E2A] p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78BFA]">
            Почему это важно
          </p>
          <p className="text-sm leading-6 text-[#E5E7EB]">{insight}</p>
        </div>
      </div>
    </div>
  );
}

function DebugPanel({ debug }: { debug: TrendwatcherDebugInfo }) {
  return (
    <section className="rounded-[28px] border border-[#3A3220] bg-[#1C1811] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FBBF24]/25 bg-[#FBBF24]/10 text-[#FBBF24]">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Диагностика отчётов</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#D6C7A4]">
            Этот блок показывает, что реально пришло из базы и с чем сравнивается текущий клиент.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#4A402A] bg-[#15110C] p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8B7A56]">Текущий client_id</p>
          <p className="mt-2 break-all text-sm font-medium text-white">{debug.currentClientId}</p>
        </div>

        <div className="rounded-2xl border border-[#4A402A] bg-[#15110C] p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8B7A56]">Текущий client_name</p>
          <p className="mt-2 break-all text-sm font-medium text-white">{debug.currentClientName}</p>
        </div>

        <div className="rounded-2xl border border-[#4A402A] bg-[#15110C] p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8B7A56]">Всего reports</p>
          <p className="mt-2 text-sm font-medium text-white">{debug.totalReports}</p>
        </div>

        <div className="rounded-2xl border border-[#4A402A] bg-[#15110C] p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8B7A56]">Совпало</p>
          <p className="mt-2 text-sm font-medium text-white">{debug.matchedReports}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#4A402A] bg-[#15110C] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B7A56]">
          Первые client_id / client_name из reports
        </p>

        {debug.sampleReportClients.length > 0 ? (
          <div className="space-y-2">
            {debug.sampleReportClients.map((item, index) => (
              <div
                key={`${item.client_id ?? "null"}-${item.client_name ?? "null"}-${index}`}
                className="rounded-xl border border-[#3A3220] bg-[#1A1510] px-3 py-2"
              >
                <p className="text-xs text-white">
                  <span className="text-[#A89264]">client_id:</span> {item.client_id || "null"}
                </p>
                <p className="mt-1 text-xs text-white">
                  <span className="text-[#A89264]">client_name:</span> {item.client_name || "null"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#D6C7A4]">В таблице reports нет строк.</p>
        )}
      </div>
    </section>
  );
}

function EmptyReportState({
  clientName,
  debug,
}: {
  clientName: string;
  debug: TrendwatcherDebugInfo;
}) {
  return (
    <div className="space-y-5">
      <DebugPanel debug={debug} />

      <section className="rounded-[28px] border border-[#5A2F2F] bg-[#1D1414] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#EF4444]/25 bg-[#EF4444]/10 text-[#F87171]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Отчёт пока не найден</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#E5B4B4]">
              Для клиента {clientName} в таблице reports сейчас нет подходящей записи.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [debug, setDebug] = useState<TrendwatcherDebugInfo>({
    totalReports: 0,
    matchedReports: 0,
    currentClientId: data.client.id,
    currentClientName: data.client.name,
    sampleReportClients: [],
  });
  const [matchedReports, setMatchedReports] = useState<ReportRecord[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState("Все платформы");
  const [selectedPriority, setSelectedPriority] = useState<"all" | TrendPriority>("all");
  const [selectedType, setSelectedType] = useState<FeedType>("all");
  const [viewMode] = useState<ViewMode>("overview");

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setIsLoadingReports(true);

      const normalizedClientName = normalizeValue(data.client.name);
      const normalizedClientId = normalizeValue(data.client.id);

      const { data: reportsData } = await supabase
        .from("reports")
        .select("id, client_id, client_name, generated_at, status, analysis, competitors, trends, scenarios")
        .order("generated_at", { ascending: false });

      if (!isMounted) return;

      const reports = dedupeReports((reportsData as ReportRecord[] | null) ?? []);

      const exactNameMatches = reports.filter(
        (report) => normalizeValue(report.client_name) === normalizedClientName
      );

      const exactIdMatches = reports.filter(
        (report) => normalizeValue(report.client_id) === normalizedClientId
      );

      const partialMatches = reports.filter((report) => {
        const reportName = normalizeValue(report.client_name);
        const reportId = normalizeValue(report.client_id);

        return (
          reportName.includes(normalizedClientName) ||
          normalizedClientName.includes(reportName) ||
          reportId.includes(normalizedClientId) ||
          normalizedClientId.includes(reportId)
        );
      });

      const nextReports =
        exactNameMatches.length > 0
          ? exactNameMatches
          : exactIdMatches.length > 0
          ? exactIdMatches
          : partialMatches;

      setMatchedReports(nextReports);
      setDebug({
        totalReports: reports.length,
        matchedReports: nextReports.length,
        currentClientId: data.client.id,
        currentClientName: data.client.name,
        sampleReportClients: reports.slice(0, 8).map((report) => ({
          client_id: report.client_id,
          client_name: report.client_name,
        })),
      });
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

  const filteredTrends = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.trends.filter((item) => {
      const matchesPlatform =
        selectedPlatform === "Все платформы" || item.platform === selectedPlatform;
      const matchesPriority =
        selectedPriority === "all" || item.priority === selectedPriority;
      const matchesType = selectedType === "all" || selectedType === "trends";

      return matchesPlatform && matchesPriority && matchesType;
    });
  }, [activeReport, selectedPlatform, selectedPriority, selectedType]);

  const filteredCompetitors = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.competitors.filter((item) => {
      const matchesPlatform =
        selectedPlatform === "Все платформы" || item.platform === selectedPlatform;
      const matchesType = selectedType === "all" || selectedType === "competitors";

      return matchesPlatform && matchesType;
    });
  }, [activeReport, selectedPlatform, selectedType]);

  const filteredScenarios = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.scenarios.filter((item) => {
      const matchesPlatform =
        selectedPlatform === "Все платформы" || item.platform === selectedPlatform;
      const matchesType = selectedType === "all" || selectedType === "scenarios";

      return matchesPlatform && matchesType;
    });
  }, [activeReport, selectedPlatform, selectedType]);

  const priorityTrends = useMemo(
    () => filteredTrends.filter((item) => item.priority === "high"),
    [filteredTrends]
  );

  const readyScenarios = useMemo(
    () => filteredScenarios.filter((item) => item.status === "ready"),
    [filteredScenarios]
  );

  const remainingTrends = useMemo(
    () => filteredTrends.filter((item) => item.priority !== "high"),
    [filteredTrends]
  );

  const remainingScenarios = useMemo(
    () => filteredScenarios.filter((item) => item.status !== "ready"),
    [filteredScenarios]
  );

  const remainingItemsCount = remainingTrends.length + remainingScenarios.length;

  const handleResetFilters = () => {
    setSelectedPlatform("Все платформы");
    setSelectedPriority("all");
    setSelectedType("all");
  };

  const analysisSummary =
    activeReport?.analysis.split("\n").find((line) => line.trim()) ||
    activeReport?.summary.primaryFocus ||
    "Сначала пройдите по приоритетной ленте, а затем при необходимости откройте полный анализ.";

  if (isLoadingReports) {
    return (
      <div className="animate-fade-in space-y-5 p-4 sm:p-6">
        <div className="rounded-[28px] border border-[#2A3548] bg-[#171E2A] py-20">
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
        <EmptyReportState clientName={data.client.name} debug={debug} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full overflow-y-auto bg-[#0D121A]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6">
        <DebugPanel debug={debug} />

        <ReportSwitcher
          reports={normalizedReports}
          selectedReportId={activeReport.id}
          onSelectReport={setSelectedReportId}
        />

        <ReportSummary report={activeReport} />

        {filteredTrends.length === 0 &&
        filteredScenarios.length === 0 &&
        filteredCompetitors.length === 0 ? (
          <EmptyFilterState
            title="По текущим фильтрам ничего не найдено"
            description="Сейчас лента пуста, потому что выбранные фильтры слишком узкие для этого отчёта. Сбросьте их и вернитесь к полному обзору."
            onReset={handleResetFilters}
          />
        ) : (
          <div className="space-y-5">
            {filteredCompetitors.length > 0 ? (
              <SectionShell
                id="competitors"
                title="ИИ Трендвотчер — конкуренты"
                subtitle="Первый блок показывает конкурентов в виде отдельных аккуратных карточек с разделённым текстом и понятными ссылками."
                icon={<Target className="h-5 w-5" />}
                accent="#38BDF8"
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredCompetitors.map((item) => (
                    <CompetitorHighlightCard
                      key={item.id}
                      name={item.name}
                      source={item.source}
                      observation={item.observation}
                      insight={item.insight}
                    />
                  ))}
                </div>

                {viewMode === "detailed" && (
                  <div className="mt-4 grid gap-4">
                    {filteredCompetitors.map((item) => (
                      <CompetitorCard key={`${item.id}-full`} item={item} viewMode={viewMode} />
                    ))}
                  </div>
                )}
              </SectionShell>
            ) : null}

            {priorityTrends.length > 0 ? (
              <SectionShell
                id="priority-trends"
                title="Приоритетные тренды"
                subtitle="Самые сильные сигналы, которые стоит смотреть и обсуждать первыми."
                icon={<TrendingUp className="h-5 w-5" />}
                accent="#FBBF24"
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  {priorityTrends.map((item) => (
                    <TrendCard key={item.id} item={item} viewMode={viewMode} featured />
                  ))}
                </div>
              </SectionShell>
            ) : null}

            {activeReport.analysis ? (
              <AnalysisPanel analysis={activeReport.analysis} summary={analysisSummary} />
            ) : null}

            {readyScenarios.length > 0 ? (
              <SectionShell
                id="ready-scenarios"
                title="Сценарии, готовые к тесту"
                subtitle="Production-ready блоки, которые уже ближе всего к передаче в работу команде."
                icon={<Zap className="h-5 w-5" />}
                accent="#34D399"
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  {readyScenarios.map((item) => (
                    <ScenarioCard key={item.id} item={item} viewMode={viewMode} featured />
                  ))}
                </div>
              </SectionShell>
            ) : null}

            {remainingItemsCount > 0 ? (
              <SectionShell
                id="rest-feed"
                title="Остальные материалы"
                subtitle="Спокойный слой ленты для второго прохода после ключевых приоритетов."
                icon={<Sparkles className="h-5 w-5" />}
                accent="#A78BFA"
              >
                <div className="space-y-4">
                  {remainingTrends.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {remainingTrends.map((item) => (
                        <TrendCard key={item.id} item={item} viewMode={viewMode} />
                      ))}
                    </div>
                  ) : null}

                  {remainingScenarios.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {remainingScenarios.map((item) => (
                        <ScenarioCard key={item.id} item={item} viewMode={viewMode} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </SectionShell>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}