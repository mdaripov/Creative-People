"use client";

interface ChatMessageContentProps {
  text: string;
}

function renderInlineFormatting(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;

    if (isBold) {
      return (
        <strong key={`${keyPrefix}-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
}

export function ChatMessageContent({ text }: ChatMessageContentProps) {
  const lines = text.split("\n").map((line) => line.trim());
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberBuffer: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;

    elements.push(
      <ul key={`bullets-${key}`} className="space-y-2 pl-1">
        {bulletBuffer.map((item, index) => (
          <li key={`bullet-${key}-${index}`} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#A78BFA]" />
            <span className="text-sm leading-7 text-[#E5E7EB]">
              {renderInlineFormatting(item, `bullet-inline-${key}-${index}`)}
            </span>
          </li>
        ))}
      </ul>
    );

    bulletBuffer = [];
  };

  const flushNumbers = (key: string) => {
    if (numberBuffer.length === 0) return;

    elements.push(
      <ol key={`numbers-${key}`} className="space-y-2 pl-1">
        {numberBuffer.map((item, index) => (
          <li key={`number-${key}-${index}`} className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#A78BFA]/25 bg-[#A78BFA]/10 text-[11px] font-semibold text-[#A78BFA]">
              {index + 1}
            </span>
            <span className="pt-0.5 text-sm leading-7 text-[#E5E7EB]">
              {renderInlineFormatting(item, `number-inline-${key}-${index}`)}
            </span>
          </li>
        ))}
      </ol>
    );

    numberBuffer = [];
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    const numberMatch = line.match(/^\d+[.)]\s+(.*)$/);

    if (!line) {
      flushBullets(`empty-b-${index}`);
      flushNumbers(`empty-n-${index}`);
      return;
    }

    if (bulletMatch) {
      flushNumbers(`before-bullet-${index}`);
      bulletBuffer.push(bulletMatch[1]);
      return;
    }

    if (numberMatch) {
      flushBullets(`before-number-${index}`);
      numberBuffer.push(numberMatch[1]);
      return;
    }

    flushBullets(`paragraph-b-${index}`);
    flushNumbers(`paragraph-n-${index}`);

    const isHeading =
      line.length < 80 &&
      !line.endsWith(".") &&
      !line.endsWith("!") &&
      !line.endsWith("?") &&
      line.includes(":");

    elements.push(
      <p
        key={`paragraph-${index}`}
        className={isHeading ? "text-sm font-semibold leading-7 text-white" : "text-sm leading-7 text-[#E5E7EB]"}
      >
        {renderInlineFormatting(line, `paragraph-inline-${index}`)}
      </p>
    );
  });

  flushBullets("final-b");
  flushNumbers("final-n");

  return <div className="space-y-3">{elements}</div>;
}