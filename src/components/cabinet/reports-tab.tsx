"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Filter,
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getReadableAuthError } from "@/lib/auth-error";
import type { AppRole } from "@/lib/auth";

interface ReportEntry {
  id: string;
  date: string;
  client: string;
  specialistId: string;
  specialistName: string;
  task: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface ReportsTabProps {
  clients: Array<{ id: string; name: string }>;
  userId: string;
  role: AppRole;
}

function formatDateForInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date: string) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}.${month}.${year}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function durationBetween(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (start === null || end === null || end < start) return "00:00";

  const total = end - start;
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

function addDurations(values: string[]) {
  const totalMinutes = values.reduce((sum, value) => {
    const minutes = timeToMinutes(value);
    return sum + (minutes ?? 0);
  }, 0);

  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

function buildSpecialistName(profile: {
  first_name: string | null;
  last_name: string | null;
} | null) {
  if (!profile) return "Неизвестный специалист";

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return fullName || "Без имени";
}

export function ReportsTab({ clients, userId, role }: ReportsTabProps) {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ReportEntry>>({});
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedSpecialist, setSelectedSpecialist] = useState("all");
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const newEntryRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);

      let query = supabase
        .from("work_reports")
        .select(
          "id, date, client_name, task, start_time, end_time, notes, specialist_id, profiles!work_reports_specialist_id_fkey(first_name, last_name)"
        )
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

      if (role === "smm_specialist") {
        query = query.eq("specialist_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error(getReadableAuthError(error));
        setEntries([]);
        setIsLoading(false);
        return;
      }

      setEntries(
        (data ?? []).map((entry) => ({
          id: entry.id,
          date: entry.date,
          client: entry.client_name,
          specialistId: entry.specialist_id,
          specialistName: buildSpecialistName(entry.profiles),
          task: entry.task,
          startTime: entry.start_time,
          endTime: entry.end_time,
          notes: entry.notes,
        }))
      );
      setIsLoading(false);
    };

    void loadReports();
  }, [userId, role]);

  useEffect(() => {
    if (!newEntryId || !newEntryRef.current) return;

    newEntryRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const firstField = newEntryRef.current.querySelector("textarea, input, select") as
      | HTMLTextAreaElement
      | HTMLInputElement
      | HTMLSelectElement
      | null;

    if (firstField) {
      firstField.focus();
    }

    const timeout = window.setTimeout(() => {
      setNewEntryId(null);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [newEntryId, entries.length, selectedClient]);

  const specialistOptions = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.specialistName))).sort((a, b) =>
      a.localeCompare(b, "ru")
    );
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const result = entries.filter((entry) => {
      const matchesClient = selectedClient === "all" || entry.client === selectedClient;
      const matchesSpecialist =
        selectedSpecialist === "all" || entry.specialistName === selectedSpecialist;

      return matchesClient && matchesSpecialist;
    });

    return [...result].sort((a, b) => {
      if (a.id === newEntryId) return -1;
      if (b.id === newEntryId) return 1;

      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;

      return b.startTime.localeCompare(a.startTime);
    });
  }, [entries, selectedClient, selectedSpecialist, newEntryId]);

  const totalForSelectedDate = useMemo(() => {
    const durations = filteredEntries
      .filter((entry) => entry.date === selectedDate)
      .map((entry) => durationBetween(entry.startTime, entry.endTime));

    return addDurations(durations);
  }, [filteredEntries, selectedDate]);

  const reportsForSelectedDate = useMemo(() => {
    return filteredEntries.filter((entry) => entry.date === selectedDate).length;
  }, [filteredEntries, selectedDate]);

  const startEditing = (entry: ReportEntry) => {
    setDrafts((prev) => ({
      ...prev,
      [entry.id]: { ...entry },
    }));
    setEditingIds((prev) => (prev.includes(entry.id) ? prev : [...prev, entry.id]));
  };

  const cancelEditing = (entryId: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[entryId];
      return next;
    });
    setEditingIds((prev) => prev.filter((id) => id !== entryId));
  };

  const updateDraft = (entryId: string, key: keyof ReportEntry, value: string) => {
    setDrafts((prev) => {
      const currentDraft = prev[entryId];
      if (!currentDraft) return prev;

      return {
        ...prev,
        [entryId]: {
          ...currentDraft,
          [key]: value,
        },
      };
    });
  };

  const saveEntry = async (entry: ReportEntry) => {
    const { error } = await supabase
      .from("work_reports")
      .update({
        date: entry.date,
        client_name: entry.client,
        task: entry.task.trim() || "Новая задача",
        start_time: entry.startTime,
        end_time: entry.endTime,
        notes: entry.notes,
      })
      .eq("id", entry.id);

    if (error) {
      toast.error(getReadableAuthError(error));
      return false;
    }

    return true;
  };

  const handleSave = async (entryId: string) => {
    const draft = drafts[entryId];
    if (!draft) return;

    setIsMutating(true);
    const ok = await saveEntry(draft);
    setIsMutating(false);

    if (!ok) return;

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...draft,
              task: draft.task.trim() || "Новая задача",
            }
          : entry
      )
    );

    cancelEditing(entryId);
    toast.success("Запись сохранена");
  };

  const removeEntry = async (id: string) => {
    setIsMutating(true);

    const { error } = await supabase
      .from("work_reports")
      .delete()
      .eq("id", id);

    setIsMutating(false);

    if (error) {
      toast.error(getReadableAuthError(error));
      return;
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    cancelEditing(id);
    toast.success("Запись удалена");
  };

  const addEntry = async () => {
    const fallbackClient =
      selectedClient !== "all" ? selectedClient : clients[0]?.name ?? "";

    if (!fallbackClient) {
      toast.error("Сначала должен быть доступен хотя бы один клиент");
      return;
    }

    setIsMutating(true);

    const { data, error } = await supabase
      .from("work_reports")
      .insert({
        specialist_id: userId,
        date: selectedDate,
        client_name: fallbackClient,
        task: "Новая задача",
        start_time: "09:00",
        end_time: "10:00",
        notes: "",
      })
      .select(
        "id, date, client_name, task, start_time, end_time, notes, specialist_id, profiles!work_reports_specialist_id_fkey(first_name, last_name)"
      )
      .single();

    setIsMutating(false);

    if (error || !data) {
      toast.error(getReadableAuthError(error));
      return;
    }

    const newEntry = {
      id: data.id,
      date: data.date,
      client: data.client_name,
      specialistId: data.specialist_id,
      specialistName: buildSpecialistName(data.profiles),
      task: data.task,
      startTime: data.start_time,
      endTime: data.end_time,
      notes: data.notes,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setDrafts((prev) => ({
      ...prev,
      [newEntry.id]: { ...newEntry },
    }));
    setEditingIds((prev) => [...prev, newEntry.id]);
    setNewEntryId(data.id);

    toast.success("Новая запись добавлена");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0F0F0F] p-4 sm:p-6 animate-fade-in">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-[28px] border border-[#1E1E1E] bg-[#131313] p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
                <ReceiptText className="h-3.5 w-3.5" />
                Учет рабочего времени
              </div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Отчёты по задачам</h2>
              <p className="mt-2 max-w-2xl text-sm text-[#8B93A7]">
                {role === "manager"
                  ? "Контрольная таблица по всем отчетам команды: кто, по какому клиенту и сколько времени отработал."
                  : "Ведите отчёт по времени, задачам и клиентам в одном аккуратном табличном интерфейсе."}
              </p>
            </div>

            {role === "smm_specialist" && (
              <Button
                onClick={addEntry}
                disabled={isMutating}
                className="rounded-2xl bg-[#38BDF8] px-4 text-white hover:bg-[#22AEEA] disabled:opacity-60"
              >
                {isMutating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Быстро добавить запись
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-[24px] border border-[#1E1E1E] bg-[#151515] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#A78BFA]" />
              <p className="text-sm font-semibold text-white">Клиент</p>
            </div>
            <select
              value={selectedClient}
              onChange={(event) => setSelectedClient(event.target.value)}
              className="w-full rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">Все клиенты</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {role === "manager" && (
            <div className="rounded-[24px] border border-[#1E1E1E] bg-[#151515] p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#38BDF8]" />
                <p className="text-sm font-semibold text-white">SMM специалист</p>
              </div>
              <select
                value={selectedSpecialist}
                onChange={(event) => setSelectedSpecialist(event.target.value)}
                className="w-full rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="all">Вся команда</option>
                {specialistOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded-[24px] border border-[#1E1E1E] bg-[#151515] p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#34D399]" />
              <p className="text-sm font-semibold text-white">Дата отчёта</p>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-12 rounded-2xl border-[#262626] bg-[#101010] text-white"
            />
          </div>

          <div className="rounded-[24px] border border-[#1E1E1E] bg-[#151515] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#FBBF24]" />
              <p className="text-sm font-semibold text-white">Сводка за день</p>
            </div>
            <div className="rounded-2xl border border-[#FBBF24]/20 bg-[#FBBF24]/10 px-4 py-3">
              <p className="text-xs text-[#E7C768]">{formatDisplayDate(selectedDate)}</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalForSelectedDate}</p>
              <p className="mt-1 text-xs text-[#FDE68A]">
                Записей: {reportsForSelectedDate}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#1E1E1E] bg-[#131313]">
          <div className="overflow-x-auto">
            <table className="min-w-[1440px] w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E] bg-[#171717]">
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Дата
                  </th>
                  {role === "manager" && (
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                      Специалист
                    </th>
                  )}
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Клиент
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Задача
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Начало
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Конец
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Итого
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Примечания / Графика
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={role === "manager" ? 9 : 8} className="px-4 py-10">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-[#8B93A7]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredEntries.map((entry) => {
                  const isNewEntry = entry.id === newEntryId;
                  const isEditing = editingIds.includes(entry.id);
                  const current = drafts[entry.id] ?? entry;

                  return (
                    <tr
                      key={entry.id}
                      ref={isNewEntry ? newEntryRef : null}
                      className={`border-b border-[#1E1E1E] align-top ${isNewEntry ? "bg-[#38BDF8]/[0.04]" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <Input
                          type="date"
                          value={current.date}
                          disabled={!isEditing}
                          onChange={(event) => updateDraft(entry.id, "date", event.target.value)}
                          className="h-11 min-w-[150px] rounded-2xl border-[#262626] bg-[#101010] text-white disabled:opacity-70"
                        />
                      </td>

                      {role === "manager" && (
                        <td className="px-4 py-3">
                          <div className="flex min-w-[200px] items-center gap-2 rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white">
                            <UserRound className="h-4 w-4 text-[#38BDF8]" />
                            <span>{current.specialistName}</span>
                          </div>
                        </td>
                      )}

                      <td className="px-4 py-3">
                        <select
                          value={current.client}
                          disabled={!isEditing}
                          onChange={(event) => updateDraft(entry.id, "client", event.target.value)}
                          className="h-11 w-full min-w-[180px] rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none disabled:opacity-70"
                        >
                          {clients.map((client) => (
                            <option key={client.id} value={client.name}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={current.task}
                          disabled={!isEditing}
                          onChange={(event) => updateDraft(entry.id, "task", event.target.value)}
                          className="min-h-[88px] w-full min-w-[280px] rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white outline-none disabled:opacity-70"
                          placeholder="Описание выполненной задачи"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="time"
                          value={current.startTime}
                          disabled={!isEditing}
                          onChange={(event) => updateDraft(entry.id, "startTime", event.target.value)}
                          className="h-11 min-w-[120px] rounded-2xl border-[#262626] bg-[#101010] text-white disabled:opacity-70"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="time"
                          value={current.endTime}
                          disabled={!isEditing}
                          onChange={(event) => updateDraft(entry.id, "endTime", event.target.value)}
                          className="h-11 min-w-[120px] rounded-2xl border-[#262626] bg-[#101010] text-white disabled:opacity-70"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex h-11 min-w-[110px] items-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 px-4 text-sm font-semibold text-[#34D399]">
                          {durationBetween(current.startTime, current.endTime)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={current.notes}
                          disabled={!isEditing}
                          onChange={(event) => updateDraft(entry.id, "notes", event.target.value)}
                          className="min-h-[88px] w-full min-w-[260px] rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white outline-none disabled:opacity-70"
                          placeholder="Ссылки, графика, комментарии"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[180px] flex-col gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => void handleSave(entry.id)}
                                disabled={isMutating}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 text-sm font-medium text-[#34D399] transition-colors hover:bg-[#34D399]/20 disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                                Сохранить
                              </button>
                              <button
                                onClick={() => cancelEditing(entry.id)}
                                disabled={isMutating}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#171717] px-4 text-sm font-medium text-[#C9D1E1] transition-colors hover:bg-[#1B1B1B] disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                                Отменить
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditing(entry)}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 text-sm font-medium text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20"
                            >
                              <Pencil className="h-4 w-4" />
                              Корректировать
                            </button>
                          )}

                          <button
                            onClick={() => void removeEntry(entry.id)}
                            disabled={isMutating}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 text-sm font-medium text-[#F87171] transition-colors hover:bg-[#EF4444]/20 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!isLoading && filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={role === "manager" ? 9 : 8} className="px-4 py-10 text-center text-sm text-[#8B93A7]">
                      По выбранным фильтрам записей пока нет.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}