"use client";

import { useState } from "react";
import { Sparkles, FolderCheck, Linkedin, TrendingUp, BarChart3 } from "lucide-react";
import { ClientHeader } from "@/components/client-header";
import { SmmChatTab } from "@/components/tabs/smm-chat-tab";
import { SmmApprovedTab } from "@/components/tabs/smm-approved-tab";
import { LinkedInTab } from "@/components/tabs/linkedin-tab";
import { TrendwatcherTab } from "@/components/tabs/trendwatcher-tab";
import { ControllerTab } from "@/components/tabs/controller-tab";
import type { ClientData } from "@/lib/mock-data";

const tabs = [
  { id: "trends", label: "ИИ Трендвотчер", icon: TrendingUp, color: "#38BDF8" },
  { id: "smm-chat", label: "ИИ СММ", icon: Sparkles, color: "#A78BFA" },
  { id: "smm-approved", label: "ИИ СММ (утверждено)", icon: FolderCheck, color: "#FBBF24" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#38BDF8" },
  { id: "controller", label: "Контроллер", icon: BarChart3, color: "#34D399" },
];

export function ClientWorkspace({ data }: { data: ClientData }) {
  const [activeTab, setActiveTab] = useState("trends");

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <ClientHeader client={data.client} />

      <div className="flex-shrink-0 border-b border-[#1A1A1A] px-4 pt-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200"
                style={{
                  color: isActive ? tab.color : "#8B93A7",
                  background: isActive ? `${tab.color}12` : "#121212",
                  borderColor: isActive ? `${tab.color}35` : "#1E1E1E",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "trends" && <TrendwatcherTab data={data} />}
        {activeTab === "smm-chat" && <SmmChatTab data={data} />}
        {activeTab === "smm-approved" && <SmmApprovedTab data={data} />}
        {activeTab === "linkedin" && <LinkedInTab data={data} />}
        {activeTab === "controller" && <ControllerTab data={data} />}
      </div>
    </div>
  );
}