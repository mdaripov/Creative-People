"use client";

import { useState } from "react";
import {
  Send,
  RefreshCw,
  Eye,
  TrendingUp,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

const statusConfig = {
  published: {
    label: "Опубликован",
    color: "text-[#34D399]",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
  },
  scheduled: {
    label: "Запланирован",
    color: "text-[#38BDF8]",
    bg: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.2)",
  },
  draft: {
    label: "Черновик",
    color: "text-[#6B7280]",
    bg: "rgba(107,114,128,0.1)",
    border: "rgba(107,114,128,0.2)",
  },
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

interface LinkedInTabProps {
  data: ClientData;
}

export function LinkedInTab({ data }: LinkedInTabProps) {
  const [isAdapting, setIsAdapting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [adaptedId, setAdaptedId] = useState<string | null>(null);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());

  const handleAdapt = async () => {
    setIsAdapting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsAdapting(false);
    setAdaptedId(data.linkedInPosts[0].id);
  };

  const handlePublish = async (postId: string) => {
    setIsPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsPublishing(false);
    setPublishedIds((prev) => new Set([...prev, postId]));
  };

  const stats = data.linkedInStats;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: CheckCircle2,
            color: "#34D399",
            label: "Опубликовано",
            value: stats.published,
            suffix: "постов",
          },
          {
            icon: Calendar,
            color: "#38BDF8",
            label: "Запланировано",
            value: stats.scheduled,
            suffix: "постов",
          },
          {
            icon: Eye,
            color: "#A78BFA",
            label: "Общий охват",
            value: formatNumber(stats.totalReach),
            suffix: "просмотров",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl p-4 bg-[#161616] border border-[#1E1E1E] animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}25`,
                }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-[10px] text-[#6B7280] leading-tight">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleAdapt}
          disabled={isAdapting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-medium hover:bg-[#38BDF8]/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAdapting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Адаптация...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Адаптировать контент
            </>
          )}
        </button>
        <button
          onClick={() => handlePublish(data.linkedInPosts[0].id)}
          disabled={isPublishing || publishedIds.has(data.linkedInPosts[0].id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-xs font-medium hover:bg-[#34D399]/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Публикация...
            </>
          ) : publishedIds.has(data.linkedInPosts[0].id) ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Опубликовано
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Опубликовать
            </>
          )}
        </button>
      </div>

      {/* Posts queue */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-sm font-semibold text-white">Очередь постов</h3>
          <span className="ml-auto text-xs text-[#6B7280]">
            {data.linkedInPosts.length} постов
          </span>
        </div>

        <div className="rounded-2xl border border-[#1E1E1E] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-[#161616] border-b border-[#1E1E1E]">
            <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">
              Превью
            </span>
            <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">
              Дата
            </span>
            <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">
              Статус
            </span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-[#1A1A1A]">
            {data.linkedInPosts.map((post, i) => {
              const status = statusConfig[post.status];
              const isAdapted = adaptedId === post.id;
              const isPublishedNow = publishedIds.has(post.id);
              const effectiveStatus = isPublishedNow ? "published" : post.status;
              const effectiveStatusConfig = statusConfig[effectiveStatus];

              return (
                <div
                  key={post.id}
                  className={`grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-[#161616] transition-colors animate-fade-in-up ${
                    isAdapted ? "bg-[#38BDF8]/5" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#D1D5DB] truncate leading-tight">
                      {post.preview}
                    </p>
                    {(post.reach || post.engagement) && (
                      <div className="flex items-center gap-3 mt-1">
                        {post.reach && (
                          <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                            <Eye className="w-3 h-3" />
                            {formatNumber(post.reach)}
                          </span>
                        )}
                        {post.engagement && (
                          <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                            <TrendingUp className="w-3 h-3" />
                            {post.engagement}%
                          </span>
                        )}
                      </div>
                    )}
                    {isAdapted && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#38BDF8]">
                        <RefreshCw className="w-2.5 h-2.5" />
                        Адаптирован для LinkedIn
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6B7280] whitespace-nowrap">
                    {post.scheduledDate}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium border whitespace-nowrap"
                    style={{
                      color: effectiveStatusConfig.color,
                      background: effectiveStatusConfig.bg,
                      borderColor: effectiveStatusConfig.border,
                    }}
                  >
                    {effectiveStatusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
