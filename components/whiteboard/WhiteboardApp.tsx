"use client";

import { useEffect, useState } from "react";
import {
  RoomProvider,
  LiveList,
  useHistory,
} from "@/lib/liveblocks.config";
import { Canvas }      from "./Canvas";
import { Toolbar }     from "./Toolbar";
import { TopBar }      from "./TopBar";
import { LiveCursors } from "./LiveCursors";
import { useCanvasStore, type Tool } from "@/lib/store";

// ── Undo/Redo bridge ──────────────────────────────────────────────────────────
// Liveblocks hooks must live inside RoomProvider, so we bridge via window events
function UndoRedoBridge() {
  const { undo, redo } = useHistory();
  useEffect(() => {
    const u = () => undo();
    const r = () => redo();
    window.addEventListener("neura:undo", u);
    window.addEventListener("neura:redo", r);
    return () => {
      window.removeEventListener("neura:undo", u);
      window.removeEventListener("neura:redo", r);
    };
  }, [undo, redo]);
  return null;
}

// ── Inner board (inside RoomProvider) ────────────────────────────────────────
function Board({ roomId, isMP }: { roomId: string; isMP: boolean }) {
  const { setTool } = useCanvasStore();
  const [snack, setSnack] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      const k = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && k === "z") {
        e.preventDefault();
        window.dispatchEvent(new Event("neura:undo"));
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (k === "y" || (e.shiftKey && k === "z"))
      ) {
        e.preventDefault();
        window.dispatchEvent(new Event("neura:redo"));
        return;
      }

      const map: Record<string, Tool> = {
        p: "pen",
        h: "highlighter",
        l: "line",
        a: "arrow",
        r: "rect",
        c: "circle",
        t: "text",
        e: "eraser",
      };
      if (map[k] && !e.ctrlKey && !e.metaKey) setTool(map[k]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setTool]);

  // Snack toast listener
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      setSnack(msg);
      setTimeout(() => setSnack(null), 2200);
    };
    window.addEventListener("neura:snack", handler);
    return () => window.removeEventListener("neura:snack", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 20%,rgba(232,93,74,.03) 0%,transparent 50%)," +
          "radial-gradient(circle at 80% 80%,rgba(74,144,217,.03) 0%,transparent 50%)," +
          "#f5f0e8",
      }}
    >
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,26,46,.025) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(26,26,46,.025) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <Canvas />
      <LiveCursors />
      <TopBar roomId={roomId} isMP={isMP} />
      <Toolbar />

      {/* Snack toast */}
      {snack && (
        <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-[12.5px] px-4 py-2 rounded-[10px] z-[300] pointer-events-none whitespace-nowrap snack-enter font-dm shadow-lg">
          {snack}
        </div>
      )}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export function WhiteboardApp({
  roomId,
  isMP,
}: {
  roomId: string;
  isMP: boolean;
}) {
  const { nick, color, userColor } = useCanvasStore();

  return (
    <RoomProvider
      id={`neura-${roomId}`}
      initialPresence={{
        cursor: null,
        tool:   "pen",
        color:  userColor,
        nick:   nick,
      }}
      initialStorage={{ elements: new LiveList([]) }}
    >
      <UndoRedoBridge />
      <Board roomId={roomId} isMP={isMP} />
    </RoomProvider>
  );
}
