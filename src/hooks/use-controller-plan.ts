"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getReadableAuthError } from "@/lib/auth-error";
import type { AppRole } from "@/lib/auth";

export interface ControllerTask {
  id: string;
  title: string;
  done: boolean;
}

export interface ControllerWeekOption {
  planId: string;
  weekStart: string;
  label: string;
  taskCount: number;
  doneCount: number;
}

function getWeekStartDate(date = new Date()) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value.toISOString().split("T")[0];
}

function formatWeekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  });

  return `${formatter.format(start)} — ${formatter.format(end)}`;
}

function isMissingControllerTableError(message: string) {
  return (
    message.includes("controller_plans") ||
    message.includes("controller_plan_tasks") ||
    message.includes("schema cache")
  );
}

export function useControllerPlan(
  clientId: string,
  userId: string,
  role: AppRole
) {
  const [tasks, setTasks] = useState<ControllerTask[]>([]);
  const [weeks, setWeeks] = useState<ControllerWeekOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getWeekStartDate());
  const [planId, setPlanId] = useState<string | null>(null);

  const currentWeekStart = useMemo(() => getWeekStartDate(), []);

  useEffect(() => {
    setSelectedWeekStart(currentWeekStart);
  }, [clientId, currentWeekStart]);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);

      let planQuery = supabase
        .from("controller_plans")
        .select("id, specialist_id, week_start")
        .eq("client_id", clientId)
        .order("week_start", { ascending: false });

      if (role === "smm_specialist") {
        planQuery = planQuery.eq("specialist_id", userId);
      }

      const { data: planRows, error: planError } = await planQuery;

      if (planError) {
        const message = getReadableAuthError(planError);

        if (isMissingControllerTableError(message)) {
          toast.error("Таблицы плана контроллера ещё не созданы в Supabase.");
          setTasks([]);
          setWeeks([]);
          setPlanId(null);
          setLoading(false);
          return;
        }

        toast.error(message);
        setTasks([]);
        setWeeks([]);
        setPlanId(null);
        setLoading(false);
        return;
      }

      const plans = planRows ?? [];

      if (plans.length === 0) {
        setWeeks([]);
        setTasks([]);
        setPlanId(null);
        setLoading(false);
        return;
      }

      const planIds = plans.map((plan) => plan.id);

      let taskQuery = supabase
        .from("controller_plan_tasks")
        .select("id, title, done, plan_id")
        .in("plan_id", planIds)
        .order("created_at", { ascending: true });

      if (role === "smm_specialist") {
        taskQuery = taskQuery.eq("specialist_id", userId);
      }

      const { data: taskRows, error: taskError } = await taskQuery;

      if (taskError) {
        const message = getReadableAuthError(taskError);

        if (isMissingControllerTableError(message)) {
          toast.error("Таблицы задач контроллера ещё не созданы в Supabase.");
          setTasks([]);
          setWeeks([]);
          setPlanId(null);
          setLoading(false);
          return;
        }

        toast.error(message);
        setTasks([]);
        setWeeks([]);
        setPlanId(null);
        setLoading(false);
        return;
      }

      const groupedTasks = new Map<string, ControllerTask[]>();

      (taskRows ?? []).forEach((task) => {
        const current = groupedTasks.get(task.plan_id) ?? [];
        current.push({
          id: task.id,
          title: task.title,
          done: task.done,
        });
        groupedTasks.set(task.plan_id, current);
      });

      const nextWeeks = plans.map((plan) => {
        const planTasks = groupedTasks.get(plan.id) ?? [];
        const doneCount = planTasks.filter((task) => task.done).length;

        return {
          planId: plan.id,
          weekStart: plan.week_start,
          label: formatWeekLabel(plan.week_start),
          taskCount: planTasks.length,
          doneCount,
        };
      });

      setWeeks(nextWeeks);

      const existingSelected =
        plans.find((plan) => plan.week_start === selectedWeekStart) ??
        plans.find((plan) => plan.week_start === currentWeekStart) ??
        plans[0];

      setSelectedWeekStart(existingSelected.week_start);
      setPlanId(existingSelected.id);
      setTasks(groupedTasks.get(existingSelected.id) ?? []);
      setLoading(false);
    };

    void loadPlans();
  }, [clientId, role, userId, currentWeekStart, selectedWeekStart]);

  const ensurePlan = async () => {
    const existingWeek = weeks.find((week) => week.weekStart === selectedWeekStart);
    if (existingWeek) {
      setPlanId(existingWeek.planId);
      return existingWeek.planId;
    }

    const { data, error } = await supabase
      .from("controller_plans")
      .insert({
        client_id: clientId,
        specialist_id: userId,
        week_start: selectedWeekStart,
      })
      .select("id, week_start")
      .single();

    if (error) {
      const message = getReadableAuthError(error);

      if (isMissingControllerTableError(message)) {
        toast.error("Сначала нужно создать таблицы контроллера в Supabase.");
        return null;
      }

      toast.error(message);
      return null;
    }

    const newWeek = {
      planId: data.id,
      weekStart: data.week_start,
      label: formatWeekLabel(data.week_start),
      taskCount: 0,
      doneCount: 0,
    };

    setWeeks((prev) => [newWeek, ...prev].sort((a, b) => b.weekStart.localeCompare(a.weekStart)));
    setPlanId(data.id);
    return data.id;
  };

  const addTask = async (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setSaving(true);
    const currentPlanId = await ensurePlan();

    if (!currentPlanId) {
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("controller_plan_tasks")
      .insert({
        client_id: clientId,
        plan_id: currentPlanId,
        specialist_id: userId,
        title: trimmed,
        done: false,
      })
      .select("id, title, done")
      .single();

    setSaving(false);

    if (error) {
      const message = getReadableAuthError(error);

      if (isMissingControllerTableError(message)) {
        toast.error("Таблица задач контроллера ещё не создана в Supabase.");
        return;
      }

      toast.error(message);
      return;
    }

    setTasks((prev) => [
      ...prev,
      {
        id: data.id,
        title: data.title,
        done: data.done,
      },
    ]);

    setWeeks((prev) =>
      prev.map((week) =>
        week.planId === currentPlanId
          ? { ...week, taskCount: week.taskCount + 1 }
          : week
      )
    );

    toast.success("Задача добавлена");
  };

  const toggleTask = async (taskId: string) => {
    const current = tasks.find((task) => task.id === taskId);
    if (!current || !planId) return;

    const nextDone = !current.done;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, done: nextDone } : task
      )
    );

    setWeeks((prev) =>
      prev.map((week) =>
        week.planId === planId
          ? {
              ...week,
              doneCount: week.doneCount + (nextDone ? 1 : -1),
            }
          : week
      )
    );

    const { error } = await supabase
      .from("controller_plan_tasks")
      .update({ done: nextDone })
      .eq("id", taskId);

    if (error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, done: current.done } : task
        )
      );

      setWeeks((prev) =>
        prev.map((week) =>
          week.planId === planId
            ? {
                ...week,
                doneCount: week.doneCount + (current.done ? 1 : -1),
              }
            : week
        )
      );

      const message = getReadableAuthError(error);

      if (isMissingControllerTableError(message)) {
        toast.error("Таблица задач контроллера ещё не создана в Supabase.");
        return;
      }

      toast.error(message);
    }
  };

  const selectWeek = (weekStart: string) => {
    const selectedWeek = weeks.find((week) => week.weekStart === weekStart);
    setSelectedWeekStart(weekStart);
    setPlanId(selectedWeek?.planId ?? null);

    if (!selectedWeek) {
      setTasks([]);
      return;
    }

    let taskQuery = supabase
      .from("controller_plan_tasks")
      .select("id, title, done")
      .eq("plan_id", selectedWeek.planId)
      .order("created_at", { ascending: true });

    if (role === "smm_specialist") {
      taskQuery = taskQuery.eq("specialist_id", userId);
    }

    void taskQuery.then(({ data, error }) => {
      if (error) {
        toast.error(getReadableAuthError(error));
        return;
      }

      setTasks(
        (data ?? []).map((task) => ({
          id: task.id,
          title: task.title,
          done: task.done,
        }))
      );
    });
  };

  const createWeek = async (weekStart: string) => {
    setSelectedWeekStart(weekStart);
    const createdPlanId = await ensurePlan();

    if (!createdPlanId) return;

    setPlanId(createdPlanId);
    setTasks([]);
    toast.success("Неделя создана");
  };

  return {
    tasks,
    weeks,
    loading,
    saving,
    selectedWeekStart,
    currentWeekStart,
    addTask,
    toggleTask,
    selectWeek,
    createWeek,
  };
}