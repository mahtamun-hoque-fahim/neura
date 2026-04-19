"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import { WhiteboardApp } from "@/components/whiteboard/WhiteboardApp";

function WhiteboardInner() {
  const params = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isMP,   setIsMP]   = useState(false);

  useEffect(() => {
    const r = params.get("room");
    if (r) {
      setRoomId(r);
      setIsMP(true);
    } else {
      // Solo session — generate a unique room so Liveblocks has a valid ID
      setRoomId(`solo-${nanoid(7)}`);
      setIsMP(false);
    }
  }, [params]);

  if (!roomId) {
    // Loading state while room ID is resolved
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f5f0e8]">
        <span className="font-caveat text-2xl text-[#5a7a68] animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  return <WhiteboardApp roomId={roomId} isMP={isMP} />;
}

export default function WhiteboardPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#f5f0e8]">
          <span className="font-caveat text-2xl text-[#5a7a68] animate-pulse">
            Loading…
          </span>
        </div>
      }
    >
      <WhiteboardInner />
    </Suspense>
  );
}
