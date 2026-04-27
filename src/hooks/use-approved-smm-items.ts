"use client";

import { useEffect, useMemo, useState } from "react";

export interface ApprovedSmmItem {
  id: string;
  clientId: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = "approved-smm-items";

function readItems(): ApprovedSmmItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items: ApprovedSmmItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useApprovedSmmItems(clientId: string) {
  const [items, setItems] = useState<ApprovedSmmItem[]>([]);

  useEffect(() => {
    setItems(readItems());
  }, []);

  const clientItems = useMemo(
    () => items.filter((item) => item.clientId === clientId),
    [items, clientId]
  );

  const approveItem = (item: Omit<ApprovedSmmItem, "createdAt">) => {
    setItems((prev) => {
      const exists = prev.some(
        (approved) => approved.clientId === item.clientId && approved.id === item.id
      );

      if (exists) {
        return prev;
      }

      const next = [
        ...prev,
        {
          ...item,
          createdAt: new Date().toISOString(),
        },
      ];

      writeItems(next);
      return next;
    });
  };

  return {
    approvedItems: clientItems,
    isApproved: (itemId: string) =>
      clientItems.some((item) => item.id === itemId),
    approveItem,
  };
}