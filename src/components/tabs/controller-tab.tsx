"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  Circle,
  BarChart3,
  Star,
  ListChecks,
  FileBarChart,
  Loader2,
  TrendingUp,
  Eye,
  Heart,
  Bookmark,
} from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

interface ControllerTabProps {
  data: ClientData;
}

export function ControllerTab({ data }: ControllerTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    setReportGenerated(true);
  };

  const totalTasks = data.weeklyTracker.reduce(
    (acc, w) => acc + w.tasks.length,
    0
  );
  const doneTasks = data.weeklyTracker.reduce(
    (acc, w) => acc + w.tasks.filter((t) => t.done).length,
    0
  );
  const completionRate = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Weekly tracker */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-4 h-4 text-[#34D399]" />
          <h3 className="text-sm font-semibold text-white">
            Трекер публикаций
          </h3>
          <span className="ml-auto text-xs text-[#6B7280]">
            {doneTasks}/{totalTasks} выполнено
          </span>
          <span
            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold"
            style={{
              background:
                completionRate >= 80
                  ? "rgba(52,211,153,0.1)"
                  : completionRate >= 60
                  ? "rgba(251,191,36,0.1)"
                  : "rgba(239,68,68,0.1)",
              color:
                completionRate >= 80
                  ? "#34D399"
                  : completionRate >= 60
                  ? "#FBBF24"
                  : "#EF4444",
              border: `1px solid ${
                completionRate >= 80
                  ? "rgba(52,211,153,0.2)"
                  : completionRate >= 60
                  ? "rgba(251,191,36,0.2)"
                  : "rgba(239,68,68,0.2)"
              }`,
            }}
          >
            {completionRate}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.weeklyTracker.map((week, wi) => (
            <div
              key={week.week}
              className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4 animate-fade-in-up"
              style={{ animationDelay: `${wi * 0.07}s`, opacity: 0 }}
            >
              <p className="text-xs font-medium text-[#9CA3AF] mb-3">
                {week.week}
              </p>
              <div className="space-y-2">
                {week.tasks.map((task, ti) => (
                  <div key={ti} className="flex items-center gap-2.5">
                    {task.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#374151] flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        task.done ? "text-[#D1D5DB]" : "text-[#4B5563]"
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality report */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#34D399]" />
          <h3 className="text-sm font-semibold text-white">
            Отчёт для руководителя
          </h3>
        </div>

        <div className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4 space-y-3">
          {data.qualityReport.map((item, i) => {
            const pct = Math.round((item.score / item.maxScore) * 100);
            const color =
              pct >= 85 ? "#34D399" : pct >= 70 ? "#FBBF24" : "#EF4444";
            return (
              <div
                key={item.criterion}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#9CA3AF]">
                    {item.criterion}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: color,
                      boxShadow: `0 0 6px ${color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client report */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-[#34D399]" />
            <h3 className="text-sm font-semibold text-white">
              Отчёт для клиента
            </h3>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || reportGenerated}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-xs font-medium hover:bg-[#34D399]/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Генерация...
              </>
            ) : reportGenerated ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Отчёт готов
              </>
            ) : (
              <>
                <FileBarChart className="w-3.5 h-3.5" />
                Сгенерировать отчёт
              </>
            )}
          </button>
        </div>

        {/* Subscriber growth chart */}
        <div className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-[#6B7280]" />
            <p className="text-xs font-medium text-[#9CA3AF]">
              Динамика роста подписчиков
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={data.subscriberGrowth}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E1E1E"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "#1C1C1C",
                  border: "1px solid #2A2A2A",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#D1D5DB",
                }}
                formatter={(value: number) => [formatNumber(value), ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", color: "#6B7280" }}
                iconType="circle"
                iconSize={6}
              />
              <Line
                type="monotone"
                dataKey="instagram"
                name="Instagram"
                stroke="#A78BFA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#A78BFA" }}
              />
              <Line
                type="monotone"
                dataKey="linkedin"
                name="LinkedIn"
                stroke="#38BDF8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#38BDF8" }}
              />
              <Line
                type="monotone"
                dataKey="tiktok"
                name="TikTok"
                stroke="#34D399"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#34D399" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Best reel */}
        <div className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-[#FBBF24]" />
            <p className="text-xs font-medium text-[#9CA3AF]">
              Лучший рилс месяца
            </p>
          </div>
          <p className="text-sm font-semibold text-white mb-3">
            {data.bestReel.title}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { icon: Eye, label: "Просмотры", value: data.bestReel.views, color: "#A78BFA" },
              { icon: Heart, label: "Лайки", value: data.bestReel.likes, color: "#F472B6" },
              { icon: Bookmark, label: "Сохранения", value: data.bestReel.saves, color: "#FBBF24" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: `${stat.color}10`,
                    border: `1px solid ${stat.color}20`,
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5 mx-auto mb-1"
                    style={{ color: stat.color }}
                  />
                  <p
                    className="text-sm font-bold"
                    style={{ color: stat.color }}
                  >
                    {formatNumber(stat.value)}
                  </p>
                  <p className="text-[9px] text-[#6B7280] mt-0.5">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {data.bestReel.analysis}
          </p>
        </div>

        {/* Next month plan */}
        <div className="rounded-2xl bg-[#161616] border border-[#1E1E1E] p-4">
          <p className="text-xs font-medium text-[#9CA3AF] mb-3">
            📋 План на следующий месяц
          </p>
          <div className="space-y-2">
            {data.nextMonthPlan.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    color: "#34D399",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-xs text-[#D1D5DB] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
