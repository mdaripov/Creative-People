"use client";

import { Palette, Linkedin, BarChart3, Users } from "lucide-react";

const agents = [
  {
    icon: Palette,
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.1)",
    border: "rgba(167, 139, 250, 0.2)",
    title: "Креативный директор",
    description: "Анализирует тренды, генерирует идеи для съёмок и создаёт полный препродакшен-пакет для вашего контента.",
  },
  {
    icon: Linkedin,
    color: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.1)",
    border: "rgba(56, 189, 248, 0.2)",
    title: "LinkedIn-менеджер",
    description: "Адаптирует контент для LinkedIn, управляет очередью публикаций и отслеживает вовлечённость аудитории.",
  },
  {
    icon: BarChart3,
    color: "#34D399",
    bg: "rgba(52, 211, 153, 0.1)",
    border: "rgba(52, 211, 153, 0.2)",
    title: "Контролёр и аналитик",
    description: "Отслеживает выполнение плана, формирует отчёты для руководства и клиентов с визуализацией роста.",
  },
];

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Icon */}
      <div className="mb-6 relative">
        <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
          <Users className="w-9 h-9 text-[#3A3A3A]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#34D399] flex items-center justify-center">
          <span className="text-[8px] font-bold text-black">AI</span>
        </div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-semibold text-white mb-2">
        Выберите клиента
      </h2>
      <p className="text-sm text-[#6B7280] text-center max-w-sm mb-10">
        Выберите клиента из боковой панели, чтобы открыть его рабочее пространство с тремя AI-агентами
      </p>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.title}
              className="rounded-2xl p-5 border animate-fade-in-up"
              style={{
                background: agent.bg,
                borderColor: agent.border,
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: agent.bg, border: `1px solid ${agent.border}` }}
              >
                <Icon className="w-5 h-5" style={{ color: agent.color }} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">
                {agent.title}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {agent.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
