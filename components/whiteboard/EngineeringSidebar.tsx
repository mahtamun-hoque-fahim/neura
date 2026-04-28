"use client";

import { useState, useCallback } from "react";
import { useCanvasStore } from "@/lib/store";
import type { CircuitSymbol } from "@/lib/liveblocks.config";

// ── Circuit symbol SVG renderers (60×40 viewport) ─────────────────────────────
export function CircuitSVG({
  symbol,
  color = "#1a1a2e",
  size = 1,
}: {
  symbol: CircuitSymbol;
  color?: string;
  size?: number;
}) {
  const s = { stroke: color, strokeWidth: 1.8 * size, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const f = { fill: color, stroke: "none" };

  switch (symbol) {
    case "resistor":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="0" y1="15" x2="12" y2="15" {...s} />
          <polyline points="12,15 15,7 20,23 25,7 30,23 35,7 40,23 43,15 48,15" {...s} />
          <line x1="48" y1="15" x2="60" y2="15" {...s} />
        </svg>
      );
    case "capacitor":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="0" y1="15" x2="26" y2="15" {...s} />
          <line x1="26" y1="4" x2="26" y2="26" {...s} />
          <line x1="34" y1="4" x2="34" y2="26" {...s} />
          <line x1="34" y1="15" x2="60" y2="15" {...s} />
        </svg>
      );
    case "inductor":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="0" y1="15" x2="10" y2="15" {...s} />
          <path d="M10,15 C10,8 16,8 16,15 C16,8 22,8 22,15 C22,8 28,8 28,15 C28,8 34,8 34,15 C34,8 40,8 40,15" {...s} />
          <line x1="40" y1="15" x2="60" y2="15" {...s} />
        </svg>
      );
    case "voltage_source":
      return (
        <svg viewBox="0 0 60 36" width="60" height="36">
          <line x1="0" y1="18" x2="12" y2="18" {...s} />
          <circle cx="30" cy="18" r="16" {...s} />
          <line x1="48" y1="18" x2="60" y2="18" {...s} />
          <line x1="26" y1="11" x2="34" y2="11" {...s} />
          <line x1="30" y1="7" x2="30" y2="15" {...s} />
          <line x1="26" y1="25" x2="34" y2="25" {...s} />
        </svg>
      );
    case "current_source":
      return (
        <svg viewBox="0 0 60 36" width="60" height="36">
          <line x1="0" y1="18" x2="12" y2="18" {...s} />
          <circle cx="30" cy="18" r="16" {...s} />
          <line x1="48" y1="18" x2="60" y2="18" {...s} />
          <line x1="20" y1="18" x2="38" y2="18" {...s} />
          <polyline points="33,13 38,18 33,23" {...s} />
        </svg>
      );
    case "ground":
      return (
        <svg viewBox="0 0 60 36" width="60" height="36">
          <line x1="30" y1="0" x2="30" y2="16" {...s} />
          <line x1="14" y1="16" x2="46" y2="16" {...s} />
          <line x1="19" y1="22" x2="41" y2="22" {...s} />
          <line x1="24" y1="28" x2="36" y2="28" {...s} />
        </svg>
      );
    case "vcc":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="30" y1="30" x2="30" y2="14" {...s} />
          <line x1="14" y1="14" x2="46" y2="14" {...s} />
          <text x="22" y="10" fontSize="9" fill={color} stroke="none" fontFamily="monospace">VCC</text>
        </svg>
      );
    case "diode":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="0" y1="15" x2="18" y2="15" {...s} />
          <polygon points="18,6 18,24 38,15" style={{ fill: color, stroke: color, strokeWidth: 1.5 }} />
          <line x1="38" y1="6" x2="38" y2="24" {...s} />
          <line x1="38" y1="15" x2="60" y2="15" {...s} />
        </svg>
      );
    case "led":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="0" y1="15" x2="18" y2="15" {...s} />
          <polygon points="18,6 18,24 38,15" style={{ fill: color, stroke: color, strokeWidth: 1.5 }} />
          <line x1="38" y1="6" x2="38" y2="24" {...s} />
          <line x1="38" y1="15" x2="60" y2="15" {...s} />
          <line x1="42" y1="4" x2="48" y2="0" {...s} strokeWidth={1.4} />
          <line x1="46" y1="7" x2="52" y2="3" {...s} strokeWidth={1.4} />
          <polyline points="45,0 48,0 48,3" {...s} strokeWidth={1.2} />
          <polyline points="49,3 52,3 52,6" {...s} strokeWidth={1.2} />
        </svg>
      );
    case "transistor_npn":
      return (
        <svg viewBox="0 0 60 50" width="60" height="50">
          <line x1="0" y1="25" x2="22" y2="25" {...s} />
          <line x1="22" y1="10" x2="22" y2="40" {...s} />
          <line x1="22" y1="18" x2="40" y2="10" {...s} />
          <line x1="22" y1="32" x2="40" y2="42" {...s} />
          <polyline points="35,42 40,42 40,38" {...s} />
          <line x1="40" y1="10" x2="40" y2="0" {...s} />
          <line x1="40" y1="42" x2="40" y2="50" {...s} />
        </svg>
      );
    case "transistor_pnp":
      return (
        <svg viewBox="0 0 60 50" width="60" height="50">
          <line x1="0" y1="25" x2="22" y2="25" {...s} />
          <line x1="22" y1="10" x2="22" y2="40" {...s} />
          <line x1="22" y1="18" x2="40" y2="10" {...s} />
          <line x1="22" y1="32" x2="40" y2="42" {...s} />
          <polyline points="25,20 22,18 25,16" {...s} />
          <line x1="40" y1="10" x2="40" y2="0" {...s} />
          <line x1="40" y1="42" x2="40" y2="50" {...s} />
        </svg>
      );
    case "op_amp":
      return (
        <svg viewBox="0 0 70 50" width="70" height="50">
          <polygon points="10,4 10,46 58,25" style={{ fill: "none", stroke: color, strokeWidth: 1.8 }} />
          <line x1="0" y1="15" x2="10" y2="15" {...s} />
          <line x1="0" y1="35" x2="10" y2="35" {...s} />
          <line x1="58" y1="25" x2="70" y2="25" {...s} />
          <text x="14" y="19" fontSize="9" fill={color} stroke="none">+</text>
          <text x="14" y="38" fontSize="9" fill={color} stroke="none">−</text>
        </svg>
      );
    case "and_gate":
      return (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <path d="M10,4 L30,4 C45,4 50,12 50,20 C50,28 45,36 30,36 L10,36 Z" {...s} />
          <line x1="0" y1="13" x2="10" y2="13" {...s} />
          <line x1="0" y1="27" x2="10" y2="27" {...s} />
          <line x1="50" y1="20" x2="60" y2="20" {...s} />
        </svg>
      );
    case "or_gate":
      return (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <path d="M8,4 C18,4 38,4 50,20 C38,36 18,36 8,36 C14,28 14,12 8,4 Z" {...s} />
          <line x1="0" y1="13" x2="12" y2="13" {...s} />
          <line x1="0" y1="27" x2="12" y2="27" {...s} />
          <line x1="50" y1="20" x2="60" y2="20" {...s} />
        </svg>
      );
    case "not_gate":
      return (
        <svg viewBox="0 0 60 36" width="60" height="36">
          <polygon points="10,4 10,32 44,18" {...s} />
          <circle cx="48" cy="18" r="4" {...s} />
          <line x1="0" y1="18" x2="10" y2="18" {...s} />
          <line x1="52" y1="18" x2="60" y2="18" {...s} />
        </svg>
      );
    case "nand_gate":
      return (
        <svg viewBox="0 0 64 40" width="64" height="40">
          <path d="M10,4 L30,4 C45,4 50,12 50,20 C50,28 45,36 30,36 L10,36 Z" {...s} />
          <circle cx="54" cy="20" r="4" {...s} />
          <line x1="0" y1="13" x2="10" y2="13" {...s} />
          <line x1="0" y1="27" x2="10" y2="27" {...s} />
          <line x1="58" y1="20" x2="64" y2="20" {...s} />
        </svg>
      );
    case "nor_gate":
      return (
        <svg viewBox="0 0 64 40" width="64" height="40">
          <path d="M8,4 C18,4 38,4 50,20 C38,36 18,36 8,36 C14,28 14,12 8,4 Z" {...s} />
          <circle cx="54" cy="20" r="4" {...s} />
          <line x1="0" y1="13" x2="12" y2="13" {...s} />
          <line x1="0" y1="27" x2="12" y2="27" {...s} />
          <line x1="58" y1="20" x2="64" y2="20" {...s} />
        </svg>
      );
    case "xor_gate":
      return (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <path d="M12,4 C22,4 42,4 54,20 C42,36 22,36 12,36 C18,28 18,12 12,4 Z" {...s} />
          <path d="M6,4 C12,12 12,28 6,36" {...s} />
          <line x1="0" y1="13" x2="10" y2="13" {...s} />
          <line x1="0" y1="27" x2="10" y2="27" {...s} />
          <line x1="54" y1="20" x2="60" y2="20" {...s} />
        </svg>
      );
    case "switch":
      return (
        <svg viewBox="0 0 60 30" width="60" height="30">
          <line x1="0" y1="15" x2="16" y2="15" {...s} />
          <circle cx="18" cy="15" r="2.5" style={{ fill: color }} />
          <circle cx="42" cy="15" r="2.5" style={{ fill: color }} />
          <line x1="18" y1="15" x2="42" y2="8" {...s} />
          <line x1="42" y1="15" x2="60" y2="15" {...s} />
        </svg>
      );
    case "wire_node":
      return (
        <svg viewBox="0 0 30 30" width="30" height="30">
          <line x1="0" y1="15" x2="30" y2="15" {...s} />
          <line x1="15" y1="0" x2="15" y2="30" {...s} />
          <circle cx="15" cy="15" r="3.5" style={{ fill: color }} />
        </svg>
      );
    default:
      return <svg viewBox="0 0 60 30" width="60" height="30"><rect x="5" y="5" width="50" height="20" {...s} /></svg>;
  }
}

// ── Sidebar data ───────────────────────────────────────────────────────────────
const CATEGORIES: {
  label: string;
  emoji: string;
  items: { symbol: CircuitSymbol; label: string }[];
}[] = [
  {
    label: "Sources",
    emoji: "⚡",
    items: [
      { symbol: "voltage_source", label: "Voltage Source" },
      { symbol: "current_source", label: "Current Source" },
      { symbol: "ground",         label: "Ground" },
      { symbol: "vcc",            label: "VCC / Power" },
    ],
  },
  {
    label: "Passive",
    emoji: "〰",
    items: [
      { symbol: "resistor",  label: "Resistor" },
      { symbol: "capacitor", label: "Capacitor" },
      { symbol: "inductor",  label: "Inductor" },
      { symbol: "switch",    label: "Switch" },
    ],
  },
  {
    label: "Semiconductors",
    emoji: "💡",
    items: [
      { symbol: "diode",           label: "Diode" },
      { symbol: "led",             label: "LED" },
      { symbol: "transistor_npn",  label: "NPN Transistor" },
      { symbol: "transistor_pnp",  label: "PNP Transistor" },
      { symbol: "op_amp",          label: "Op-Amp" },
    ],
  },
  {
    label: "Logic Gates",
    emoji: "🔲",
    items: [
      { symbol: "and_gate",  label: "AND" },
      { symbol: "or_gate",   label: "OR" },
      { symbol: "not_gate",  label: "NOT" },
      { symbol: "nand_gate", label: "NAND" },
      { symbol: "nor_gate",  label: "NOR" },
      { symbol: "xor_gate",  label: "XOR" },
    ],
  },
  {
    label: "Wiring",
    emoji: "🔗",
    items: [
      { symbol: "wire_node", label: "Junction" },
    ],
  },
];

// ── Main sidebar component ─────────────────────────────────────────────────────
export function EngineeringSidebar() {
  const { sidebarOpen, setSidebarOpen, color } = useCanvasStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragSymbol, setDragSymbol] = useState<CircuitSymbol | null>(null);

  const toggleCategory = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleDragStart = useCallback(
    (e: React.DragEvent, symbol: CircuitSymbol) => {
      setDragSymbol(symbol);
      e.dataTransfer.setData("neura/circuit-symbol", symbol);
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        title="Open circuit panel"
        className="fixed left-3 top-1/2 -translate-y-1/2 z-[90] w-8 h-16 rounded-xl flex items-center justify-center shadow-md transition-all hover:scale-105"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#666" strokeWidth="1.7" strokeLinecap="round">
          <path d="M5 2l5 5-5 5" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-[90] flex flex-col select-none"
      style={{
        width: 220,
        background: "#fff",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "2px 0 16px rgba(0,0,0,0.06)",
        paddingTop: 52, // below TopBar
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/06">
        <span className="text-[12px] font-semibold text-[#1a1a2e] tracking-wide uppercase opacity-60">
          Circuit Elements
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          title="Collapse sidebar"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#888] hover:bg-black/06 hover:text-[#1a1a2e] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M8 2L3 6l5 4" />
          </svg>
        </button>
      </div>

      {/* Drag hint */}
      <p className="text-[10.5px] text-[#999] px-3 pt-2.5 pb-1 leading-snug">
        Drag elements onto the canvas to place them.
      </p>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "thin" }}>
        {CATEGORIES.map(cat => (
          <div key={cat.label} className="border-b border-black/04 last:border-0">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.label)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-black/03 transition-colors"
            >
              <span className="text-[13px]">{cat.emoji}</span>
              <span className="text-[11.5px] font-semibold text-[#444] flex-1">{cat.label}</span>
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#aaa" strokeWidth="1.7" strokeLinecap="round"
                className={`transition-transform duration-200 ${collapsed[cat.label] ? "-rotate-90" : ""}`}
              >
                <path d="M2 3.5L5 6.5L8 3.5" />
              </svg>
            </button>

            {/* Items grid */}
            {!collapsed[cat.label] && (
              <div className="px-2 pb-2 grid grid-cols-2 gap-1.5">
                {cat.items.map(item => (
                  <div
                    key={item.symbol}
                    draggable
                    onDragStart={e => handleDragStart(e, item.symbol)}
                    onDragEnd={() => setDragSymbol(null)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all
                      ${dragSymbol === item.symbol
                        ? "bg-[#6c63ff]/10 scale-95"
                        : "hover:bg-black/04"
                      }`}
                    style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                    title={`Drag to place ${item.label}`}
                  >
                    <div className="flex items-center justify-center" style={{ minHeight: 34 }}>
                      <CircuitSVG symbol={item.symbol} color={color} />
                    </div>
                    <span className="text-[9.5px] text-center text-[#666] leading-tight font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
