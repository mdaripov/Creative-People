export type ReportRecord = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  generated_at: string | null;
  status: string | null;
  analysis: unknown;
  competitors: unknown;
  trends: unknown;
  scenarios: unknown;
};

export type TrendPriority = "high" | "medium" | "low";
export type ViewMode = "overview" | "detailed";

export interface NormalizedTrendItem {
  id: string;
  title: string;
  platform: string;
  category: string;
  freshness: string;
  whyItMatters: string;
  source: string;
  priority: TrendPriority;
  action: string;
  rawText: string;
}

export interface NormalizedCompetitorItem {
  id: string;
  name: string;
  platform: string;
  source: string;
  observation: string;
  insight: string;
  recommendation: string;
  differentiation: string;
  rawText: string;
}

export interface NormalizedScenarioItem {
  id: string;
  title: string;
  format: string;
  platform: string;
  hook: string;
  structure: string;
  cta: string;
  expectedEffect: string;
  bullets: string[];
  status: "ready" | "adapt" | "raw";
  rawText: string;
}

export interface NormalizedReportSummary {
  totalInsights: number;
  priorityInsights: number;
  readyToTest: number;
  primaryFocus: string;
  updatedLabel: string;
  sourceLabel: string;
}

export interface NormalizedReport {
  id: string;
  title: string;
  status: string;
  generatedAt: string | null;
  analysis: string;
  trends: NormalizedTrendItem[];
  competitors: NormalizedCompetitorItem[];
  scenarios: NormalizedScenarioItem[];
  summary: NormalizedReportSummary;
}

const PRIORITY_ORDER: TrendPriority[] = ["high", "medium", "low"];

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return [];
}

function normalizeValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeMatchText(value: string | null | undefined) {
  return normalizeValue(value)
    .replace(/[_-]+/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"'’”“?<>@+|[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeaningfulWords(value: string) {
  return normalizeMatchText(value)
    .split(" ")
    .filter((word) => word.length >= 3);
}

export function getMatchScore(report: ReportRecord, clientName: string, clientId: string) {
  const reportClientId = normalizeMatchText(report.client_id);
  const reportClientName = normalizeMatchText(report.client_name);
  const normalizedName = normalizeMatchText(clientName);
  const normalizedId = normalizeMatchText(clientId);

  if (!reportClientId && !reportClientName) return 0;

  const values = [reportClientId, reportClientName].filter(Boolean);

  if (values.includes(normalizedId) || values.includes(normalizedName)) return 100;
  if (values.some((value) => value.includes(normalizedId) || normalizedId.includes(value))) return 92;
  if (values.some((value) => value.includes(normalizedName) || normalizedName.includes(value))) return 88;

  const nameWords = getMeaningfulWords(normalizedName);
  const idWords = getMeaningfulWords(normalizedId);
  const reportWords = new Set(values.flatMap((value) => getMeaningfulWords(value)));

  const matchedNameWords = nameWords.filter((word) => reportWords.has(word));
  const matchedIdWords = idWords.filter((word) => reportWords.has(word));
  const totalMatches = new Set([...matchedNameWords, ...matchedIdWords]).size;

  if (totalMatches >= 3) return 80;
  if (totalMatches === 2) return 68;
  if (totalMatches === 1) return 52;

  const compactName = normalizedName.replace(/\s+/g, "");
  const compactReportValues = values.map((value) => value.replace(/\s+/g, ""));

  if (
    compactReportValues.some(
      (value) =>
        value.includes(compactName) ||
        compactName.includes(value)
    )
  ) {
    return 60;
  }

  return 0;
}

export function unwrapStructuredValue(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const objectValue = value as Record<string, unknown>;

  if ("scenarios" in objectValue) return objectValue.scenarios;
  if ("scenario_analytics" in objectValue) return objectValue.scenario_analytics;
  if ("analytics" in objectValue) return objectValue.analytics;
  if ("trends" in objectValue) return objectValue.trends;
  if ("competitors" in objectValue) return objectValue.competitors;
  if ("analysis" in objectValue) return objectValue.analysis;
  if ("data" in objectValue) return unwrapStructuredValue(objectValue.data);
  if ("report" in objectValue) return unwrapStructuredValue(objectValue.report);
  if ("result" in objectValue) return unwrapStructuredValue(objectValue.result);
  if ("output" in objectValue) return unwrapStructuredValue(objectValue.output);

  return value;
}

function decodeWrappedJsonString(value: string) {
  let current = value.trim();

  for (let i = 0; i < 4; i += 1) {
    if (!current) return current;

    const looksJson =
      (current.startsWith("[") && current.endsWith("]")) ||
      (current.startsWith("{") && current.endsWith("}")) ||
      (current.startsWith("\"[") && current.endsWith("]\"")) ||
      (current.startsWith("\"{") && current.endsWith("}\""));

    if (!looksJson) return current;

    try {
      const parsed = JSON.parse(current);
      if (typeof parsed === "string") {
        current = parsed.trim();
        continue;
      }
      return parsed;
    } catch {
      return current;
    }
  }

  return current;
}

export function parseUnknownJson(value: string) {
  return decodeWrappedJsonString(value);
}

export function prettifyKey(key: string) {
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
    category: "Категория",
    relevance: "Приоритет",
    recommendation: "Рекомендация",
    expected_result: "Ожидаемый эффект",
    difficulty: "Сложность",
    status: "Статус",
    content: "Контент",
    metadata: "Метаданные",
    link: "Ссылка",
    links: "Ссылки",
  };

  if (dictionary[key]) return dictionary[key];

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function splitLongText(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\s{2,}/g, " ")
    .split(/\n{2,}|(?<=\.)\s+(?=[A-ZА-ЯЁ0-9«"(\[])/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatObjectToRichText(value: Record<string, unknown>) {
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
    "link",
    "links",
    "hook",
    "script",
    "cta",
    "recommendation",
    "expected_result",
    "status",
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
        const chunks = splitLongText(raw);
        if (chunks.length <= 1) {
          return `**${label}:** ${raw}`;
        }

        return `**${label}:**\n${chunks.map((chunk) => `- ${chunk}`).join("\n")}`;
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

function normalizeAny(value: unknown): unknown {
  const unwrapped = unwrapStructuredValue(value);
  return typeof unwrapped === "string" ? parseUnknownJson(unwrapped) : unwrapped;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const text = safeString(value);
    if (text) return text;
  }
  return "";
}

function extractPriority(value: Record<string, unknown>): TrendPriority {
  const raw = normalizeValue(
    firstNonEmpty(value.relevance, value.priority, value.status, value.label)
  );

  if (raw.includes("high") || raw.includes("выс") || raw.includes("важ") || raw.includes("hot")) {
    return "high";
  }
  if (raw.includes("med") || raw.includes("сред")) {
    return "medium";
  }
  return "low";
}

function actionByPriority(priority: TrendPriority) {
  if (priority === "high") return "Использовать в контенте";
  if (priority === "medium") return "Проверить у клиента";
  return "Отложить";
}

function derivePrimaryFocus(report: {
  analysis: string;
  trends: NormalizedTrendItem[];
  competitors: NormalizedCompetitorItem[];
  scenarios: NormalizedScenarioItem[];
}) {
  if (report.analysis) {
    const firstLine = splitLongText(report.analysis)[0];
    if (firstLine) return firstLine;
  }

  const topTrend = [...report.trends].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  )[0];

  if (topTrend) {
    return `${topTrend.platform || "Контент"}: ${topTrend.title}`;
  }

  if (report.scenarios[0]) {
    return `Сначала протестировать сценарий «${report.scenarios[0].title}»`;
  }

  if (report.competitors[0]) {
    return `Проверить подход конкурента ${report.competitors[0].name}`;
  }

  return "Новых приоритетов пока не найдено";
}

function normalizeTrendItem(item: unknown, index: number): NormalizedTrendItem {
  if (typeof item === "string") {
    const textChunks = splitLongText(item);
    return {
      id: `trend-${index}`,
      title: textChunks[0] || `Тренд ${index + 1}`,
      platform: "Все платформы",
      category: "Инсайт",
      freshness: "Без даты",
      whyItMatters: textChunks.slice(1).join("\n\n") || item,
      source: "Не указан",
      priority: "medium",
      action: "Проверить у клиента",
      rawText: item,
    };
  }

  const objectItem = asObject(item);

  if (!objectItem) {
    const rawText = String(item);
    const textChunks = splitLongText(rawText);
    return {
      id: `trend-${index}`,
      title: textChunks[0] || `Тренд ${index + 1}`,
      platform: "Все платформы",
      category: "Инсайт",
      freshness: "Без даты",
      whyItMatters: textChunks.slice(1).join("\n\n") || rawText,
      source: "Не указан",
      priority: "medium",
      action: "Проверить у клиента",
      rawText,
    };
  }

  const title = firstNonEmpty(objectItem.title, objectItem.name, objectItem.topic, objectItem.headline) || `Тренд ${index + 1}`;
  const platform = firstNonEmpty(objectItem.platform, objectItem.channel) || "Все платформы";
  const category = firstNonEmpty(objectItem.category, objectItem.type, objectItem.format) || "Тренд";
  const freshness = firstNonEmpty(objectItem.date, objectItem.freshness, objectItem.updated_at) || "Без даты";
  const whyItMatters =
    firstNonEmpty(
      objectItem.why_works,
      objectItem.why_viral,
      objectItem.summary,
      objectItem.description,
      objectItem.analysis,
      objectItem.insight,
      objectItem.text,
      objectItem.content
    ) || "Инсайт без пояснения";
  const source = firstNonEmpty(
    objectItem.source,
    objectItem.website,
    objectItem.instagram,
    objectItem.tiktok,
    objectItem.link
  ) || "Не указан";
  const priority = extractPriority(objectItem);
  const rawText = formatObjectToRichText(objectItem);

  return {
    id: safeString(objectItem.id) || `trend-${index}`,
    title,
    platform,
    category,
    freshness,
    whyItMatters: splitLongText(whyItMatters).join("\n\n"),
    source,
    priority,
    action: actionByPriority(priority),
    rawText,
  };
}

function normalizeCompetitorItem(item: unknown, index: number): NormalizedCompetitorItem {
  if (typeof item === "string") {
    const textChunks = splitLongText(item);
    return {
      id: `competitor-${index}`,
      name: textChunks[0] || `Ориентир ${index + 1}`,
      platform: "Не указана",
      source: "Не указан",
      observation: textChunks.slice(1).join("\n\n") || item,
      insight: "Нужна ручная интерпретация",
      recommendation: "Проверить и адаптировать под клиента",
      differentiation: "Не копировать напрямую",
      rawText: item,
    };
  }

  const objectItem = asObject(item);

  if (!objectItem) {
    const rawText = String(item);
    const textChunks = splitLongText(rawText);
    return {
      id: `competitor-${index}`,
      name: textChunks[0] || `Ориентир ${index + 1}`,
      platform: "Не указана",
      source: "Не указан",
      observation: textChunks.slice(1).join("\n\n") || rawText,
      insight: "Нужна ручная интерпретация",
      recommendation: "Проверить и адаптировать под клиента",
      differentiation: "Не копировать напрямую",
      rawText,
    };
  }

  const name = firstNonEmpty(objectItem.name, objectItem.title, objectItem.source) || `Ориентир ${index + 1}`;
  const platform = firstNonEmpty(
    objectItem.platform,
    objectItem.channel,
    objectItem.instagram ? "Instagram" : "",
    objectItem.tiktok ? "TikTok" : "",
    objectItem.website ? "Website" : ""
  ) || "Не указана";
  const source = firstNonEmpty(
    objectItem.source,
    objectItem.website,
    objectItem.instagram,
    objectItem.tiktok,
    objectItem.link
  ) || "Не указан";
  const observation =
    firstNonEmpty(
      objectItem.description,
      objectItem.summary,
      objectItem.analysis,
      objectItem.text,
      objectItem.content
    ) || "Наблюдение не распознано";
  const insight =
    firstNonEmpty(objectItem.why_works, objectItem.why_viral, objectItem.insight) || "Что сработало, нужно уточнить";
  const recommendation =
    firstNonEmpty(objectItem.recommendation, objectItem.adaptation, objectItem.hook, objectItem.cta) || "Адаптировать подход под бренд клиента";
  const differentiation =
    firstNonEmpty(objectItem.risk, objectItem.comment, objectItem.note) || "Сохранять отличие по тону и подаче";
  const rawText = formatObjectToRichText(objectItem);

  return {
    id: safeString(objectItem.id) || `competitor-${index}`,
    name,
    platform,
    source,
    observation: splitLongText(observation).join("\n\n"),
    insight: splitLongText(insight).join("\n\n"),
    recommendation: splitLongText(recommendation).join("\n\n"),
    differentiation: splitLongText(differentiation).join("\n\n"),
    rawText,
  };
}

function deriveScenarioStatus(item: Record<string, unknown>) {
  const status = normalizeValue(firstNonEmpty(item.status, item.difficulty, item.readiness));

  if (status.includes("ready") || status.includes("готов")) return "ready";
  if (status.includes("adapt") || status.includes("нуж")) return "adapt";
  return "raw";
}

function normalizeScenarioItem(item: unknown, index: number): NormalizedScenarioItem {
  if (typeof item === "string") {
    const textChunks = splitLongText(item);
    return {
      id: `scenario-${index}`,
      title: textChunks[0] || `Сценарий ${index + 1}`,
      format: "Не указан",
      platform: "Все платформы",
      hook: "",
      structure: textChunks.slice(1).join("\n\n") || item,
      cta: "",
      expectedEffect: "",
      bullets: [],
      status: "raw",
      rawText: item,
    };
  }

  const objectItem = asObject(item);

  if (!objectItem) {
    const rawText = String(item);
    const textChunks = splitLongText(rawText);
    return {
      id: `scenario-${index}`,
      title: textChunks[0] || `Сценарий ${index + 1}`,
      format: "Не указан",
      platform: "Все платформы",
      hook: "",
      structure: textChunks.slice(1).join("\n\n") || rawText,
      cta: "",
      expectedEffect: "",
      bullets: [],
      status: "raw",
      rawText,
    };
  }

  const bullets = [
    ...toArray(objectItem.points),
    ...toArray(objectItem.bullets),
    ...toArray(objectItem.items),
    ...toArray(objectItem.steps),
    ...toArray(objectItem.references),
    ...toArray(objectItem.links),
  ]
    .map((bullet) => {
      if (typeof bullet === "string") return bullet.trim();

      if (typeof bullet === "object" && bullet) {
        return formatObjectToRichText(bullet as Record<string, unknown>);
      }

      return String(bullet);
    })
    .filter(Boolean);

  const rawText = formatObjectToRichText(objectItem);

  return {
    id: safeString(objectItem.id) || `scenario-${index}`,
    title: firstNonEmpty(objectItem.title, objectItem.name, objectItem.topic) || `Сценарий ${index + 1}`,
    format: firstNonEmpty(objectItem.format, objectItem.type) || "Не указан",
    platform: firstNonEmpty(objectItem.platform, objectItem.channel) || "Все платформы",
    hook: splitLongText(firstNonEmpty(objectItem.hook, objectItem.headline)).join("\n\n"),
    structure: splitLongText(
      firstNonEmpty(
        objectItem.script,
        objectItem.summary,
        objectItem.description,
        objectItem.text,
        objectItem.content
      ) || rawText
    ).join("\n\n"),
    cta: splitLongText(firstNonEmpty(objectItem.cta, objectItem.recommendation)).join("\n\n"),
    expectedEffect: splitLongText(
      firstNonEmpty(objectItem.expected_result, objectItem.expectedEffect, objectItem.analysis)
    ).join("\n\n"),
    bullets,
    status: deriveScenarioStatus(objectItem),
    rawText,
  };
}

function getCollection(value: unknown) {
  const normalized = normalizeAny(value);

  if (Array.isArray(normalized)) return normalized;

  if (typeof normalized === "string") {
    const decoded = parseUnknownJson(normalized);

    if (Array.isArray(decoded)) return decoded;
    if (decoded && typeof decoded === "object") return [decoded];

    return splitLongText(normalized);
  }

  if (normalized && typeof normalized === "object") {
    const objectValue = normalized as Record<string, unknown>;

    if (Array.isArray(objectValue.items)) return objectValue.items;
    if (Array.isArray(objectValue.data)) return objectValue.data;
    if (Array.isArray(objectValue.results)) return objectValue.results;

    return [normalized];
  }

  return [];
}

function normalizeAnalysis(value: unknown) {
  const normalized = normalizeAny(value);

  if (typeof normalized === "string") {
    return splitLongText(normalized).join("\n\n");
  }

  if (Array.isArray(normalized)) {
    return normalized
      .map((item) =>
        typeof item === "string"
          ? item
          : typeof item === "object" && item
            ? formatObjectToRichText(item as Record<string, unknown>)
            : String(item)
      )
      .join("\n\n");
  }

  if (normalized && typeof normalized === "object") {
    return formatObjectToRichText(normalized as Record<string, unknown>);
  }

  return "";
}

function formatUpdatedLabel(date: string | null) {
  if (!date) return "Дата не указана";
  return new Date(date).toLocaleString("ru-RU");
}

export function normalizeReport(report: ReportRecord, sourceLabel: string): NormalizedReport {
  const analysis = normalizeAnalysis(report.analysis);
  const trends = getCollection(report.trends).map(normalizeTrendItem);
  const competitors = getCollection(report.competitors).map(normalizeCompetitorItem);
  const scenarios = getCollection(report.scenarios).map(normalizeScenarioItem);

  const totalInsights = trends.length + competitors.length + scenarios.length + (analysis ? 1 : 0);
  const priorityInsights = trends.filter((item) => item.priority === "high").length;
  const readyToTest = scenarios.filter((item) => item.status === "ready").length;

  return {
    id: report.id,
    title: report.client_name || report.client_id || "Отчёт по трендам",
    status: report.status || "new",
    generatedAt: report.generated_at,
    analysis,
    trends,
    competitors,
    scenarios,
    summary: {
      totalInsights,
      priorityInsights,
      readyToTest,
      primaryFocus: derivePrimaryFocus({ analysis, trends, competitors, scenarios }),
      updatedLabel: formatUpdatedLabel(report.generated_at),
      sourceLabel,
    },
  };
}

export function getPlatformOptions(report: NormalizedReport) {
  const values = new Set<string>();

  report.trends.forEach((item) => values.add(item.platform));
  report.competitors.forEach((item) => values.add(item.platform));
  report.scenarios.forEach((item) => values.add(item.platform));

  return ["Все платформы", ...Array.from(values).filter(Boolean)];
}