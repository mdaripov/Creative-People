"use client";

import { AlertTriangle, CheckCircle2, Siren, type LucideIcon } from "lucide-react";
import { getHealthMeta, type HealthStatus } from "@/lib/manager-dashboard";

const iconMap: Record<HealthStatus, LucideIcon> = {
  green: CheckCircle2,
  yellow: AlertTriangle,
  red: Siren,
};

interface StatusBadgeProps {
  status: HealthStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const meta = getHealthMeta(status);
  const Icon = iconMap[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
      style={{
        color: meta.color,
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label ?? meta.label}
    </span>
  );
}