"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

interface MentorMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const quickPrompts = [
  "Как улучшить контент-стратегию?",
  "С чего начать развитие личного бренда?",
  "Какой контент публиковать 3 раза в неделю?",
  "Как повысить вовлеченность?",
];

export function MentorChatView() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: "mentor-welcome",
      role: "assistant",
      text: "Привет! Я ИИ СММ наставник. Это оболочка чата, куда позже можно подключить вашу логику, подсказки и полноценные ответы агента.",
    },
  ]);

  const handleSend = async (value: string) => {
    const text = value.trim();
    if (!text || isLoading) return;

    const webhookUrl =
      process.env.NEXT_PUBLIC_MENTOR_WEBHOOK_URL ||
      "https://n8n19643.hostkey.in/webhook/8aa0f5e4-74f0-4304-b5e5-116b147492d6";

    const userMessage: MentorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();
      const result = data.result || data.output || "";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now() + 1}`,
          role: "assistant",
          text: result,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now() + 1}`,
          role: "assistant",
          text: "Ошибка подключения. Попробуйте снова.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0F0F0F] animate-fade-in">
      <div className="border-b border-[#1A1A1A] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-medium text-[#A78BFA]">
              <Sparkles className="h-3.5 w-3.5" />
              Режим наставника
            </div>
            <h2 className="text-xl font-semibold text-white">ИИ СММ наставник</h2>
            <p className="mt-1 max-w-2xl text-sm text-[#8B93A7]">
              Отдельный чат-интерфейс для общения с наставником по стратегии, контенту и росту.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-2xl border border-[#222222] bg-[#141414] px-3 py-2.5 text-left text-xs text-[#C9D1E1] transition-all duration-200 hover:border-[#A78BFA]/30 hover:bg-[#191919] hover:text-white"
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
            const isAssistant = message.role === "assistant";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {isAssistant && (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#A78BFA]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 sm:max-w-[70%] ${
                    isAssistant
                      ? "border border-[#1F2230] bg-[#14161C] text-[#E5E7EB]"
                      : "border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-white"
                  }`}
                >
                  <div className="mb-1 text-[11px] font-medium">
                    <span className={isAssistant ? "text-[#A78BFA]" : "text-[#7DD3FC]"}>
                      {isAssistant ? "ИИ СММ наставник" : "Вы"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>

                {!isAssistant && (
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
            <div className="flex-1 rounded-2xl border border-[#222222] bg-[#0F0F0F] px-4 py-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение наставнику..."
                className="h-20 w-full resize-none bg-transparent text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleSend(input)}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 text-[#A78BFA] transition-all duration-200 hover:bg-[#A78BFA]/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}