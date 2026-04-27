"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CircleAlert,
  Filter,
  LineChart,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import {
  getProgressPercent,
  type HealthStatus,
  type ManagerCompanyStatus,
} from "@/lib/manager-dashboard";
import { StatusBadge } from "@/components/manager/status-badge";

interface CompanyHealthGridProps {
  companies: ManagerCompanyStatus[];
  onOpenCompany: (companyId: string) => void;
}

type SortMode = "risk" | "name" | "progress";

export function CompanyHealthGrid({
  companies,
  onOpenCompany,
}: CompanyHealthGridProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | HealthStatus>("all");
  const [specialistFilter, setSpecialistFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("risk");
  const [search, setSearch] = useState("");

  const specialists = useMemo(() => {
    return Array.from(
      new Set(companies.map((company) => company.assignedSpecialistName).filter(Boolean))
    );
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const filtered = companies.filter((company) => {
      const matchesStatus =
        statusFilter === "all" || company.healthStatus === statusFilter;
      const matchesSpecialist =
        specialistFilter === "all" || company.assignedSpecialistName === specialistFilter;
      const matchesSearch =
        company.companyName.toLowerCase().includes(search.toLowerCase()) ||
        company.assignedSpecialistName.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSpecialist && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortMode === "name") {
        return a.companyName.localeCompare(b.companyName, "ru");
      }

      if (sortMode === "progress") {
        return (
          getProgressPercent(b.weeklyPlanDone, b.weeklyPlanTotal) -
          getProgressPercent(a.weeklyPlanDone, a.weeklyPlanTotal)
        );
      }

      const score = { red: 0, yellow: 1, green: 2 };
      return score[a.healthStatus] - score[b.healthStatus];
    });
  }, [companies, search, sortMode, specialistFilter, statusFilter]);

  return (
    <section className="rounded-[32px] border border-[#1E1E1E] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC]">
            <LineChart className="h-3.5 w-3.5" />
            Состояние компаний
          </div>
          <h2 className="text-xl font-semibold text-white">Компании под управлением</h2>
          <p className="mt-1 text-sm text-[#8B93A7]">
            Быстрая оценка отчётов, недельного плана, KPI и замечаний контроллера.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск компании"
              className="h-11 w-full rounded-2xl border border-[#262626] bg-[#101010] pl-10 pr-3 text-sm text-white outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | HealthStatus)}
            className="h-11 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
          >
            <option value="all">Все статусы</option>
            <option value="green">Зелёные</option>
            <option value="yellow">Жёлтые</option>
            <option value="red">Красные</option>
          </select>

          <select
            value={specialistFilter}
            onChange={(event) => setSpecialistFilter(event.target.value)}
            className="h-11 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
          >
            <option value="all">Все SMM</option>
            {specialists.map((specialist) => (
              <option key={specialist} value={specialist}>
                {specialist}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-11 rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
          >
            <option value="risk">Сортировка по риску</option>
            <option value="name">По названию</option>
            <option value="progress">По прогрессу</option>
          </select>
        </div>
      </div>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#101010] px-3 py-1.5 text-xs text-[#B6C0D4]">
        <Filter className="h-3.5 w-3.5 text-[#38BDF8]" />
        Показано компаний: {filteredCompanies.length}
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredCompanies.map((company) => {
            const progress = getProgressPercent(
              company.weeklyPlanDone,
              company.weeklyPlanTotal
            );

            return (
              <button
                key={company.companyId}
                onClick={() => onOpenCompany(company.companyId)}
                className="rounded-[28px] border border-[#232323] bg-[#181818] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/30 hover:bg-[#191C22]"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{company.companyName}</p>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-[#B6C0D4]">
                      <UserRound className="h-4 w-4 text-[#38BDF8]" />
                      {company.assignedSpecialistName}
                    </div>
                  </div>
                  <StatusBadge status={company.healthStatus} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Отчёт за сегодня
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {company.reportSubmittedToday ? "Есть отчёт" : "Нет отчёта"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Последний апдейт
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{company.lastUpdate}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#242424] bg-[#111111] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#B6C0D4]">
                    <span>Недельный план</span>
                    <span>
                      {company.weeklyPlanDone}/{company.weeklyPlanTotal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background:
                          company.healthStatus === "green"
                            ? "#34D399"
                            : company.healthStatus === "yellow"
                            ? "#FBBF24"
                            : "#F87171",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Охват
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {company.kpi.reach.toLocaleString("ru-RU")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Рост
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      +{company.kpi.growth.toLocaleString("ru-RU")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#242424] bg-[#111111] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                      Лиды
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {company.kpi.leads}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {company.alertReasons.slice(0, 2).map((reason) => (
                    <div
                      key={reason}
                      className="flex items-start gap-2 rounded-2xl border border-[#252525] bg-[#111111] px-3 py-2.5"
                    >
                      {company.controllerEscalation || company.healthStatus === "red" ? (
                        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F87171]" />
                      ) : (
                        <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FBBF24]" />
                      )}
                      <p className="text-sm text-[#D1D5DB]">{reason}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#38BDF8]">
                  Открыть workspace
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#111111] p-8 text-center text-sm text-[#8B93A7]">
          По выбранным фильтрам компании не найдены.
        </div>
      )}
    </section>
  );
}