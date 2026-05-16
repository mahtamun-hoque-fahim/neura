"use client";

import { useCanvasStore, type StrokeStyle, type EdgeStyle } from "@/lib/store";

// ── Color palettes ────────────────────────────────────────────────────────────
const STROKE_COLORS = [
  "#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#1e1e1e",
];

const BG_COLORS = [
  { value: "",        checker: true  },
  { value: "#ffc9c9", checker: false },
  { value: "#b2f2bb", checker: false },
  { value: "#a5d8ff", checker: false },
  { value: "#ffec99", checker: false },
  { value: "#fcc2d7", checker: false },
];

// ── Layer icons ───────────────────────────────────────────────────────────────
const LayerIcons = {
  toBottom: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="1" x2="7" y2="9"/><polyline points="4,6 7,9 10,6"/>
      <line x1="2" y1="12" x2="12" y2="12"/>
    </svg>
  ),
  down: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="2" x2="7" y2="11"/><polyline points="4,8 7,11 10,8"/>
    </svg>
  ),
  up: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="11" x2="7" y2="2"/><polyline points="4,5 7,2 10,5"/>
    </svg>
  ),
  toTop: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="12" y2="2"/>
      <line x1="7" y1="12" x2="7" y2="4"/><polyline points="4,7 7,4 10,7"/>
    </svg>
  ),
};

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
      className="fixed z-[88] select-none"
      style={{ left: 8, top: 60, bottom: 72, width: 208, pointerEvents: "none" }}
    >
      <div
        className="flex flex-col gap-0 overflow-y-auto"
        style={{
          maxHeight: "100%",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.07)",
          pointerEvents: "auto",
          scrollbarWidth: "none",
        }}
      >

        {/* ── Stroke ── */}
        <Section label="Stroke">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STROKE_COLORS.map((c, i) => (
              <Swatch
                key={i}
                bg={c}
                active={color === c && STROKE_COLORS.includes(color)}
                onClick={() => setColor(c)}
              />
            ))}
            {/* Custom color picker */}
            <ColorPickerSwatch
              value={color}
              onChange={setColor}
              isCustom={!STROKE_COLORS.includes(color)}
            />
          </div>
        </Section>

        <Hr />

        {/* ── Background ── */}
        <Section label="Background">
          <div className="flex items-center gap-1.5 flex-wrap">
            {BG_COLORS.map((c, i) => (
              <Swatch
                key={i}
                bg={c.checker ? "transparent" : c.value}
                checker={c.checker}
                active={fillColor === c.value}
                onClick={() => setFillColor(c.value)}
                bordered={c.checker}
              />
            ))}
            {/* Custom background color */}
            <ColorPickerSwatch
              value={fillColor || "#ffffff"}
              onChange={setFillColor}
              isCustom={fillColor !== "" && !BG_COLORS.some(b => b.value === fillColor)}
            />
          </div>
        </Section>

        <Hr />

        {/* ── Fill style ── */}
        <Section label="Fill">
          <div className="flex gap-2">
            {/* Hatch */}
            <OptionBtn active={false} onClick={() => {}} title="Hatch">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="2" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="6" y1="16" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="2" y1="16" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="10" y1="16" x2="20" y2="6" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </OptionBtn>
            {/* Cross hatch */}
            <OptionBtn active={false} onClick={() => {}} title="Cross hatch">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="2" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="6" y1="16" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="2" y1="16" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="6" y1="6" x2="16" y2="16" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="2" y1="6" x2="12" y2="16" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </OptionBtn>
            {/* Solid */}
            <OptionBtn
              active={fillColor !== "" && BG_COLORS.some(b => b.value === fillColor)}
              onClick={() => setFillColor(fillColor || "#a5d8ff")}
              title="Solid fill"
            >
              <svg width="22" height="22" viewBox="0 0 22 22">
                <rect x="2" y="2" width="18" height="18" rx="2"
                  fill={fillColor || "#a5d8ff"}
                  stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </OptionBtn>
          </div>
        </Section>

        <Hr />

        {/* ── Stroke width ── */}
        <Section label="Stroke width">
          <div className="flex gap-2">
            {[
              { val: 1, strokeW: 1.2 },
              { val: 2, strokeW: 2.5 },
              { val: 3, strokeW: 4.5 },
            ].map(s => (
              <OptionBtn
                key={s.val}
                active={strokeSize === s.val}
                onClick={() => setStrokeSize(s.val)}
                title={`Width ${s.val}`}
              >
                <svg width="28" height="12" viewBox="0 0 28 12">
                  <line x1="2" y1="6" x2="26" y2="6"
                    stroke="currentColor" strokeWidth={s.strokeW} strokeLinecap="round"/>
                </svg>
              </OptionBtn>
            ))}
          </div>
        </Section>

        <Hr />

        {/* ── Stroke style ── */}
        <Section label="Stroke style">
          <div className="flex gap-2">
            {([
              { val: "solid",  da: undefined },
              { val: "dashed", da: "6 3" },
              { val: "dotted", da: "1.5 3.5" },
            ] as { val: StrokeStyle; da?: string }[]).map(s => (
              <OptionBtn
                key={s.val}
                active={strokeStyle === s.val}
                onClick={() => setStrokeStyle(s.val)}
                title={s.val}
              >
                <svg width="28" height="12" viewBox="0 0 28 12">
                  <line
                    x1="2" y1="6" x2="26" y2="6"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                    strokeDasharray={s.da}
                  />
                </svg>
              </OptionBtn>
            ))}
          </div>
        </Section>

        <Hr />

        {/* ── Sloppiness ── */}
        <Section label="Sloppiness">
          <div className="flex gap-2">
            {[
              { val: 0,   path: "M3,9 L25,7",                              title: "Architect"   },
              { val: 1.5, path: "M3,10 C8,6 14,12 20,8 C23,5 25,8 26,7",  title: "Artist"      },
              { val: 3,   path: "M3,9 C7,4 12,14 17,8 C21,3 24,12 26,8",  title: "Cartoonist"  },
            ].map(r => (
              <OptionBtn
                key={r.val}
                active={roughness === r.val}
                onClick={() => setRoughness(r.val)}
                title={r.title}
              >
                <svg width="28" height="16" viewBox="0 0 28 16" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d={r.path} />
                </svg>
              </OptionBtn>
            ))}
          </div>
        </Section>

        <Hr />

        {/* ── Edges ── */}
        <Section label="Edges">
          <div className="flex gap-2">
            <OptionBtn
              active={edgeStyle === "sharp"}
              onClick={() => setEdgeStyle("sharp")}
              title="Sharp"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="miter">
                <rect x="3" y="3" width="16" height="16" rx="0"/>
              </svg>
            </OptionBtn>
            <OptionBtn
              active={edgeStyle === "round"}
              onClick={() => setEdgeStyle("round")}
              title="Rounded"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="16" height="16" rx="5"/>
              </svg>
            </OptionBtn>
          </div>
        </Section>

        <Hr />

        {/* ── Opacity ── */}
        <Section label="Opacity">
          <input
            type="range" min={0} max={100} step={1} value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#6c63ff]"
            style={{ height: 4 }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#aaa]">0</span>
            <span className="text-[10px] text-[#aaa]">{opacity}</span>
          </div>
        </Section>

        <Hr />

        {/* ── Layers ── */}
        <Section label="Layers">
          <div className="flex gap-1">
            {(["toBottom", "down", "up", "toTop"] as const).map(action => {
              const Icon = LayerIcons[action];
              const titles = { toBottom: "Send to back", down: "Send backward", up: "Bring forward", toTop: "Bring to front" };
              return (
                <button
                  key={action}
                  title={titles[action]}
                  onClick={() => onLayerChange?.(action)}
                  className="flex-1 h-9 rounded-xl flex items-center justify-center text-[#666] hover:bg-black/06 hover:text-[#1a1a2e] transition-colors"
                >
                  <Icon />
                </button>
              );
            })}
          </div>
        </Section>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-3">
      <p className="text-[11px] font-medium text-[#888] mb-2.5">{label}</p>
      {children}
    </div>
  );
}

function Hr() {
  return <div className="mx-3.5" style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />;
}

function Swatch({
  bg, active, onClick, checker, bordered,
}: {
  bg: string; active: boolean; onClick: () => void;
  checker?: boolean; bordered?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex-shrink-0 transition-all hover:scale-110 relative overflow-hidden"
      style={{
        background: checker
          ? "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 0 / 10px 10px"
          : bg,
        boxShadow: active
          ? "0 0 0 2px #fff, 0 0 0 3.5px #6c63ff"
          : bordered
          ? "0 0 0 1.5px rgba(0,0,0,0.14)"
          : "0 0 0 1.5px rgba(0,0,0,0.08)",
        transform: active ? "scale(1.12)" : "scale(1)",
        transition: "all 130ms ease",
      }}
    />
  );
}

function ColorPickerSwatch({
  value, onChange, isCustom,
}: {
  value: string; onChange: (c: string) => void; isCustom: boolean;
}) {
  return (
    <label
      className="w-7 h-7 rounded-lg flex-shrink-0 relative overflow-hidden cursor-pointer hover:scale-110 transition-transform"
      title="Custom color"
      style={{
        boxShadow: isCustom
          ? "0 0 0 2px #fff, 0 0 0 3.5px #6c63ff"
          : "0 0 0 1.5px rgba(0,0,0,0.12)",
        transform: isCustom ? "scale(1.12)" : "scale(1)",
        transition: "all 130ms ease",
      }}
    >
      <div
        className="w-full h-full"
        style={{
          background: isCustom
            ? value
            : "conic-gradient(#e03131 0deg, #f08c00 60deg, #2f9e44 120deg, #1971c2 180deg, #ae3ec9 240deg, #e03131 300deg)",
        }}
      />
      <input
        type="color"
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
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
      className="flex-1 h-9 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: active ? "rgba(108,99,255,0.12)" : "transparent",
        border: active
          ? "1.5px solid rgba(108,99,255,0.4)"
          : "1.5px solid rgba(0,0,0,0.08)",
        color: active ? "#6c63ff" : "#555",
      }}
    >
      {children}
    </button>
  );
}
