"use client";

import { useCanvasStore, TOOL_COLORS, type Tool } from "@/lib/store";

const TOOLS: { id: Tool; icon: string; label: string; key: string }[] = [
  { id: "pen",         icon: "✏️", label: "Pen",         key: "P" },
  { id: "highlighter", icon: "🖊️", label: "Highlighter", key: "H" },
  { id: "line",        icon: "╱",  label: "Line",        key: "L" },
  { id: "arrow",       icon: "→",  label: "Arrow",       key: "A" },
  { id: "rect",        icon: "▭",  label: "Rectangle",   key: "R" },
  { id: "circle",      icon: "○",  label: "Circle",      key: "C" },
  { id: "text",        icon: "T",  label: "Text",        key: "T" },
  { id: "eraser",      icon: "◻",  label: "Eraser",      key: "E" },
];

const SIZES = [
  { value: 3,  px: 8  },
  { value: 6,  px: 12 },
  { value: 12, px: 18 },
  { value: 24, px: 24 },
];

export function Toolbar() {
  const { tool, color, strokeSize, setTool, setColor, setStrokeSize } = useCanvasStore();

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-[#1a1a2e] border border-[#2d2d4e] rounded-[20px] px-3.5 py-2.5 shadow-[0_8px_32px_rgba(26,26,46,.18),0_0_0_1px_rgba(255,255,255,.05)_inset] backdrop-blur-md">

      {/* Tools */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={`${t.label} (${t.key})`}
          onClick={() => setTool(t.id)}
          className={`relative w-[38px] h-[38px] border-none rounded-[10px] flex items-center justify-center text-[17px] transition-all duration-150 group
            ${tool === t.id
              ? "bg-white/12 text-white shadow-[0_0_0_1.5px_rgba(255,255,255,.2)]"
              : "bg-transparent text-[#aaa] hover:bg-white/8 hover:text-white"
            }`}
        >
          {t.icon}
          <span className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-[#111] text-[#eee] text-[11px] px-2 py-1 rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-dm z-50">
            {t.label} <span className="opacity-60">({t.key})</span>
          </span>
        </button>
      ))}

      {/* Separator */}
      <div className="w-px h-7 bg-[#2d2d4e] mx-1" />

      {/* Colors */}
      {TOOL_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => setColor(c)}
          title={c}
          className={`w-[22px] h-[22px] rounded-full flex-shrink-0 transition-all duration-150 hover:scale-110 border-[2.5px]
            ${color === c ? "border-white scale-110" : "border-transparent"}`}
          style={{ background: c }}
        />
      ))}

      {/* Separator */}
      <div className="w-px h-7 bg-[#2d2d4e] mx-1" />

      {/* Sizes */}
      <div className="flex items-center gap-1.5 px-1.5">
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStrokeSize(s.value)}
            title={`Size ${s.value}`}
            className={`rounded-full transition-all duration-150 hover:scale-110 flex-shrink-0
              ${strokeSize === s.value ? "bg-white scale-110" : "bg-[#888] hover:bg-white"}`}
            style={{ width: s.px, height: s.px }}
          />
        ))}
      </div>
    </div>
  );
}
