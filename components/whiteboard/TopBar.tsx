"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCanvasStore } from "@/lib/store";
import { useCanUndo, useCanRedo, useOthers } from "@/lib/liveblocks.config";

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconMenu() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}
function IconOpen() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h4l2 2h5v7H2V4z" />
    </svg>
  );
}
function IconSave() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 3v7M4.5 7l3 3 3-3" /><path d="M2 12h11" />
    </svg>
  );
}
function IconExport() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="11" height="11" rx="1.5" />
      <path d="M5 7.5l2.5 2.5L10 7.5M7.5 10V5" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,4 13,4" /><path d="M5 4V2.5h5V4" /><path d="M3 4l.8 8.5h7.4L12 4" />
    </svg>
  );
}
function IconCollab() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="5" r="2" /><path d="M1.5 13c0-2.2 1.8-4 4-4" />
      <circle cx="10.5" cy="5" r="2" /><path d="M13.5 13c0-2.2-1.8-4-4-4" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="6" />
      <path d="M5.5 6c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8L7.5 8.5V10" />
      <circle cx="7.5" cy="11.5" r=".5" fill="currentColor" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="4.5" r="2" /><path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="10.5" cy="4.5" r="1.5" /><path d="M13 13c0-1.7-1.1-3-2.5-3" />
    </svg>
  );
}

// ── Menu item component ───────────────────────────────────────────────────────
function MenuItem({
  Icon,
  label,
  shortcut,
  onClick,
  danger,
}: {
  Icon: React.FC;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] rounded-lg transition-colors text-left
        ${danger
          ? "text-red-500 hover:bg-red-50"
          : "text-[#1a1a2e] hover:bg-black/[0.05]"
        }`}
    >
      <span className="opacity-60 flex-shrink-0"><Icon /></span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[11px] text-[#aaa] font-medium">{shortcut}</span>
      )}
    </button>
  );
}

// ── Main TopBar ───────────────────────────────────────────────────────────────
export function TopBar({ roomId, isMP }: { roomId: string; isMP: boolean }) {
  const { nick, setNick } = useCanvasStore();
  const others = useOthers();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const snack = (msg: string) =>
    window.dispatchEvent(new CustomEvent("neura:snack", { detail: msg }));

  const handleExport = () => {
    window.__neura_export?.();
    snack("Board exported");
    setMenuOpen(false);
  };

  const handleClear = () => {
    if (!confirm("Clear canvas? This removes all strokes for everyone in the room.")) return;
    window.__neura_clear?.();
    snack("Canvas cleared");
    setMenuOpen(false);
  };

  const copyInvite = () => {
    const url = `${window.location.origin}/whiteboard?room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => snack("Invite link copied"));
  };

  const handleNick = () => {
    const n = prompt("Your nickname:", nick);
    if (n !== null) setNick(n.trim());
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[52px] z-[99] flex items-center justify-between px-3 pointer-events-none"
      style={{ left: 196 }}
    >
      {/* Left — hamburger menu */}
      <div ref={menuRef} className="relative pointer-events-auto">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
            ${menuOpen
              ? "bg-black/08 text-[#1a1a2e]"
              : "text-[#888] hover:bg-black/05 hover:text-[#1a1a2e]"
            }`}
          title="Menu"
        >
          <IconMenu />
        </button>

        {menuOpen && (
          <div
            className="absolute top-[calc(100%+6px)] left-0 py-1.5 rounded-2xl min-w-[220px] z-[200]"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.09)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)",
            }}
          >
            <div className="px-2">
              <MenuItem Icon={IconExport} label="Export image" shortcut="Ctrl+Shift+E" onClick={handleExport} />
              {isMP && (
                <MenuItem Icon={IconCollab} label="Live collaboration" onClick={() => { copyInvite(); setMenuOpen(false); }} />
              )}
              <MenuItem Icon={IconHelp} label="Shortcuts" shortcut="?" onClick={() => {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
                setMenuOpen(false);
              }} />
            </div>
            <div className="my-1.5 mx-2 border-t border-black/06" />
            <div className="px-2">
              <MenuItem Icon={IconTrash} label="Reset the canvas" onClick={handleClear} danger />
            </div>
          </div>
        )}
      </div>

      {/* Right — live badge + share */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Live badge */}
        <div
          className="flex items-center gap-1.5 h-[32px] px-3 rounded-xl text-[12px] font-medium"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(0,0,0,0.09)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            color: "#555",
          }}
        >
          <span
            className="w-[7px] h-[7px] rounded-full flex-shrink-0"
            style={{ background: isMP ? "#22a86a" : "#bbb" }}
          />
          {isMP ? (
            <>
              {nick || "Anon"}
              {others.length > 0 && <span className="opacity-50 ml-0.5">+{others.length}</span>}
            </>
          ) : "solo"}
        </div>

        {/* Share button */}
        {isMP ? (
          <button
            onClick={copyInvite}
            className="h-[32px] px-4 rounded-xl text-[12px] font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90"
            style={{ background: "#6c63ff" }}
          >
            <IconUsers />
            Share
          </button>
        ) : (
          <button
            onClick={handleNick}
            className="h-[32px] px-4 rounded-xl text-[12px] font-medium transition-all hover:bg-black/05"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,0,0,0.09)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              color: "#555",
            }}
          >
            {nick || "Set name"}
          </button>
        )}
      </div>
    </div>
  );
}
