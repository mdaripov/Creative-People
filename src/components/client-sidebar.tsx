"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Zap,
  Loader2,
  AlertCircle,
  Database,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ClientSidebarProps {
  selectedClientId: string | null;
  onSelectClient: (id: string, name?: string) => void;
  assignedClientIds: string[];
  onToggleAssignClient: (id: string) => void;
  onClientsLoaded?: (clients: Array<{ id: string; name: string }>) => void;
  mode?: "default" | "cabinet";
  onOpenMentor?: () => void;
}

type SupabaseClient = {
  id: string;
  name: string;
};

type ClientStatus = "active" | "paused" | "review";

type ClientListItem = {
  id: string;
  name: string;
  industry: string;
  status: ClientStatus;
  avatarColor: string;
};

function StatusDot({ status }: { status: ClientStatus }) {
  const colors: Record<ClientStatus, string> = {
    active: "bg-[#34D399]",
    paused: "bg-[#6B7280]",
    review: "bg-[#FBBF24]",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`}
    />
  );
}

function ClientAvatar({ client }: { client: ClientListItem }) {
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ backgroundColor: client.avatarColor }}
    >
      {initials}
    </div>
  );
}

function getAvatarColor(name: string) {
  const palette = ["#A78BFA", "#38BDF8", "#34D399", "#F472B6", "#F59E0B", "#8B5CF6"];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

export function ClientSidebar({
  selectedClientId,
  onSelectClient,
  assignedClientIds,
  onToggleAssignClient,
  onClientsLoaded,
  mode = "default",
  onOpenMentor,
}: ClientSidebarProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rawCount, setRawCount] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        setClients([]);
        setRawCount(0);
        onClientsLoaded?.([]);
        setFetchError(error.message);
        toast.error("Не удалось загрузить клиентов");
        setIsLoading(false);
        return;
      }

      const rows = data ?? [];
      setRawCount(rows.length);

      const mappedClients: ClientListItem[] = rows.map((client: SupabaseClient) => ({
        id: client.id,
        name: client.name,
        industry: "Клиент",
        status: "active",
        avatarColor: getAvatarColor(client.name),
      }));

      setClients(mappedClients);
      onClientsLoaded?.(rows.map((client: SupabaseClient) => ({ id: client.id, name: client.name })));
      setIsLoading(false);
    };

    fetchClients();
  }, [onClientsLoaded]);

  const filtered = useMemo(
    () =>
      clients.filter(
        (client) =>
          client.name.toLowerCase().includes(search.toLowerCase()) ||
          client.industry.toLowerCase().includes(search.toLowerCase())
      ),
    [clients, search]
  );

  const assignedClients = useMemo(
    () => clients.filter((client) => assignedClientIds.includes(client.id)),
    [clients, assignedClientIds]
  );

  if (mode === "cabinet") {
    return (
      <div className="w-full flex flex-col h-full bg-[#111111] border-r border-[#1E1E1E]">
        <div className="px-5 py-5 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">
                Личный кабинет
              </h1>
              <p className="text-[10px] text-[#6B7280] leading-tight">
                Мои клиенты и наставник
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-[#1E1E1E]">
          <button
            onClick={onOpenMentor}
            className="w-full flex items-center gap-3 rounded-2xl border border-[#A78BFA]/25 bg-[#A78BFA]/10 px-3 py-3 text-left transition-all duration-200 hover:bg-[#A78BFA]/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#A78BFA]/25 bg-[#A78BFA]/10 text-[#A78BFA]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">ИИ СММ наставник</p>
              <p className="text-[11px] text-[#B9A7F8]">Быстрый переход в чат</p>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 py-2">
            <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider px-2 mb-1">
              Выбранные клиенты ({assignedClients.length})
            </p>
          </div>

          {isLoading ? (
            <div className="px-5 py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
            </div>
          ) : assignedClients.length > 0 ? (
            <ul className="space-y-0.5 px-2">
              {assignedClients.map((client) => {
                const isSelected = selectedClientId === client.id;

                return (
                  <li key={client.id}>
                    <button
                      onClick={() => onSelectClient(client.id, client.name)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left
                        transition-all duration-200
                        ${isSelected ? "bg-white text-black" : "hover:bg-[#1A1A1A]"}
                      `}
                    >
                      <ClientAvatar client={client} />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate leading-tight ${
                            isSelected ? "text-black" : "text-white"
                          }`}
                        >
                          {client.name}
                        </p>
                        <p
                          className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isSelected ? "text-[#555]" : "text-[#6B7280]"
                          }`}
                        >
                          {client.industry}
                        </p>
                      </div>
                      <StatusDot status={client.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center space-y-2">
              <p className="text-sm text-[#6B7280]">Нет выбранных клиентов</p>
              <p className="text-xs text-[#8B93A7]">
                Добавьте клиентов из основного списка, чтобы они появились здесь.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full bg-[#111111] border-r border-[#1E1E1E]">
      <div className="px-5 py-5 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              SMM Agency
            </h1>
            <p className="text-[10px] text-[#6B7280] leading-tight">
              AI-powered dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[#1E1E1E]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Поиск клиентов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A] transition-colors"
          />
        </div>
      </div>

      {!isLoading && (
        <div className="px-4 py-3 border-b border-[#1E1E1E] bg-[#0F0F0F]">
          <div className="rounded-2xl border border-[#1E1E1E] bg-[#151515] p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="font-medium">Статус загрузки клиентов</span>
            </div>

            {fetchError ? (
              <div className="flex items-start gap-2 text-xs text-[#FCA5A5]">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Ошибка Supabase</p>
                  <p className="text-[#FECACA] break-words">{fetchError}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-[#86EFAC]">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Запрос выполнен</p>
                  <p className="text-[#8B93A7]">Таблица clients вернула записей: {rawCount}</p>
                  <p className="text-[#8B93A7]">После поиска показано: {filtered.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-2">
          <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider px-2 mb-1">
            Клиенты ({isLoading ? 0 : filtered.length})
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <ul className="space-y-0.5 px-2">
            {filtered.map((client) => {
              const isSelected = selectedClientId === client.id;
              const isAssigned = assignedClientIds.includes(client.id);

              return (
                <li key={client.id}>
                  <div
                    className={`
                      flex items-center gap-2 px-2 py-1.5 rounded-xl
                      transition-all duration-200
                      ${isSelected ? "bg-white text-black" : "hover:bg-[#1A1A1A]"}
                    `}
                  >
                    <button
                      onClick={() => onSelectClient(client.id, client.name)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <ClientAvatar client={client} />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate leading-tight ${
                            isSelected ? "text-black" : "text-white"
                          }`}
                        >
                          {client.name}
                        </p>
                        <p
                          className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isSelected ? "text-[#555]" : "text-[#6B7280]"
                          }`}
                        >
                          {client.industry}
                        </p>
                      </div>
                      <StatusDot status={client.status} />
                    </button>

                    <button
                      onClick={() => onToggleAssignClient(client.id)}
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                        isAssigned
                          ? "border-[#34D399]/30 bg-[#34D399]/12 text-[#34D399]"
                          : "border-[#2A2A2A] bg-[#171717] text-[#6B7280] hover:border-[#34D399]/30 hover:text-[#34D399]"
                      }`}
                      aria-label="Добавить клиента в личный кабинет"
                      title="Добавить клиента в личный кабинет"
                    >
                      {isAssigned ? (
                        <UserCheck className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center space-y-2">
            <p className="text-sm text-[#6B7280]">Нет клиентов</p>
            {!fetchError && (
              <p className="text-xs text-[#8B93A7]">
                Запрос к таблице clients выполнился, но вернул 0 записей.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#1E1E1E]">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#2A2A2A] text-[#6B7280] hover:border-[#3A3A3A] hover:text-white text-sm transition-all duration-200 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          Новый клиент
        </button>
      </div>
    </div>
  );
}