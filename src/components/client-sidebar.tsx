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
  Users,
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
  collapsed?: boolean;
}

type SupabaseClient = {
  id: string;
  name: string;
};

type SupabaseSpecialist = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: "smm_specialist" | "manager";
};

type ClientStatus = "active" | "paused" | "review";

type ClientListItem = {
  id: string;
  name: string;
  industry: string;
  status: ClientStatus;
  avatarColor: string;
};

type SpecialistListItem = {
  id: string;
  name: string;
  subtitle: string;
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

function ClientAvatar({ client }: { client: { name: string; avatarColor: string } }) {
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

function buildSpecialistName(specialist: SupabaseSpecialist) {
  const fullName = [specialist.first_name, specialist.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Без имени";
}

export function ClientSidebar({
  selectedClientId,
  onSelectClient,
  assignedClientIds,
  onToggleAssignClient,
  onClientsLoaded,
  mode = "default",
  onOpenMentor,
  collapsed = false,
}: ClientSidebarProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [specialists, setSpecialists] = useState<SpecialistListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rawCount, setRawCount] = useState(0);
  const [cabinetSection, setCabinetSection] = useState<"clients" | "specialists">("clients");

  useEffect(() => {
    const fetchSidebarData = async () => {
      setIsLoading(true);
      setFetchError(null);

      const [clientsResponse, specialistsResponse] = await Promise.all([
        supabase.from("clients").select("id, name").order("name", { ascending: true }),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, role")
          .eq("role", "smm_specialist")
          .order("first_name", { ascending: true }),
      ]);

      if (clientsResponse.error) {
        setClients([]);
        setSpecialists([]);
        setRawCount(0);
        onClientsLoaded?.([]);
        setFetchError(clientsResponse.error.message);
        toast.error("Не удалось загрузить клиентов");
        setIsLoading(false);
        return;
      }

      if (specialistsResponse.error) {
        setSpecialists([]);
        toast.error("Не удалось загрузить SMM-специалистов");
      }

      const clientRows = clientsResponse.data ?? [];
      const specialistRows = specialistsResponse.data ?? [];

      setRawCount(clientRows.length);

      const mappedClients: ClientListItem[] = clientRows.map((client: SupabaseClient) => ({
        id: client.id,
        name: client.name,
        industry: "Клиент",
        status: "active",
        avatarColor: getAvatarColor(client.name),
      }));

      const mappedSpecialists: SpecialistListItem[] = specialistRows.map(
        (specialist: SupabaseSpecialist) => {
          const name = buildSpecialistName(specialist);

          return {
            id: `specialist-${specialist.id}`,
            name,
            subtitle: "Личный кабинет",
            avatarColor: getAvatarColor(name),
          };
        }
      );

      setClients(mappedClients);
      setSpecialists(mappedSpecialists);
      onClientsLoaded?.(clientRows.map((client: SupabaseClient) => ({ id: client.id, name: client.name })));
      setIsLoading(false);
    };

    fetchSidebarData();
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

  const filteredSpecialists = useMemo(
    () =>
      specialists.filter(
        (specialist) =>
          specialist.name.toLowerCase().includes(search.toLowerCase()) ||
          specialist.subtitle.toLowerCase().includes(search.toLowerCase())
      ),
    [specialists, search]
  );

  if (mode === "cabinet") {
    const visibleItems = cabinetSection === "clients" ? clients : filteredSpecialists;
    const sectionTitle =
      cabinetSection === "clients"
        ? `Все клиенты (${clients.length})`
        : `SMM специалисты (${filteredSpecialists.length})`;

    return (
      <div className="w-full flex flex-col h-full bg-[#111111] border-r border-[#1E1E1E]">
        <div className="px-5 py-5 border-b border-[#1E1E1E]">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-black" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-sm font-semibold text-white leading-tight">
                  Личный кабинет
                </h1>
                <p className="text-[10px] text-[#6B7280] leading-tight">
                  Клиенты и кабинеты команды
                </p>
              </div>
            )}
          </div>
        </div>

        {!collapsed && (
          <>
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

            <div className="p-3 border-b border-[#1E1E1E]">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder={cabinetSection === "clients" ? "Поиск клиентов..." : "Поиск специалистов..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCabinetSection("clients")}
                  className="flex items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all duration-200"
                  style={{
                    borderColor:
                      cabinetSection === "clients" ? "rgba(56,189,248,0.35)" : "#2A2A2A",
                    background:
                      cabinetSection === "clients" ? "rgba(56,189,248,0.12)" : "#151515",
                  }}
                >
                  <Briefcase
                    className="h-4 w-4"
                    style={{
                      color: cabinetSection === "clients" ? "#38BDF8" : "#8B93A7",
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Клиенты</p>
                    <p className="text-[11px] text-[#8B93A7]">Все компании</p>
                  </div>
                </button>

                <button
                  onClick={() => setCabinetSection("specialists")}
                  className="flex items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all duration-200"
                  style={{
                    borderColor:
                      cabinetSection === "specialists" ? "rgba(52,211,153,0.35)" : "#2A2A2A",
                    background:
                      cabinetSection === "specialists" ? "rgba(52,211,153,0.12)" : "#151515",
                  }}
                >
                  <Users
                    className="h-4 w-4"
                    style={{
                      color: cabinetSection === "specialists" ? "#34D399" : "#8B93A7",
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">SMM специалисты</p>
                    <p className="text-[11px] text-[#8B93A7]">Личные кабинеты</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider px-2 mb-1">
                {sectionTitle}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="px-5 py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
            </div>
          ) : visibleItems.length > 0 ? (
            <ul className="space-y-0.5 px-2">
              {visibleItems.map((item) => {
                const isSelected = selectedClientId === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectClient(item.id, item.name)}
                      className={`
                        w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-xl text-left
                        transition-all duration-200
                        ${isSelected ? "bg-white text-black" : "hover:bg-[#1A1A1A]"}
                      `}
                      title={collapsed ? item.name : undefined}
                    >
                      <ClientAvatar client={{ name: item.name, avatarColor: item.avatarColor }} />
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate leading-tight ${
                                isSelected ? "text-black" : "text-white"
                              }`}
                            >
                              {item.name}
                            </p>
                            <p
                              className={`text-[10px] truncate leading-tight mt-0.5 ${
                                isSelected ? "text-[#555]" : "text-[#6B7280]"
                              }`}
                            >
                              {"industry" in item ? item.industry : item.subtitle}
                            </p>
                          </div>
                          {"status" in item ? <StatusDot status={item.status} /> : null}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            !collapsed && (
              <div className="px-5 py-8 text-center space-y-2">
                <p className="text-sm text-[#6B7280]">
                  {cabinetSection === "clients"
                    ? "Нет клиентов"
                    : "Нет зарегистрированных SMM-специалистов"}
                </p>
                <p className="text-xs text-[#8B93A7]">
                  {cabinetSection === "clients"
                    ? "Клиенты загрузятся здесь автоматически."
                    : "Как только специалисты зарегистрированы, они появятся здесь."}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full bg-[#111111] border-r border-[#1E1E1E]">
      <div className="px-5 py-5 border-b border-[#1E1E1E]">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-black" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">
                SMM Agency
              </h1>
              <p className="text-[10px] text-[#6B7280] leading-tight">
                AI-powered dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
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
      )}

      {!isLoading && !collapsed && (
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
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider px-2 mb-1">
              Клиенты ({isLoading ? 0 : filtered.length})
            </p>
          </div>
        )}

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
                      flex items-center ${collapsed ? "justify-center" : "gap-2"} px-2 py-1.5 rounded-xl
                      transition-all duration-200
                      ${isSelected ? "bg-white text-black" : "hover:bg-[#1A1A1A]"}
                    `}
                    title={collapsed ? client.name : undefined}
                  >
                    <button
                      onClick={() => onSelectClient(client.id, client.name)}
                      className={`flex min-w-0 ${collapsed ? "justify-center" : "flex-1 items-center gap-3"} text-left`}
                    >
                      <ClientAvatar client={client} />
                      {!collapsed && (
                        <>
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
                        </>
                      )}
                    </button>

                    {!collapsed && (
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
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          !collapsed && (
            <div className="px-5 py-8 text-center space-y-2">
              <p className="text-sm text-[#6B7280]">Нет клиентов</p>
              {!fetchError && (
                <p className="text-xs text-[#8B93A7]">
                  Запрос к таблице clients выполнился, но вернул 0 записей.
                </p>
              )}
            </div>
          )
        )}
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-[#1E1E1E]">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#2A2A2A] text-[#6B7280] hover:border-[#3A3A3A] hover:text-white text-sm transition-all duration-200 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            Новый клиент
          </button>
        </div>
      )}
    </div>
  );
}