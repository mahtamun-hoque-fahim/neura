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
      <path d="M6 1.5v5M9.5 2.5v4M13 5v4a5 5 0 0 1-10 0V7.5a1 1 0 0 1 2 0V6a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1" />
    </svg>
  );
}
function IconSelect() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2l4.5 11 2-4 4-2L2 2z" />
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
      <circle cx="3.5" cy="8" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12.5" cy="8" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M5 8h2a1 1 0 0 0 1-1V6a1 1 0 0 1 1-1h1.5" />
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
      <rect x="1" y="3" width="13" height="9" rx="1" />
      <path d="M5 6.5L3 7.5 5 8.5M10 6.5l2 1-2 1" />
      <line x1="7" y1="6" x2="8" y2="9" />
    </svg>
  );
}
function IconLaser() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M10.4 3.2l-1.4 1.4M4.6 10.4l-1.4 1.4" />
    </svg>
  );
}
function IconLasso() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6C2 3.8 4.5 2 7.5 2S13 3.8 13 6c0 1.8-1.5 3.3-3.5 3.8" strokeDasharray="2 1.2" />
      <path d="M9.5 9.8C8.8 10 8 10.2 7.5 10.2c-1 0-2-.3-2-.3" strokeDasharray="2 1.2" />
      <path d="M7.5 10.2v4" />
    </svg>
  );
}
function IconMore() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3.5" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="12.5" cy="8" r="1.3" />
    </svg>
  );
}

// ── Tool definitions ───────────────────────────────────────────────────────────
// key shown as subscript on the button
const MAIN_TOOLS: { id: Tool; Icon: React.FC; label: string; key: string }[] = [
  { id: "lock",      Icon: IconLock,      label: "Lock",        key: ""  },
  { id: "hand",      Icon: IconHand,      label: "Hand",        key: "H" },
  { id: "select",    Icon: IconSelect,    label: "Select",      key: "V" },
  { id: "rect",      Icon: IconRect,      label: "Rectangle",   key: "R" },
  { id: "diamond",   Icon: IconDiamond,   label: "Diamond",     key: "D" },
  { id: "circle",    Icon: IconCircle,    label: "Circle",      key: "O" },
  { id: "arrow",     Icon: IconArrow,     label: "Arrow",       key: "A" },
  { id: "line",      Icon: IconLine,      label: "Line",        key: "L" },
  { id: "pen",       Icon: IconPen,       label: "Pen",         key: "P" },
  { id: "text",      Icon: IconText,      label: "Text",        key: "T" },
  { id: "image",     Icon: IconImage,     label: "Image",       key: "I" },
  { id: "eraser",    Icon: IconEraser,    label: "Eraser",      key: "E" },
  { id: "connector", Icon: IconConnector, label: "Connector",   key: "C" },
];

const OVERFLOW_TOOLS: { id: Tool; Icon: React.FC; label: string; key?: string }[] = [
  { id: "frame",  Icon: IconFrame,  label: "Frame tool",      key: "F" },
  { id: "lasso",  Icon: IconLasso,  label: "Lasso selection"            },
  { id: "laser",  Icon: IconLaser,  label: "Laser pointer",   key: "K" },
];

// ── Toolbar ────────────────────────────────────────────────────────────────────
export function Toolbar() {
  const { tool, setTool } = useCanvasStore();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overflowOpen) return;
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node))
        setOverflowOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [overflowOpen]);

  const selectTool = (t: Tool) => { setTool(t); setOverflowOpen(false); };
  const isOverflowActive = OVERFLOW_TOOLS.some(t => t.id === tool);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[98] flex flex-col items-center gap-2">

      {/* Main pill */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl"
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {/* Lock (no shortcut shown) */}
        <ToolBtn t={MAIN_TOOLS[0]} active={tool === "lock"} onSelect={selectTool} />

        <Sep />

        {/* Hand */}
        <ToolBtn t={MAIN_TOOLS[1]} active={tool === "hand"} onSelect={selectTool} />
        {/* Select */}
        <ToolBtn t={MAIN_TOOLS[2]} active={tool === "select"} onSelect={selectTool} />

        <Sep />

        {/* Shape + draw tools */}
        {MAIN_TOOLS.slice(3, 13).map(t => (
          <ToolBtn key={t.id} t={t} active={tool === t.id} onSelect={selectTool} />
        ))}

        <Sep />

        {/* Overflow */}
        <div ref={overflowRef} className="relative">
          <button
            onClick={() => setOverflowOpen(v => !v)}
            title="More tools"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150
              ${isOverflowActive || overflowOpen
                ? "bg-[#6c63ff]/12 text-[#6c63ff]"
                : "text-[#888] hover:bg-black/05 hover:text-[#1a1a2e]"}`}
          >
            <IconMore />
          </button>

          {overflowOpen && (
            <div
              className="absolute top-[calc(100%+10px)] right-0 py-1.5 rounded-2xl min-w-[200px] z-[200]"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.09)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)",
              }}
            >
              {OVERFLOW_TOOLS.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTool(t.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium transition-colors
                    ${tool === t.id ? "bg-[#6c63ff]/08 text-[#6c63ff]" : "text-[#1a1a2e] hover:bg-black/04"}`}
                >
                  <span className="opacity-60"><t.Icon /></span>
                  <span className="flex-1 text-left">{t.label}</span>
                  {t.key && (
                    <span className="text-[11px] font-semibold opacity-40">{t.key}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ── Sub-components ─────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-6 bg-black/08 mx-0.5 flex-shrink-0" />;
}

function ToolBtn({
  t,
  active,
  onSelect,
}: {
  t: { id: Tool; Icon: React.FC; label: string; key: string };
  active: boolean;
  onSelect: (id: Tool) => void;
}) {
  return (
    <button
      title={t.key ? `${t.label} (${t.key})` : t.label}
      onClick={() => onSelect(t.id)}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 group
        ${active
          ? "bg-[#6c63ff]/12 text-[#6c63ff]"
          : "text-[#777] hover:bg-black/05 hover:text-[#1a1a2e]"}`}
    >
      <t.Icon />
      {t.key && (
        <span
          className="absolute bottom-[3px] right-[4px] text-[8px] leading-none font-bold opacity-35 pointer-events-none"
          style={{ fontFamily: "monospace" }}
        >
          {t.key}
        </span>
      )}
      <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-[11px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
        {t.label}{t.key && <span className="opacity-50 ml-1">({t.key})</span>}
      </span>
    </button>
  );
}
