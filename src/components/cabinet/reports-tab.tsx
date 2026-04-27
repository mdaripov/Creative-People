"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Filter,
  Loader2,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

interface ReportEntry {
  id: string;
  date: string;
  client: string;
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

const STORAGE_KEY = "dyad-local-work-reports";

function getStorageKey(userId: string) {
  return `${STORAGE_KEY}:${userId}`;
}

function readLocalReports(userId: string): ReportEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalReports(userId: string, entries: ReportEntry[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(entries));
  } catch {
    return;
  }
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

export function ReportsTab({ clients, userId, role }: ReportsTabProps) {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);

      let query = supabase
        .from("work_reports")
        .select("id, date, client_name, task, start_time, end_time, notes, specialist_id")
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

      if (role === "smm_specialist") {
        query = query.eq("specialist_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        const localEntries = readLocalReports(userId);
        setEntries(localEntries);
        setIsLocalMode(true);
        setIsLoading(false);
        return;
      }

      const nextEntries = (data ?? []).map((entry) => ({
        id: entry.id,
        date: entry.date,
        client: entry.client_name,
        task: entry.task,
        startTime: entry.start_time,
        endTime: entry.end_time,
        notes: entry.notes,
      }));

      setEntries(nextEntries);
      writeLocalReports(userId, nextEntries);
      setIsLocalMode(false);
      setIsLoading(false);
    };

    void loadReports();
  }, [userId, role]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesClient = selectedClient === "all" || entry.client === selectedClient;
      return matchesClient;
    });
  }, [entries, selectedClient]);

  const totalForSelectedDate = useMemo(() => {
    const durations = entries
      .filter((entry) => entry.date === selectedDate)
      .map((entry) => durationBetween(entry.startTime, entry.endTime));

    return addDurations(durations);
  }, [entries, selectedDate]);

  const updateEntry = async (id: string, key: keyof ReportEntry, value: string) => {
    const nextEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, [key]: value } : entry
    );

    setEntries(nextEntries);
    writeLocalReports(userId, nextEntries);

    if (isLocalMode) {
      return;
    }

    const target = nextEntries.find((entry) => entry.id === id);
    if (!target) return;

    const { error } = await supabase
      .from("work_reports")
      .update({
        date: target.date,
        client_name: target.client,
        task: target.task || "Без названия задачи",
        start_time: target.startTime,
        end_time: target.endTime,
        notes: target.notes,
      })
      .eq("id", id);

    if (error) {
      setIsLocalMode(true);
      toast.error("Не удалось обновить запись в Supabase. Изменения сохранены локально.");
    }
  };

  const removeEntry = async (id: string) => {
    const nextEntries = entries.filter((entry) => entry.id !== id);
    setEntries(nextEntries);
    writeLocalReports(userId, nextEntries);

    if (isLocalMode) {
      toast.success("Запись удалена");
      return;
    }

    const { error } = await supabase
      .from("work_reports")
      .delete()
      .eq("id", id);

    if (error) {
      setIsLocalMode(true);
      toast.error("Не удалось удалить запись из Supabase. Удаление выполнено локально.");
      return;
    }

    toast.success("Запись удалена");
  };

  const addEntry = async () => {
    const fallbackClient =
      selectedClient !== "all" ? selectedClient : clients[0]?.name ?? "Новый клиент";

    const optimisticEntry: ReportEntry = {
      id: `local-${Date.now()}`,
      date: selectedDate,
      client: fallbackClient,
      task: "",
      startTime: "09:00",
      endTime: "10:00",
      notes: "",
    };

    if (isLocalMode) {
      const nextEntries = [optimisticEntry, ...entries];
      setEntries(nextEntries);
      writeLocalReports(userId, nextEntries);
      toast.success("Новая запись добавлена локально");
      return;
    }

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
      .select("id, date, client_name, task, start_time, end_time, notes")
      .single();

    if (error || !data) {
      const nextEntries = [optimisticEntry, ...entries];
      setEntries(nextEntries);
      writeLocalReports(userId, nextEntries);
      setIsLocalMode(true);
      toast.error("Не удалось добавить запись в Supabase. Запись сохранена локально.");
      return;
    }

    const nextEntries = [
      {
        id: data.id,
        date: data.date,
        client: data.client_name,
        task: data.task,
        startTime: data.start_time,
        endTime: data.end_time,
        notes: data.notes,
      },
      ...entries,
    ];

    setEntries(nextEntries);
    writeLocalReports(userId, nextEntries);
    setIsLocalMode(false);
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
                Ведите отчёт по времени, задачам и клиентам в одном аккуратном табличном интерфейсе.
              </p>
              {isLocalMode && (
                <p className="mt-3 text-xs text-[#FBBF24]">
                  Сейчас включён локальный режим: отчёты сохраняются в этом браузере без Supabase.
                </p>
              )}
            </div>

            <Button
              onClick={addEntry}
              className="rounded-2xl bg-[#38BDF8] px-4 text-white hover:bg-[#22AEEA]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Быстро добавить запись
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-[#1E1E1E] bg-[#151515] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#A78BFA]" />
              <p className="text-sm font-semibold text-white">Фильтр по клиенту</p>
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
              <p className="text-sm font-semibold text-white">Итого за день</p>
            </div>
            <div className="rounded-2xl border border-[#FBBF24]/20 bg-[#FBBF24]/10 px-4 py-3">
              <p className="text-xs text-[#E7C768]">{formatDisplayDate(selectedDate)}</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalForSelectedDate}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#1E1E1E] bg-[#131313]">
          <div className="overflow-x-auto">
            <table className="min-w-[1280px] w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E] bg-[#171717]">
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#8B93A7]">
                    Дата
                  </th>
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
                    <td colSpan={8} className="px-4 py-10">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-[#8B93A7]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#1E1E1E] align-top">
                    <td className="px-4 py-3">
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(event) => updateEntry(entry.id, "date", event.target.value)}
                        className="h-11 min-w-[150px] rounded-2xl border-[#262626] bg-[#101010] text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        list={`clients-${entry.id}`}
                        value={entry.client}
                        onChange={(event) => updateEntry(entry.id, "client", event.target.value)}
                        className="h-11 w-full min-w-[180px] rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white outline-none"
                        placeholder="Название клиента"
                      />
                      <datalist id={`clients-${entry.id}`}>
                        {clients.map((client) => (
                          <option key={client.id} value={client.name} />
                        ))}
                      </datalist>
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={entry.task}
                        onChange={(event) => updateEntry(entry.id, "task", event.target.value)}
                        className="min-h-[88px] w-full min-w-[280px] rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white outline-none"
                        placeholder="Описание выполненной задачи"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={entry.startTime}
                        onChange={(event) => updateEntry(entry.id, "startTime", event.target.value)}
                        className="h-11 min-w-[120px] rounded-2xl border-[#262626] bg-[#101010] text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={entry.endTime}
                        onChange={(event) => updateEntry(entry.id, "endTime", event.target.value)}
                        className="h-11 min-w-[120px] rounded-2xl border-[#262626] bg-[#101010] text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex h-11 min-w-[110px] items-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 px-4 text-sm font-semibold text-[#34D399]">
                        {durationBetween(entry.startTime, entry.endTime)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={entry.notes}
                        onChange={(event) => updateEntry(entry.id, "notes", event.target.value)}
                        className="min-h-[88px] w-full min-w-[260px] rounded-2xl border border-[#262626] bg-[#101010] px-4 py-3 text-sm text-white outline-none"
                        placeholder="Ссылки, графика, комментарии"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 text-sm font-medium text-[#F87171] transition-colors hover:bg-[#EF4444]/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}

                {!isLoading && filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#8B93A7]">
                      По выбранному фильтру записей пока нет.
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