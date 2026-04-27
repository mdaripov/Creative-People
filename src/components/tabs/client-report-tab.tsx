"use client";

import {
  BarChart3,
  CheckCircle2,
  Eye,
  FileText,
  Heart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function ClientReportTab({ data }: { data: ClientData }) {
  const approvedCount =
    data.contentPosts.filter((item) => item.approved).length +
    data.videoTZList.filter((item) => item.approved).length +
    data.editorTZList.filter((item) => item.approved).length;

  const completedWeeks = data.weeklyTracker.filter((week) =>
    week.tasks.every((task) => task.done)
  ).length;

  const totalWeeks = data.weeklyTracker.length;

  const avgQualityScore = Math.round(
    data.qualityReport.reduce((sum, item) => sum + item.score, 0) / data.qualityReport.length
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <section className="rounded-[28px] border border-[#1E1E1E] bg-[#161616] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
              <FileText className="h-3.5 w-3.5" />
              Отчёт клиенту
            </div>
            <h3 className="text-2xl font-semibold text-white">
              Итоги работы для {data.client.name}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8B93A7]">
              Краткая витрина результатов: прогресс по контенту, выполненные задачи,
              лучший материал и основные показатели за период.
            </p>
          </div>

          <div className="rounded-3xl border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-3">
            <p className="text-xs text-[#86EFAC]">Статус</p>
            <p className="mt-1 text-sm font-semibold text-white">Отчёт готов к показу клиенту</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: CheckCircle2,
            label: "Утверждено материалов",
            value: approvedCount,
            color: "#34D399",
          },
          {
            icon: BarChart3,
            label: "Средняя оценка качества",
            value: `${avgQualityScore}/10`,
            color: "#A78BFA",
          },
          {
            icon: TrendingUp,
            label: "Публикаций в LinkedIn",
            value: data.linkedInStats.published,
            color: "#38BDF8",
          },
          {
            icon: Eye,
            label: "Суммарный охват",
            value: formatNumber(data.linkedInStats.totalReach),
            color: "#FBBF24",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-4"
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
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
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#A78BFA]" />
            <h4 className="text-sm font-semibold text-white">Что было сделано</h4>
          </div>

          <div className="space-y-3">
            {data.nextMonthPlan.items.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-[#222222] bg-[#121212] px-4 py-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-xs font-semibold text-[#A78BFA]">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-[#D1D5DB]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-[#F472B6]" />
            <h4 className="text-sm font-semibold text-white">Лучший материал</h4>
          </div>

          <div className="rounded-3xl border border-[#222222] bg-[#121212] p-4">
            <p className="text-lg font-semibold text-white">{data.bestReel.title}</p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Просмотры", value: formatNumber(data.bestReel.views) },
                { label: "Лайки", value: formatNumber(data.bestReel.likes) },
                { label: "Сохранения", value: formatNumber(data.bestReel.saves) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#1E1E1E] bg-[#171717] p-3 text-center"
                >
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] text-[#8B93A7]">{item.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#C9D1E1]">
              {data.bestReel.analysis}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#34D399]" />
          <h4 className="text-sm font-semibold text-white">Прогресс по неделям</h4>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {data.weeklyTracker.map((week) => {
            const done = week.tasks.filter((task) => task.done).length;
            const total = week.tasks.length;
            const percent = total ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={week.week}
                className="rounded-2xl border border-[#222222] bg-[#121212] p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{week.week}</p>
                  <span className="text-xs text-[#8B93A7]">
                    {done}/{total}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#1E1E1E]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      background: percent === 100 ? "#34D399" : "#38BDF8",
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#8B93A7]">
                  {percent === 100
                    ? "Неделя выполнена полностью"
                    : "Есть задачи в работе"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-3">
          <p className="text-sm text-white">
            Полностью завершено недель:{" "}
            <span className="font-semibold text-[#34D399]">
              {completedWeeks} из {totalWeeks}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}