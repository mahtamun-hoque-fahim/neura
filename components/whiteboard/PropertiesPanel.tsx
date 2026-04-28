"use client";

import { useCanvasStore, type StrokeStyle, type EdgeStyle } from "@/lib/store";

// ── Stroke colors ─────────────────────────────────────────────────────────────
const STROKE_COLORS = ["#1e1e1e","#e03131","#2f9e44","#1971c2","#f08c00","#1e1e1e"];
// ── Fill colors (first = transparent, last = checkerboard = none) ─────────────
const FILL_COLORS = [
  { value: "",         bg: "transparent", checker: true  },
  { value: "#ffc9c9",  bg: "#ffc9c9",     checker: false },
  { value: "#b2f2bb",  bg: "#b2f2bb",     checker: false },
  { value: "#a5d8ff",  bg: "#a5d8ff",     checker: false },
  { value: "#ffec99",  bg: "#ffec99",     checker: false },
  { value: "#f3f0ff",  bg: "#f3f0ff",     checker: false },
];

// Layer arrow icons
function IcoToBottom() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="1" x2="7" y2="10"/><polyline points="4,7 7,10 10,7"/><line x1="2" y1="13" x2="12" y2="13"/></svg>; }
function IcoDown()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="2" x2="7" y2="12"/><polyline points="4,9 7,12 10,9"/></svg>; }
function IcoUp()       { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="12" x2="7" y2="2"/><polyline points="4,5 7,2 10,5"/></svg>; }
function IcoToTop()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="1" x2="12" y2="1"/><line x1="7" y1="13" x2="7" y2="4"/><polyline points="4,7 7,4 10,7"/></svg>; }

// ── Main component ─────────────────────────────────────────────────────────────
export function PropertiesPanel({
  onLayerChange,
}: {
  onLayerChange?: (action: "toBottom" | "down" | "up" | "toTop") => void;
}) {
  const {
    color, setColor,
    fillColor, setFillColor,
    strokeSize, setStrokeSize,
    strokeStyle, setStrokeStyle,
    roughness, setRoughness,
    edgeStyle, setEdgeStyle,
    opacity, setOpacity,
  } = useCanvasStore();

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-[89] flex flex-col select-none overflow-y-auto"
      style={{
        width: 200,
        paddingTop: 52,
        paddingBottom: 80,
        background: "#fff",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "2px 0 12px rgba(0,0,0,0.05)",
        scrollbarWidth: "none",
      }}
    >
      {/* ── Stroke ── */}
      <Section label="Stroke">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STROKE_COLORS.map((c, i) => (
            <ColorDot
              key={i}
              bg={c}
              active={color === c}
              onClick={() => setColor(c)}
            />
          ))}
          {/* Custom color picker */}
          <label
            className="relative w-7 h-7 rounded-lg overflow-hidden cursor-pointer border border-black/10 hover:scale-110 transition-transform flex-shrink-0"
            title="Custom color"
          >
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(135deg,#e85d4a,#4a90d9,#52b788)" }}
            />
            <input
              type="color"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              value={color}
              onChange={e => setColor(e.target.value)}
            />
          </label>
        </div>
      </Section>

      <Divider />

      {/* ── Background / Fill ── */}
      <Section label="Background">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILL_COLORS.map((f, i) => (
            <ColorDot
              key={i}
              bg={f.bg}
              checker={f.checker}
              active={fillColor === f.value}
              onClick={() => setFillColor(f.value)}
              bordered={f.checker || f.value === ""}
            />
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── Stroke width ── */}
      <Section label="Stroke width">
        <div className="flex gap-2">
          {[
            { val: 1, h: 1.5 },
            { val: 2, h: 3   },
            { val: 3, h: 5   },
          ].map(s => (
            <OptionBtn
              key={s.val}
              active={strokeSize === s.val}
              onClick={() => setStrokeSize(s.val)}
              title={`Width ${s.val}`}
            >
              <div
                className="rounded-full w-8"
                style={{ height: s.h, background: strokeSize === s.val ? "#6c63ff" : "#555" }}
              />
            </OptionBtn>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── Stroke style ── */}
      <Section label="Stroke style">
        <div className="flex gap-2">
          {([
            { val: "solid",  render: () => <div className="w-8 border-b-2 border-current" /> },
            { val: "dashed", render: () => <div className="w-8 border-b-2 border-dashed border-current" /> },
            { val: "dotted", render: () => <div className="w-8 border-b-2 border-dotted border-current" /> },
          ] as { val: StrokeStyle; render: () => React.ReactNode }[]).map(s => (
            <OptionBtn
              key={s.val}
              active={strokeStyle === s.val}
              onClick={() => setStrokeStyle(s.val)}
              title={s.val}
            >
              {s.render()}
            </OptionBtn>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── Sloppiness ── */}
      <Section label="Sloppiness">
        <div className="flex gap-2">
          {[
            { val: 0, path: "M2,10 C5,10 8,8 12,8" },
            { val: 1, path: "M2,10 C4,7 7,12 10,8 C11,7 12,8 14,9" },
            { val: 2, path: "M2,9 C3,6 6,13 8,8 C9,5 11,11 14,8" },
          ].map(r => (
            <OptionBtn
              key={r.val}
              active={roughness === r.val}
              onClick={() => setRoughness(r.val)}
              title={["Architect","Artist","Cartoonist"][r.val]}
            >
              <svg width="28" height="16" viewBox="0 0 28 16" fill="none"
                stroke={roughness === r.val ? "#6c63ff" : "#555"} strokeWidth="1.6" strokeLinecap="round">
                <path d={r.path} />
              </svg>
            </OptionBtn>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── Edges ── */}
      <Section label="Edges">
        <div className="flex gap-2">
          <OptionBtn
            active={edgeStyle === "sharp"}
            onClick={() => setEdgeStyle("sharp")}
            title="Sharp edges"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
              stroke={edgeStyle === "sharp" ? "#6c63ff" : "#555"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="16" height="16" strokeDasharray="3 2" />
            </svg>
          </OptionBtn>
          <OptionBtn
            active={edgeStyle === "round"}
            onClick={() => setEdgeStyle("round")}
            title="Round edges"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
              stroke={edgeStyle === "round" ? "#6c63ff" : "#555"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="16" height="16" rx="5" strokeDasharray="3 2" />
            </svg>
          </OptionBtn>
        </div>
      </Section>

      <Divider />

      {/* ── Opacity ── */}
      <Section label="Opacity">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#999] w-4">0</span>
          <input
            type="range"
            min={0} max={100} step={1}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="flex-1 accent-[#6c63ff] h-1 cursor-pointer"
          />
          <span className="text-[10px] text-[#999] w-6 text-right">100</span>
        </div>
      </Section>

      <Divider />

      {/* ── Layers ── */}
      <Section label="Layers">
        <div className="flex gap-1.5">
          {([
            { action: "toBottom", Icon: IcoToBottom, title: "Send to back"    },
            { action: "down",     Icon: IcoDown,     title: "Send backward"   },
            { action: "up",       Icon: IcoUp,       title: "Bring forward"   },
            { action: "toTop",    Icon: IcoToTop,    title: "Bring to front"  },
          ] as { action: "toBottom"|"down"|"up"|"toTop"; Icon: React.FC; title: string }[]).map(b => (
            <button
              key={b.action}
              title={b.title}
              onClick={() => onLayerChange?.(b.action)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#555] hover:bg-black/06 hover:text-[#1a1a2e] transition-colors"
            >
              <b.Icon />
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-3">
      <p className="text-[10.5px] font-semibold text-[#999] uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-3 border-t border-black/06" />;
}

function ColorDot({
  bg, active, onClick, checker, bordered,
}: {
  bg: string; active: boolean; onClick: () => void; checker?: boolean; bordered?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-150 hover:scale-110 overflow-hidden"
      style={{
        background: checker
          ? `repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0/8px 8px`
          : bg,
        boxShadow: active ? `0 0 0 2px #fff, 0 0 0 3.5px #6c63ff` : "none",
        border: bordered && !active ? "1.5px solid rgba(0,0,0,0.12)" : active ? "none" : "1.5px solid transparent",
        transform: active ? "scale(1.15)" : "scale(1)",
      }}
    />
  );
}

function OptionBtn({
  children, active, onClick, title,
}: {
  children: React.ReactNode; active: boolean; onClick: () => void; title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
      style={{
        background: active ? "rgba(108,99,255,0.10)" : "transparent",
        border: active ? "1.5px solid rgba(108,99,255,0.3)" : "1.5px solid rgba(0,0,0,0.09)",
      }}
    >
      {children}
    </button>
  );
}
