"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

export function useSpecialistClients(userId: string | null, role: AppRole | null) {
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setClientIds([]);
      return;
    }

    const loadAssignments = async () => {
      setLoading(true);

      if (role === "manager") {
        setClientIds([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("specialist_clients")
        .select("client_id")
        .eq("specialist_id", userId);

      if (error) {
        setClientIds([]);
        setLoading(false);
        return;
      }

      setClientIds((data ?? []).map((item) => item.client_id));
      setLoading(false);
    };

    void loadAssignments();
  }, [userId, role]);

  const assignedClientIds = useMemo(() => clientIds, [clientIds]);

  const toggleClient = async (clientId: string) => {
    if (!userId || role === "manager") return;

    const isAssigned = clientIds.includes(clientId);

    if (isAssigned) {
      const { error } = await supabase
        .from("specialist_clients")
        .delete()
        .eq("specialist_id", userId)
        .eq("client_id", clientId);

      if (error) {
        toast.error("Не удалось убрать клиента");
        return;
      }

      setClientIds((prev) => prev.filter((id) => id !== clientId));
      toast.success("Клиент убран из личного кабинета");
      return;
    }

    const { error } = await supabase.from("specialist_clients").insert({
      specialist_id: userId,
      client_id: clientId,
    });

    if (error) {
      toast.error("Не удалось добавить клиента");
      return;
    }

    setClientIds((prev) => [...prev, clientId]);
    toast.success("Клиент добавлен в личный кабинет");
  };

  const isAssigned = (clientId: string) => assignedClientIds.includes(clientId);

  return {
    assignedClientIds,
    toggleClient,
    isAssigned,
    loading,
  };
}