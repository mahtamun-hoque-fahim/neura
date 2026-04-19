"use client";

import Link from "next/link";
import { useCanvasStore } from "@/lib/store";
import { useCanUndo, useCanRedo, useOthers } from "@/lib/liveblocks.config";

interface TopBarProps {
  roomId: string;
  isMP: boolean;
}

export function TopBar({ roomId, isMP }: TopBarProps) {
  const { nick, setNick } = useCanvasStore();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const others  = useOthers();

  const snack = (msg: string) =>
    window.dispatchEvent(new CustomEvent("neura:snack", { detail: msg }));

  const copyInvite = () => {
    const url = `${window.location.origin}/whiteboard?room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => snack("Invite link copied ✓"));
  };

  const handleExport = () => {
    window.__neura_export?.();
    snack("Board exported ✓");
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
    <div className="fixed top-0 left-0 right-0 h-[52px] flex items-center justify-between px-4 z-[99] pointer-events-none">
      {/* Left — logo + room badge */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <Link
          href="/"
          className="font-caveat text-xl font-semibold text-[#1a1a2e] opacity-55 hover:opacity-80 transition-opacity no-underline"
        >
          ✏ neura
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
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
        <Btn onClick={() => window.dispatchEvent(new Event("neura:undo"))} disabled={!canUndo}>↩ Undo</Btn>
        <Btn onClick={() => window.dispatchEvent(new Event("neura:redo"))} disabled={!canRedo}>↪ Redo</Btn>
        <Btn onClick={handleClear}>🗑 Clear</Btn>
        <Btn onClick={handleExport}>⬇ Export</Btn>
        {isMP && (
          <Btn onClick={copyInvite} green>👥 Invite</Btn>
        )}
        <Btn onClick={handleNick}>👤 {nick || "Me"}</Btn>
      </div>
    </div>
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
