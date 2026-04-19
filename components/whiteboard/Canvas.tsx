"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { useCanvasStore } from "@/lib/store";
import {
  useMyPresence,
  useMutation,
  useStorage,
  type StrokeElement,
} from "@/lib/liveblocks.config";

export function Canvas() {
  const staticRef  = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const rcStaticRef  = useRef<RoughCanvas | null>(null);
  const rcPreviewRef = useRef<RoughCanvas | null>(null);

  const isDrawingRef  = useRef(false);
  const startPtRef    = useRef<[number, number]>([0, 0]);
  const currentPtsRef = useRef<[number, number][]>([]);

  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const { tool, color, strokeSize } = useCanvasStore();
  const [, updatePresence] = useMyPresence();
  const elements = useStorage((root) => root.elements);

  const addElement = useMutation(({ storage }, el: StrokeElement) => {
    storage.get("elements").push(el);
  }, []);

  const clearAll = useMutation(({ storage }) => {
    storage.get("elements").clear();
  }, []);

  // Expose utilities globally so TopBar can reach them
  useEffect(() => {
    (window as any).__neura_clear  = clearAll;
    (window as any).__neura_export = () => {
      const PAD = 40;
      const s = staticRef.current;
      if (!s) return;
      const tmp = document.createElement("canvas");
      tmp.width  = s.width  + PAD * 2;
      tmp.height = s.height + PAD * 2;
      const tc = tmp.getContext("2d")!;
      tc.fillStyle = "#f5f0e8";
      tc.fillRect(0, 0, tmp.width, tmp.height);
      tc.drawImage(s, 0, 0, s.width, s.height, PAD, PAD, s.width, s.height);
      const a = document.createElement("a");
      a.download = `neura-${Date.now()}.png`;
      a.href = tmp.toDataURL();
      a.click();
    };
  }, [clearAll]);

  // Resize both canvases on window resize
  useEffect(() => {
    const resize = () => {
      [staticRef, previewRef].forEach((r) => {
        const c = r.current;
        if (!c) return;
        c.width  = window.innerWidth;
        c.height = window.innerHeight;
      });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Init rough canvases after mount
  useEffect(() => {
    if (staticRef.current)  rcStaticRef.current  = rough.canvas(staticRef.current);
    if (previewRef.current) rcPreviewRef.current = rough.canvas(previewRef.current);
  }, []);

  // Draw one element onto a ctx + rc pair
  const renderEl = useCallback(
    (el: StrokeElement, ctx: CanvasRenderingContext2D, rc: RoughCanvas) => {
      ctx.save();
      ctx.globalAlpha       = el.alpha ?? 1;
      ctx.strokeStyle       = el.color;
      ctx.fillStyle         = el.color;
      ctx.lineWidth         = el.size;
      ctx.lineCap           = "round";
      ctx.lineJoin          = "round";

      const ro = {
        stroke:      el.color,
        strokeWidth: el.size,
        roughness:   1.4,
        seed:        el.seed,
        fill:        "none" as const,
        bowing:      1,
      };

      switch (el.type) {
        case "path":
          if (el.pts && el.pts.length > 1) {
            ctx.globalCompositeOperation = "source-over";
            ctx.beginPath();
            ctx.moveTo(el.pts[0][0], el.pts[0][1]);
            for (let i = 1; i < el.pts.length; i++)
              ctx.lineTo(el.pts[i][0], el.pts[i][1]);
            ctx.stroke();
          }
          break;

        case "erase":
          if (el.pts && el.pts.length > 1) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = el.size * 2;
            ctx.beginPath();
            ctx.moveTo(el.pts[0][0], el.pts[0][1]);
            for (let i = 1; i < el.pts.length; i++)
              ctx.lineTo(el.pts[i][0], el.pts[i][1]);
            ctx.stroke();
          }
          break;

        case "line":
          rc.line(el.x1!, el.y1!, el.x2!, el.y2!, ro);
          break;

        case "arrow": {
          rc.line(el.x1!, el.y1!, el.x2!, el.y2!, ro);
          const ang = Math.atan2(el.y2! - el.y1!, el.x2! - el.x1!);
          const hl  = Math.max(14, el.size * 4);
          ctx.beginPath();
          ctx.moveTo(el.x2!, el.y2!);
          ctx.lineTo(el.x2! - hl * Math.cos(ang - Math.PI / 7), el.y2! - hl * Math.sin(ang - Math.PI / 7));
          ctx.lineTo(el.x2! - hl * Math.cos(ang + Math.PI / 7), el.y2! - hl * Math.sin(ang + Math.PI / 7));
          ctx.closePath();
          ctx.fill();
          break;
        }

        case "rect":
          rc.rectangle(el.x!, el.y!, el.w!, el.h!, ro);
          break;

        case "circle":
          rc.ellipse(el.cx!, el.cy!, el.rx! * 2, el.ry! * 2, ro);
          break;

        case "text":
          ctx.globalCompositeOperation = "source-over";
          ctx.font      = `${el.fontSize}px Caveat, cursive`;
          ctx.fillStyle = el.color;
          el.lines?.forEach((line, i) => {
            ctx.fillText(line, el.x!, el.y! + i * (el.lineHeight ?? 28));
          });
          break;
      }
      ctx.restore();
    },
    []
  );

  // Re-render static canvas when Liveblocks storage changes
  useEffect(() => {
    const canvas = staticRef.current;
    const rc     = rcStaticRef.current;
    if (!canvas || !rc || elements === null) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const el of elements) renderEl(el, ctx, rc);
  }, [elements, renderEl]);

  // Pointer position helper
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = previewRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "text") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pos = getPos(e);
    isDrawingRef.current  = true;
    startPtRef.current    = pos;
    currentPtsRef.current = [pos];
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = getPos(e);
    updatePresence({ cursor: { x, y } });
    if (!isDrawingRef.current) return;

    currentPtsRef.current.push([x, y]);
    const [sx, sy] = startPtRef.current;
    const pts      = currentPtsRef.current;

    const pCanvas = previewRef.current;
    const rc      = rcPreviewRef.current;
    if (!pCanvas || !rc) return;
    const ctx = pCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const ro = { stroke: color, strokeWidth: strokeSize, roughness: 1.4, seed: 1, fill: "none" as const };

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    switch (tool) {
      case "pen":
        ctx.lineWidth               = strokeSize;
        ctx.globalAlpha             = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        break;

      case "highlighter":
        ctx.lineWidth               = strokeSize * 3;
        ctx.globalAlpha             = 0.35;
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        break;

      case "eraser":
        ctx.lineWidth               = strokeSize * 2;
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        break;

      case "line":
        rc.line(sx, sy, x, y, ro);
        break;

      case "arrow": {
        rc.line(sx, sy, x, y, ro);
        const ang = Math.atan2(y - sy, x - sx);
        const hl  = Math.max(14, strokeSize * 4);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - hl * Math.cos(ang - Math.PI / 7), y - hl * Math.sin(ang - Math.PI / 7));
        ctx.lineTo(x - hl * Math.cos(ang + Math.PI / 7), y - hl * Math.sin(ang + Math.PI / 7));
        ctx.closePath();
        ctx.fill();
        break;
      }

      case "rect":
        rc.rectangle(sx, sy, x - sx, y - sy, ro);
        break;

      case "circle": {
        const rx = Math.abs(x - sx) / 2;
        const ry = Math.abs(y - sy) / 2;
        rc.ellipse(sx + (x - sx) / 2, sy + (y - sy) / 2, rx * 2, ry * 2, ro);
        break;
      }
    }
    ctx.restore();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // Clear preview layer
    const pCanvas = previewRef.current;
    if (pCanvas) pCanvas.getContext("2d")!.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const [x, y] = getPos(e);
    const [sx, sy] = startPtRef.current;
    const pts   = [...currentPtsRef.current];
    const seed  = Math.floor(Math.random() * 100000);
    const rx    = Math.abs(x - sx) / 2;
    const ry    = Math.abs(y - sy) / 2;

    let el: StrokeElement | null = null;

    switch (tool) {
      case "pen":
        if (pts.length > 1) el = { id: crypto.randomUUID(), type: "path", color, size: strokeSize,       alpha: 1,    seed, pts };
        break;
      case "highlighter":
        if (pts.length > 1) el = { id: crypto.randomUUID(), type: "path", color, size: strokeSize * 3,   alpha: 0.35, seed, pts };
        break;
      case "eraser":
        if (pts.length > 1) el = { id: crypto.randomUUID(), type: "erase", color: "#000", size: strokeSize, alpha: 1, seed, pts };
        break;
      case "line":
        el = { id: crypto.randomUUID(), type: "line",   color, size: strokeSize, alpha: 1, seed, x1: sx, y1: sy, x2: x, y2: y };
        break;
      case "arrow":
        el = { id: crypto.randomUUID(), type: "arrow",  color, size: strokeSize, alpha: 1, seed, x1: sx, y1: sy, x2: x, y2: y };
        break;
      case "rect":
        el = { id: crypto.randomUUID(), type: "rect",   color, size: strokeSize, alpha: 1, seed, x: sx, y: sy, w: x - sx, h: y - sy };
        break;
      case "circle":
        el = { id: crypto.randomUUID(), type: "circle", color, size: strokeSize, alpha: 1, seed, cx: sx + (x - sx) / 2, cy: sy + (y - sy) / 2, rx, ry };
        break;
    }

    if (el) addElement(el);
  };

  // Text tool click
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "text") return;
    const rect = previewRef.current!.getBoundingClientRect();
    setTextPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => textRef.current?.focus(), 10);
  };

  const commitText = () => {
    const ta = textRef.current;
    if (!textPos || !ta || !ta.value.trim()) { setTextPos(null); return; }
    const fs = Math.max(20, strokeSize * 5);
    const lh = Math.max(24, strokeSize * 6);
    addElement({
      id:         crypto.randomUUID(),
      type:       "text",
      color,
      size:       strokeSize,
      alpha:      1,
      seed:       0,
      x:          textPos.x,
      y:          textPos.y,
      lines:      ta.value.split("\n"),
      fontSize:   fs,
      lineHeight: lh,
    });
    setTextPos(null);
  };

  const cursorClass =
    tool === "eraser" ? "cursor-none" :
    tool === "text"   ? "cursor-text"  :
    "cursor-crosshair";

  return (
    <div className="absolute inset-0">
      {/* Layer 1: committed strokes */}
      <canvas ref={staticRef} className="absolute inset-0" />
      {/* Layer 2: live preview + pointer events */}
      <canvas
        ref={previewRef}
        className={`absolute inset-0 touch-none ${cursorClass}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => updatePresence({ cursor: null })}
        onClick={onCanvasClick}
      />
      {/* Text overlay */}
      {textPos && (
        <textarea
          ref={textRef}
          rows={1}
          placeholder="Type here…"
          autoFocus
          className="fixed z-[200] font-caveat text-2xl border-none outline-none bg-transparent resize-none overflow-hidden leading-[1.3] min-w-[200px]"
          style={{ left: textPos.x, top: textPos.y - 6, color, caretColor: "#e85d4a" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setTextPos(null); return; }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); return; }
            setTimeout(() => {
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = ta.scrollHeight + "px";
            }, 0);
          }}
          onBlur={commitText}
        />
      )}
    </div>
  );
}
