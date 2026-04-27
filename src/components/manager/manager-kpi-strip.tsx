"use client";

import { Activity, AlertTriangle, Building2, ShieldAlert, Users, type LucideIcon } from "lucide-react";
import type { ManagerKpiItem } from "@/lib/manager-dashboard";

const iconMap: Record<string, LucideIcon> = {
  "active-companies": Building2,
  "green-zone": Activity,
  "yellow-red-zone": AlertTriangle,
  "specialists-working": Users,
  "without-report": ShieldAlert,
  "controller-escalations": ShieldAlert,
};

interface ManagerKpiStripProps {
  items: ManagerKpiItem[];
}

function getToneStyles(tone: ManagerKpiItem["tone"]) {
  if (tone === "green") {
    return {
      color: "#34D399",
      bg: "rgba(52,211,153,0.10)",
      border: "rgba(52,211,153,0.24)",
    };
  }

  if (tone === "yellow") {
    return {
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.24)",
    };
  }

  if (tone === "red") {
    return {
      color: "#F87171",
      bg: "rgba(248,113,113,0.10)",
      border: "rgba(248,113,113,0.24)",
    };
  }

  return {
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.24)",
  };
}

export function ManagerKpiStrip({ items }: ManagerKpiStripProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const styles = getToneStyles(item.tone);
        const Icon = iconMap[item.id] ?? Activity;

        return (
          <div
            key={item.id}
            className="rounded-[28px] border bg-[#151515] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
            style={{ borderColor: "#242424" }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                color: styles.color,
                background: styles.bg,
                borderColor: styles.border,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-semibold tracking-tight text-white">{item.value}</p>
            <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#8B93A7]">{item.note}</p>
          </div>
        );
      })}
    </div>
  );
}