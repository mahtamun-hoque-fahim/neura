"use client";

import { useEffect, useState } from "react";
import { RoomProvider, LiveList, useHistory } from "@/lib/liveblocks.config";
import { Canvas }            from "./Canvas";
import { Toolbar }           from "./Toolbar";
import { TopBar }            from "./TopBar";
import { LiveCursors }       from "./LiveCursors";
import { EngineeringSidebar } from "./EngineeringSidebar";
import { PropertiesPanel }   from "./PropertiesPanel";
import { useCanvasStore }    from "@/lib/store";

function UndoRedoBridge() {
  const { undo, redo } = useHistory();
  useEffect(() => {
    const u = () => undo(), r = () => redo();
    window.addEventListener("neura:undo", u);
    window.addEventListener("neura:redo", r);
    return () => { window.removeEventListener("neura:undo", u); window.removeEventListener("neura:redo", r); };
  }, [undo, redo]);
  return null;
}

function Board({ roomId, isMP }: { roomId: string; isMP: boolean }) {
  const { setTool, mode } = useCanvasStore();
  const [snack, setSnack] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); window.dispatchEvent(new Event("neura:undo")); return; }
      if ((e.ctrlKey || e.metaKey) && (k === "y" || (e.shiftKey && k === "z"))) { e.preventDefault(); window.dispatchEvent(new Event("neura:redo")); return; }
      const map: Record<string, import("@/lib/store").Tool> = {
        h:"hand", v:"select", r:"rect", d:"diamond", o:"circle",
        a:"arrow", l:"line", p:"pen", t:"text", i:"image",
        e:"eraser", c:"connector", f:"frame", k:"laser",
      };
      if (map[k] && !e.ctrlKey && !e.metaKey) setTool(map[k]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setTool]);

  // Snack
  useEffect(() => {
    const handler = (e: Event) => {
      setSnack((e as CustomEvent<string>).detail);
      setTimeout(() => setSnack(null), 2200);
    };
    window.addEventListener("neura:snack", handler);
    return () => window.removeEventListener("neura:snack", handler);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#f5f0e8" }}>
      {/* Properties panel — always on left */}
      <PropertiesPanel onLayerChange={action => window.dispatchEvent(new CustomEvent("neura:layer", { detail: action }))} />

      {/* Engineering sidebar — on right in engineering mode */}
      {mode === "engineering" && <EngineeringSidebar />}

      <Canvas />
      <LiveCursors />
      <TopBar roomId={roomId} isMP={isMP} />
      <Toolbar />

      {snack && (
        <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-[12.5px] px-4 py-2 rounded-[10px] z-[300] pointer-events-none whitespace-nowrap shadow-lg">
          {snack}
        </div>
      )}
    </div>
  );
}

export function WhiteboardApp({ roomId, isMP }: { roomId: string; isMP: boolean }) {
  const { nick, userColor } = useCanvasStore();
  return (
    <RoomProvider
      id={`neura-${roomId}`}
      initialPresence={() => ({ cursor: null, tool: "select", color: userColor, nick })}
      initialStorage={() => ({ elements: new LiveList([]) })}
    >
      <UndoRedoBridge />
      <Board roomId={roomId} isMP={isMP} />
    </RoomProvider>
  );
}
