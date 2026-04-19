"use client";

import { useOthers } from "@/lib/liveblocks.config";

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null;
        return (
          <div
            key={connectionId}
            className="remote-cursor"
            style={{ left: presence.cursor.x, top: presence.cursor.y }}
          >
            <svg width="16" height="22" viewBox="0 0 16 22">
              <path
                d="M0 0 L0 18 L5 13 L9 21 L11 20 L7 12 L13 12 Z"
                fill={presence.color || "#4a90d9"}
                stroke="#fff"
                strokeWidth="1.2"
              />
            </svg>
            <div
              className="remote-cursor-label"
              style={{ background: presence.color || "#4a90d9" }}
            >
              {presence.nick || "Anon"}
            </div>
          </div>
        );
      })}
    </>
  );
}
