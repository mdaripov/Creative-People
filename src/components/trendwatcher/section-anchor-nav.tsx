"use client";

interface SectionAnchorNavProps {
  items: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
}

export function SectionAnchorNav({ items }: SectionAnchorNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#2A3548] bg-[#10151F] px-3 py-2 text-xs font-semibold text-[#C5CEE0] transition-colors hover:bg-[#151C28] hover:text-white"
        >
          <span>{item.label}</span>
          {typeof item.count === "number" ? (
            <span className="rounded-full border border-[#253042] bg-[#171E2A] px-2 py-0.5 text-[10px] text-[#8EA0BE]">
              {item.count}
            </span>
          ) : null}
        </a>
      ))}
    </div>
  );
}