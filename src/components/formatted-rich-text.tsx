"use client";

import { ExternalLink } from "lucide-react";

interface FormattedRichTextProps {
  text: string;
  accent?: string;
  compact?: boolean;
}

type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

type HeadingBlock = {
  type: "heading";
  text: string;
};

type QuoteBlock = {
  type: "quote";
  lines: string[];
};

type BulletListBlock = {
  type: "bullet-list";
  items: string[];
};

type OrderedListBlock = {
  type: "ordered-list";
  items: string[];
};

type SectionBlock = {
  type: "section";
  title: string;
  body: string[];
};

type RichTextBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | BulletListBlock
  | OrderedListBlock
  | SectionBlock;

function cleanUrlToken(token: string) {
  let url = token;
  let trailing = "";

  while (/[),.!?:;]$/.test(url)) {
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }

  return { url, trailing };
}

function renderInlineFormatting(text: string, keyPrefix: string, accent: string) {
  const parts = text.split(/(\*\*.*?\*\*|https?:\/\/[^\s<]+)/g).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;

    if (isBold) {
      return (
        <strong key={key} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("http://") || part.startsWith("https://")) {
      const { url, trailing } = cleanUrlToken(part);

      return (
        <span key={key} className="relative z-20 inline pointer-events-auto">
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="relative z-20 inline-flex items-center gap-1 break-all underline decoration-1 underline-offset-4 pointer-events-auto cursor-pointer hover:opacity-80"
            style={{ color: accent }}
          >
            <span>{url}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
          {trailing ? <span>{trailing}</span> : null}
        </span>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

function isHeadingLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed) return false;
  if (trimmed.startsWith("#")) return true;
  if (trimmed.length > 90) return false;
  if (/^[-•*]\s+/.test(trimmed)) return false;
  if (/^\d+[.)]\s+/.test(trimmed)) return false;
  if (trimmed.startsWith(">")) return false;

  if (trimmed.endsWith(":")) return true;
  if (/^[A-ZА-ЯЁ0-9][^.!?]{2,80}$/.test(trimmed)) return true;

  return false;
}

function normalizeHeading(line: string) {
  return line.replace(/^#{1,3}\s*/, "").trim();
}

function parseBlock(rawBlock: string): RichTextBlock[] {
  const lines = rawBlock
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const quoteLines = lines
    .filter((line) => line.startsWith(">"))
    .map((line) => line.replace(/^>\s?/, "").trim());

  if (quoteLines.length === lines.length) {
    return [{ type: "quote", lines: quoteLines }];
  }

  const bulletItems = lines
    .filter((line) => /^[-•*]\s+/.test(line))
    .map((line) => line.replace(/^[-•*]\s+/, "").trim());

  if (bulletItems.length === lines.length) {
    return [{ type: "bullet-list", items: bulletItems }];
  }

  const orderedItems = lines
    .filter((line) => /^\d+[.)]\s+/.test(line))
    .map((line) => line.replace(/^\d+[.)]\s+/, "").trim());

  if (orderedItems.length === lines.length) {
    return [{ type: "ordered-list", items: orderedItems }];
  }

  if (lines.length >= 2 && isHeadingLine(lines[0])) {
    return [
      {
        type: "section",
        title: normalizeHeading(lines[0]),
        body: lines.slice(1),
      },
    ];
  }

  if (lines.length === 1 && isHeadingLine(lines[0])) {
    return [{ type: "heading", text: normalizeHeading(lines[0]) }];
  }

  const result: RichTextBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    result.push({
      type: "paragraph",
      text: paragraphBuffer.join(" "),
    });
    paragraphBuffer = [];
  };

  lines.forEach((line) => {
    if (isHeadingLine(line)) {
      flushParagraph();
      result.push({ type: "heading", text: normalizeHeading(line) });
      return;
    }

    if (/^[-•*]\s+/.test(line)) {
      flushParagraph();
      result.push({
        type: "bullet-list",
        items: [line.replace(/^[-•*]\s+/, "").trim()],
      });
      return;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      result.push({
        type: "ordered-list",
        items: [line.replace(/^\d+[.)]\s+/, "").trim()],
      });
      return;
    }

    paragraphBuffer.push(line);
  });

  flushParagraph();

  return result;
}

function parseText(text: string): RichTextBlock[] {
  return text
    .split(/\n{2,}/)
    .flatMap((block) => parseBlock(block.trim()))
    .filter((block) => {
      if (block.type === "paragraph" || block.type === "heading") {
        return Boolean(block.text.trim());
      }

      if (block.type === "quote") return block.lines.length > 0;
      if (block.type === "bullet-list" || block.type === "ordered-list") {
        return block.items.length > 0;
      }

      return block.title.trim().length > 0 || block.body.length > 0;
    });
}

export function FormattedRichText({
  text,
  accent = "#A78BFA",
  compact = false,
}: FormattedRichTextProps) {
  const blocks = parseText(text);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return (
            <div key={key} className="border-b border-white/5 pb-2">
              <h4 className="text-sm font-semibold tracking-[0.01em] text-white sm:text-[15px]">
                {renderInlineFormatting(block.text, `${key}-heading`, accent)}
              </h4>
            </div>
          );
        }

        if (block.type === "paragraph") {
          return (
            <div
              key={key}
              className="text-sm leading-7 text-[#E5E7EB] sm:text-[15px] sm:leading-7"
            >
              {renderInlineFormatting(block.text, `${key}-paragraph`, accent)}
            </div>
          );
        }

        if (block.type === "quote") {
          return (
            <div
              key={key}
              className="rounded-2xl border-l-2 px-4 py-3"
              style={{
                background: `${accent}12`,
                borderColor: accent,
              }}
            >
              <div className="space-y-2">
                {block.lines.map((line, lineIndex) => (
                  <div
                    key={`${key}-quote-${lineIndex}`}
                    className="text-sm leading-7 text-[#F3F4F6]"
                  >
                    {renderInlineFormatting(line, `${key}-quote-inline-${lineIndex}`, accent)}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "bullet-list") {
          return (
            <ul key={key} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-bullet-${itemIndex}`} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <div className="text-sm leading-7 text-[#E5E7EB]">
                    {renderInlineFormatting(item, `${key}-bullet-inline-${itemIndex}`, accent)}
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={key} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-ordered-${itemIndex}`} className="flex items-start gap-3">
                  <span
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold"
                    style={{
                      color: accent,
                      background: `${accent}12`,
                      borderColor: `${accent}28`,
                    }}
                  >
                    {itemIndex + 1}
                  </span>
                  <div className="pt-0.5 text-sm leading-7 text-[#E5E7EB]">
                    {renderInlineFormatting(item, `${key}-ordered-inline-${itemIndex}`, accent)}
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <div
            key={key}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
          >
            <h4 className="mb-3 text-sm font-semibold text-white sm:text-[15px]">
              {renderInlineFormatting(block.title, `${key}-section-title`, accent)}
            </h4>
            <div className="space-y-3">
              {block.body.map((line, lineIndex) => (
                <div
                  key={`${key}-section-line-${lineIndex}`}
                  className="text-sm leading-7 text-[#E5E7EB] sm:text-[15px]"
                >
                  {renderInlineFormatting(line, `${key}-section-inline-${lineIndex}`, accent)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}