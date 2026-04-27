"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildManagerDashboardData,
  type ManagerDashboardData,
} from "@/lib/manager-dashboard";

export function useManagerDashboard() {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [controllerTablesMissing, setControllerTablesMissing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setControllerTablesMissing(false);

      const [
        clientsResponse,
        profilesResponse,
        reportsResponse,
        plansResponse,
        tasksResponse,
      ] = await Promise.all([
        supabase.from("clients").select("id, name, smm_specialist_id").order("name", { ascending: true }),
        supabase.from("profiles").select("id, first_name, last_name, role"),
        supabase
          .from("work_reports")
          .select("id, specialist_id, client_name, date, start_time, end_time, created_at")
          .order("date", { ascending: false }),
        supabase
          .from("controller_plans")
          .select("id, client_id, specialist_id, week_start, created_at")
          .order("week_start", { ascending: false }),
        supabase
          .from("controller_plan_tasks")
          .select("id, plan_id, client_id, specialist_id, title, done, created_at, updated_at")
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      const plansError = plansResponse.error;
      const tasksError = tasksResponse.error;

      const tablesMissing =
        Boolean(plansError?.message?.includes("schema cache")) ||
        Boolean(tasksError?.message?.includes("schema cache")) ||
        Boolean(plansError?.message?.includes("controller_plans")) ||
        Boolean(tasksError?.message?.includes("controller_plan_tasks"));

      if (tablesMissing) {
        setControllerTablesMissing(true);
      }

      const nextData = buildManagerDashboardData({
        clients: clientsResponse.data ?? [],
        profiles: profilesResponse.data ?? [],
        workReports: reportsResponse.data ?? [],
        controllerPlans: plansResponse.data ?? [],
        controllerTasks: tasksResponse.data ?? [],
      });

      setData(nextData);
      setLoading(false);
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    loading,
    controllerTablesMissing,
  };
}