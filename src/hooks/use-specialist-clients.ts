"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "specialist-clients";

function readClientIds(): string[] {
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

function writeClientIds(clientIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clientIds));
}

export function useSpecialistClients() {
  const [clientIds, setClientIds] = useState<string[]>([]);

  useEffect(() => {
    setClientIds(readClientIds());
  }, []);

  const assignedClientIds = useMemo(() => clientIds, [clientIds]);

  const toggleClient = (clientId: string) => {
    setClientIds((prev) => {
      const next = prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId];

      writeClientIds(next);
      return next;
    });
  };

  const isAssigned = (clientId: string) => assignedClientIds.includes(clientId);

  return {
    assignedClientIds,
    toggleClient,
    isAssigned,
  };
}