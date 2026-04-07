export type ClientStatus = "active" | "paused" | "review";

export interface Client {
  id: string;
  name: string;
  industry: string;
  status: ClientStatus;
  platforms: string[];
  avatarColor: string;
  lastActive: string;
}

export interface ContentPost {
  id: string;
  type: "reel" | "post" | "story" | "carousel";
  topic: string;
  caption: string;
  platform: string;
  date: string;
  approved: boolean;
}

export interface VideoTZ {
  id: string;
  title: string;
  duration: string;
  scenes: string[];
  references: string[];
  approved: boolean;
}

export interface EditorTZ {
  id: string;
  title: string;
  style: string;
  music: string;
  transitions: string;
  effects: string[];
  approved: boolean;
}

export interface Trend {
  id: string;
  platform: string;
  title: string;
  description: string;
  source: string;
  date: string;
  relevance: "high" | "medium" | "low";
  category: string;
}

export interface WeeklyTracker {
  week: string;
  tasks: Array<{ name: string; done: boolean }>;
}

export interface QualityReportItem {
  criterion: string;
  score: number;
  maxScore: number;
}

export interface SubscriberGrowthData {
  month: string;
  instagram: number;
  linkedin: number;
  tiktok: number;
}

export interface BestReel {
  title: string;
  views: number;
  likes: number;
  saves: number;
  analysis: string;
}

export interface NextMonthPlan {
  items: string[];
}

export interface LinkedInPost {
  id: string;
  preview: string;
  scheduledDate: string;
  status: "published" | "scheduled" | "draft";
  reach?: number;
  engagement?: number;
}

export interface LinkedInStats {
  published: number;
  scheduled: number;
  totalReach: number;
}

export interface ClientData {
  client: Client;
  contentPosts: ContentPost[];
  videoTZList: VideoTZ[];
  editorTZList: EditorTZ[];
  trends: Trend[];
  weeklyTracker: WeeklyTracker[];
  qualityReport: QualityReportItem[];
  subscriberGrowth: SubscriberGrowthData[];
  bestReel: BestReel;
  nextMonthPlan: NextMonthPlan;
  linkedInPosts: LinkedInPost[];
  linkedInStats: LinkedInStats;
}

export const clients: Client[] = [
  { id: "nike", name: "Nike", industry: "Спорт", status: "active", platforms: ["Instagram", "TikTok", "LinkedIn"], avatarColor: "#FF5722", lastActive: "2 часа назад" },
  { id: "adidas", name: "Adidas", industry: "Спорт", status: "active", platforms: ["Instagram", "YouTube"], avatarColor: "#2196F3", lastActive: "5 часов назад" },
  { id: "zara", name: "Zara", industry: "Мода", status: "paused", platforms: ["Instagram"], avatarColor: "#9C27B0", lastActive: "1 день назад" },
  { id: "hm", name: "H&M", industry: "Мода", status: "review", platforms: ["Instagram", "TikTok"], avatarColor: "#4CAF50", lastActive: "3 часа назад" },
  { id: "apple", name: "Apple", industry: "Технологии", status: "active", platforms: ["YouTube", "LinkedIn"], avatarColor: "#607D8B", lastActive: "1 час назад" },
];

function getAvatarColor(name: string) {
  const palette = ["#A78BFA", "#38BDF8", "#34D399", "#F472B6", "#F59E0B", "#8B5CF6"];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

const makeData = (clientName: string, clientId?: string): ClientData => {
  const existingClient = clients.find((c) => c.name === clientName);

  const client: Client =
    existingClient ?? {
      id: clientId ?? clientName.toLowerCase().replace(/\s+/g, "-"),
      name: clientName,
      industry: "Клиент",
      status: "active",
      platforms: ["Instagram", "TikTok", "LinkedIn"],
      avatarColor: getAvatarColor(clientName),
      lastActive: "только что",
    };

  return {
    client,
    contentPosts: [
      { id: `${client.id}-p1`, type: "reel", topic: `Утренняя рутина с ${clientName}`, caption: "Начни день правильно!", platform: "Instagram", date: "10 апр", approved: false },
      { id: `${client.id}-p2`, type: "carousel", topic: "5 причин выбрать нас", caption: "Листай карточки 👉", platform: "Instagram", date: "13 апр", approved: false },
      { id: `${client.id}-p3`, type: "post", topic: "За кулисами", caption: "Смотри как создаётся качество", platform: "LinkedIn", date: "15 апр", approved: false },
      { id: `${client.id}-p4`, type: "story", topic: "Опрос", caption: "Голосуй!", platform: "Instagram", date: "17 апр", approved: false },
      { id: `${client.id}-p5`, type: "reel", topic: "Челлендж", caption: "Присоединяйся!", platform: "TikTok", date: "20 апр", approved: false },
    ],
    videoTZList: [
      { id: `${client.id}-v1`, title: "Рилс «Утренняя рутина»", duration: "30–45 сек", scenes: ["Крупный план продукта", "Человек просыпается", "Использование продукта", "Улыбка", "Лого + слоган"], references: ["https://instagram.com/p/example1"], approved: false },
      { id: `${client.id}-v2`, title: "Рилс «Тренд-челлендж»", duration: "15–20 сек", scenes: ["Переход с лого", "Участник", "Продукт", "CTA"], references: ["https://tiktok.com/@trend/video/2"], approved: false },
    ],
    editorTZList: [
      { id: `${client.id}-e1`, title: "Монтаж «Утренняя рутина»", style: "Динамичный, ритмичный", music: "Трек без слов, 120–130 BPM", transitions: "Jump cut, fade", effects: ["Цветокоррекция", "Субтитры", "Анимированный лого"], approved: false },
      { id: `${client.id}-e2`, title: "Монтаж «Тренд-челлендж»", style: "Быстрый, энергичный", music: "Трендовый аудио", transitions: "Whip pan, zoom", effects: ["Яркая цветокоррекция", "Стикеры", "Звуковые эффекты"], approved: false },
    ],
    trends: [
      { id: `${client.id}-t1`, platform: "TikTok", title: "GRWM", description: "Формат набирает 2M+ просмотров", source: "TikTok Creative Center", date: "5 апр 2025", relevance: "high", category: "Формат" },
      { id: `${client.id}-t2`, platform: "Instagram", title: "Карусели с ценностью", description: "Охват в 3× выше", source: "Later.com", date: "3 апр 2025", relevance: "high", category: "Контент" },
      { id: `${client.id}-t3`, platform: "LinkedIn", title: "Личные истории", description: "ER в 5× выше", source: "LinkedIn Insights", date: "1 апр 2025", relevance: "medium", category: "Тон" },
      { id: `${client.id}-t4`, platform: "TikTok", title: "POV-видео", description: "Вовлечённость на 40% выше", source: "Sprout Social", date: "28 мар 2025", relevance: "high", category: "Формат" },
      { id: `${client.id}-t5`, platform: "Instagram", title: "Микро-блогеры", description: "Конверсия в 3× выше", source: "HypeAuditor", date: "25 мар 2025", relevance: "medium", category: "Стратегия" },
      { id: `${client.id}-t6`, platform: "YouTube", title: "Shorts до 60 сек", description: "Удержание 70%+", source: "YouTube Creator", date: "20 мар 2025", relevance: "low", category: "Платформа" },
    ],
    weeklyTracker: [
      { week: "1-я неделя", tasks: [{ name: "Согласовать контент-план", done: true }, { name: "Снять рилс", done: true }, { name: "Выложить пост", done: false }] },
      { week: "2-я неделя", tasks: [{ name: "Монтаж видео", done: false }, { name: "Согласовать с клиентом", done: false }] },
    ],
    qualityReport: [
      { criterion: "Соответствие ТЗ", score: 8, maxScore: 10 },
      { criterion: "Соблюдение сроков", score: 9, maxScore: 10 },
      { criterion: "Качество исполнения", score: 7, maxScore: 10 },
      { criterion: "Вовлечённость аудитории", score: 6, maxScore: 10 },
    ],
    subscriberGrowth: [
      { month: "Янв", instagram: 1200, linkedin: 800, tiktok: 0 },
      { month: "Фев", instagram: 1350, linkedin: 850, tiktok: 200 },
      { month: "Мар", instagram: 1500, linkedin: 920, tiktok: 450 },
      { month: "Апр", instagram: 1700, linkedin: 1000, tiktok: 700 },
    ],
    bestReel: {
      title: "Утренняя рутина",
      views: 15400,
      likes: 2300,
      saves: 450,
      analysis: "Хороший хук в первые 2 секунды, высокий показатель сохранений.",
    },
    nextMonthPlan: {
      items: ["Запустить серию GRWM", "Снять 2 коллаборации", "Увеличить частоту постов до 5 в неделю"],
    },
    linkedInPosts: [
      {
        id: `${client.id}-li-1`,
        preview: `Как ${clientName} использует контент-маркетинг для роста узнаваемости бренда`,
        scheduledDate: "18 апр, 10:00",
        status: "draft",
      },
      {
        id: `${client.id}-li-2`,
        preview: `3 вывода из последней рекламной кампании ${clientName} и что они значат для B2B-аудитории`,
        scheduledDate: "21 апр, 12:30",
        status: "scheduled",
      },
      {
        id: `${client.id}-li-3`,
        preview: `Почему короткие форматы дают лучший first-touch для брендов в 2025`,
        scheduledDate: "11 апр, 09:00",
        status: "published",
        reach: 12600,
        engagement: 4.8,
      },
    ],
    linkedInStats: {
      published: 14,
      scheduled: 6,
      totalReach: 84200,
    },
  };
};

export function createClientData(clientId: string, clientName: string): ClientData {
  return makeData(clientName, clientId);
}

export const allClientsData: Record<string, ClientData> = {
  nike: makeData("Nike"),
  adidas: makeData("Adidas"),
  zara: makeData("Zara"),
  hm: makeData("H&M"),
  apple: makeData("Apple"),
};