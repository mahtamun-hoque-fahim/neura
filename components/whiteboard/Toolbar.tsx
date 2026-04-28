"use client";

import { useState, useRef, useEffect } from "react";
import { useCanvasStore, type Tool } from "@/lib/store";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconHand() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v6M6 3.5V6M10 3.5V6M4.5 7v-1a1 1 0 0 0-1 1v3a4.5 4.5 0 0 0 9 0V7a1 1 0 0 0-1 0" />
    </svg>
  );
}
function IconSelect() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2l5.5 12.5 2-4.5 4.5-2L2 2z" />
    </svg>
  );
}
function IconRect() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="12" height="9" rx="1" />
    </svg>
  );
}
function IconDiamond() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L14 8L8 14L2 8L8 2z" />
    </svg>
  );
}
function IconCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13L13 3M13 3H7M13 3v6" />
    </svg>
  );
}
function IconLine() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" />
    </svg>
  );
}
function IconPen() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l3 3-8 8H3v-3L11 2z" />
    </svg>
  );
}
function IconText() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M8 4v9M6 13h4" />
    </svg>
  );
}
function IconImage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <circle cx="5.5" cy="6.5" r="1" />
      <path d="M2 11l3-3 2.5 2.5L10 8l4 4" />
    </svg>
  );
}
function IconEraser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 5L7 11M11 3L5 9l2 2 6-6-2-2zM3 13h5" />
    </svg>
  );
}
function IconConnector() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
      <path d="M4.5 8h2.5a1 1 0 0 1 1 1v0a1 1 0 0 0 1 1h2" />
    </svg>
  );
}
function IconFrame() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4V1h3M11 1h3v3M14 11v3h-3M4 14H1v-3" />
    </svg>
  );
}
function IconEmbed() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3L2 7.5 5 12M10 3l3 4.5-3 4.5" />
    </svg>
  );
}
function IconLaser() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="1.5" />
      <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M10.4 3.2l-1.4 1.4M4.6 10.4l-1.4 1.4" />
    </svg>
  );
}
function IconLasso() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2C4 2 2 4 2 6.5c0 2 1.5 3.5 3.5 3.5.5 0 1-.1 1.5-.3" strokeDasharray="2 1.5" />
      <path d="M9 10l3 3" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
  );
}

// ── Tool definitions ───────────────────────────────────────────────────────────
const MAIN_TOOLS: { id: Tool; Icon: React.FC; label: string; key: string; num: number }[] = [
  { id: "lock",      Icon: IconLock,      label: "Lock",      key: "Q", num: 0 },
  { id: "hand",      Icon: IconHand,      label: "Hand",      key: "H", num: 0 },
  { id: "select",    Icon: IconSelect,    label: "Select",    key: "V", num: 1 },
  { id: "rect",      Icon: IconRect,      label: "Rectangle", key: "R", num: 2 },
  { id: "diamond",   Icon: IconDiamond,   label: "Diamond",   key: "D", num: 3 },
  { id: "circle",    Icon: IconCircle,    label: "Circle",    key: "O", num: 4 },
  { id: "arrow",     Icon: IconArrow,     label: "Arrow",     key: "A", num: 5 },
  { id: "line",      Icon: IconLine,      label: "Line",      key: "L", num: 6 },
  { id: "pen",       Icon: IconPen,       label: "Pen",       key: "P", num: 7 },
  { id: "text",      Icon: IconText,      label: "Text",      key: "T", num: 8 },
  { id: "image",     Icon: IconImage,     label: "Image",     key: "I", num: 9 },
  { id: "eraser",    Icon: IconEraser,    label: "Eraser",    key: "E", num: 0 },
  { id: "connector", Icon: IconConnector, label: "Connector", key: "C", num: 0 },
];

const OVERFLOW_TOOLS: { id: Tool; Icon: React.FC; label: string; key?: string; color?: string }[] = [
  { id: "frame",  Icon: IconFrame,  label: "Frame tool",    key: "F", color: "#6c63ff" },
  { id: "lasso",  Icon: IconLasso,  label: "Lasso selection",                           },
  { id: "laser",  Icon: IconLaser,  label: "Laser pointer", key: "K", color: "#e85d4a" },
];

const SIZES = [
  { value: 2,  px: 7  },
  { value: 4,  px: 11 },
  { value: 8,  px: 16 },
  { value: 16, px: 22 },
];

// ── Toolbar ────────────────────────────────────────────────────────────────────
export function Toolbar() {
  const { tool, color, strokeSize, setTool, setColor, setStrokeSize } = useCanvasStore();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close overflow on outside click
  useEffect(() => {
    if (!overflowOpen) return;
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [overflowOpen]);

  const selectTool = (t: Tool) => {
    setTool(t);
    setOverflowOpen(false);
  };

  const isOverflowActive = OVERFLOW_TOOLS.some(t => t.id === tool);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {/* Main toolbar pill */}
      <div
        className="flex items-center gap-0.5 px-2 py-2 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Lock */}
        <ToolBtn
          tool={MAIN_TOOLS[0]}
          active={tool === "lock"}
          onSelect={selectTool}
          showNum={false}
        />

        <Divider />

        {/* Hand */}
        <ToolBtn
          tool={MAIN_TOOLS[1]}
          active={tool === "hand"}
          onSelect={selectTool}
          showNum={false}
        />

        {/* Select */}
        <ToolBtn
          tool={MAIN_TOOLS[2]}
          active={tool === "select"}
          onSelect={selectTool}
          showNum
          num={1}
        />

        <Divider />

        {/* Shape tools with numbers */}
        {MAIN_TOOLS.slice(3, 12).map((t, i) => (
          <ToolBtn
            key={t.id}
            tool={t}
            active={tool === t.id}
            onSelect={selectTool}
            showNum
            num={i + 2}
          />
        ))}

        <Divider />

        {/* Eraser */}
        <ToolBtn
          tool={MAIN_TOOLS[11]}
          active={tool === "eraser"}
          onSelect={selectTool}
          showNum={false}
        />

        {/* Connector */}
        <ToolBtn
          tool={MAIN_TOOLS[12]}
          active={tool === "connector"}
          onSelect={selectTool}
          showNum={false}
        />

        <Divider />

        {/* Overflow menu trigger */}
        <div ref={overflowRef} className="relative">
          <button
            onClick={() => setOverflowOpen(v => !v)}
            title="More tools"
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 group
              ${isOverflowActive || overflowOpen
                ? "bg-[#6c63ff]/12 text-[#6c63ff]"
                : "text-[#666] hover:bg-black/5 hover:text-[#1a1a2e]"
              }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="4" cy="9" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="14" cy="9" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
          </button>

          {/* Overflow popup */}
          {overflowOpen && (
            <div
              className="absolute bottom-[calc(100%+10px)] right-0 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14),0_1px_4px_rgba(0,0,0,0.08)] py-1.5 min-w-[210px] z-[200]"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {OVERFLOW_TOOLS.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTool(t.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium transition-colors
                    ${tool === t.id ? "bg-[#6c63ff]/08 text-[#6c63ff]" : "text-[#1a1a2e] hover:bg-black/04"}`}
                >
                  <span className={t.color ? "" : "text-[#555]"} style={t.color ? { color: t.color } : {}}>
                    <t.Icon />
                  </span>
                  <span style={tool === t.id && t.color ? { color: t.color } : t.color && tool !== t.id ? { color: t.color } : {}}>{t.label}</span>
                  {t.key && (
                    <span className="ml-auto text-[11px] font-semibold opacity-50">{t.key}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary: colors + sizes */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {["#1a1a2e","#e85d4a","#4a90d9","#52b788","#f4a261","#b48fff"].map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={c}
              className="rounded-full transition-all duration-150 hover:scale-110 flex-shrink-0 flex items-center justify-center"
              style={{
                width: 18, height: 18,
                background: c,
                boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 3.5px ${c}` : "none",
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <div className="w-px h-4 bg-black/10 mx-0.5" />

        {/* Sizes */}
        <div className="flex items-center gap-1.5 px-0.5">
          {SIZES.map(s => (
            <button
              key={s.value}
              onClick={() => setStrokeSize(s.value)}
              title={`Size ${s.value}`}
              className="rounded-full transition-all duration-150 hover:scale-110 flex-shrink-0 flex items-center justify-center"
              style={{
                width: s.px, height: s.px,
                background: strokeSize === s.value ? "#1a1a2e" : "#bbb",
                transform: strokeSize === s.value ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px h-6 bg-black/08 mx-0.5 flex-shrink-0" />;
}

function ToolBtn({
  tool,
  active,
  onSelect,
  showNum,
  num,
}: {
  tool: { id: Tool; Icon: React.FC; label: string; key: string };
  active: boolean;
  onSelect: (t: Tool) => void;
  showNum: boolean;
  num?: number;
}) {
  return (
    <button
      title={`${tool.label} (${tool.key})`}
      onClick={() => onSelect(tool.id)}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 group flex-shrink-0
        ${active
          ? "bg-[#6c63ff]/12 text-[#6c63ff]"
          : "text-[#666] hover:bg-black/05 hover:text-[#1a1a2e]"
        }`}
    >
      <tool.Icon />
      {showNum && num !== undefined && num > 0 && (
        <span
          className="absolute bottom-0.5 right-0.5 text-[8px] leading-none font-semibold opacity-40"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {num}
        </span>
      )}
      {/* Tooltip */}
      <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-[#eee] text-[11px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
        {tool.label} <span className="opacity-50">({tool.key})</span>
      </span>
    </button>
  );
}
