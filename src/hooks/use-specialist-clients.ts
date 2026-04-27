"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

const STORAGE_KEY = "dyad-specialist-clients";

function getStorageKey(userId: string) {
  return `${STORAGE_KEY}:${userId}`;
}

function readLocalClientIds(userId: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeLocalClientIds(userId: string, clientIds: string[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(clientIds));
  } catch {
    return;
  }
}

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

      const localClientIds = readLocalClientIds(userId);
      setClientIds(localClientIds);

      const { data, error } = await supabase
        .from("specialist_clients")
        .select("client_id")
        .eq("specialist_id", userId);

      if (error) {
        setLoading(false);
        return;
      }

      const remoteClientIds = (data ?? []).map((item) => item.client_id);
      const nextIds = remoteClientIds.length > 0 ? remoteClientIds : localClientIds;

      setClientIds(nextIds);
      writeLocalClientIds(userId, nextIds);
      setLoading(false);
    };

    void loadAssignments();
  }, [userId, role]);

  const assignedClientIds = useMemo(() => clientIds, [clientIds]);

  const toggleClient = async (clientId: string) => {
    if (!userId || role === "manager") return;

    const isAssigned = clientIds.includes(clientId);

    if (isAssigned) {
      const nextIds = clientIds.filter((id) => id !== clientId);
      setClientIds(nextIds);
      writeLocalClientIds(userId, nextIds);

      const { error } = await supabase
        .from("specialist_clients")
        .delete()
        .eq("specialist_id", userId)
        .eq("client_id", clientId);

      if (error) {
        toast.error("Не удалось удалить клиента из Supabase. Изменение сохранено локально.");
        return;
      }

      toast.success("Клиент убран из личного кабинета");
      return;
    }

    const nextIds = [...clientIds, clientId];
    setClientIds(nextIds);
    writeLocalClientIds(userId, nextIds);

    const { error } = await supabase
      .from("specialist_clients")
      .upsert(
        {
          specialist_id: userId,
          client_id: clientId,
        },
        {
          onConflict: "specialist_id,client_id",
        }
      );

    if (error) {
      toast.error("Не удалось сохранить клиента в Supabase. Клиент добавлен только локально.");
      return;
    }

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