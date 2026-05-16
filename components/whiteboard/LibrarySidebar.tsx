"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/lib/store";
import { CircuitSVG } from "./EngineeringSidebar";
import type { CircuitSymbol } from "@/lib/liveblocks.config";

const WIDTH = 260;

// ── Individual component library ─────────────────────────────────────────────
const COMPONENTS: {
  label: string;
  items: { symbol: CircuitSymbol; label: string }[];
}[] = [
  {
    label: "Sources",
    items: [
      { symbol: "voltage_source", label: "Voltage Source" },
      { symbol: "current_source", label: "Current Source" },
      { symbol: "ac_source",      label: "AC Source"      },
      { symbol: "battery",        label: "Battery"        },
      { symbol: "ground",         label: "Ground"         },
      { symbol: "vcc",            label: "VCC / Power"    },
    ],
  },
  {
    label: "Passive",
    items: [
      { symbol: "resistor",       label: "Resistor"       },
      { symbol: "potentiometer",  label: "Potentiometer"  },
      { symbol: "capacitor",      label: "Capacitor"      },
      { symbol: "inductor",       label: "Inductor"       },
      { symbol: "transformer",    label: "Transformer"    },
      { symbol: "switch",         label: "Switch"         },
      { symbol: "fuse",           label: "Fuse"           },
    ],
  },
  {
    label: "Semiconductors",
    items: [
      { symbol: "diode",          label: "Diode"          },
      { symbol: "zener_diode",    label: "Zener Diode"    },
      { symbol: "led",            label: "LED"            },
      { symbol: "transistor_npn", label: "NPN BJT"        },
      { symbol: "transistor_pnp", label: "PNP BJT"        },
      { symbol: "mosfet_n",       label: "N-MOSFET"       },
      { symbol: "mosfet_p",       label: "P-MOSFET"       },
      { symbol: "op_amp",         label: "Op-Amp"         },
      { symbol: "schmitt",        label: "Schmitt Trigger" },
    ],
  },
  {
    label: "Logic Gates",
    items: [
      { symbol: "buffer",         label: "Buffer"         },
      { symbol: "not_gate",       label: "NOT"            },
      { symbol: "and_gate",       label: "AND"            },
      { symbol: "nand_gate",      label: "NAND"           },
      { symbol: "or_gate",        label: "OR"             },
      { symbol: "nor_gate",       label: "NOR"            },
      { symbol: "xor_gate",       label: "XOR"            },
      { symbol: "xnor_gate",      label: "XNOR"           },
    ],
  },
  {
    label: "Measurement",
    items: [
      { symbol: "ammeter",        label: "Ammeter"        },
      { symbol: "voltmeter",      label: "Voltmeter"      },
      { symbol: "lamp",           label: "Lamp / Bulb"    },
      { symbol: "motor",          label: "Motor"          },
      { symbol: "wire_node",      label: "Junction"       },
    ],
  },
];

// ── Circuit presets (SVG diagrams placed as a group) ─────────────────────────
const PRESETS: {
  label: string;
  desc: string;
  Preview: () => React.ReactElement;
}[] = [
  {
    label: "Voltage Divider",
    desc: "R1 + R2 from Vcc to GND",
    Preview: () => (
      <svg viewBox="0 0 80 90" width="80" height="90" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="40" y1="0" x2="40" y2="12" />
        <polyline points="40,12 37,16 43,20 37,24 43,28 37,32 43,36 40,40" />
        <line x1="40" y1="40" x2="40" y2="52" />
        <polyline points="40,52 37,56 43,60 37,64 43,68 37,72 43,76 40,80" />
        <line x1="40" y1="80" x2="40" y2="90" />
        <line x1="28" y1="90" x2="52" y2="90" /><line x1="32" y1="94" x2="48" y2="94" /><line x1="36" y1="98" x2="44" y2="98" />
        <text x="46" y="28" fontSize="8" fill="#444" stroke="none">R1</text>
        <text x="46" y="68" fontSize="8" fill="#444" stroke="none">R2</text>
        <text x="44" y="8" fontSize="7" fill="#444" stroke="none">Vcc</text>
      </svg>
    ),
  },
  {
    label: "RC Low-pass Filter",
    desc: "Series R + shunt C",
    Preview: () => (
      <svg viewBox="0 0 110 60" width="110" height="60" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="0" y1="20" x2="12" y2="20" />
        <polyline points="12,20 15,13 20,27 25,13 30,27 35,13 40,27 43,20 55,20" />
        <line x1="55" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="32" />
        <line x1="74" y1="32" x2="86" y2="32" />
        <line x1="74" y1="38" x2="86" y2="38" />
        <line x1="80" y1="38" x2="80" y2="50" />
        <line x1="70" y1="50" x2="90" y2="50" /><line x1="73" y1="54" x2="87" y2="54" /><line x1="76" y1="58" x2="84" y2="58" />
        <line x1="80" y1="20" x2="110" y2="20" />
        <text x="23" y="10" fontSize="7" fill="#444" stroke="none">R</text>
        <text x="88" y="37" fontSize="7" fill="#444" stroke="none">C</text>
        <text x="2" y="16" fontSize="7" fill="#555" stroke="none">in</text>
        <text x="96" y="16" fontSize="7" fill="#555" stroke="none">out</text>
      </svg>
    ),
  },
  {
    label: "Half-wave Rectifier",
    desc: "Single diode + load",
    Preview: () => (
      <svg viewBox="0 0 120 60" width="120" height="60" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="30" r="16" />
        <line x1="14" y1="22" x2="22" y2="22" /><line x1="18" y1="18" x2="18" y2="26" />
        <line x1="14" y1="38" x2="22" y2="38" />
        <line x1="36" y1="30" x2="48" y2="30" />
        <polygon points="48,24 48,36 62,30" fill="#1a1a2e" />
        <line x1="62" y1="24" x2="62" y2="36" />
        <line x1="62" y1="30" x2="80" y2="30" />
        <line x1="80" y1="20" x2="80" y2="50" />
        <polyline points="80,20 83,26 88,14 93,26 98,14 103,26 108,20" /><line x1="108" y1="20" x2="108" y2="50" />
        <line x1="80" y1="50" x2="108" y2="50" />
        <line x1="4" y1="30" x2="4" y2="50" /><line x1="4" y1="50" x2="80" y2="50" />
        <text x="84" y="35" fontSize="7" fill="#444" stroke="none">R</text>
      </svg>
    ),
  },
  {
    label: "Common Emitter Amp",
    desc: "NPN BJT amplifier stage",
    Preview: () => (
      <svg viewBox="0 0 100 90" width="100" height="90" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="38" y="7" fontSize="7" fill="#444" stroke="none">Vcc</text>
        <line x1="45" y1="8" x2="45" y2="18" />
        <polyline points="45,18 42,22 48,26 42,30 48,34 45,38" />
        <text x="49" y="26" fontSize="7" fill="#444" stroke="none">Rc</text>
        <line x1="45" y1="38" x2="45" y2="44" />
        <line x1="45" y1="44" x2="56" y2="44" />
        <line x1="56" y1="36" x2="56" y2="54" />
        <line x1="0" y1="44" x2="44" y2="44" />
        <line x1="60" y1="40" x2="72" y2="32" />
        <line x1="60" y1="48" x2="72" y2="58" />
        <line x1="72" y1="32" x2="72" y2="22" />
        <line x1="72" y1="58" x2="72" y2="68" />
        <polyline points="68,58 72,58 72,55" />
        <line x1="72" y1="22" x2="72" y2="8" />
        <polyline points="72,68 69,75 75,77 69,81 75,83 69,87 75,89" strokeWidth="1.3" />
        <line x1="72" y1="89" x2="72" y2="92" />
        <text x="76" y="80" fontSize="7" fill="#444" stroke="none">Re</text>
        <text x="2" y="41" fontSize="7" fill="#555" stroke="none">Vin</text>
        <text x="74" y="10" fontSize="7" fill="#555" stroke="none">Vout</text>
      </svg>
    ),
  },
  {
    label: "Full-wave Bridge",
    desc: "4-diode bridge rectifier",
    Preview: () => (
      <svg viewBox="0 0 100 80" width="100" height="80" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="50" y1="0" x2="50" y2="16" />
        <polygon points="40,16 60,16 50,28" fill="#1a1a2e" /><line x1="40" y1="28" x2="60" y2="28" />
        <line x1="50" y1="28" x2="50" y2="36" />
        <polygon points="40,36 60,36 50,48" fill="#1a1a2e" /><line x1="40" y1="48" x2="60" y2="48" />
        <line x1="50" y1="48" x2="50" y2="60" />
        <polygon points="40,60 60,60 50,72" fill="#1a1a2e" /><line x1="40" y1="72" x2="60" y2="72" />
        <line x1="50" y1="72" x2="50" y2="80" />
        <line x1="0" y1="32" x2="40" y2="32" />
        <line x1="60" y1="32" x2="100" y2="32" />
        <text x="2" y="28" fontSize="7" fill="#555" stroke="none">AC</text>
        <text x="76" y="28" fontSize="7" fill="#555" stroke="none">DC+</text>
        <text x="42" y="77" fontSize="7" fill="#555" stroke="none">GND</text>
      </svg>
    ),
  },
  {
    label: "Inverting Op-Amp",
    desc: "Op-Amp in inverting config",
    Preview: () => (
      <svg viewBox="0 0 120 70" width="120" height="70" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="30,10 30,60 75,35" />
        <line x1="0" y1="24" x2="30" y2="24" />
        <line x1="0" y1="46" x2="30" y2="46" />
        <line x1="75" y1="35" x2="120" y2="35" />
        <line x1="52" y1="46" x2="52" y2="62" /><line x1="44" y1="62" x2="60" y2="62" /><line x1="47" y1="66" x2="57" y2="66" /><line x1="50" y1="70" x2="54" y2="70" />
        <text x="33" y="28" fontSize="8" fill="#444" stroke="none">+</text>
        <text x="33" y="48" fontSize="8" fill="#444" stroke="none">−</text>
        <text x="2" y="20" fontSize="7" fill="#555" stroke="none">Vin</text>
        <text x="97" y="31" fontSize="7" fill="#555" stroke="none">Vout</text>
        <line x1="0" y1="24" x2="0" y2="8" />
        <polyline points="0,8 5,8 8,4 12,12 16,4 20,12 23,8 30,8" strokeWidth="1.3" />
        <text x="-2" y="6" fontSize="6" fill="#555" stroke="none">Rf</text>
      </svg>
    ),
  },
  {
    label: "555 Astable",
    desc: "555 timer free-running",
    Preview: () => (
      <svg viewBox="0 0 100 80" width="100" height="80" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="28" y="14" width="44" height="52" rx="3" />
        <text x="38" y="43" fontSize="10" fill="#1a1a2e" stroke="none" fontFamily="monospace">555</text>
        <line x1="0" y1="20" x2="28" y2="20" /><text x="2" y="17" fontSize="6" fill="#555" stroke="none">Vcc</text>
        <line x1="0" y1="35" x2="28" y2="35" /><text x="2" y="32" fontSize="6" fill="#555" stroke="none">Ra</text>
        <line x1="0" y1="50" x2="28" y2="50" /><text x="2" y="47" fontSize="6" fill="#555" stroke="none">Rb</text>
        <line x1="0" y1="60" x2="28" y2="60" /><text x="2" y="57" fontSize="6" fill="#555" stroke="none">C</text>
        <line x1="72" y1="22" x2="100" y2="22" /><text x="82" y="19" fontSize="6" fill="#555" stroke="none">Out</text>
        <line x1="72" y1="38" x2="100" y2="38" /><text x="82" y="35" fontSize="6" fill="#555" stroke="none">Thr</text>
        <line x1="72" y1="54" x2="100" y2="54" /><text x="82" y="51" fontSize="6" fill="#555" stroke="none">Dis</text>
        <line x1="50" y1="66" x2="50" y2="80" /><text x="40" y="78" fontSize="6" fill="#555" stroke="none">GND</text>
      </svg>
    ),
  },
  {
    label: "D Flip-Flop",
    desc: "Edge-triggered D latch",
    Preview: () => (
      <svg viewBox="0 0 100 70" width="100" height="70" fill="none" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="24" y="8" width="52" height="54" rx="3" />
        <line x1="0" y1="22" x2="24" y2="22" /><text x="2" y="19" fontSize="7" fill="#555" stroke="none">D</text>
        <line x1="0" y1="50" x2="24" y2="50" /><text x="2" y="47" fontSize="7" fill="#555" stroke="none">CLK</text>
        <polyline points="24,46 30,50 24,54" />
        <line x1="76" y1="22" x2="100" y2="22" /><text x="82" y="19" fontSize="7" fill="#555" stroke="none">Q</text>
        <line x1="76" y1="50" x2="100" y2="50" /><text x="78" y="47" fontSize="7" fill="#555" stroke="none">Q̄</text>
        <text x="32" y="22" fontSize="7" fill="#1a1a2e" stroke="none">D</text>
        <text x="32" y="50" fontSize="7" fill="#1a1a2e" stroke="none">CLK</text>
        <text x="62" y="22" fontSize="7" fill="#1a1a2e" stroke="none">Q</text>
        <text x="60" y="50" fontSize="7" fill="#1a1a2e" stroke="none">Q̄</text>
      </svg>
    ),
  },
];

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="5.5" cy="5.5" r="4" />
      <line x1="8.8" y1="8.8" x2="12" y2="12" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#aaa" strokeWidth="1.7" strokeLinecap="round"
      className={`transition-transform duration-150 ${open ? "" : "-rotate-90"}`}>
      <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 2l8 8M10 2L2 10" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function LibrarySidebar() {
  const { libraryOpen, setLibraryOpen, color } = useCanvasStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"components" | "presets">("components");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const filteredComponents = COMPONENTS.map(cat => ({
    ...cat,
    items: cat.items.filter(i =>
      !query || i.label.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  const filteredPresets = PRESETS.filter(p =>
    !query || p.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!libraryOpen) return null;

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-[90] flex flex-col select-none"
      style={{
        width: WIDTH,
        background: "#fff",
        borderLeft: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.06)",
        paddingTop: 52,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <span className="text-[13px] font-semibold text-[#1a1a2e]">Circuit Library</span>
        <button
          onClick={() => setLibraryOpen(false)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#aaa] hover:bg-black/06 hover:text-[#1a1a2e] transition-colors"
        >
          <IconX />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-xl"
          style={{ background: "#f4f4f5", border: "1px solid rgba(0,0,0,0.07)" }}
        >
          <span className="text-[#aaa] flex-shrink-0"><IconSearch /></span>
          <input
            type="text"
            placeholder="Search library..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[#1a1a2e] placeholder-[#aaa] outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#aaa] hover:text-[#555]">
              <IconX />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 gap-1 pb-2">
        {(["components", "presets"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 h-8 rounded-lg text-[12px] font-medium transition-colors capitalize"
            style={{
              background: tab === t ? "#6c63ff" : "transparent",
              color: tab === t ? "#fff" : "#888",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      <p className="text-[10.5px] text-[#bbb] px-4 pb-2 leading-snug">
        Drag elements onto the canvas to place them.
      </p>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#ddd transparent" }}>

        {/* ── Components tab ── */}
        {tab === "components" && (
          <div className="pb-6">
            {filteredComponents.length === 0 && (
              <p className="text-[12px] text-[#bbb] text-center py-10">No results for &ldquo;{query}&rdquo;</p>
            )}
            {filteredComponents.map(cat => (
              <div key={cat.label}>
                <button
                  onClick={() => toggle(cat.label)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-black/02 transition-colors"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                >
                  <span className="text-[12px] font-semibold text-[#555]">{cat.label}</span>
                  <IconChevron open={!collapsed[cat.label]} />
                </button>
                {!collapsed[cat.label] && (
                  <div className="px-2 py-2 grid grid-cols-2 gap-1.5">
                    {cat.items.map(item => (
                      <div
                        key={item.symbol}
                        draggable
                        onDragStart={e => {
                          e.dataTransfer.setData("neura/circuit-symbol", item.symbol);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        title={`Drag to place: ${item.label}`}
                        className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl cursor-grab active:cursor-grabbing active:scale-95 transition-all hover:bg-black/04"
                        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <div className="flex items-center justify-center" style={{ minHeight: 36 }}>
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
        )}

        {/* ── Presets tab ── */}
        {tab === "presets" && (
          <div className="px-2 py-2 pb-6">
            {filteredPresets.length === 0 && (
              <p className="text-[12px] text-[#bbb] text-center py-10">No results for &ldquo;{query}&rdquo;</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredPresets.map(preset => (
                <div
                  key={preset.label}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData("neura/circuit-preset", preset.label);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  title={preset.desc}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl cursor-grab active:cursor-grabbing active:scale-95 transition-all hover:bg-black/04"
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center justify-center w-full py-1" style={{ minHeight: 60 }}>
                    <preset.Preview />
                  </div>
                  <span className="text-[10px] font-semibold text-[#333] text-center leading-tight">{preset.label}</span>
                  <span className="text-[9px] text-[#aaa] text-center leading-tight">{preset.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <p className="text-[10px] text-[#ccc] text-center">EEE / BEE circuit library</p>
      </div>
    </div>
  );
}
