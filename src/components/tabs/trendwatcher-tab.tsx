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
import { FormattedRichText } from "@/components/formatted-rich-text";
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

function parseUnknownJson(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return value;

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("\"[") && trimmed.endsWith("]\"")) ||
    (trimmed.startsWith("\"{") && trimmed.endsWith("}\""))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      try {
        return JSON.parse(JSON.parse(trimmed));
      } catch {
        return value;
      }
    }
  }

  return value;
}

function prettifyKey(key: string) {
  const dictionary: Record<string, string> = {
    name: "Название",
    title: "Название",
    topic: "Тема",
    format: "Формат",
    platform: "Платформа",
    description: "Описание",
    summary: "Кратко",
    analysis: "Анализ",
    why_works: "Почему работает",
    why_viral: "Почему вирусится",
    source: "Источник",
    date: "Дата",
    website: "Сайт",
    instagram: "Instagram",
    tiktok: "TikTok",
    hook: "Хук",
    script: "Сценарий",
    cta: "CTA",
    headline: "Заголовок",
    label: "Метка",
    insight: "Инсайт",
    text: "Текст",
  };

  if (dictionary[key]) return dictionary[key];

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatObjectToRichText(value: Record<string, unknown>) {
  const priorityOrder = [
    "name",
    "title",
    "topic",
    "headline",
    "format",
    "platform",
    "description",
    "summary",
    "analysis",
    "why_works",
    "why_viral",
    "source",
    "date",
    "website",
    "instagram",
    "tiktok",
    "hook",
    "script",
    "cta",
  ];

  const entries = Object.entries(value).filter(([, raw]) => {
    if (raw === null || raw === undefined) return false;
    if (typeof raw === "string") return raw.trim().length > 0;
    if (Array.isArray(raw)) return raw.length > 0;
    return true;
  });

  const sortedEntries = entries.sort(([a], [b]) => {
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);

    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

    return safeA - safeB;
  });

  return sortedEntries
    .map(([key, raw]) => {
      const label = prettifyKey(key);

      if (typeof raw === "string") {
        return `**${label}:** ${raw}`;
      }

      if (Array.isArray(raw)) {
        const items = raw
          .map((item) =>
            typeof item === "string"
              ? `- ${item}`
              : typeof item === "object" && item
                ? `- ${formatObjectToRichText(item as Record<string, unknown>).replace(/\n/g, " ")}`
                : `- ${String(item)}`
          )
          .join("\n");

        return `**${label}:**\n${items}`;
      }

      if (typeof raw === "object" && raw) {
        return `**${label}:**\n${formatObjectToRichText(raw as Record<string, unknown>)}`;
      }

      return `**${label}:** ${String(raw)}`;
    })
    .join("\n\n");
}

function getItemsArray(value: unknown): string[] {
  const unwrapped = unwrapStructuredValue(value);
  const parsed = typeof unwrapped === "string" ? parseUnknownJson(unwrapped) : unwrapped;

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return formatObjectToRichText(item as Record<string, unknown>);
        }
        return String(item);
      })
      .filter(Boolean);
  }

  if (typeof parsed === "string") {
    return parsed
      .split(/\n{2,}|•/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (parsed && typeof parsed === "object") {
    return [formatObjectToRichText(parsed as Record<string, unknown>)];
  }

  return [];
}

function parseScenarioInsights(value: unknown): ScenarioInsight[] {
  const normalizedValue = unwrapStructuredValue(value);
  const parsedValue =
    typeof normalizedValue === "string" ? parseUnknownJson(normalizedValue) : normalizedValue;

  const normalizeBulletList = (items: unknown[]): string[] =>
    items
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return formatObjectToRichText(item as Record<string, unknown>);
        }
        return String(item).trim();
      })
      .filter(Boolean);

  if (typeof parsedValue === "string") {
    const trimmed = parsedValue.trim();
    if (!trimmed) return [];

    return trimmed
      .split(/\n{2,}/)
      .map((part, index) => ({
        title: `Сценарий ${index + 1}`,
        summary: part.trim(),
        bullets: [],
      }))
      .filter((item) => item.summary);
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue
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

          const title =
            typeof objectItem.title === "string"
              ? objectItem.title
              : typeof objectItem.name === "string"
                ? objectItem.name
                : typeof objectItem.topic === "string"
                  ? objectItem.topic
                  : `Сценарий ${index + 1}`;

          const summaryParts = [
            typeof objectItem.format === "string" ? `**Формат:** ${objectItem.format}` : "",
            typeof objectItem.platform === "string" ? `**Платформа:** ${objectItem.platform}` : "",
            typeof objectItem.hook === "string" ? `**Хук:** ${objectItem.hook}` : "",
            typeof objectItem.description === "string" ? `**Описание:** ${objectItem.description}` : "",
            typeof objectItem.summary === "string" ? `**Кратко:** ${objectItem.summary}` : "",
            typeof objectItem.script === "string" ? `**Сценарий:** ${objectItem.script}` : "",
            typeof objectItem.cta === "string" ? `**CTA:** ${objectItem.cta}` : "",
          ].filter(Boolean);

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
            summary: summaryParts.join("\n\n"),
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

  if (parsedValue && typeof parsedValue === "object") {
    return [
      {
        title: "Сценарий",
        summary: formatObjectToRichText(parsedValue as Record<string, unknown>),
        bullets: [],
      },
    ];
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
    <section className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="mb-5 flex items-start gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{ background: `${accent}16`, borderColor: `${accent}32`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-[#B6C0D4]">{subtitle}</p>
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
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold"
      style={{
        color: accent,
        background: `${accent}14`,
        borderColor: `${accent}30`,
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
          key={`${index}-${item.slice(0, 40)}`}
          className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4"
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <div className="min-w-0 flex-1">
              <FormattedRichText text={item} accent={accent} />
            </div>
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
    <div className="rounded-3xl border border-[#2A2A2A] bg-[#111111] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.015)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA4B8]">
            Сценарий {index + 1}
          </p>
          <h5 className="mt-1 text-base font-semibold leading-snug text-white">
            {scenario.title || `Сценарий ${index + 1}`}
          </h5>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#34D399]/24 bg-[#34D399]/12 text-[#34D399]">
          <Lightbulb className="h-4 w-4" />
        </div>
      </div>

      {scenario.summary ? (
        <div className="mb-4 rounded-2xl border border-[#242424] bg-[#171717] p-4">
          <FormattedRichText text={scenario.summary} accent="#34D399" />
        </div>
      ) : null}

      {scenario.bullets.length > 0 ? (
        <div className="space-y-2.5">
          {scenario.bullets.map((bullet, bulletIndex) => (
            <div
              key={`${scenario.title}-${bulletIndex}`}
              className="rounded-2xl border border-[#242424] bg-[#181818] px-3 py-3"
            >
              <FormattedRichText text={bullet} accent="#34D399" compact />
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
      <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill label={label} accent="#A78BFA" />
              {report.status ? <Pill label={report.status} accent="#38BDF8" /> : null}
            </div>
            <h3 className="text-xl font-semibold text-white">
              {report.client_name || report.client_id || "Отчёт по трендам"}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#C5CEE0]">
              Подборка сильных идей, конкурентных ориентиров и контент-сценариев для быстрого запуска в работу.
            </p>
          </div>

          {report.generated_at ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#101010] px-4 py-2 text-xs font-medium text-[#C5CEE0]">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(report.generated_at).toLocaleString("ru-RU")}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Актуальные тренды"
          subtitle="Форматы и темы, которые сейчас лучше всего удерживают внимание."
          icon={<Flame className="h-5 w-5" />}
          accent="#A78BFA"
        >
          {trends.length > 0 ? (
            <InsightList items={trends} accent="#A78BFA" />
          ) : (
            <p className="text-sm text-[#B6C0D4]">Тренды пока не найдены.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Конкуренты и ориентиры"
          subtitle="Полезные примеры, на которые можно опираться при планировании."
          icon={<Target className="h-5 w-5" />}
          accent="#38BDF8"
        >
          {competitors.length > 0 ? (
            <InsightList items={competitors} accent="#38BDF8" />
          ) : (
            <p className="text-sm text-[#B6C0D4]">Конкуренты пока не найдены.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Сценарии для контента"
        subtitle="Готовые идеи с понятной подачей, которые можно быстро адаптировать."
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
          <p className="text-sm text-[#B6C0D4]">Сценарии пока не найдены.</p>
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
      <div className="rounded-[32px] border border-[#2A2A2A] bg-[#151A24] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/24 bg-[#38BDF8]/12 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
              <ClipboardList className="h-3.5 w-3.5" />
              ИИ Трендвотчер
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Инсайты для {data.client.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#D1D9E8] sm:text-base">
              Подборка конкурентных идей, трендов и контент-сценариев в более чистом и читаемом формате.
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
                className="rounded-3xl border border-[#2A2A2A] bg-[#101010] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.015)]"
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
                <p className="mt-1 text-xs font-medium text-[#B6C0D4]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoadingReports ? (
        <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#9AA4B8]" />
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
        <div className="rounded-[28px] border border-[#2A2A2A] bg-[#171717] p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#4B5563]" />
          <p className="mt-3 text-sm text-[#C5CEE0]">Для этого клиента пока нет оформленных инсайтов.</p>
        </div>
      )}
    </div>
  );
}