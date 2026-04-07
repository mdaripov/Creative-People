"use client";

import { useState } from "react";
import {
  CheckCircle2,
  FolderOpen,
  Sparkles,
  Video,
  Scissors,
  FileText,
  ChevronDown,
  ChevronUp,
  Instagram,
  Linkedin,
} from "lucide-react";
import type { ClientData, ContentPost, VideoTZ, EditorTZ } from "@/lib/mock-data";

type ApprovedFolder = {
  contentPosts: ContentPost[];
  videoTZList: VideoTZ[];
  editorTZList: EditorTZ[];
};

const typeLabels: Record<ContentPost["type"], string> = {
  reel: "Рилс",
  post: "Пост",
  story: "Сторис",
  carousel: "Карусель",
};

const typeColors: Record<ContentPost["type"], string> = {
  reel: "#A78BFA",
  post: "#38BDF8",
  story: "#FBBF24",
  carousel: "#34D399",
};

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "Instagram") return <Instagram className="w-3 h-3" />;
  if (platform === "LinkedIn") return <Linkedin className="w-3 h-3" />;
  return <span className="text-[10px]">{platform[0]}</span>;
}

function SectionToggle({
  title,
  icon,
  color,
  count,
  approvedCount,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  approvedCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl bg-[#161616] border border-[#1E1E1E] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#1A1A1A] transition-colors"
      >
        <span style={{ color }}>{icon}</span>
        <span className="text-sm font-semibold text-white flex-1 text-left">{title}</span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
        >
          {approvedCount}/{count} утверждено
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#6B7280]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        )}
      </button>
      {open && <div className="border-t border-[#1E1E1E]">{children}</div>}
    </div>
  );
}

export function SmmTab({ data }: { data: ClientData }) {
  const [posts, setPosts] = useState<ContentPost[]>(data.contentPosts);
  const [videos, setVideos] = useState<VideoTZ[]>(data.videoTZList);
  const [editors, setEditors] = useState<EditorTZ[]>(data.editorTZList);
  const [folderOpen, setFolderOpen] = useState(false);

  const approved: ApprovedFolder = {
    contentPosts: posts.filter((p) => p.approved),
    videoTZList: videos.filter((v) => v.approved),
    editorTZList: editors.filter((e) => e.approved),
  };
  const totalApproved =
    approved.contentPosts.length +
    approved.videoTZList.length +
    approved.editorTZList.length;

  const approvePost = (id: string) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, approved: true } : p)));
  const approveVideo = (id: string) =>
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, approved: true } : v)));
  const approveEditor = (id: string) =>
    setEditors((prev) => prev.map((e) => (e.id === id ? { ...e, approved: true } : e)));

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Approved folder */}
      <div className="rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <button
          onClick={() => setFolderOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] hover:bg-[#1E1E1E] transition-colors"
        >
          <FolderOpen className="w-4 h-4 text-[#FBBF24]" />
          <span className="text-sm font-semibold text-white flex-1 text-left">
            Контент-план (утверждённые)
          </span>
          {totalApproved > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/25">
              {totalApproved}
            </span>
          )}
          {folderOpen ? (
            <ChevronUp className="w-4 h-4 text-[#6B7280]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6B7280]" />
          )}
        </button>

        {folderOpen && (
          <div className="bg-[#111111] border-t border-[#1E1E1E] p-4 space-y-4">
            {totalApproved === 0 ? (
              <p className="text-xs text-[#6B7280] text-center py-4">
                Утверждённых материалов пока нет. Нажмите «Утвердить» на любом элементе.
              </p>
            ) : (
              <>
                {approved.contentPosts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                      📅 Посты ({approved.contentPosts.length})
                    </p>
                    <div className="space-y-2">
                      {approved.contentPosts.map((p) => (
                        <div key={p.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#161616] border border-[#1E1E1E]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white">{p.topic}</p>
                            <p className="text-[10px] text-[#6B7280] mt-0.5">{p.platform} · {p.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {approved.videoTZList.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                      🎬 ТЗ видеографа ({approved.videoTZList.length})
                    </p>
                    <div className="space-y-2">
                      {approved.videoTZList.map((v) => (
                        <div key={v.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#161616] border border-[#1E1E1E]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-white">{v.title}</p>
                            <p className="text-[10px] text-[#6B7280] mt-0.5">{v.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {approved.editorTZList.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                      ✂️ ТЗ монтажёра ({approved.editorTZList.length})
                    </p>
                    <div className="space-y-2">
                      {approved.editorTZList.map((e) => (
                        <div key={e.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#161616] border border-[#1E1E1E]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-white">{e.title}</p>
                            <p className="text-[10px] text-[#6B7280] mt-0.5">{e.style}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Content plan */}
      <SectionToggle
        title="Контент-план"
        icon={<FileText className="w-4 h-4" />}
        color="#A78BFA"
        count={posts.length}
        approvedCount={posts.filter((p) => p.approved).length}
      >
        <div className="divide-y divide-[#1A1A1A]">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="p-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                    style={{
                      background: `${typeColors[post.type]}15`,
                      color: typeColors[post.type],
                      border: `1px solid ${typeColors[post.type]}25`,
                    }}
                  >
                    {typeLabels[post.type]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                    <PlatformIcon platform={post.platform} />
                    {post.platform}
                  </span>
                  <span className="text-[10px] text-[#6B7280]">{post.date}</span>
                </div>
                {post.approved ? (
                  <span className="flex items-center gap-1 text-[10px] text-[#34D399] font-medium flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Утверждён
                  </span>
                ) : (
                  <button
                    onClick={() => approvePost(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[#A78BFA] text-[10px] font-medium hover:bg-[#A78BFA]/20 transition-all flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Утвердить
                  </button>
                )}
              </div>
              <p className="text-sm font-medium text-white mb-1">{post.topic}</p>
              <p className="text-xs text-[#9CA3AF] leading-relaxed line-clamp-2">{post.caption}</p>
            </div>
          ))}
        </div>
      </SectionToggle>

      {/* Video TZ */}
      <SectionToggle
        title="ТЗ для видеографа"
        icon={<Video className="w-4 h-4" />}
        color="#38BDF8"
        count={videos.length}
        approvedCount={videos.filter((v) => v.approved).length}
      >
        <div className="divide-y divide-[#1A1A1A]">
          {videos.map((tz, i) => (
            <div
              key={tz.id}
              className="p-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{tz.title}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">⏱ {tz.duration}</p>
                </div>
                {tz.approved ? (
                  <span className="flex items-center gap-1 text-[10px] text-[#34D399] font-medium flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Утверждено
                  </span>
                ) : (
                  <button
                    onClick={() => approveVideo(tz.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-[10px] font-medium hover:bg-[#38BDF8]/20 transition-all flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Утвердить
                  </button>
                )}
              </div>
              <div className="mb-3">
                <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">
                  Раскадровка
                </p>
                <div className="space-y-1.5">
                  {tz.scenes.map((scene, si) => (
                    <div key={si} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#38BDF8]/20">
                        {si + 1}
                      </span>
                      <p className="text-xs text-[#D1D5DB] leading-relaxed">{scene}</p>
                    </div>
                  ))}
                </div>
              </div>
              {tz.references.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">
                    Референсы
                  </p>
                  <div className="space-y-1">
                    {tz.references.map((ref, ri) => (
                      <p key={ri} className="text-[10px] text-[#38BDF8] truncate">
                        🔗 {ref}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionToggle>

      {/* Editor TZ */}
      <SectionToggle
        title="ТЗ для монтажёра"
        icon={<Scissors className="w-4 h-4" />}
        color="#34D399"
        count={editors.length}
        approvedCount={editors.filter((e) => e.approved).length}
      >
        <div className="divide-y divide-[#1A1A1A]">
          {editors.map((tz, i) => (
            <div
              key={tz.id}
              className="p-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-semibold text-white">{tz.title}</p>
                {tz.approved ? (
                  <span className="flex items-center gap-1 text-[10px] text-[#34D399] font-medium flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Утверждено
                  </span>
                ) : (
                  <button
                    onClick={() => approveEditor(tz.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-[10px] font-medium hover:bg-[#34D399]/20 transition-all flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Утвердить
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {[
                  { label: "Стиль монтажа", value: tz.style },
                  { label: "Музыка", value: tz.music },
                  { label: "Переходы", value: tz.transitions },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#111111] border border-[#1E1E1E] p-3">
                    <p className="text-[9px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">
                  Эффекты и детали
                </p>
                <div className="space-y-1.5">
                  {tz.effects.map((effect, ei) => (
                    <div key={ei} className="flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-[#34D399] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#D1D5DB] leading-relaxed">{effect}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionToggle>
    </div>
  );
}
