"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Linkedin,
  Loader2,
  RefreshCw,
  Send,
  TrendingUp,
} from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

const statusConfig = {
  published: {
    label: "Опубликован",
    color: "#34D399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
  },
  scheduled: {
    label: "Запланирован",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.2)",
  },
  draft: {
    label: "Черновик",
    color: "#9CA3AF",
    bg: "rgba(156,163,175,0.1)",
    border: "rgba(156,163,175,0.2)",
  },
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function LinkedInTab({ data }: { data: ClientData }) {
  const [isAdapting, setIsAdapting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [adaptedId, setAdaptedId] = useState<string | null>(null);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());

  const firstPost = data.linkedInPosts[0];

  const handleAdapt = async () => {
    setIsAdapting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsAdapting(false);
    setAdaptedId(firstPost.id);
  };

  const handlePublish = async (postId: string) => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsPublishing(false);
    setPublishedIds((prev) => new Set([...prev, postId]));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="rounded-3xl border border-[#1E1E1E] bg-[#131720] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-3 py-1 text-[11px] font-medium text-[#38BDF8]">
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn-автопостинг
            </div>
            <h3 className="text-lg font-semibold text-white">Адаптация и публикация контента</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#8B93A7]">
              Здесь можно преобразовывать контент под LinkedIn и запускать автопостинг.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAdapt}
              disabled={isAdapting}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 py-2.5 text-xs font-medium text-[#38BDF8] transition-all duration-200 hover:bg-[#38BDF8]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAdapting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Адаптация...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Преобразовать под LinkedIn
                </>
              )}
            </button>

            <button
              onClick={() => handlePublish(firstPost.id)}
              disabled={isPublishing || publishedIds.has(firstPost.id)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-2.5 text-xs font-medium text-[#34D399] transition-all duration-200 hover:bg-[#34D399]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Публикация...
                </>
              ) : publishedIds.has(firstPost.id) ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Опубликовано
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Запустить автопостинг
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: CheckCircle2,
            color: "#34D399",
            label: "Опубликовано",
            value: data.linkedInStats.published,
          },
          {
            icon: Calendar,
            color: "#38BDF8",
            label: "Запланировано",
            value: data.linkedInStats.scheduled,
          },
          {
            icon: Eye,
            color: "#A78BFA",
            label: "Охват",
            value: formatNumber(data.linkedInStats.totalReach),
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-[#1E1E1E] bg-[#161616] p-4"
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

      <div className="rounded-3xl border border-[#1E1E1E] bg-[#161616] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-3">
          <FileText className="h-4 w-4 text-[#38BDF8]" />
          <h4 className="text-sm font-semibold text-white">Очередь постов</h4>
          <span className="ml-auto text-xs text-[#8B93A7]">{data.linkedInPosts.length}</span>
        </div>

        <div className="divide-y divide-[#1E1E1E]">
          {data.linkedInPosts.map((post) => {
            const isAdapted = adaptedId === post.id;
            const isPublished = publishedIds.has(post.id);
            const statusKey = isPublished ? "published" : post.status;
            const status = statusConfig[statusKey];

            return (
              <div key={post.id} className={`p-4 ${isAdapted ? "bg-[#38BDF8]/5" : ""}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#38BDF8]/10 px-2.5 py-1 text-[11px] font-medium text-[#38BDF8]">
                        LinkedIn
                      </span>
                      <span className="text-xs text-[#8B93A7]">{post.scheduledDate}</span>
                      {isAdapted && (
                        <span className="rounded-full bg-[#A78BFA]/10 px-2.5 py-1 text-[11px] font-medium text-[#A78BFA]">
                          Адаптирован
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white">{post.preview}</p>

                    {(post.reach || post.engagement) && (
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#8B93A7]">
                        {post.reach ? (
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {formatNumber(post.reach)}
                          </span>
                        ) : null}
                        {post.engagement ? (
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {post.engagement}%
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <span
                    className="inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      color: status.color,
                      background: status.bg,
                      borderColor: status.border,
                    }}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}