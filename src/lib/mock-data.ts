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

export interface ClientData {
  client: Client;
  contentPosts: ContentPost[];
  videoTZList: VideoTZ[];
  editorTZList: EditorTZ[];
  trends: Trend[];
}

export const clients: Client[] = [
  {
    id: "nike",
    name: "Nike",
    industry: "Спорт / Ритейл",
    status: "active",
    platforms: ["Instagram", "LinkedIn", "TikTok"],
    avatarColor: "#E11D48",
    lastActive: "Сегодня, 14:32",
  },
  {
    id: "adidas",
    name: "Adidas",
    industry: "Спорт / Мода",
    status: "active",
    platforms: ["Instagram", "TikTok"],
    avatarColor: "#2563EB",
    lastActive: "Сегодня, 11:15",
  },
  {
    id: "zara",
    name: "Zara",
    industry: "Мода / Ритейл",
    status: "paused",
    platforms: ["Instagram", "Pinterest"],
    avatarColor: "#7C3AED",
    lastActive: "Вчера, 18:00",
  },
  {
    id: "hm",
    name: "H&M",
    industry: "Мода / Масс-маркет",
    status: "review",
    platforms: ["Instagram", "LinkedIn"],
    avatarColor: "#D97706",
    lastActive: "2 дня назад",
  },
  {
    id: "apple",
    name: "Apple",
    industry: "Технологии",
    status: "active",
    platforms: ["Instagram", "LinkedIn", "YouTube"],
    avatarColor: "#059669",
    lastActive: "Сегодня, 09:45",
  },
];

const makeData = (clientName: string): ClientData => {
  const client = clients.find((c) => c.name === clientName)!;
  return {
    client,
    contentPosts: [
      {
        id: `${client.id}-p1`,
        type: "reel",
        topic: `Утренняя рутина с ${clientName}`,
        caption: `Начни день правильно 🔥 Наш новый продукт поможет тебе зарядиться энергией с самого утра. Свайпай и узнай больше! #${clientName} #lifestyle`,
        platform: "Instagram",
        date: "10 апр",
        approved: false,
      },
      {
        id: `${client.id}-p2`,
        type: "carousel",
        topic: "5 причин выбрать нас",
        caption: `Почему тысячи людей доверяют ${clientName}? Листай карточки и узнай 5 главных причин 👉 #качество #бренд`,
        platform: "Instagram",
        date: "13 апр",
        approved: false,
      },
      {
        id: `${client.id}-p3`,
        type: "post",
        topic: "За кулисами производства",
        caption: `Мы открываем двери нашего производства. Посмотри, как создаётся качество, которому ты доверяешь. #${clientName} #behindthescenes`,
        platform: "LinkedIn",
        date: "15 апр",
        approved: false,
      },
      {
        id: `${client.id}-p4`,
        type: "story",
        topic: "Опрос: ваш любимый продукт",
        caption: `Голосуй за свой фаворит! Результаты покажем в конце недели 🗳️`,
        platform: "Instagram",
        date: "17 апр",
        approved: false,
      },
      {
        id: `${client.id}-p5`,
        type: "reel",
        topic: "Тренд-челлендж апреля",
        caption: `Мы приняли вызов! Присоединяйся к челленджу и отмечай нас 🎯 #challenge #trend`,
        platform: "TikTok",
        date: "20 апр",
        approved: false,
      },
    ],
    videoTZList: [
      {
        id: `${client.id}-v1`,
        title: "Рилс «Утренняя рутина»",
        duration: "30–45 сек",
        scenes: [
          "Крупный план продукта на столе (3 сек)",
          "Человек просыпается, тянется (5 сек)",
          "Использование продукта — динамичная нарезка (15 сек)",
          "Улыбка, выход из кадра (5 сек)",
          "Лого + слоган на финале (5 сек)",
        ],
        references: [
          "https://instagram.com/p/example1",
          "https://tiktok.com/@example/video/1",
        ],
        approved: false,
      },
      {
        id: `${client.id}-v2`,
        title: "Рилс «Тренд-челлендж»",
        duration: "15–20 сек",
        scenes: [
          "Быстрый переход с логотипом (2 сек)",
          "Участник выполняет движение (8 сек)",
          "Продукт в кадре крупно (3 сек)",
          "CTA: «Повтори и отметь нас» (4 сек)",
        ],
        references: ["https://tiktok.com/@trend/video/2"],
        approved: false,
      },
    ],
    editorTZList: [
      {
        id: `${client.id}-e1`,
        title: "Монтаж «Утренняя рутина»",
        style: "Динамичный, ритмичный монтаж под бит",
        music: "Трек без слов, 120–130 BPM, лицензия CC0",
        transitions: "Jump cut между сценами, плавный fade на финале",
        effects: [
          "Цветокоррекция: тёплые тона (+10 температура)",
          "Субтитры белым шрифтом снизу",
          "Анимированный логотип на финале (0.5 сек появление)",
        ],
        approved: false,
      },
      {
        id: `${client.id}-e2`,
        title: "Монтаж «Тренд-челлендж»",
        style: "Быстрый, энергичный, вирусный стиль",
        music: "Трендовый аудио с TikTok (указан в ТЗ видеографа)",
        transitions: "Whip pan переходы, zoom in на продукт",
        effects: [
          "Яркая цветокоррекция (насыщенность +20)",
          "Текстовые стикеры в стиле TikTok",
          "Звуковые эффекты на переходах",
        ],
        approved: false,
      },
    ],
    trends: [
      {
        id: `${client.id}-t1`,
        platform: "TikTok",
        title: "Get Ready With Me (GRWM)",
        description: `Формат «собираюсь вместе с тобой» набирает 2M+ просмотров в нише ${clientName}. Аутентичность и закулисье — ключ.`,
        source: "TikTok Creative Center",
        date: "5 апр 2025",
        relevance: "high",
        category: "Формат",
      },
      {
        id: `${client.id}-t2`,
        platform: "Instagram",
        title: "Карусели с ценностью",
        description:
          "Образовательные карусели «5 фактов / советов» дают охват в 3× выше обычных постов. Алгоритм продвигает сохранения.",
        source: "Later.com Research",
        date: "3 апр 2025",
        relevance: "high",
        category: "Контент",
      },
      {
        id: `${client.id}-t3`,
        platform: "LinkedIn",
        title: "Личные истории основателей",
        description:
          "Посты от лица CEO с личной историей получают ER в 5× выше корпоративных. Тренд на человечность бренда.",
        source: "LinkedIn Insights",
        date: "1 апр 2025",
        relevance: "medium",
        category: "Тон",
      },
      {
        id: `${client.id}-t4`,
        platform: "TikTok",
        title: "POV-видео",
        description:
          "«Точка зрения» — съёмка от первого лица. Вовлечённость на 40% выше стандартных рилс. Особенно работает в lifestyle.",
        source: "Sprout Social",
        date: "28 мар 2025",
        relevance: "high",
        category: "Формат",
      },
      {
        id: `${client.id}-t5`,
        platform: "Instagram",
        title: "Коллаборации с микро-блогерами",
        description:
          "Блогеры 10K–50K дают конверсию в 3× выше макро. Аудитория доверяет «своим». Бюджет ниже, ROI выше.",
        source: "HypeAuditor 2025",
        date: "25 мар 2025",
        relevance: "medium",
        category: "Стратегия",
      },
      {
        id: `${client.id}-t6`,
        platform: "YouTube",
        title: "Shorts до 60 секунд",
        description:
          "YouTube Shorts с хуком в первые 2 секунды показывают удержание 70%+. Алгоритм активно продвигает короткий формат.",
        source: "YouTube Creator Academy",
        date: "20 мар 2025",
        relevance: "low",
        category: "Платформа",
      },
    ],
  };
};

export const allClientsData: Record<string, ClientData> = {
  nike: makeData("Nike"),
  adidas: makeData("Adidas"),
  zara: makeData("Zara"),
  hm: makeData("H&M"),
  apple: makeData("Apple"),
};
