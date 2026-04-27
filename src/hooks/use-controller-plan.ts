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

function getWeekStartDate() {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split("T")[0];
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  const weekStart = useMemo(() => getWeekStartDate(), []);

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);

      let planQuery = supabase
        .from("controller_plans")
        .select("id, specialist_id")
        .eq("client_id", clientId)
        .eq("week_start", weekStart)
        .order("created_at", { ascending: false });

      if (role === "smm_specialist") {
        planQuery = planQuery.eq("specialist_id", userId);
      }

      const { data: planRows, error: planError } = await planQuery.limit(1);

      if (planError) {
        const message = getReadableAuthError(planError);

        if (isMissingControllerTableError(message)) {
          toast.error("Таблицы плана контроллера ещё не созданы в Supabase.");
          setTasks([]);
          setPlanId(null);
          setLoading(false);
          return;
        }

        toast.error(message);
        setTasks([]);
        setPlanId(null);
        setLoading(false);
        return;
      }

      const existingPlan = planRows?.[0];

      if (!existingPlan) {
        setTasks([]);
        setPlanId(null);
        setLoading(false);
        return;
      }

      setPlanId(existingPlan.id);

      let taskQuery = supabase
        .from("controller_plan_tasks")
        .select("id, title, done")
        .eq("plan_id", existingPlan.id)
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
          setLoading(false);
          return;
        }

        toast.error(message);
        setTasks([]);
        setLoading(false);
        return;
      }

      setTasks(
        (taskRows ?? []).map((task) => ({
          id: task.id,
          title: task.title,
          done: task.done,
        }))
      );
      setLoading(false);
    };

    void loadPlan();
  }, [clientId, role, userId, weekStart]);

  const ensurePlan = async () => {
    if (planId) return planId;

    const { data, error } = await supabase
      .from("controller_plans")
      .insert({
        client_id: clientId,
        specialist_id: userId,
        week_start: weekStart,
      })
      .select("id")
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
    toast.success("Задача добавлена");
  };

  const toggleTask = async (taskId: string) => {
    const current = tasks.find((task) => task.id === taskId);
    if (!current) return;

    const nextDone = !current.done;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, done: nextDone } : task
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

      const message = getReadableAuthError(error);

      if (isMissingControllerTableError(message)) {
        toast.error("Таблица задач контроллера ещё не создана в Supabase.");
        return;
      }

      toast.error(message);
    }
  };

  return {
    tasks,
    loading,
    saving,
    addTask,
    toggleTask,
  };
}