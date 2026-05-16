"use client";

import { useCanUndo, useCanRedo } from "@/lib/liveblocks.config";

function IconUndo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 5.5h6a3.5 3.5 0 0 1 0 7H5" />
      <polyline points="2.5,2.5 2.5,5.5 5.5,5.5" />
    </svg>
  );
}
function IconRedo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 5.5h-6a3.5 3.5 0 0 0 0 7H9" />
      <polyline points="11.5,2.5 11.5,5.5 8.5,5.5" />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="2" y1="6" x2="10" y2="6" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="6" y1="2" x2="6" y2="10" />
      <line x1="2" y1="6" x2="10" y2="6" />
    </svg>
  );
}

const pill = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.09)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05)",
};

export function BottomBar() {
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div
      className="fixed bottom-5 z-[200] flex items-center gap-3"
      style={{ left: 228 }}
    >
      {/* Zoom controls */}
      <div className="flex items-center rounded-xl overflow-hidden" style={pill}>
        <Btn
          onClick={() => window.dispatchEvent(new CustomEvent("neura:zoom", { detail: 0.8 }))}
          title="Zoom out"
        >
          <IconMinus />
        </Btn>
        <button
          onClick={() => window.dispatchEvent(new Event("neura:zoom-reset"))}
          title="Reset zoom"
          className="h-9 px-3 text-[12px] font-medium text-[#555] hover:bg-black/05 transition-colors border-x border-black/[0.07]"
          style={{ minWidth: 60 }}
          id="zoom-display"
        >
          100%
        </button>
        <Btn
          onClick={() => window.dispatchEvent(new CustomEvent("neura:zoom", { detail: 1.2 }))}
          title="Zoom in"
        >
          <IconPlus />
        </Btn>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center rounded-xl overflow-hidden" style={pill}>
        <Btn
          onClick={() => window.dispatchEvent(new Event("neura:undo"))}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <IconUndo />
        </Btn>
        <div className="w-px h-5 bg-black/[0.08]" />
        <Btn
          onClick={() => window.dispatchEvent(new Event("neura:redo"))}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <IconRedo />
        </Btn>
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-9 h-9 flex items-center justify-center text-[#666] hover:bg-black/05 hover:text-[#1a1a2e] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
