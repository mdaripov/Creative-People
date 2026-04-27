"use client";

import { Briefcase, LogOut, Sparkles, UserCircle2 } from "lucide-react";

type MainView = "mentor" | "clients" | "cabinet";

interface DashboardNavProps {
  mainView: MainView;
  onClientsClick: () => void;
  onMentorClick: () => void;
  onCabinetClick: () => void;
  onSignOut: () => void;
}

const items = [
  {
    id: "clients" as const,
    label: "Клиенты",
    description: "Все клиенты",
    icon: Briefcase,
    color: "#38BDF8",
  },
  {
    id: "mentor" as const,
    label: "ИИ СММ наставник",
    description: "Наставник",
    icon: Sparkles,
    color: "#A78BFA",
  },
  {
    id: "cabinet" as const,
    label: "Личный кабинет",
    description: "Мой профиль",
    icon: UserCircle2,
    color: "#34D399",
  },
];

export function DashboardNav({
  mainView,
  onClientsClick,
  onMentorClick,
  onCabinetClick,
  onSignOut,
}: DashboardNavProps) {
  const handleClick = (id: MainView) => {
    if (id === "clients") onClientsClick();
    if (id === "mentor") onMentorClick();
    if (id === "cabinet") onCabinetClick();
  };

  return (
    <div className="border-b border-[#1A1A1A] px-3 py-3 sm:px-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = mainView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="min-w-fit rounded-2xl border px-4 py-3 text-left transition-all duration-200"
              style={{
                borderColor: active ? `${item.color}40` : "#222222",
                background: active ? `${item.color}12` : "#151515",
                color: active ? "#FFFFFF" : "#C9D1E1",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: active ? `${item.color}35` : "#2A2A2A",
                    background: active ? `${item.color}16` : "#1A1A1A",
                    color: item.color,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold whitespace-nowrap">{item.label}</p>
                  <p className="text-[11px] text-[#8B93A7] whitespace-nowrap">{item.description}</p>
                </div>
              </div>
            </button>
          );
        })}

        <button
          onClick={onSignOut}
          className="ml-auto inline-flex min-w-fit items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 text-sm font-semibold text-[#C9D1E1] transition-all duration-200 hover:bg-[#1A1A1A] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </div>
  );
}