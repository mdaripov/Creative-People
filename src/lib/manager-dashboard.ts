import { createClientData } from "@/lib/mock-data";

export type HealthStatus = "green" | "yellow" | "red";

export interface ManagerKpiItem {
  id: string;
  label: string;
  value: number;
  tone: HealthStatus | "neutral";
  note: string;
}

export interface ManagerCompanyStatus {
  companyId: string;
  companyName: string;
  assignedSpecialistId: string | null;
  assignedSpecialistName: string;
  reportSubmittedToday: boolean;
  weeklyPlanTotal: number;
  weeklyPlanDone: number;
  healthStatus: HealthStatus;
  alertReasons: string[];
  lastUpdate: string;
  controllerEscalation: boolean;
  controllerFlag: boolean;
  kpi: {
    reach: number;
    growth: number;
    leads: number;
  };
}

export interface ManagerSpecialistStatus {
  specialistId: string;
  specialistName: string;
  roleLabel: string;
  clients: Array<{ id: string; name: string; healthStatus: HealthStatus }>;
  reportsTodayCount: number;
  weeklyTasksDone: number;
  weeklyTasksTotal: number;
  totalTrackedMinutes: number;
  totalReportEntries: number;
  disciplineStatus: "stable" | "warning" | "risk";
  riskStatus: HealthStatus;
  alertReasons: string[];
}

export interface ManagerControllerAction {
  id: string;
  type: "plan" | "flag" | "escalation" | "report";
  companyName: string;
  specialistName: string;
  label: string;
  createdAt: string;
  tone: HealthStatus;
}

export interface ManagerControllerStatus {
  totalPlans: number;
  completedPlans: number;
  pendingPlans: number;
  escalationsCount: number;
  flaggedCompanies: ManagerCompanyStatus[];
  recentControllerActions: ManagerControllerAction[];
}

export interface ManagerDashboardData {
  kpis: ManagerKpiItem[];
  companies: ManagerCompanyStatus[];
  specialists: ManagerSpecialistStatus[];
  controller: ManagerControllerStatus;
  attentionItems: Array<{
    id: string;
    title: string;
    description: string;
    tone: HealthStatus;
    companyId?: string;
    specialistId?: string;
  }>;
}

interface ProfileRecord {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: "smm_specialist" | "manager";
}

interface ClientRecord {
  id: string;
  name: string;
  smm_specialist_id: string | null;
}

interface WorkReportRecord {
  id: string;
  specialist_id: string;
  client_name: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface ControllerPlanRecord {
  id: string;
  client_id: string;
  specialist_id: string;
  week_start: string;
  created_at: string;
}

interface ControllerTaskRecord {
  id: string;
  plan_id: string;
  client_id: string;
  specialist_id: string;
  title: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

function toFullName(profile: ProfileRecord | undefined) {
  if (!profile) return "Не назначен";
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return name || "Без имени";
}

function isToday(value: string) {
  return value === new Date().toISOString().split("T")[0];
}

function getWeekStartDate(date = new Date()) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value.toISOString().split("T")[0];
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

function durationBetween(start: string, end: string) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return Math.max(endMinutes - startMinutes, 0);
}

export function getHealthMeta(status: HealthStatus) {
  if (status === "green") {
    return {
      label: "Зелёная зона",
      color: "#34D399",
      bg: "rgba(52,211,153,0.10)",
      border: "rgba(52,211,153,0.24)",
    };
  }

  if (status === "yellow") {
    return {
      label: "Жёлтая зона",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.24)",
    };
  }

  return {
    label: "Красная зона",
    color: "#F87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.24)",
  };
}

export function formatTrackedTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getProgressPercent(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function computeCompanyHealth(input: {
  reportSubmittedToday: boolean;
  weeklyPlanDone: number;
  weeklyPlanTotal: number;
  controllerEscalation: boolean;
  controllerFlag: boolean;
}) {
  const reasons: string[] = [];
  const progress = getProgressPercent(input.weeklyPlanDone, input.weeklyPlanTotal);

  if (!input.reportSubmittedToday) {
    reasons.push("Нет отчёта сегодня");
  }

  if (input.weeklyPlanTotal > 0 && input.weeklyPlanDone === 0) {
    reasons.push(`0/${input.weeklyPlanTotal} задач выполнено`);
  } else if (
    input.weeklyPlanTotal > 0 &&
    input.weeklyPlanDone < input.weeklyPlanTotal
  ) {
    reasons.push(`${input.weeklyPlanDone}/${input.weeklyPlanTotal} задач выполнено`);
  }

  if (input.controllerEscalation) {
    reasons.push("Есть эскалация от контроллера");
  } else if (input.controllerFlag) {
    reasons.push("Контроллер отметил проблему");
  }

  if (!input.reportSubmittedToday || input.controllerEscalation) {
    return {
      healthStatus: "red" as HealthStatus,
      alertReasons: reasons,
    };
  }

  if (
    input.weeklyPlanTotal > 0 &&
    (progress < 100 || input.controllerFlag)
  ) {
    return {
      healthStatus: "yellow" as HealthStatus,
      alertReasons: reasons,
    };
  }

  return {
    healthStatus: "green" as HealthStatus,
    alertReasons: reasons.length ? reasons : ["План выполняется и отчёт есть"],
  };
}

export function buildManagerDashboardData(input: {
  clients: ClientRecord[];
  profiles: ProfileRecord[];
  workReports: WorkReportRecord[];
  controllerPlans: ControllerPlanRecord[];
  controllerTasks: ControllerTaskRecord[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const currentWeekStart = getWeekStartDate();

  const specialistProfiles = input.profiles.filter((profile) => profile.role === "smm_specialist");

  const companies = input.clients.map<ManagerCompanyStatus>((client) => {
    const specialist = specialistProfiles.find((profile) => profile.id === client.smm_specialist_id);
    const clientReports = input.workReports.filter((report) => report.client_name === client.name);
    const reportsToday = clientReports.filter((report) => report.date === today);

    const plan = input.controllerPlans.find(
      (item) => item.client_id === client.id && item.week_start === currentWeekStart
    );

    const planTasks = plan
      ? input.controllerTasks.filter((task) => task.plan_id === plan.id)
      : [];

    const weeklyPlanTotal = planTasks.length;
    const weeklyPlanDone = planTasks.filter((task) => task.done).length;
    const reportSubmittedToday = reportsToday.length > 0;
    const controllerEscalation = weeklyPlanTotal > 0 && weeklyPlanDone === 0;
    const controllerFlag =
      weeklyPlanTotal > 0 && weeklyPlanDone < weeklyPlanTotal;

    const health = computeCompanyHealth({
      reportSubmittedToday,
      weeklyPlanDone,
      weeklyPlanTotal,
      controllerEscalation,
      controllerFlag,
    });

    const mockData = createClientData(client.id, client.name);
    const reach = mockData.linkedInStats.totalReach;
    const growth = mockData.subscriberGrowth.at(-1)?.instagram ?? 0;
    const leads = Math.max(Math.round(reach / 900), 0);

    const lastUpdate =
      reportsToday[0]?.created_at ??
      clientReports[0]?.created_at ??
      plan?.created_at ??
      "Нет обновлений";

    return {
      companyId: client.id,
      companyName: client.name,
      assignedSpecialistId: specialist?.id ?? null,
      assignedSpecialistName: toFullName(specialist),
      reportSubmittedToday,
      weeklyPlanTotal,
      weeklyPlanDone,
      healthStatus: health.healthStatus,
      alertReasons: health.alertReasons,
      lastUpdate,
      controllerEscalation,
      controllerFlag,
      kpi: {
        reach,
        growth,
        leads,
      },
    };
  });

  const specialists = specialistProfiles.map<ManagerSpecialistStatus>((profile) => {
    const specialistClients = companies.filter(
      (company) => company.assignedSpecialistId === profile.id
    );
    const specialistReports = input.workReports.filter(
      (report) => report.specialist_id === profile.id
    );
    const reportsTodayCount = specialistReports.filter((report) => isToday(report.date)).length;

    const specialistTasks = input.controllerTasks.filter(
      (task) => task.specialist_id === profile.id
    );
    const weeklyTasks = specialistTasks.filter((task) => {
      const plan = input.controllerPlans.find((item) => item.id === task.plan_id);
      return plan?.week_start === currentWeekStart;
    });

    const weeklyTasksDone = weeklyTasks.filter((task) => task.done).length;
    const weeklyTasksTotal = weeklyTasks.length;
    const totalTrackedMinutes = specialistReports.reduce(
      (sum, report) => sum + durationBetween(report.start_time, report.end_time),
      0
    );

    const alertReasons: string[] = [];
    let riskStatus: HealthStatus = "green";

    if (specialistClients.some((company) => company.healthStatus === "red")) {
      alertReasons.push("Есть компании в красной зоне");
      riskStatus = "red";
    }

    if (reportsTodayCount === 0) {
      alertReasons.push("Нет отчётов за сегодня");
      riskStatus = "red";
    } else if (weeklyTasksTotal > 0 && weeklyTasksDone < weeklyTasksTotal) {
      alertReasons.push("Не все недельные задачи закрыты");
      riskStatus = riskStatus === "red" ? "red" : "yellow";
    }

    const disciplineStatus =
      riskStatus === "red"
        ? "risk"
        : riskStatus === "yellow"
        ? "warning"
        : "stable";

    return {
      specialistId: profile.id,
      specialistName: toFullName(profile),
      roleLabel: "SMM специалист",
      clients: specialistClients.map((client) => ({
        id: client.companyId,
        name: client.companyName,
        healthStatus: client.healthStatus,
      })),
      reportsTodayCount,
      weeklyTasksDone,
      weeklyTasksTotal,
      totalTrackedMinutes,
      totalReportEntries: specialistReports.length,
      disciplineStatus,
      riskStatus,
      alertReasons:
        alertReasons.length > 0 ? alertReasons : ["Работа идёт стабильно"],
    };
  });

  const redCompanies = companies.filter((company) => company.healthStatus === "red");
  const yellowCompanies = companies.filter((company) => company.healthStatus === "yellow");
  const greenCompanies = companies.filter((company) => company.healthStatus === "green");

  const controllerPlansCurrentWeek = input.controllerPlans.filter(
    (plan) => plan.week_start === currentWeekStart
  );

  const controllerSummary: ManagerControllerStatus = {
    totalPlans: controllerPlansCurrentWeek.length,
    completedPlans: controllerPlansCurrentWeek.filter((plan) => {
      const planTasks = input.controllerTasks.filter((task) => task.plan_id === plan.id);
      return planTasks.length > 0 && planTasks.every((task) => task.done);
    }).length,
    pendingPlans: controllerPlansCurrentWeek.filter((plan) => {
      const planTasks = input.controllerTasks.filter((task) => task.plan_id === plan.id);
      return planTasks.length === 0 || planTasks.some((task) => !task.done);
    }).length,
    escalationsCount: companies.filter((company) => company.controllerEscalation).length,
    flaggedCompanies: companies.filter(
      (company) => company.controllerFlag || company.controllerEscalation
    ),
    recentControllerActions: companies
      .filter((company) => company.controllerFlag || company.controllerEscalation || !company.reportSubmittedToday)
      .slice(0, 6)
      .map((company, index) => ({
        id: `${company.companyId}-${index}`,
        type: company.controllerEscalation
          ? "escalation"
          : company.controllerFlag
          ? "flag"
          : "report",
        companyName: company.companyName,
        specialistName: company.assignedSpecialistName,
        label: company.controllerEscalation
          ? "Контроллер поднял эскалацию"
          : company.controllerFlag
          ? "Контроллер отметил риск по плану"
          : "Система видит отсутствие отчёта",
        createdAt: company.lastUpdate,
        tone: company.controllerEscalation
          ? "red"
          : company.controllerFlag
          ? "yellow"
          : "red",
      })),
  };

  const attentionItems = [
    ...redCompanies.map((company) => ({
      id: `company-${company.companyId}`,
      title: company.companyName,
      description: company.alertReasons[0] ?? "Требуется проверка компании",
      tone: "red" as HealthStatus,
      companyId: company.companyId,
    })),
    ...specialists
      .filter((specialist) => specialist.riskStatus !== "green")
      .map((specialist) => ({
        id: `specialist-${specialist.specialistId}`,
        title: specialist.specialistName,
        description: specialist.alertReasons[0] ?? "Есть риск по дисциплине",
        tone: specialist.riskStatus,
        specialistId: specialist.specialistId,
      })),
  ].slice(0, 8);

  const kpis: ManagerKpiItem[] = [
    {
      id: "active-companies",
      label: "Активных компаний",
      value: companies.length,
      tone: "neutral",
      note: "в поле зрения руководителя",
    },
    {
      id: "green-zone",
      label: "В зелёной зоне",
      value: greenCompanies.length,
      tone: "green",
      note: "есть отчёт и план в порядке",
    },
    {
      id: "yellow-red-zone",
      label: "В зоне риска",
      value: yellowCompanies.length + redCompanies.length,
      tone: redCompanies.length > 0 ? "red" : "yellow",
      note: "жёлтые и красные компании",
    },
    {
      id: "specialists-working",
      label: "SMM в работе",
      value: specialists.length,
      tone: "neutral",
      note: "активная команда",
    },
    {
      id: "without-report",
      label: "Без отчёта за сегодня",
      value: companies.filter((company) => !company.reportSubmittedToday).length,
      tone: companies.some((company) => !company.reportSubmittedToday) ? "red" : "green",
      note: "компании без дневного отчёта",
    },
    {
      id: "controller-escalations",
      label: "Эскалации контроллера",
      value: controllerSummary.escalationsCount,
      tone: controllerSummary.escalationsCount > 0 ? "red" : "green",
      note: "нужна реакция руководителя",
    },
  ];

  return {
    kpis,
    companies,
    specialists,
    controller: controllerSummary,
    attentionItems,
  } satisfies ManagerDashboardData;
}