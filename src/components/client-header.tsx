"use client";

import { Clock, Instagram, Linkedin, Video } from "lucide-react";
import type { Client, ClientStatus } from "@/lib/mock-data";

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-3.5 h-3.5" />,
  LinkedIn: <Linkedin className="w-3.5 h-3.5" />,
  TikTok: <Video className="w-3.5 h-3.5" />,
};

const statusConfig: Record<ClientStatus, { label: string; color: string; dot: string }> = {
  active: {
    label: "Active",
    color: "text-[#34D399] bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.2)]",
    dot: "bg-[#34D399]",
  },
  paused: {
    label: "Paused",
    color: "text-[#9CA3AF] bg-[rgba(156,163,175,0.1)] border-[rgba(156,163,175,0.2)]",
    dot: "bg-[#6B7280]",
  },
  review: {
    label: "Review",
    color: "text-[#FBBF24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]",
    dot: "bg-[#FBBF24]",
  },
};

interface ClientHeaderProps {
  client: Client;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const status = statusConfig[client.status];
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="px-6 py-5 border-b border-[#1E1E1E] bg-[#0F0F0F]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
            style={{ backgroundColor: client.avatarColor }}
          >
            {initials}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">{client.name}</h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm text-[#6B7280]">{client.industry}</span>
              <span className="text-[#2A2A2A]">·</span>
              {/* Platforms */}
              <div className="flex items-center gap-1.5">
                {client.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] text-[10px]"
                  >
                    {platformIcons[platform]}
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Активность: {client.lastActive}</span>
          </div>
        </div>
      </div>
    </div>
  );
}