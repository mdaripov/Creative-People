"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Calendar,
  Loader2,
  Flame,
  Target,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import reportsRows from "@/lib/reports_rows.json";
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
    (typeof value.label === "string" && value.label) ||
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
    (typeof value.text === "string" && value.text) ||
    ""
  );
}

function unwrapStructuredValue(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const objectValue = value as Record<string, unknown>;

  if ("scenarios" in objectValue) return objectValue.scenarios;
  if ("scenario_analytics" in objectValue) return objectValue.scenario_analytics;
  if ("analytics" in objectValue) return objectValue.analytics;
  if ("data" in objectValue) return unwrapStructuredValue(objectValue.data);
  if ("report" in objectValue) return unwrapStructuredValue(objectValue.report);
  if ("result" in objectValue) return unwrapStructuredValue(objectValue.result);
  if ("output" in objectValue) return unwrapStructuredValue(objectValue.output);

  return value;
}

function getItemsArray(value: unknown): string[] {
  const unwrapped = unwrapStructuredValue(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped
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

  if (typeof unwrapped === "string") {
    const trimmed = unwrapped.trim();

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

  if (unwrapped && typeof unwrapped === "object") {
    const objectValue = unwrapped as Record<string, unknown>;
    return Object.values(objectValue).flatMap((item) =>
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
  const normalizedValue = unwrapStructuredValue(value);

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

  if (typeof normalizedValue === "string") {
    const trimmed = normalizedValue.trim();

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

  if (Array.isArray(normalizedValue)) {
    return normalizedValue
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
                    : Array.isArray(objectItem.hooks)
                      ? normalizeBulletList(objectItem.hooks)
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

  if (normalizedValue && typeof normalizedValue === "object") {
    const objectValue = normalizedValue as Record<string, unknown>;

    if (
      "title" in objectValue ||
      "name" in objectValue ||
      "description" in objectValue ||
      "summary" in objectValue ||
      "analysis" in objectValue ||
      "text" in objectValue
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
                  : Array.isArray(objectValue.steps)
                    ? normalizeBulletList(objectValue.steps)
                    : Array.isArray(objectValue.hooks)
                      ? normalizeBulletList(objectValue.hooks)
                      : [],
        },
      ];
    }

    return Object.entries(objectValue).flatMap(([key, nestedValue], index) => {
      const unwrappedNested = unwrapStructuredValue(nestedValue);

      if (Array.isArray(unwrappedNested)) {
        return [
          {
            title: key,
            summary: "",
            bullets: normalizeBulletList(unwrappedNested),
          },
        ];
      }

      if (unwrappedNested && typeof unwrappedNested === "object") {
        const nestedObject = unwrappedNested as Record<string, unknown>;
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
                    : Array.isArray(nestedObject.steps)
                      ? normalizeBulletList(nestedObject.steps)
                      : Array.isArray(nestedObject.hooks)
                        ? normalizeBulletList(nestedObject.hooks)
                        : [],
          },
        ];
      }

      if (typeof unwrappedNested === "string") {
        return [
          {
            title: key,
            summary: unwrappedNested,
            bullets: [],
          },
        ];
      }

      return [];
    });
  }

  return [];
}

function getMatchScore(report: ReportRecord, clientName: string, clientId: string) {
  const reportClientId = normalizeValue(report.client_id);
  const reportClientName = normalizeValue(report.client_name);
  const normalizedName = normalizeValue(clientName);
  const normalizedId = normalizeValue(clientId);

  if (!reportClientId && !reportClientName) return 0;

  const values = [reportClientId, reportClientName].filter(Boolean);

  if (values.includes(normalizedId) || values.includes(normalizedName)) return 100;
  if (values.some((value) => value.includes(normalizedId) || normalizedId.includes(value))) return 80;
  if (values.some((value) => value.includes(normalizedName) || normalizedName.includes(value))) return 70;

  const nameWords = normalizedName.split(/\s+/).filter(Boolean);
  const matchedWords = nameWords.filter((word) => values.some((value) => value.includes(word)));

  if (matchedWords.length > 0) return 40 + matchedWords.length;

  return 0;
}

function SectionCard({
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
    <section className="rounded-[28px] border border-[#1E1E1E] bg-[#141414] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{ background: `${accent}14`, borderColor: `${accent}28`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="mt-1 text-sm text-[#8B93A7]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Pill({
  label,
  accent,
}: {
  label: string;
  accent: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium"
      style={{
        color: accent,
        background: `${accent}12`,
        borderColor: `${accent}26`,
      }}
    >
      {label}
    </span>
  );
}

function InsightList({
  items,
  accent,
}: {
  items: string[];
  accent: string;
}) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="rounded-2xl border border-[#222222] bg-[#101010] p-4"
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <p className="text-sm leading-relaxed text-[#D1D5DB]">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScenarioCard({
  scenario,
  index,
}: {
  scenario: ScenarioInsight;
  index: number;
}) {
  return (
    <div className="rounded-3xl border border-[#222222] bg-[#101010] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6B7280]">
            Сценарий {index + 1}
          </p>
          <h5 className="mt-1 text-base font-semibold text-white">
            {scenario.title || `Сценарий ${index + 1}`}
          </h5>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
          <Lightbulb className="h-4 w-4" />
        </div>
      </div>

      {scenario.summary ? (
        <p className="mb-4 text-sm leading-relaxed text-[#C9D1E1]">
          {scenario.summary}
        </p>
      ) : null}

      {scenario.bullets.length > 0 ? (
        <div className="space-y-2.5">
          {scenario.bullets.map((bullet, bulletIndex) => (
            <div
              key={`${scenario.title}-${bulletIndex}`}
              className="flex items-start gap-2.5 rounded-2xl border border-[#1C1C1C] bg-[#151515] px-3 py-3"
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

function ReportShowcase({
  report,
  label,
}: {
  report: ReportRecord;
  label: string;
}) {
  const trends = getItemsArray(report.trends);
  const competitors = getItemsArray(report.competitors);
  const scenarios = parseScenarioInsights(report.scenarios);

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill label={label} accent="#A78BFA" />
              {report.status ? <Pill label={report.status} accent="#38BDF8" /> : null}
            </div>
            <h3 className="text-xl font-semibold text-white">
              {report.client_name || report.client_id || "Отчёт по трендам"}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8B93A7]">
              Красивое представление трендов, конкурентов и сценариев для выбранного клиента.
            </p>
          </div>

          {report.generated_at ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#222222] bg-[#101010] px-4 py-2 text-xs text-[#8B93A7]">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(report.generated_at).toLocaleString("ru-RU")}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Актуальные тренды"
          subtitle="Что сейчас лучше всего цепляет внимание аудитории."
          icon={<Flame className="h-5 w-5" />}
          accent="#A78BFA"
        >
          {trends.length > 0 ? (
            <InsightList items={trends} accent="#A78BFA" />
          ) : (
            <p className="text-sm text-[#6B7280]">Тренды пока не найдены.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Конкуренты и ориентиры"
          subtitle="Кого стоит отслеживать и какие идеи можно адаптировать."
          icon={<Target className="h-5 w-5" />}
          accent="#38BDF8"
        >
          {competitors.length > 0 ? (
            <InsightList items={competitors} accent="#38BDF8" />
          ) : (
            <p className="text-sm text-[#6B7280]">Конкуренты пока не найдены.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Сценарии для контента"
        subtitle="Готовые идеи и направления, которые можно брать в работу."
        icon={<Sparkles className="h-5 w-5" />}
        accent="#34D399"
      >
        {scenarios.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {scenarios.map((scenario, index) => (
              <ScenarioCard
                key={`${report.id}-${scenario.title}-${index}`}
                scenario={scenario}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">Сценарии пока не найдены.</p>
        )}
      </SectionCard>
    </div>
  );
}

export function TrendwatcherTab({ data }: { data: ClientData }) {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const localReports = reportsRows as ReportRecord[];

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

      const matchedReports = allReports
        .map((report) => ({
          report,
          score: getMatchScore(report, data.client.name, data.client.id),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.report);

      if (matchedReports.length > 0) {
        setReports(matchedReports);
      } else {
        setReports([]);
      }

      setIsLoadingReports(false);
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [data.client.id, data.client.name]);

  const visibleReports = useMemo(() => {
    if (reports.length > 0) return reports;
    return localReports;
  }, [reports, localReports]);

  const heroLabel = reports.length > 0 ? "Данные из Supabase" : "Подготовленный отчёт";

  return (
    <div className="animate-fade-in space-y-5 p-4 sm:p-6">
      <div className="rounded-[32px] border border-[#1E1E1E] bg-[#131720] p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
              <ClipboardList className="h-3.5 w-3.5" />
              ИИ Трендвотчер
            </div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Инсайты для {data.client.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8B93A7] sm:text-base">
              Подборка конкурентных идей, трендов и контент-сценариев в понятном и аккуратном формате.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Тренды", value: visibleReports[0] ? getItemsArray(visibleReports[0].trends).length : 0, color: "#A78BFA" },
              { label: "Конкуренты", value: visibleReports[0] ? getItemsArray(visibleReports[0].competitors).length : 0, color: "#38BDF8" },
              { label: "Сценарии", value: visibleReports[0] ? parseScenarioInsights(visibleReports[0].scenarios).length : 0, color: "#34D399" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-[#1E1E1E] bg-[#101010] p-4"
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}25`,
                  }}
                >
                  <TrendingUp className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-[#8B93A7]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoadingReports ? (
        <div className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7280]" />
          </div>
        </div>
      ) : visibleReports.length > 0 ? (
        <div className="space-y-6">
          {visibleReports.map((report, index) => (
            <ReportShowcase
              key={report.id}
              report={report}
              label={index === 0 ? heroLabel : `Дополнительный отчёт #${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#2A2A2A]" />
          <p className="mt-3 text-sm text-[#6B7280]">Для этого клиента пока нет оформленных инсайтов.</p>
        </div>
      )}
    </div>
  );
}