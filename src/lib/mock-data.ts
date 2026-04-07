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

// Добавлено: интерфейс для трекера публикаций
export interface WeeklyTracker {
  week: string;
  tasks: Array<{ name: string; done: boolean }>;
}

// Добавлено: ClientData теперь включает трекер
export interface ClientData {
  client: Client;
  contentPosts: ContentPost[];
  videoTZList: VideoTZ[];
  editorTZList: EditorTZ[];
  trends: Trend[];
  weeklyTracker: WeeklyTracker[];
}

// Остальной код без изменений...