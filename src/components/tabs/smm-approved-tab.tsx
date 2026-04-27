"use client";

import { CheckCircle2, FileText, FolderOpen, MessageSquareText, Scissors, Video } from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import { useApprovedSmmItems } from "@/hooks/use-approved-smm-items";
import type { ClientData } from "@/lib/mock-data";

export function SmmApprovedTab({ data }: { data: ClientData }) {
  const { approvedItems } = useApprovedSmmItems(data.client.id);
  const approvedPosts = data.contentPosts.filter((item) => item.approved);
  const approvedVideoTZ = data.videoTZList.filter((item) => item.approved);
  const approvedEditorTZ = data.editorTZList.filter((item) => item.approved);

  const totalApproved =
    approvedItems.length +
    approvedPosts.length +
    approvedVideoTZ.length +
    approvedEditorTZ.length;

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="mb-5 rounded-3xl border border-[#262626] bg-[#131313] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FBBF24]/20 bg-[#FBBF24]/10 text-[#FBBF24]">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">ИИ СММ — утверждено</h3>
              <p className="text-sm text-[#8B93A7]">
                Отдельная папка с подтвержденным контентом, сообщениями и техническими заданиями.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-2 text-sm font-medium text-[#34D399]">
            <CheckCircle2 className="h-4 w-4" />
            Всего утверждено: {totalApproved}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <section className="rounded-3xl border border-[#1E1E1E] bg-[#161616] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-3">
            <MessageSquareText className="h-4 w-4 text-[#A78BFA]" />
            <h4 className="text-sm font-semibold text-white">Утвержденные ответы ИИ SMM</h4>
            <span className="ml-auto text-xs text-[#8B93A7]">{approvedItems.length}</span>
          </div>
          <div className="p-4">
            {approvedItems.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Пока нет утвержденных ответов из чата.</p>
            ) : (
              <div className="space-y-3">
                {approvedItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#222222] bg-[#121212] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#A78BFA]/10 px-2.5 py-1 text-[11px] font-medium text-[#A78BFA]">
                        ИИ SMM
                      </span>
                      <span className="text-xs text-[#8B93A7]">
                        Утверждено
                      </span>
                    </div>
                    <FormattedRichText text={item.text} accent="#A78BFA" compact />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#1E1E1E] bg-[#161616] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-3">
            <FileText className="h-4 w-4 text-[#A78BFA]" />
            <h4 className="text-sm font-semibold text-white">Контент-план</h4>
            <span className="ml-auto text-xs text-[#8B93A7]">{approvedPosts.length}</span>
          </div>
          <div className="p-4">
            {approvedPosts.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Пока нет утвержденных постов.</p>
            ) : (
              <div className="space-y-3">
                {approvedPosts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-[#222222] bg-[#121212] p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#A78BFA]/10 px-2.5 py-1 text-[11px] font-medium text-[#A78BFA]">
                        {post.type}
                      </span>
                      <span className="text-xs text-[#8B93A7]">{post.platform}</span>
                      <span className="text-xs text-[#8B93A7]">•</span>
                      <span className="text-xs text-[#8B93A7]">{post.date}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{post.topic}</p>
                    <p className="mt-1 text-sm text-[#9CA3AF]">{post.caption}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#1E1E1E] bg-[#161616] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-3">
            <Video className="h-4 w-4 text-[#38BDF8]" />
            <h4 className="text-sm font-semibold text-white">ТЗ для видеографа</h4>
            <span className="ml-auto text-xs text-[#8B93A7]">{approvedVideoTZ.length}</span>
          </div>
          <div className="p-4">
            {approvedVideoTZ.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Пока нет утвержденных ТЗ для видеографа.</p>
            ) : (
              <div className="space-y-3">
                {approvedVideoTZ.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#222222] bg-[#121212] p-4">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-[#8B93A7]">{item.duration}</p>
                    <ul className="mt-3 space-y-1.5">
                      {item.scenes.map((scene, index) => (
                        <li key={index} className="text-sm text-[#C9D1E1]">
                          {index + 1}. {scene}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#1E1E1E] bg-[#161616] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-3">
            <Scissors className="h-4 w-4 text-[#34D399]" />
            <h4 className="text-sm font-semibold text-white">ТЗ для монтажёра</h4>
            <span className="ml-auto text-xs text-[#8B93A7]">{approvedEditorTZ.length}</span>
          </div>
          <div className="p-4">
            {approvedEditorTZ.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Пока нет утвержденных ТЗ для монтажёра.</p>
            ) : (
              <div className="space-y-3">
                {approvedEditorTZ.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#222222] bg-[#121212] p-4">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-[#1E1E1E] bg-[#181818] p-3">
                        <p className="text-[11px] text-[#6B7280]">Стиль</p>
                        <p className="mt-1 text-sm text-[#E5E7EB]">{item.style}</p>
                      </div>
                      <div className="rounded-2xl border border-[#1E1E1E] bg-[#181818] p-3">
                        <p className="text-[11px] text-[#6B7280]">Музыка</p>
                        <p className="mt-1 text-sm text-[#E5E7EB]">{item.music}</p>
                      </div>
                      <div className="rounded-2xl border border-[#1E1E1E] bg-[#181818] p-3">
                        <p className="text-[11px] text-[#6B7280]">Переходы</p>
                        <p className="mt-1 text-sm text-[#E5E7EB]">{item.transitions}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.effects.map((effect, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-2.5 py-1 text-[11px] text-[#34D399]"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}