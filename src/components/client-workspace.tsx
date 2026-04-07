"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { ClientHeader } from "@/components/client-header";
import { SmmTab } from "@/components/tabs/smm-tab";
import { TrendwatcherTab } from "@/components/tabs/trendwatcher-tab";
import { ControllerTab } from "@/components/tabs/controller-tab";
import type { ClientData } from "@/lib/mock-data";

const tabs = [
  { id: "smm", label: "ИИ СММ", icon: Sparkles, color: "#A78BFA" },
  { id: "trends", label: "ИИ Трендвотчер", icon: TrendingUp, color: "#38BDF8" },
  { id: "controller", label: "Контроллер", icon: BarChart3, color: "#34D399" },
];

export function ClientWorkspace({ data }: { data: ClientData }) {
  const [activeTab, setActiveTab] = useState("smm");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <ClientHeader client={data.client} />

      {/* Tab bar */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-4 border-b border-[#1A1A1A]">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all duration-200"
                style={{
                  color: isActive ? tab.color : "#6B7280",
                  background: isActive ? `${tab.color}08` : "transparent",
                  borderBottom: isActive ? `2px solid ${tab.color}` : "2px solid transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "smm" && <SmmTab data={data} />}
        {activeTab === "trends" && <TrendwatcherTab data={data} />}
        {activeTab === "controller" && <ControllerTab data={data} />}
      </div>
    </div>
  );
}
