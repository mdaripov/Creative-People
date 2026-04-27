"use client";

import { Briefcase, Sparkles, UserCircle2 } from "lucide-react";

type MainView = "mentor" | "clients" | "cabinet";

interface EmptyStateProps {
  onSelectView: (view: MainView) => void;
}

const items = [
  {
    id: "clients" as const,
    title: "Клиенты",
    description: "Откройте список всех клиентов и начните работу по нужному проекту.",
    icon: Briefcase,
    color: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.10)",
    border: "rgba(56, 189, 248, 0.24)",
  },
  {
    id: "mentor" as const,
    title: "ИИ СММ наставник",
    description: "Перейдите в чат с наставником для идей, стратегии и рекомендаций.",
    icon: Sparkles,
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.10)",
    border: "rgba(167, 139, 250, 0.24)",
  },
  {
    id: "cabinet" as const,
    title: "Личный кабинет",
    description: "Посмотрите закреплённых клиентов и своё персональное рабочее пространство.",
    icon: UserCircle2,
    color: "#34D399",
    bg: "rgba(52, 211, 153, 0.10)",
    border: "rgba(52, 211, 153, 0.24)",
  },
];

export function EmptyState({ onSelectView }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#1E1E1E] bg-[#131313] p-6 sm:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-4 py-1.5 text-[11px] font-medium text-[#C4B5FD]">
              AI SMM Workspace
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Единая система для управления клиентами, наставником и личным кабинетом
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#8B93A7] sm:text-base">
              Выберите нужный раздел, чтобы перейти к клиентам, открыть ИИ СММ наставника
              или зайти в личный кабинет специалиста.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {items.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className="group rounded-[28px] border p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:bg-[#171717] animate-fade-in-up"
                  style={{
                    background: "#151515",
                    borderColor: item.border,
                    animationDelay: `${index * 0.08}s`,
                    opacity: 0,
                  }}
                >
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl border"
                    style={{
                      background: item.bg,
                      borderColor: item.border,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>

                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8B93A7]">
                    {item.description}
                  </p>

                  <div
                    className="mt-5 inline-flex rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: item.bg,
                      color: item.color,
                      border: `1px solid ${item.border}`,
                    }}
                  >
                    Открыть раздел
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}