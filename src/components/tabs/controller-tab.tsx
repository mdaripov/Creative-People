"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Eye,
  FileBarChart,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useControllerPlan } from "@/hooks/use-controller-plan";
import type { AppRole } from "@/lib/auth";
import type { ClientData } from "@/lib/mock-data";

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

interface ControllerTabProps {
  data: ClientData;
  userId: string;
  role: AppRole;
}

export function ControllerTab({ data, userId, role }: ControllerTabProps) {
  const [newTask, setNewTask] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);
  const { tasks, loading, saving, addTask, toggleTask } = useControllerPlan(
    data.client.id,
    userId,
    role
  );

  const doneCount = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const reviewSummary = useMemo(() => {
    const postsDone = data.linkedInStats.published;
    const planned = tasks.length;
    const completed = doneCount;
    const topMetric = data.bestReel.views;

    return {
      postsDone,
      planned,
      completed,
      topMetric,
      status:
        completed === planned && planned > 0
          ? "План закрыт полностью"
          : completed > 0
          ? "Есть частичное выполнение"
          : "Нужна работа по плану",
      statusColor:
        completed === planned && planned > 0
          ? "#34D399"
          : completed > 0
          ? "#FBBF24"
          : "#EF4444",
      insight:
        completed === planned && planned > 0
          ? "ИИ-контроллер видит, что специалист закрыл весь недельный план и активность по клиенту выглядит ровной."
          : completed > 0
          ? "ИИ-контроллер видит, что часть задач выполнена, но план ещё не закрыт полностью."
          : "ИИ-контроллер видит, что по плану пока нет закрытых задач и нужно сверить действия с аккаунтом клиента.",
    };
  }, [data.bestReel.views, data.linkedInStats.published, doneCount, tasks.length]);

  const handleAddTask = async () => {
    const value = newTask.trim();
    if (!value) return;

    await addTask(value);
    setNewTask("");
  };

  const handleWeeklyCheck = async () => {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setIsChecking(false);
    setReviewReady(true);
  };

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="grid gap-5 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-5">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-medium text-[#34D399]">
                <ClipboardCheck className="h-3.5 w-3.5" />
                План специалиста
              </div>
              <h3 className="text-lg font-semibold text-white">Что нужно сделать по клиенту</h3>
              <p className="mt-1 max-w-2xl text-sm text-[#8B93A7]">
                Специалист сам ведёт недельный план, отмечает выполненные пункты, а готовые задачи автоматически зачеркиваются и сохраняются в Supabase.
              </p>
            </div>

            <div className="min-w-[220px] rounded-3xl border border-[#2A2A2A] bg-[#121212] p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-[#8B93A7]">
                <span>Прогресс недели</span>
                <span>{doneCount}/{tasks.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1E1E1E]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: progress >= 100 ? "#34D399" : "#38BDF8",
                  }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-white">{progress}% выполнено</p>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAddTask();
                  }
                }}
                placeholder="Добавить новый пункт плана..."
                className="h-12 w-full rounded-2xl border border-[#262626] bg-[#101010] px-4 text-sm text-white placeholder:text-[#6B7280] outline-none"
              />
            </div>
            <button
              onClick={() => void handleAddTask()}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 text-sm font-medium text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Добавить задачу
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-3xl border border-[#222222] bg-[#121212] p-6 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#8B93A7]" />
              </div>
            ) : tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => void toggleTask(task.id)}
                className="flex w-full items-start gap-3 rounded-3xl border border-[#222222] bg-[#121212] px-4 py-4 text-left transition-all duration-200 hover:bg-[#171717]"
              >
                <div className="pt-0.5">
                  {task.done ? (
                    <CheckCircle2 className="h-5 w-5 text-[#34D399]" />
                  ) : (
                    <Circle className="h-5 w-5 text-[#4B5563]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm transition-all duration-200 ${
                      task.done
                        ? "text-[#6B7280] line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
              </button>
            ))}

            {!loading && tasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#121212] p-6 text-center text-sm text-[#8B93A7]">
                Пока нет задач. Добавьте первый пункт недельного плана — он сохранится в базе.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-5">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-medium text-[#A78BFA]">
                <Sparkles className="h-3.5 w-3.5" />
                ИИ-контроллер
              </div>
              <h3 className="text-lg font-semibold text-white">Недельная сверка по аккаунту клиента</h3>
              <p className="mt-1 max-w-2xl text-sm text-[#8B93A7]">
                Нижний блок проверяет, что реально сделано по клиенту за неделю, и сравнивает это с планом специалиста.
              </p>
            </div>

            <button
              onClick={handleWeeklyCheck}
              disabled={isChecking}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 px-4 text-sm font-medium text-[#A78BFA] transition-colors hover:bg-[#A78BFA]/20 disabled:opacity-60"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Идёт сверка...
                </>
              ) : (
                <>
                  <FileBarChart className="h-4 w-4" />
                  Запустить недельную сверку
                </>
              )}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {[
              {
                icon: Target,
                label: "Задач в плане",
                value: reviewSummary.planned,
                color: "#38BDF8",
              },
              {
                icon: CheckCircle2,
                label: "Выполнено",
                value: reviewSummary.completed,
                color: "#34D399",
              },
              {
                icon: TrendingUp,
                label: "Публикаций в аккаунте",
                value: reviewSummary.postsDone,
                color: "#A78BFA",
              },
              {
                icon: Eye,
                label: "Лучший охват",
                value: formatNumber(reviewSummary.topMetric),
                color: "#FBBF24",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[#222222] bg-[#121212] p-4"
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}25`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-[#8B93A7]">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-[#222222] bg-[#121212] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#A78BFA]" />
                <p className="text-sm font-semibold text-white">Вывод ИИ-контроллера</p>
              </div>

              <div
                className="mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  color: reviewSummary.statusColor,
                  background: `${reviewSummary.statusColor}12`,
                  borderColor: `${reviewSummary.statusColor}30`,
                }}
              >
                {reviewSummary.status}
              </div>

              <p className="text-sm leading-relaxed text-[#D1D5DB]">
                {reviewReady
                  ? reviewSummary.insight
                  : "Запустите сверку, чтобы ИИ-контроллер сравнил недельный план специалиста с активностью клиента и показал итог."}
              </p>

              <div className="mt-4 space-y-2">
                {[
                  "Сверка публикаций и контент-активности за неделю",
                  "Сопоставление выполненных задач с реальными действиями",
                  "Быстрый вывод по качеству недельной работы",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#34D399]" />
                    <p className="text-sm text-[#C9D1E1]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#222222] bg-[#121212] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#F472B6]" />
                <p className="text-sm font-semibold text-white">Недельный фокус</p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                    Лучший материал
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{data.bestReel.title}</p>
                </div>

                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                    Что усиливать
                  </p>
                  <p className="mt-2 text-sm text-[#D1D5DB]">{data.bestReel.analysis}</p>
                </div>

                <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280]">
                    Следующий шаг
                  </p>
                  <p className="mt-2 text-sm text-[#D1D5DB]">
                    Повторить сильный формат и проверить, закрывает ли специалист недельный план полностью.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}