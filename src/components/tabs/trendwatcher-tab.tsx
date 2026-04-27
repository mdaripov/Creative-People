"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Calendar,
  Loader2,
  Flame,
  Target,
  Lightbulb,
  FileText,
  Database,
  Tag,
  UserCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
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

type ScenarioInsight = {
  title: string;
  summary: string;
  bullets: string[];
};

function normalizeValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function extractTextFromObject(value: Record<string, unknown>) {
  return (
    (typeof value.title === "string" && value.title) ||
    (typeof value.name === "string" && value.name) ||
    (typeof value.topic === "string" && value.topic) ||
    (typeof value.headline === "string" && value.headline) ||
    ""
  );
}

function extractSummaryFromObject(value: Record<string, unknown>) {
  return (
    (typeof value.description === "string" && value.description) ||
    (typeof value.summary === "string" && value.summary) ||
    (typeof value.analysis === "string" && value.analysis) ||
    (typeof value.insight === "string" && value.insight) ||
    (typeof value.scenario === "string" && value.scenario) ||
    ""
  );
}

function getItemsArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const objectItem = item as Record<string, unknown>;
          return (
            extractTextFromObject(objectItem) ||
            extractSummaryFromObject(objectItem) ||
            JSON.stringify(item, null, 2)
          );
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
                extractTextFromObject(objectItem) ||
                extractSummaryFromObject(objectItem) ||
                JSON.stringify(nested, null, 2)
              );
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

function parseScenarioInsights(value: unknown): ScenarioInsight[] {
  const normalizeBulletList = (items: unknown[]): string[] =>
    items
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const objectItem = item as Record<string, unknown>;
          return (
            extractTextFromObject(objectItem) ||
            extractSummaryFromObject(objectItem) ||
            JSON.stringify(item, null, 2)
          );
        }
        return String(item).trim();
      })
      .filter(Boolean);

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        return parseScenarioInsights(JSON.parse(trimmed));
      } catch {
        const parts = trimmed
          .split(/\n{2,}/)
          .map((part) => part.trim())
          .filter(Boolean);

        return parts.map((part, index) => ({
          title: `Сценарий ${index + 1}`,
          summary: part,
          bullets: [],
        }));
      }
    }

    const parts = trimmed
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);

    return parts.map((part, index) => ({
      title: `Сценарий ${index + 1}`,
      summary: part,
      bullets: [],
    }));
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            title: `Сценарий ${index + 1}`,
            summary: item,
            bullets: [],
          };
        }

        if (item && typeof item === "object") {
          const objectItem = item as Record<string, unknown>;
          const title = extractTextFromObject(objectItem) || `Сценарий ${index + 1}`;
          const summary = extractSummaryFromObject(objectItem);
          const bullets =
            Array.isArray(objectItem.points)
              ? normalizeBulletList(objectItem.points)
              : Array.isArray(objectItem.bullets)
                ? normalizeBulletList(objectItem.bullets)
                : Array.isArray(objectItem.items)
                  ? normalizeBulletList(objectItem.items)
                  : Array.isArray(objectItem.steps)
                    ? normalizeBulletList(objectItem.steps)
                    : [];

          return {
            title,
            summary,
            bullets,
          };
        }

        return {
          title: `Сценарий ${index + 1}`,
          summary: String(item),
          bullets: [],
        };
      })
      .filter((item) => item.title || item.summary || item.bullets.length > 0);
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    if (
      "title" in objectValue ||
      "name" in objectValue ||
      "description" in objectValue ||
      "summary" in objectValue ||
      "analysis" in objectValue
    ) {
      return [
        {
          title: extractTextFromObject(objectValue) || "Сценарий",
          summary: extractSummaryFromObject(objectValue),
          bullets:
            Array.isArray(objectValue.points)
              ? normalizeBulletList(objectValue.points)
              : Array.isArray(objectValue.bullets)
                ? normalizeBulletList(objectValue.bullets)
                : Array.isArray(objectValue.items)
                  ? normalizeBulletList(objectValue.items)
                  : [],
        },
      ];
    }

    return Object.entries(objectValue).flatMap(([key, nestedValue], index) => {
      if (Array.isArray(nestedValue)) {
        return [
          {
            title: key,
            summary: "",
            bullets: normalizeBulletList(nestedValue),
          },
        ];
      }

      if (nestedValue && typeof nestedValue === "object") {
        const nestedObject = nestedValue as Record<string, unknown>;
        return [
          {
            title: extractTextFromObject(nestedObject) || key || `Сценарий ${index + 1}`,
            summary: extractSummaryFromObject(nestedObject),
            bullets:
              Array.isArray(nestedObject.points)
                ? normalizeBulletList(nestedObject.points)
                : Array.isArray(nestedObject.bullets)
                  ? normalizeBulletList(nestedObject.bullets)
                  : Array.isArray(nestedObject.items)
                    ? normalizeBulletList(nestedObject.items)
                    : [],
          },
        ];
      }

      if (typeof nestedValue === "string") {
        return [
          {
            title: key,
            summary: nestedValue,
            bullets: [],
          },
        ];
      }

      return [];
    });
  }

  return [];
}

function getPrettyJson(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        return JSON.stringify(JSON.parse(trimmed), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? "");
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
      <div className="mb-4 flex items-center gap-2">
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
              className="whitespace-pre-wrap rounded-2xl border border-[#1B1B1B] bg-[#161616] px-3 py-3 text-sm leading-relaxed text-[#D1D5DB]"
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

function ScenarioAnalyticsCard({ scenario, index }: { scenario: ScenarioInsight; index: number }) {
  return (
    <div className="rounded-3xl border border-[#1E1E1E] bg-[#111111] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6B7280]">
            Сценарий {index + 1}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-white">
            {scenario.title || `Сценарий ${index + 1}`}
          </h4>
        </div>
      </div>

      {scenario.summary ? (
        <p className="mb-4 text-sm leading-relaxed text-[#D1D5DB]">
          {scenario.summary}
        </p>
      ) : null}

      {scenario.bullets.length > 0 ? (
        <div className="space-y-2">
          {scenario.bullets.map((bullet, bulletIndex) => (
            <div
              key={`${scenario.title}-${bulletIndex}`}
              className="flex items-start gap-2 rounded-2xl border border-[#1B1B1B] bg-[#161616] px-3 py-3"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#34D399]" />
              <p className="text-sm leading-relaxed text-[#D1D5DB]">{bullet}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MetaCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-[#8B93A7]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="break-all text-sm text-white">{value || "—"}</p>
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [allReportsCount, setAllReportsCount] = useState(0);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setIsLoadingReports(true);
      setErrorMessage(null);

      const { data: reportsData, error } = await supabase
        .from("reports")
        .select("id, client_id, client_name, generated_at, status, competitors, trends, scenarios")
        .order("generated_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setReports([]);
        setAllReportsCount(0);
        setErrorMessage(error.message);
        setIsLoadingReports(false);
        return;
      }

      const allReports = (reportsData as ReportRecord[] | null) ?? [];
      setAllReportsCount(allReports.length);

      const normalizedName = normalizeValue(data.client.name);
      const normalizedId = normalizeValue(data.client.id);

      const matchedReports = allReports.filter((report) => {
        const reportClientId = normalizeValue(report.client_id);
        const reportClientName = normalizeValue(report.client_name);

        return (
          reportClientId === normalizedName ||
          reportClientName === normalizedName ||
          reportClientId === normalizedId ||
          reportClientName === normalizedId ||
          reportClientId.includes(normalizedName) ||
          reportClientName.includes(normalizedName) ||
          normalizedName.includes(reportClientId) ||
          normalizedName.includes(reportClientName)
        );
      });

      setReports(matchedReports);
      setIsLoadingReports(false);
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.id, data.client.name]);

  const latestReport = reports[0] ?? null;
  const reportTrends = useMemo(() => getItemsArray(latestReport?.trends), [latestReport]);
  const reportCompetitors = useMemo(() => getItemsArray(latestReport?.competitors), [latestReport]);
  const scenarioAnalytics = useMemo(() => parseScenarioInsights(latestReport?.scenarios), [latestReport]);

  return (
    <div className="animate-fade-in space-y-5 p-4 sm:p-6">
      <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
              <ClipboardList className="h-3.5 w-3.5" />
              Данные из reports
            </div>
            <h3 className="text-lg font-semibold text-white">ИИ Трендвотчер</h3>
            <p className="mt-1 text-sm text-[#8B93A7]">
              Во вкладке отображаются реальные поля из таблицы reports для текущего клиента.
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
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7280]" />
          </div>
        </div>
      ) : errorMessage ? (
        <div className="rounded-3xl border border-[#7F1D1D] bg-[#2A1212] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#FCA5A5]">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">Ошибка загрузки reports</p>
          </div>
          <p className="text-sm text-[#FECACA]">{errorMessage}</p>
          <div className="mt-4 rounded-2xl border border-[#4A1D1D] bg-[#1B0F0F] p-4 text-left">
            <p className="mb-1 text-xs text-[#FCA5A5]">Текущий клиент</p>
            <p className="break-all text-sm text-white">name: {data.client.name}</p>
            <p className="break-all text-sm text-white">id: {data.client.id}</p>
          </div>
        </div>
      ) : latestReport ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetaCard label="Report ID" value={latestReport.id} icon={<Database className="h-3.5 w-3.5" />} />
            <MetaCard label="Client ID" value={latestReport.client_id ?? ""} icon={<UserCircle2 className="h-3.5 w-3.5" />} />
            <MetaCard label="Client Name" value={latestReport.client_name ?? ""} icon={<FileText className="h-3.5 w-3.5" />} />
            <MetaCard label="Status" value={latestReport.status ?? ""} icon={<Tag className="h-3.5 w-3.5" />} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportColumn title="Тренды" icon={<Flame className="h-4 w-4" />} accent="#A78BFA" items={reportTrends} />
            <ReportColumn title="Конкуренты" icon={<Target className="h-4 w-4" />} accent="#38BDF8" items={reportCompetitors} />
          </div>

          <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Аналитика сценариев</h4>
                <p className="text-sm text-[#8B93A7]">
                  Содержимое поля reports.scenarios в более удобном и читаемом виде.
                </p>
              </div>
            </div>

            {scenarioAnalytics.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {scenarioAnalytics.map((scenario, index) => (
                  <ScenarioAnalyticsCard
                    key={`${scenario.title}-${index}`}
                    scenario={scenario}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="text-sm text-[#6B7280]">В scenarios нет распознанной аналитики.</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#1E1E1E] bg-[#111111] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Raw scenarios</h4>
            <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-[#9CA3AF]">
              {getPrettyJson(latestReport.scenarios)}
            </pre>
          </div>
        </>
      ) : (
        <div className="space-y-3 rounded-3xl border border-[#1E1E1E] bg-[#161616] p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#2A2A2A]" />
          <p className="text-sm text-[#6B7280]">Для этого клиента в таблице reports пока нет записей</p>
          <div className="mx-auto max-w-xl rounded-2xl border border-[#222222] bg-[#111111] p-4 text-left">
            <p className="mb-1 text-xs text-[#8B93A7]">Диагностика</p>
            <p className="break-all text-sm text-white">name: {data.client.name}</p>
            <p className="break-all text-sm text-white">id: {data.client.id}</p>
            <p className="break-all text-sm text-white">reports visible in browser: {allReportsCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}