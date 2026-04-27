"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  Pencil,
  Scissors,
  Trash2,
  Video,
} from "lucide-react";
import { FormattedRichText } from "@/components/formatted-rich-text";
import { useApprovedSmmItems } from "@/hooks/use-approved-smm-items";
import type { ClientData } from "@/lib/mock-data";

interface ApprovedAnswerCardProps {
  id: string;
  text: string;
  createdAt: string;
  onSave: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

function ApprovedAnswerCard({
  id,
  text,
  createdAt,
  onSave,
  onDelete,
}: ApprovedAnswerCardProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  const handleSave = () => {
    onSave(id, draft.trim() || text);
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-[#222222] bg-[#121212] overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#171717]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#A78BFA]">
          <FileText className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {text.replace(/\n/g, " ").slice(0, 90) || "Утверждённый материал"}
          </p>
          <p className="mt-1 text-xs text-[#8B93A7]">
            {new Date(createdAt).toLocaleString("ru-RU")}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[#8B93A7]">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#1E1E1E] p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 px-3 py-2 text-xs font-medium text-[#34D399] transition-colors hover:bg-[#34D399]/20"
              >
                Сохранить
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-3 py-2 text-xs font-medium text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20"
              >
                <Pencil className="h-3.5 w-3.5" />
                Корректировать
              </button>
            )}

            <button
              onClick={() => onDelete(id)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs font-medium text-[#F87171] transition-colors hover:bg-[#EF4444]/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-[220px] w-full rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
            />
          ) : (
            <FormattedRichText text={text} accent="#A78BFA" compact />
          )}
        </div>
      )}
    </div>
  );
}

export function SmmApprovedTab({ data }: { data: ClientData }) {
  const { approvedItems, updateItem, removeItem } = useApprovedSmmItems(data.client.id);
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
                Здесь собраны утверждённые материалы с возможностью открыть, поправить и удалить.
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
            <FileText className="h-4 w-4 text-[#A78BFA]" />
            <h4 className="text-sm font-semibold text-white">Контент-план</h4>
            <span className="ml-auto text-xs text-[#8B93A7]">
              {approvedItems.length + approvedPosts.length}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {approvedItems.length === 0 && approvedPosts.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Пока нет утвержденных материалов.</p>
            ) : (
              <>
                {approvedItems.map((item) => (
                  <ApprovedAnswerCard
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    createdAt={item.createdAt}
                    onSave={updateItem}
                    onDelete={removeItem}
                  />
                ))}

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
              </>
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