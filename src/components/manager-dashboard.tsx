"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useManagerDashboard } from "@/hooks/use-manager-dashboard";
import { ManagerKpiStrip } from "@/components/manager/manager-kpi-strip";
import { AttentionPanel } from "@/components/manager/attention-panel";
import { CompanyHealthGrid } from "@/components/manager/company-health-grid";
import { TeamOverview } from "@/components/manager/team-overview";
import { ControllerOverview } from "@/components/manager/controller-overview";

interface ManagerDashboardProps {
  onOpenClient: (id: string) => void;
}

export function ManagerDashboard({ onOpenClient }: ManagerDashboardProps) {
  const { data, loading, controllerTablesMissing } = useManagerDashboard();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F0F0F]">
        <Loader2 className="h-7 w-7 animate-spin text-[#8B93A7]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F0F0F] p-6">
        <div className="rounded-[32px] border border-[#1E1E1E] bg-[#151515] p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-[#6B7280]" />
          <p className="mt-3 text-sm text-[#8B93A7]">
            Пока нет данных для управленческого dashboard.
          </p>
        </div>
      </div>
    );
  }

  const openCompany = (companyId: string) => {
    onOpenClient(companyId);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="rounded-[32px] border border-[#1E1E1E] bg-[#13151A] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-4 py-1.5 text-[11px] font-semibold text-[#7DD3FC]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Executive overview
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Управленческий dashboard руководителя
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#9FA8BB] sm:text-base">
              Быстрый обзор по компаниям, SMM-специалистам и контроллеру, чтобы за несколько секунд видеть,
              где всё идёт по плану, а где требуется вмешательство.
            </p>
          </div>
        </div>

        <ManagerKpiStrip items={data.kpis} />

        <AttentionPanel
          items={data.attentionItems}
          onOpenCompany={openCompany}
          onFocusSpecialist={() => undefined}
        />

        <CompanyHealthGrid companies={data.companies} onOpenCompany={openCompany} />

        <TeamOverview specialists={data.specialists} onOpenCompany={openCompany} />

        <ControllerOverview
          controller={data.controller}
          onOpenCompany={openCompany}
          controllerTablesMissing={controllerTablesMissing}
        />
      </div>
    </div>
  );
}