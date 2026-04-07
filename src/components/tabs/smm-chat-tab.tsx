"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, User, Paperclip, Mic } from "lucide-react";
import type { ClientData } from "@/lib/mock-data";

interface Message {
  id: string;
  role: "agent" | "user";
  text: string;
}

const starterPrompts = [
  "Собери контент-план на неделю",
  "Подготовь ТЗ для видеографа",
  "Сделай идеи для Reels",
  "Предложи 3 контент-рубрики",
];

const WEBHOOK_URL = "https://n8n19643.hostkey.in/webhook/client-agent";

export function SmmChatTab({ data }: { data: ClientData }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: `Привет! Я ИИ SMM-агент для ${data.client.name}. Могу помочь с контент-планом, идеями, ТЗ и стратегией.`,
    },
  ]);

  const handleSend = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: value },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: value,
          client_id: data.client.id,
        }),
      });

      const responseData = await response.json();
      const result = responseData.result || responseData.output || "";

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now() + 1}`,
          role: "agent",
          text: result,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now() + 1}`,
          role: "agent",
          text: "Ошибка подключения. Попробуйте снова.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="border-b border-[#1A1A1A] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-medium text-[#A78BFA]">
              <Sparkles className="h-3.5 w-3.5" />
              ИИ агент активен
            </div>
            <h3 className="text-lg font-semibold text-white">Чат с ИИ SMM-агентом</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#8B93A7]">
              Используйте чат для постановки задач по контенту, креативам, ТЗ и публикациям.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-xl border border-[#222222] bg-[#141414] px-3 py-2 text-left text-xs text-[#C9D1E1] transition-all duration-200 hover:border-[#A78BFA]/30 hover:bg-[#191919] hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {messages.map((message) => {
            const isAgent = message.role === "agent";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isAgent ? "justify-start" : "justify-end"}`}
              >
                {isAgent && (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#A78BFA]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 sm:max-w-[70%] ${
                    isAgent
                      ? "border border-[#1F2230] bg-[#14161C] text-[#E5E7EB]"
                      : "border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-white"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-medium ${
                        isAgent ? "text-[#A78BFA]" : "text-[#7DD3FC]"
                      }`}
                    >
                      {isAgent ? "ИИ SMM-агент" : "Вы"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>

                {!isAgent && (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#1A1A1A] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#1E1E1E] bg-[#121212] p-3">
          <div className="flex items-end gap-2">
            <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#222222] bg-[#171717] text-[#6B7280] transition-colors hover:text-white">
              <Paperclip className="h-4 w-4" />
            </button>

            <div className="min-h-10 flex-1 rounded-2xl border border-[#222222] bg-[#0F0F0F] px-4 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение ИИ агенту..."
                className="h-20 w-full resize-none bg-transparent text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
              />
            </div>

            <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#222222] bg-[#171717] text-[#6B7280] transition-colors hover:text-white">
              <Mic className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleSend(input)}
              disabled={isLoading}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 text-[#A78BFA] transition-all duration-200 hover:bg-[#A78BFA]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}