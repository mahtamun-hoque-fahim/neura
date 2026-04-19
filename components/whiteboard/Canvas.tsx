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

// ── Viewport ──────────────────────────────────────────────────────────────────
interface Viewport { x: number; y: number; scale: number; }
const MIN_SCALE = 0.05;
const MAX_SCALE = 20;

function worldToScreen(wx: number, wy: number, vp: Viewport): [number, number] {
  return [wx * vp.scale + vp.x, wy * vp.scale + vp.y];
}
function screenToWorld(sx: number, sy: number, vp: Viewport): [number, number] {
  return [(sx - vp.x) / vp.scale, (sy - vp.y) / vp.scale];
}

// ── Hit test (world coords) ───────────────────────────────────────────────────
function hitTest(el: StrokeElement, wx: number, wy: number): boolean {
  const PAD = 8;
  switch (el.type) {
    case "path":
    case "erase":
      return (el.pts ?? []).some(
        ([px, py]) => Math.hypot(px - wx, py - wy) < Math.max(PAD, (el.size ?? 4) + 4)
      );
    case "line":
    case "arrow": {
      const dx = (el.x2 ?? 0) - (el.x1 ?? 0), dy = (el.y2 ?? 0) - (el.y1 ?? 0);
      const len = Math.hypot(dx, dy) || 1;
      const t   = Math.max(0, Math.min(1, ((wx - (el.x1 ?? 0)) * dx + (wy - (el.y1 ?? 0)) * dy) / (len * len)));
      return Math.hypot(wx - ((el.x1 ?? 0) + t * dx), wy - ((el.y1 ?? 0) + t * dy)) < PAD;
    }
    case "rect":
      return wx >= (el.x ?? 0) - PAD && wx <= (el.x ?? 0) + (el.w ?? 0) + PAD &&
             wy >= (el.y ?? 0) - PAD && wy <= (el.y ?? 0) + (el.h ?? 0) + PAD;
    case "circle": {
      const dx = wx - (el.cx ?? 0), dy = wy - (el.cy ?? 0);
      const rx = el.rx ?? 1, ry = el.ry ?? 1;
      return Math.abs(dx * dx / (rx * rx) + dy * dy / (ry * ry) - 1) < 0.4;
    }
    case "text":
      return wx >= (el.x ?? 0) - PAD && wx <= (el.x ?? 0) + 200 + PAD &&
             wy >= (el.y ?? 0) - (el.fontSize ?? 20) - PAD &&
             wy <= (el.y ?? 0) + (el.lines ?? []).length * (el.lineHeight ?? 28) + PAD;
    default: return false;
  }
}

// ── Translate element ─────────────────────────────────────────────────────────
function translateEl(el: StrokeElement, dx: number, dy: number): StrokeElement {
  const e = { ...el };
  if (e.pts) e.pts = e.pts.map(([px, py]) => [px + dx, py + dy]);
  if (e.x1 !== undefined) { e.x1 += dx; e.x2 = (e.x2 ?? 0) + dx; }
  if (e.y1 !== undefined) { e.y1 += dy; e.y2 = (e.y2 ?? 0) + dy; }
  if (e.x  !== undefined) e.x  += dx;
  if (e.y  !== undefined) e.y  += dy;
  if (e.cx !== undefined) e.cx += dx;
  if (e.cy !== undefined) e.cy += dy;
  return e;
}

// ── Bounding box ──────────────────────────────────────────────────────────────
function getBBox(el: StrokeElement) {
  if (el.pts?.length) {
    const xs = el.pts.map(p => p[0]), ys = el.pts.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  if (el.x1 !== undefined) return { x: Math.min(el.x1, el.x2 ?? el.x1), y: Math.min(el.y1 ?? 0, el.y2 ?? 0), w: Math.abs((el.x2 ?? el.x1) - el.x1), h: Math.abs((el.y2 ?? el.y1 ?? 0) - (el.y1 ?? 0)) };
  if (el.cx !== undefined) return { x: el.cx - (el.rx ?? 0), y: (el.cy ?? 0) - (el.ry ?? 0), w: (el.rx ?? 0) * 2, h: (el.ry ?? 0) * 2 };
  return { x: el.x ?? 0, y: el.y ?? 0, w: el.w ?? 100, h: el.h ?? 50 };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Canvas() {
  const staticRef    = useRef<HTMLCanvasElement>(null);
  const previewRef   = useRef<HTMLCanvasElement>(null);
  const rcStaticRef  = useRef<RoughCanvas | null>(null);
  const rcPreviewRef = useRef<RoughCanvas | null>(null);

  const vpRef          = useRef<Viewport>({ x: 0, y: 0, scale: 1 });
  const [, forceRender] = useState(0);

  const isDrawingRef      = useRef(false);
  const isPanningRef      = useRef(false);
  const isDraggingRef     = useRef(false);
  const startWorldRef     = useRef<[number, number]>([0, 0]);
  const startScreenRef    = useRef<[number, number]>([0, 0]);
  const startVpRef        = useRef<Viewport>({ x: 0, y: 0, scale: 1 });
  const currentPtsRef     = useRef<[number, number][]>([]);
  const selectedIdRef     = useRef<string | null>(null);
  const dragStartWorldRef = useRef<[number, number]>([0, 0]);

  const [textPos, setTextPos] = useState<{ wx: number; wy: number } | null>(null);
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

  const moveElement = useMutation(({ storage }, id: string, dx: number, dy: number) => {
    const list = storage.get("elements");
    const idx  = list.findIndex((e) => e.id === id);
    if (idx !== -1) list.set(idx, translateEl(list.get(idx)!, dx, dy));
  }, []);

  const deleteElement = useMutation(({ storage }, id: string) => {
    const list = storage.get("elements");
    const idx  = list.findIndex((e) => e.id === id);
    if (idx !== -1) list.delete(idx);
  }, []);

  // ── Render one element (ctx already transformed to world space) ─────────────
  const renderEl = useCallback(
    (el: StrokeElement, ctx: CanvasRenderingContext2D, rc: RoughCanvas) => {
      ctx.save();
      ctx.globalAlpha = el.alpha ?? 1;
      ctx.strokeStyle = el.color;
      ctx.fillStyle   = el.color;
      ctx.lineWidth   = el.size;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";

      const ro = { stroke: el.color, strokeWidth: el.size, roughness: 1.4, seed: el.seed, fill: "none" as const, bowing: 1 };

      switch (el.type) {
        case "path":
          if (el.pts && el.pts.length > 1) {
            ctx.beginPath();
            ctx.moveTo(el.pts[0][0], el.pts[0][1]);
            for (let i = 1; i < el.pts.length; i++) ctx.lineTo(el.pts[i][0], el.pts[i][1]);
            ctx.stroke();
          }
          break;

        case "erase":
          // Paint over with background color — works correctly on re-render
          if (el.pts && el.pts.length > 1) {
            ctx.strokeStyle = "#f5f0e8";
            ctx.lineWidth   = el.size * 2;
            ctx.beginPath();
            ctx.moveTo(el.pts[0][0], el.pts[0][1]);
            for (let i = 1; i < el.pts.length; i++) ctx.lineTo(el.pts[i][0], el.pts[i][1]);
            ctx.stroke();
          }
          break;

        case "line":   rc.line(el.x1!, el.y1!, el.x2!, el.y2!, ro); break;

        case "arrow": {
          rc.line(el.x1!, el.y1!, el.x2!, el.y2!, ro);
          const ang = Math.atan2(el.y2! - el.y1!, el.x2! - el.x1!);
          const hl  = Math.max(14, el.size * 4);
          ctx.beginPath();
          ctx.moveTo(el.x2!, el.y2!);
          ctx.lineTo(el.x2! - hl * Math.cos(ang - Math.PI / 7), el.y2! - hl * Math.sin(ang - Math.PI / 7));
          ctx.lineTo(el.x2! - hl * Math.cos(ang + Math.PI / 7), el.y2! - hl * Math.sin(ang + Math.PI / 7));
          ctx.closePath(); ctx.fill();
          break;
        }

        case "rect":   rc.rectangle(el.x!, el.y!, el.w!, el.h!, ro); break;
        case "circle": rc.ellipse(el.cx!, el.cy!, el.rx! * 2, el.ry! * 2, ro); break;

        case "text":
          ctx.font      = `${el.fontSize}px Caveat, cursive`;
          ctx.fillStyle = el.color;
          el.lines?.forEach((line, i) => ctx.fillText(line, el.x!, el.y! + i * (el.lineHeight ?? 28)));
          break;
      }
      ctx.restore();
    },
    []
  );

  // ── Redraw static canvas ────────────────────────────────────────────────────
  const redrawStatic = useCallback(() => {
    const canvas = staticRef.current;
    const rc     = rcStaticRef.current;
    if (!canvas || !rc) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const vp = vpRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    const GRID = 36;
    ctx.save();
    ctx.strokeStyle = "rgba(26,26,46,0.04)";
    ctx.lineWidth = 1;
    const sx0 = Math.floor((-vp.x / vp.scale) / GRID) * GRID;
    const sy0 = Math.floor((-vp.y / vp.scale) / GRID) * GRID;
    const sx1 = (canvas.width  - vp.x) / vp.scale;
    const sy1 = (canvas.height - vp.y) / vp.scale;
    for (let wx = sx0; wx < sx1; wx += GRID) {
      const [screenX] = worldToScreen(wx, 0, vp);
      ctx.beginPath(); ctx.moveTo(screenX, 0); ctx.lineTo(screenX, canvas.height); ctx.stroke();
    }
    for (let wy = sy0; wy < sy1; wy += GRID) {
      const [, screenY] = worldToScreen(0, wy, vp);
      ctx.beginPath(); ctx.moveTo(0, screenY); ctx.lineTo(canvas.width, screenY); ctx.stroke();
    }
    ctx.restore();

    // Elements
    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.scale, vp.scale);
    if (elements) {
      for (const el of elements) {
        if (el.id === selectedIdRef.current) {
          const bb = getBBox(el);
          ctx.save();
          ctx.strokeStyle = "#4a90d9";
          ctx.lineWidth   = 2 / vp.scale;
          ctx.setLineDash([6 / vp.scale, 3 / vp.scale]);
          ctx.globalAlpha = 0.8;
          ctx.strokeRect(bb.x - 8 / vp.scale, bb.y - 8 / vp.scale, bb.w + 16 / vp.scale, bb.h + 16 / vp.scale);
          ctx.restore();
        }
        renderEl(el, ctx, rc);
      }
    }
    ctx.restore();
  }, [elements, renderEl]);

  useEffect(() => { redrawStatic(); }, [elements, redrawStatic]);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      [staticRef, previewRef].forEach((r) => {
        if (r.current) { r.current.width = window.innerWidth; r.current.height = window.innerHeight; }
      });
      redrawStatic();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (staticRef.current)  rcStaticRef.current  = rough.canvas(staticRef.current);
    if (previewRef.current) rcPreviewRef.current = rough.canvas(previewRef.current);
  }, []);

  // ── Wheel zoom / pan ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vp = vpRef.current;
      if (e.ctrlKey || e.metaKey) {
        const factor   = e.deltaY < 0 ? 1.08 : 1 / 1.08;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vp.scale * factor));
        const ratio    = newScale / vp.scale;
        vpRef.current  = { scale: newScale, x: e.clientX - ratio * (e.clientX - vp.x), y: e.clientY - ratio * (e.clientY - vp.y) };
      } else {
        vpRef.current = { ...vp, x: vp.x - e.deltaX, y: vp.y - e.deltaY };
      }
      redrawStatic();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [redrawStatic]);

  // ── Pointer helpers ─────────────────────────────────────────────────────────
  const getScreen = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = previewRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const getWorld = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const [sx, sy] = getScreen(e);
    return screenToWorld(sx, sy, vpRef.current);
  };

  // ── Pointer events ──────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);

    const [sx, sy] = getScreen(e);
    const [wx, wy] = screenToWorld(sx, sy, vpRef.current);

    if (e.button === 1) {
      isPanningRef.current  = true;
      startScreenRef.current = [sx, sy];
      startVpRef.current    = { ...vpRef.current };
      return;
    }

    if (tool === "text") return;

    if (tool === "select") {
      const hit = elements ? [...elements].reverse().find((el) => hitTest(el, wx, wy)) : undefined;
      selectedIdRef.current = hit?.id ?? null;
      if (hit) {
        isDraggingRef.current     = true;
        dragStartWorldRef.current = [wx, wy];
      }
      forceRender((n) => n + 1);
      redrawStatic();
      return;
    }

    isDrawingRef.current   = true;
    startWorldRef.current  = [wx, wy];
    currentPtsRef.current  = [[wx, wy]];
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [sx, sy] = getScreen(e);
    const [wx, wy] = screenToWorld(sx, sy, vpRef.current);
    updatePresence({ cursor: { x: wx, y: wy } });

    if (isPanningRef.current) {
      const [ssx, ssy] = startScreenRef.current;
      vpRef.current = { ...startVpRef.current, x: startVpRef.current.x + sx - ssx, y: startVpRef.current.y + sy - ssy };
      redrawStatic();
      return;
    }

    if (isDraggingRef.current && selectedIdRef.current) {
      const [dwx, dwy]          = dragStartWorldRef.current;
      dragStartWorldRef.current = [wx, wy];
      moveElement(selectedIdRef.current, wx - dwx, wy - dwy);
      return;
    }

    if (!isDrawingRef.current) return;

    currentPtsRef.current.push([wx, wy]);
    const [swx, swy] = startWorldRef.current;
    const pts        = currentPtsRef.current;
    const pCanvas    = previewRef.current;
    const rc         = rcPreviewRef.current;
    if (!pCanvas || !rc) return;

    const ctx = pCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const vp = vpRef.current;
    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.scale, vp.scale);

    const ro = { stroke: color, strokeWidth: strokeSize, roughness: 1.4, seed: 1, fill: "none" as const };
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    switch (tool) {
      case "pen":
        ctx.lineWidth = strokeSize; ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.stroke();
        break;
      case "highlighter":
        ctx.lineWidth = strokeSize * 3; ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.stroke();
        break;
      case "eraser":
        ctx.strokeStyle = "#f5f0e8"; ctx.lineWidth = strokeSize * 2;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.stroke();
        break;
      case "line": rc.line(swx, swy, wx, wy, ro); break;
      case "arrow": {
        rc.line(swx, swy, wx, wy, ro);
        const ang = Math.atan2(wy - swy, wx - swx), hl = Math.max(14, strokeSize * 4);
        ctx.beginPath(); ctx.moveTo(wx, wy);
        ctx.lineTo(wx - hl * Math.cos(ang - Math.PI / 7), wy - hl * Math.sin(ang - Math.PI / 7));
        ctx.lineTo(wx - hl * Math.cos(ang + Math.PI / 7), wy - hl * Math.sin(ang + Math.PI / 7));
        ctx.closePath(); ctx.fill(); break;
      }
      case "rect": rc.rectangle(swx, swy, wx - swx, wy - swy, ro); break;
      case "circle": {
        const rx = Math.abs(wx - swx) / 2, ry = Math.abs(wy - swy) / 2;
        rc.ellipse(swx + (wx - swx) / 2, swy + (wy - swy) / 2, rx * 2, ry * 2, ro);
        break;
      }
    }
    ctx.restore();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) { isPanningRef.current = false; return; }
    if (isDraggingRef.current) { isDraggingRef.current = false; return; }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const pCanvas = previewRef.current;
    if (pCanvas) pCanvas.getContext("2d")!.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const [wx, wy]   = getWorld(e);
    const [swx, swy] = startWorldRef.current;
    const pts  = [...currentPtsRef.current];
    const seed = Math.floor(Math.random() * 100000);
    const rx   = Math.abs(wx - swx) / 2;
    const ry   = Math.abs(wy - swy) / 2;

    let el: StrokeElement | null = null;
    switch (tool) {
      case "pen":         if (pts.length > 1) el = { id: crypto.randomUUID(), type: "path",   color,        size: strokeSize,     alpha: 1,    seed, pts }; break;
      case "highlighter": if (pts.length > 1) el = { id: crypto.randomUUID(), type: "path",   color,        size: strokeSize * 3, alpha: 0.35, seed, pts }; break;
      case "eraser":      if (pts.length > 1) el = { id: crypto.randomUUID(), type: "erase",  color: "#f5f0e8", size: strokeSize,  alpha: 1,    seed, pts }; break;
      case "line":    el = { id: crypto.randomUUID(), type: "line",   color, size: strokeSize, alpha: 1, seed, x1: swx, y1: swy, x2: wx, y2: wy }; break;
      case "arrow":   el = { id: crypto.randomUUID(), type: "arrow",  color, size: strokeSize, alpha: 1, seed, x1: swx, y1: swy, x2: wx, y2: wy }; break;
      case "rect":    el = { id: crypto.randomUUID(), type: "rect",   color, size: strokeSize, alpha: 1, seed, x: swx, y: swy, w: wx - swx, h: wy - swy }; break;
      case "circle":  el = { id: crypto.randomUUID(), type: "circle", color, size: strokeSize, alpha: 1, seed, cx: swx + (wx - swx) / 2, cy: swy + (wy - swy) / 2, rx, ry }; break;
    }
    if (el) addElement(el);
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "text") return;
    const r  = previewRef.current!.getBoundingClientRect();
    const [wx, wy] = screenToWorld(e.clientX - r.left, e.clientY - r.top, vpRef.current);
    setTextPos({ wx, wy });
    setTimeout(() => textRef.current?.focus(), 10);
  };

  // Delete with Backspace/Delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if ((e.key === "Backspace" || e.key === "Delete") && selectedIdRef.current) {
        deleteElement(selectedIdRef.current);
        selectedIdRef.current = null;
        forceRender((n) => n + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteElement]);

  // Expose globals for TopBar
  useEffect(() => {
    window.__neura_clear  = clearAll;
    window.__neura_export = () => {
      const PAD = 40, s = staticRef.current;
      if (!s) return;
      const tmp = document.createElement("canvas");
      tmp.width = s.width + PAD * 2; tmp.height = s.height + PAD * 2;
      const tc = tmp.getContext("2d")!;
      tc.fillStyle = "#f5f0e8"; tc.fillRect(0, 0, tmp.width, tmp.height);
      tc.drawImage(s, 0, 0, s.width, s.height, PAD, PAD, s.width, s.height);
      const a = document.createElement("a");
      a.download = `neura-${Date.now()}.png`; a.href = tmp.toDataURL(); a.click();
    };
    const onZoomReset = () => {
      vpRef.current = { x: 0, y: 0, scale: 1 };
      redrawStatic();
    };
    window.addEventListener("neura:zoom-reset", onZoomReset);
    return () => window.removeEventListener("neura:zoom-reset", onZoomReset);
  }, [clearAll, redrawStatic]);

  const commitText = () => {
    const ta = textRef.current;
    if (!textPos || !ta || !ta.value.trim()) { setTextPos(null); return; }
    const fs = Math.max(20, strokeSize * 5), lh = Math.max(24, strokeSize * 6);
    addElement({ id: crypto.randomUUID(), type: "text", color, size: strokeSize, alpha: 1, seed: 0, x: textPos.wx, y: textPos.wy, lines: ta.value.split("\n"), fontSize: fs, lineHeight: lh });
    setTextPos(null);
  };

  const textScreenPos = textPos ? worldToScreen(textPos.wx, textPos.wy, vpRef.current) : null;

  const cursorStyle = isPanningRef.current ? "cursor-grabbing" :
    tool === "eraser" ? "cursor-none" :
    tool === "text"   ? "cursor-text"  :
    tool === "select" ? "cursor-default" :
    "cursor-crosshair";

  return (
    <div className="absolute inset-0">
      <canvas ref={staticRef}  className="absolute inset-0" />
      <canvas
        ref={previewRef}
        className={`absolute inset-0 touch-none ${cursorStyle}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => updatePresence({ cursor: null })}
        onClick={onCanvasClick}
      />
      {textPos && textScreenPos && (
        <textarea
          ref={textRef}
          rows={1}
          placeholder="Type here…"
          autoFocus
          className="fixed z-[200] font-caveat border-none outline-none bg-transparent resize-none overflow-hidden leading-[1.3] min-w-[200px]"
          style={{ left: textScreenPos[0], top: textScreenPos[1] - 6, color, caretColor: "#e85d4a", fontSize: Math.max(20, strokeSize * 5) * vpRef.current.scale }}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setTextPos(null); return; }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); return; }
            setTimeout(() => { const ta = e.currentTarget; ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }, 0);
          }}
          onBlur={commitText}
        />
      )}
    </div>
  );
}
