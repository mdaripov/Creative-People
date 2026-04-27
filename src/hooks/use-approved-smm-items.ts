"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

export interface ApprovedSmmItem {
  id: string;
  clientId: string;
  text: string;
  createdAt: string;
}

export function useApprovedSmmItems(
  clientId: string,
  userId: string | null,
  role: AppRole | null
) {
  const [items, setItems] = useState<ApprovedSmmItem[]>([]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      let query = supabase
        .from("approved_smm_items")
        .select("id, client_id, text, created_at, specialist_id")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (role === "smm_specialist") {
        query = query.eq("specialist_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Не удалось загрузить утверждённые материалы");
        return;
      }

      setItems(
        (data ?? []).map((item) => ({
          id: item.id,
          clientId: item.client_id,
          text: item.text,
          createdAt: item.created_at,
        }))
      );
    };

    void loadItems();
  }, [clientId, userId, role]);

  const clientItems = useMemo(
    () => items.filter((item) => item.clientId === clientId),
    [items, clientId]
  );

  const approveItem = async (item: Omit<ApprovedSmmItem, "createdAt">) => {
    if (!userId) return;

    const exists = clientItems.some((approved) => approved.id === item.id);
    if (exists) return;

    const payload = {
      id: item.id,
      client_id: item.clientId,
      text: item.text,
      specialist_id: userId,
    };

    const { data, error } = await supabase
      .from("approved_smm_items")
      .insert(payload)
      .select("id, client_id, text, created_at")
      .single();

    if (error) {
      toast.error("Не удалось сохранить материал");
      return;
    }

    setItems((prev) => [
      {
        id: data.id,
        clientId: data.client_id,
        text: data.text,
        createdAt: data.created_at,
      },
      ...prev,
    ]);
  };

  const updateItem = async (itemId: string, text: string) => {
    const { error } = await supabase
      .from("approved_smm_items")
      .update({ text })
      .eq("id", itemId);

    if (error) {
      toast.error("Не удалось обновить материал");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, text }
          : item
      )
    );
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from("approved_smm_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast.error("Не удалось удалить материал");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return {
    approvedItems: clientItems,
    isApproved: (itemId: string) =>
      clientItems.some((item) => item.id === itemId),
    approveItem,
    updateItem,
    removeItem,
  };
}