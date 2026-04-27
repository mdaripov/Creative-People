"use client";

import { FormattedRichText } from "@/components/formatted-rich-text";

interface ChatMessageContentProps {
  text: string;
}

export function ChatMessageContent({ text }: ChatMessageContentProps) {
  return <FormattedRichText text={text} accent="#A78BFA" compact />;
}