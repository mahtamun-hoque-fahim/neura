"use client";

import Link from "next/link";
import { useCanvasStore } from "@/lib/store";
import { useCanUndo, useCanRedo, useOthers } from "@/lib/liveblocks.config";

interface TopBarProps {
  roomId: string;
  isMP: boolean;
}

function IconUndo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5h6a4 4 0 0 1 0 8H5" />
      <polyline points="2,2 2,5 5,5" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5H6a4 4 0 0 0 0 8h3" />
      <polyline points="12,2 12,5 9,5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,4 12,4" />
      <path d="M5 4V2h4v2" />
      <path d="M3 4l.8 8h6.4L11 4" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2v7" />
      <polyline points="4,7 7,10 10,7" />
      <path d="M2 12h10" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="4" r="2" />
      <path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="10.5" cy="4.5" r="1.5" />
      <path d="M13 13c0-1.7-1.1-3-2.5-3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="4.5" r="2.5" />
      <path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function IconZoomReset() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="10" height="10" rx="1.5" />
      <path d="M5 7h4M7 5v4" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7,1 3,7 6,7 5,11 9,5 6,5" />
    </svg>
  );
}

export function TopBar({ roomId, isMP }: TopBarProps) {
  const { nick, setNick, mode, setMode } = useCanvasStore();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const others  = useOthers();

  const snack = (msg: string) =>
    window.dispatchEvent(new CustomEvent("neura:snack", { detail: msg }));

  const copyInvite = () => {
    const url = `${window.location.origin}/whiteboard?room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => snack("Invite link copied"));
  };

  const handleExport = () => {
    window.__neura_export?.();
    snack("Board exported");
  };

  const handleClear = () => {
    if (!confirm("Clear canvas? This removes all strokes for everyone in the room.")) return;
    window.__neura_clear?.();
    snack("Canvas cleared");
  };

  const handleNick = () => {
    const n = prompt("Your nickname:", nick);
    if (n !== null) setNick(n.trim());
  };

  return (
    <div
      className="fixed top-0 h-[52px] flex items-center justify-between px-4 z-[99] pointer-events-none"
      style={{ left: 200, right: 0 }}
    >
      {/* Left — logo + room badge + mode switcher */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <Link
          href="/"
          className="font-caveat text-xl font-semibold text-[#1a1a2e] opacity-55 hover:opacity-80 transition-opacity no-underline"
        >
          neura
        </Link>

        <div className="flex items-center gap-1.5 bg-[rgba(253,250,244,.88)] border border-[rgba(26,26,46,.12)] rounded-[9px] px-2.5 h-[30px] backdrop-blur-lg text-[11.5px] text-[#5a7a68]">
          {isMP ? (
            <>
              <span className="w-[7px] h-[7px] rounded-full bg-[#22a86a] flex-shrink-0 animate-blink" />
              live · {nick || "Anon"}
              {others.length > 0 && (
                <span className="opacity-50 ml-1">+{others.length}</span>
              )}
            </>
          ) : (
            <>
              <span className="w-[7px] h-[7px] rounded-full bg-[#bbb] flex-shrink-0" />
              solo
            </>
          )}
        </div>

        {/* Mode switcher */}
        <div
          className="flex items-center gap-0.5 rounded-[9px] p-0.5 h-[30px]"
          style={{ background: "rgba(253,250,244,.88)", border: "1px solid rgba(26,26,46,.12)" }}
        >
          <ModeBtn active={mode === "normal"} onClick={() => setMode("normal")}>
            Normal
          </ModeBtn>
          <ModeBtn active={mode === "engineering"} onClick={() => setMode("engineering")}>
            <span className="flex items-center gap-1"><IconBolt /> Engineering</span>
          </ModeBtn>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
        <Btn onClick={() => window.dispatchEvent(new Event("neura:zoom-reset"))}>
          <span className="flex items-center gap-1.5"><IconZoomReset /> 100%</span>
        </Btn>
        <Btn onClick={() => window.dispatchEvent(new Event("neura:undo"))} disabled={!canUndo}>
          <span className="flex items-center gap-1.5"><IconUndo /> Undo</span>
        </Btn>
        <Btn onClick={() => window.dispatchEvent(new Event("neura:redo"))} disabled={!canRedo}>
          <span className="flex items-center gap-1.5"><IconRedo /> Redo</span>
        </Btn>
        <Btn onClick={handleClear}>
          <span className="flex items-center gap-1.5"><IconTrash /> Clear</span>
        </Btn>
        <Btn onClick={handleExport}>
          <span className="flex items-center gap-1.5"><IconDownload /> Export</span>
        </Btn>
        {isMP && (
          <Btn onClick={copyInvite} green>
            <span className="flex items-center gap-1.5"><IconUsers /> Invite</span>
          </Btn>
        )}
        <Btn onClick={handleNick}>
          <span className="flex items-center gap-1.5"><IconUser /> {nick || "Me"}</span>
        </Btn>
      </div>
    </div>
  );
}

function ModeBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 h-[22px] rounded-[6px] text-[11px] font-semibold transition-all whitespace-nowrap
        ${active
          ? "bg-[#1a1a2e] text-[#fdfaf4]"
          : "bg-transparent text-[#5a7a68] hover:bg-[#1a1a2e]/08"
        }`}
    >
      {children}
    </button>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  green,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  green?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-[30px] px-3 rounded-[9px] border text-[12px] font-medium transition-all whitespace-nowrap backdrop-blur-lg font-dm
        disabled:opacity-40 disabled:cursor-not-allowed
        ${
          green
            ? "bg-[#0d5c3a] text-white border-[#0d5c3a] hover:bg-[#0a4a2f]"
            : "bg-[rgba(253,250,244,.88)] text-[#1a1a2e] border-[rgba(26,26,46,.15)] hover:bg-[#1a1a2e] hover:text-[#fdfaf4] hover:border-[#1a1a2e]"
        }`}
    >
      {children}
    </button>
  );
}
