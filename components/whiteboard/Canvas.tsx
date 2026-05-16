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
  type CircuitSymbol,
} from "@/lib/liveblocks.config";
import { CircuitSVG } from "./EngineeringSidebar";

// ── Viewport ──────────────────────────────────────────────────────────────────
interface Viewport { x: number; y: number; scale: number; }
const MIN_SCALE = 0.05, MAX_SCALE = 20;
function worldToScreen(wx: number, wy: number, vp: Viewport): [number, number] {
  return [wx * vp.scale + vp.x, wy * vp.scale + vp.y];
}
function screenToWorld(sx: number, sy: number, vp: Viewport): [number, number] {
  return [(sx - vp.x) / vp.scale, (sy - vp.y) / vp.scale];
}

// ── Path simplification (Ramer-Douglas-Peucker) ──────────────────────────────
function simplifyPath(pts: [number, number][], tolerance = 1.5): [number, number][] {
  if (pts.length <= 2) return pts;
  const [x1, y1] = pts[0];
  const [x2, y2] = pts[pts.length - 1];
  const len = Math.hypot(x2 - x1, y2 - y1);
  let maxDist = 0, maxIdx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const dist = len === 0
      ? Math.hypot(x - x1, y - y1)
      : Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / len;
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const left  = simplifyPath(pts.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(pts.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [pts[0], pts[pts.length - 1]];
}

// ── Laser trail point ─────────────────────────────────────────────────────────
interface LaserPt { x: number; y: number; t: number; }

// ── Hit test ──────────────────────────────────────────────────────────────────
function hitTest(el: StrokeElement, wx: number, wy: number): boolean {
  const PAD = 8;
  switch (el.type) {
    case "path": case "erase":
      return (el.pts ?? []).some(([px, py]) => Math.hypot(px - wx, py - wy) < Math.max(PAD, (el.size ?? 4) + 4));
    case "line": case "arrow": {
      const dx = (el.x2 ?? 0) - (el.x1 ?? 0), dy = (el.y2 ?? 0) - (el.y1 ?? 0);
      const len = Math.hypot(dx, dy) || 1;
      const t = Math.max(0, Math.min(1, ((wx - (el.x1 ?? 0)) * dx + (wy - (el.y1 ?? 0)) * dy) / (len * len)));
      return Math.hypot(wx - ((el.x1 ?? 0) + t * dx), wy - ((el.y1 ?? 0) + t * dy)) < PAD;
    }
    case "rect": case "diamond": case "frame":
      return wx >= (el.x ?? 0) - PAD && wx <= (el.x ?? 0) + (el.w ?? 0) + PAD &&
             wy >= (el.y ?? 0) - PAD && wy <= (el.y ?? 0) + (el.h ?? 0) + PAD;
    case "circle": {
      const dx = wx - (el.cx ?? 0), dy = wy - (el.cy ?? 0);
      const rx = el.rx ?? 1, ry = el.ry ?? 1;
      return Math.abs(dx * dx / (rx * rx) + dy * dy / (ry * ry) - 1) < 0.4;
    }
    case "text": case "image": case "embed":
      return wx >= (el.x ?? 0) - PAD && wx <= (el.x ?? 0) + (el.w ?? 200) + PAD &&
             wy >= (el.y ?? 0) - PAD && wy <= (el.y ?? 0) + (el.h ?? 50) + PAD;
    case "circuit":
      return wx >= (el.sx ?? 0) - PAD && wx <= (el.sx ?? 0) + (el.sw ?? 80) + PAD &&
             wy >= (el.sy ?? 0) - PAD && wy <= (el.sy ?? 0) + (el.sh ?? 50) + PAD;
    default: return false;
  }
}

// ── Translate element ─────────────────────────────────────────────────────────
function translateEl(el: StrokeElement, dx: number, dy: number): StrokeElement {
  const e = { ...el };
  if (e.pts) e.pts = e.pts.map(([px, py]) => [px + dx, py + dy]);
  if (e.x1 !== undefined) { e.x1 += dx; e.x2 = (e.x2 ?? 0) + dx; }
  if (e.y1 !== undefined) { e.y1 += dy; e.y2 = (e.y2 ?? 0) + dy; }
  if (e.x  !== undefined) e.x += dx;
  if (e.y  !== undefined) e.y += dy;
  if (e.cx !== undefined) e.cx += dx;
  if (e.cy !== undefined) e.cy += dy;
  if (e.sx !== undefined) e.sx += dx;
  if (e.sy !== undefined) e.sy += dy;
  return e;
}

// ── Bounding box ──────────────────────────────────────────────────────────────
function getBBox(el: StrokeElement) {
  if (el.type === "circuit") return { x: el.sx ?? 0, y: el.sy ?? 0, w: el.sw ?? 80, h: el.sh ?? 50 };
  if (el.pts?.length) {
    const xs = el.pts.map(p => p[0]), ys = el.pts.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  if (el.x1 !== undefined) return { x: Math.min(el.x1, el.x2 ?? el.x1), y: Math.min(el.y1 ?? 0, el.y2 ?? 0), w: Math.abs((el.x2 ?? el.x1) - el.x1), h: Math.abs((el.y2 ?? (el.y1 ?? 0)) - (el.y1 ?? 0)) };
  if (el.cx !== undefined) return { x: el.cx - (el.rx ?? 0), y: (el.cy ?? 0) - (el.ry ?? 0), w: (el.rx ?? 0) * 2, h: (el.ry ?? 0) * 2 };
  return { x: el.x ?? 0, y: el.y ?? 0, w: el.w ?? 100, h: el.h ?? 50 };
}

// ── Point-in-polygon (lasso) ──────────────────────────────────────────────────
function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ── Canvas component ──────────────────────────────────────────────────────────
export function Canvas() {
  const staticRef    = useRef<HTMLCanvasElement>(null);
  const previewRef   = useRef<HTMLCanvasElement>(null);
  const lassoRef     = useRef<HTMLCanvasElement>(null);
  const rcStaticRef  = useRef<RoughCanvas | null>(null);
  const rcPreviewRef = useRef<RoughCanvas | null>(null);

  const vpRef             = useRef<Viewport>({ x: 0, y: 0, scale: 1 });
  const isDrawingRef      = useRef(false);
  const isPanningRef      = useRef(false);
  const isDraggingRef     = useRef(false);
  const startWorldRef     = useRef<[number, number]>([0, 0]);
  const startScreenRef    = useRef<[number, number]>([0, 0]);
  const startVpRef        = useRef<Viewport>({ x: 0, y: 0, scale: 1 });
  const currentPtsRef     = useRef<[number, number][]>([]);
  const selectedIdRef     = useRef<string | null>(null);
  const selectedIdsRef    = useRef<Set<string>>(new Set()); // lasso multi-select
  const dragStartWorldRef = useRef<[number, number]>([0, 0]);

  // Laser trail
  const laserPtsRef       = useRef<LaserPt[]>([]);
  const laserRafRef       = useRef<number>(0);
  const isLaserDrawingRef = useRef(false);

  // Optimistic elements: committed locally but not yet confirmed by Liveblocks storage.
  // These render on top of storage-driven elements so the local user sees no latency.
  const pendingElementsRef = useRef<StrokeElement[]>([]);

  const [textPos, setTextPos] = useState<{ wx: number; wy: number } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Image file input (hidden)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImagePosRef = useRef<{ wx: number; wy: number } | null>(null);

  // Circuit DOM overlays
  const [circuitOverlays, setCircuitOverlays] = useState<
    { id: string; symbol: CircuitSymbol; screenX: number; screenY: number; screenW: number; screenH: number; color: string }[]
  >([]);

  // Embed/image DOM overlays
  const [domOverlays, setDomOverlays] = useState<
    { id: string; type: "image" | "embed" | "frame"; screenX: number; screenY: number; screenW: number; screenH: number; src?: string; label?: string; color: string }[]
  >([]);

  const { tool, color, fillColor, strokeSize, strokeStyle, roughness, edgeStyle, opacity, mode, sidebarOpen } = useCanvasStore();
  const [, updatePresence] = useMyPresence();
  const elements = useStorage((root) => root.elements);
  const elementsRef = useRef(elements);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  const addElement = useMutation(({ storage }, el: StrokeElement) => {
    storage.get("elements").push(el);
  }, []);
  const clearAll = useMutation(({ storage }) => {
    storage.get("elements").clear();
  }, []);
  const moveElement = useMutation(({ storage }, id: string, dx: number, dy: number) => {
    const list = storage.get("elements");
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) list.set(idx, translateEl(list.get(idx)!, dx, dy));
  }, []);
  const moveElements = useMutation(({ storage }, ids: string[], dx: number, dy: number) => {
    const list = storage.get("elements");
    ids.forEach(id => {
      const idx = list.findIndex(e => e.id === id);
      if (idx !== -1) list.set(idx, translateEl(list.get(idx)!, dx, dy));
    });
  }, []);
  const deleteElement = useMutation(({ storage }, id: string) => {
    const list = storage.get("elements");
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) list.delete(idx);
  }, []);

  // Eraser: delete elements whose paths intersect the erase stroke
  const eraseElements = useMutation(({ storage }, erasePts: [number, number][], eraseSize: number) => {
    const list = storage.get("elements");
    const PAD  = eraseSize * 2;
    const toDelete: number[] = [];
    for (let i = list.length - 1; i >= 0; i--) {
      const el = list.get(i)!;
      if (el.type === "erase") continue; // skip erase markers
      for (const [ex, ey] of erasePts) {
        if (hitTest(el, ex, ey) || (el.pts ?? []).some(([px, py]) => Math.hypot(px - ex, py - ey) < PAD)) {
          toDelete.push(i);
          break;
        }
      }
    }
    // Delete in reverse order to keep indices valid
    for (const idx of toDelete) list.delete(idx);
  }, []);

  const layerElement = useMutation(({ storage }, id: string, action: "toBottom"|"down"|"up"|"toTop") => {
    const list  = storage.get("elements");
    const idx   = list.findIndex(e => e.id === id);
    if (idx === -1) return;
    const el = list.get(idx)!;
    list.delete(idx);
    if      (action === "toBottom") list.insert(el, 0);
    else if (action === "down")     list.insert(el, Math.max(0, idx - 1));
    else if (action === "up")       list.insert(el, Math.min(list.length, idx + 1));
    else                            list.insert(el, list.length);
  }, []);

  // ── Render one element ────────────────────────────────────────────────────
  const renderEl = useCallback((el: StrokeElement, ctx: CanvasRenderingContext2D, rc: RoughCanvas) => {
    if (el.type === "circuit" || el.type === "image" || el.type === "embed") return; // DOM overlays
    ctx.save();
    ctx.globalAlpha = el.alpha ?? 1;
    ctx.strokeStyle = el.color;
    ctx.fillStyle   = el.color;
    ctx.lineWidth   = el.size;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    const fillVal  = el.fillColor && el.fillColor !== "" ? el.fillColor : "none";
    const dashArr  = el.strokeStyle === "dashed" ? [12, 6] : el.strokeStyle === "dotted" ? [2, 6] : undefined;
    const ro = {
      stroke: el.color,
      strokeWidth: el.size,
      roughness: el.roughness ?? 1,
      seed: el.seed,
      fill: fillVal,
      fillStyle: fillVal !== "none" ? "solid" as const : undefined,
      bowing: 1,
      strokeLineDash: dashArr,
    };

    switch (el.type) {
      case "path":
        if (el.pts && el.pts.length > 1) {
          ctx.beginPath(); ctx.moveTo(el.pts[0][0], el.pts[0][1]);
          for (let i = 1; i < el.pts.length; i++) ctx.lineTo(el.pts[i][0], el.pts[i][1]);
          ctx.stroke();
        }
        break;
      case "erase":
        // Legacy: erase strokes stored as background-color paint
        // New eraser directly deletes elements, but we keep this for old data
        if (el.pts && el.pts.length > 1) {
          ctx.strokeStyle = "#f5f0e8"; ctx.lineWidth = el.size * 2;
          ctx.beginPath(); ctx.moveTo(el.pts[0][0], el.pts[0][1]);
          for (let i = 1; i < el.pts.length; i++) ctx.lineTo(el.pts[i][0], el.pts[i][1]);
          ctx.stroke();
        }
        break;
      case "line":   rc.line(el.x1!, el.y1!, el.x2!, el.y2!, ro); break;
      case "arrow": {
        rc.line(el.x1!, el.y1!, el.x2!, el.y2!, ro);
        const ang = Math.atan2(el.y2! - el.y1!, el.x2! - el.x1!), hl = Math.max(14, el.size * 4);
        ctx.beginPath(); ctx.moveTo(el.x2!, el.y2!);
        ctx.lineTo(el.x2! - hl * Math.cos(ang - Math.PI / 7), el.y2! - hl * Math.sin(ang - Math.PI / 7));
        ctx.lineTo(el.x2! - hl * Math.cos(ang + Math.PI / 7), el.y2! - hl * Math.sin(ang + Math.PI / 7));
        ctx.closePath(); ctx.fill(); break;
      }
      case "rect":   rc.rectangle(el.x!, el.y!, el.w!, el.h!, ro); break;
      case "diamond": {
        const cx = el.x! + el.w! / 2, cy = el.y! + el.h! / 2;
        rc.polygon([[cx, el.y!], [el.x! + el.w!, cy], [cx, el.y! + el.h!], [el.x!, cy]], ro);
        break;
      }
      case "circle": rc.ellipse(el.cx!, el.cy!, el.rx! * 2, el.ry! * 2, ro); break;
      case "text":
        ctx.font = `${el.fontSize}px Caveat, cursive`; ctx.fillStyle = el.color;
        el.lines?.forEach((line, i) => ctx.fillText(line, el.x!, el.y! + i * (el.lineHeight ?? 28)));
        break;
      case "frame": {
        // Frame: dashed border + label
        ctx.save();
        ctx.strokeStyle = el.color; ctx.lineWidth = 1.5 / vpRef.current.scale;
        ctx.setLineDash([6 / vpRef.current.scale, 4 / vpRef.current.scale]);
        ctx.globalAlpha = 0.6;
        ctx.strokeRect(el.x!, el.y!, el.w!, el.h!);
        ctx.restore();
        ctx.save();
        ctx.font = `bold ${14 / vpRef.current.scale}px system-ui, sans-serif`;
        ctx.fillStyle = el.color; ctx.globalAlpha = 0.7;
        ctx.fillText(el.label ?? "Frame", el.x!, el.y! - 6 / vpRef.current.scale);
        ctx.restore();
        break;
      }
    }
    ctx.restore();
  }, []);

  // ── Update zoom display ──────────────────────────────────────────────────
  const updateZoomDisplay = (scale: number) => {
    const el = document.getElementById("zoom-display");
    if (el) el.textContent = `${Math.round(scale * 100)}%`;
  };

  // Also update on wheel zoom
  // ── Update DOM overlays ───────────────────────────────────────────────────
  const updateDomOverlays = useCallback(() => {
    const els = elementsRef.current;
    const vp  = vpRef.current;
    if (!els) { setCircuitOverlays([]); setDomOverlays([]); return; }

    const circuits = [...els]
      .filter(el => el.type === "circuit" && el.symbol && el.sx !== undefined)
      .map(el => {
        const [sx, sy] = worldToScreen(el.sx!, el.sy!, vp);
        return { id: el.id, symbol: el.symbol!, screenX: sx, screenY: sy, screenW: (el.sw ?? 80) * vp.scale, screenH: (el.sh ?? 50) * vp.scale, color: el.color };
      });
    setCircuitOverlays(circuits);

    const doms = [...els]
      .filter(el => el.type === "image" || el.type === "embed")
      .map(el => {
        const [sx, sy] = worldToScreen(el.x!, el.y!, vp);
        return {
          id: el.id,
          type: el.type as "image" | "embed",
          screenX: sx, screenY: sy,
          screenW: (el.w ?? 200) * vp.scale,
          screenH: (el.h ?? 150) * vp.scale,
          src: el.src,
          label: el.label,
          color: el.color,
        };
      });
    setDomOverlays(doms);
  }, []);

  // ── Redraw static canvas ──────────────────────────────────────────────────
  const redrawStatic = useCallback(() => {
    const canvas = staticRef.current;
    if (!canvas) return;
    if (!rcStaticRef.current) rcStaticRef.current = rough.canvas(canvas);
    const rc  = rcStaticRef.current;
    const els = elementsRef.current;
    if (!rc) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const vp = vpRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    const GRID = 36;
    ctx.save();
    ctx.strokeStyle = "rgba(26,26,46,0.04)"; ctx.lineWidth = 1;
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
    if (els) {
      for (const el of els) {
        // Selection highlight
        const isSelected = el.id === selectedIdRef.current || selectedIdsRef.current.has(el.id);
        if (isSelected) {
          const bb = getBBox(el);
          ctx.save();
          ctx.strokeStyle = "#6c63ff"; ctx.lineWidth = 2 / vp.scale;
          ctx.setLineDash([6 / vp.scale, 3 / vp.scale]);
          ctx.globalAlpha = 0.8;
          ctx.strokeRect(bb.x - 8 / vp.scale, bb.y - 8 / vp.scale, bb.w + 16 / vp.scale, bb.h + 16 / vp.scale);
          ctx.restore();
        }
        renderEl(el, ctx, rc);
      }
    }
    // Render optimistic pending elements (local-only, not yet in storage)
    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.scale, vp.scale);
    for (const el of pendingElementsRef.current) {
      renderEl(el, ctx, rc);
    }
    ctx.restore();

    ctx.restore();
    updateDomOverlays();
  }, [renderEl, updateDomOverlays]);

  useEffect(() => {
    // Storage updated — clear optimistic buffer since elements are now in storage
    pendingElementsRef.current = [];
    redrawStatic();
  }, [elements, redrawStatic]);

  // ── Init + resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      [staticRef, previewRef, lassoRef].forEach(r => {
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

  // ── Wheel zoom/pan ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vp = vpRef.current;
      if (e.ctrlKey || e.metaKey) {
        const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vp.scale * factor));
        const ratio = newScale / vp.scale;
        vpRef.current = { scale: newScale, x: e.clientX - ratio * (e.clientX - vp.x), y: e.clientY - ratio * (e.clientY - vp.y) };
      } else {
        vpRef.current = { ...vp, x: vp.x - e.deltaX, y: vp.y - e.deltaY };
      }
      redrawStatic();
      updateZoomDisplay(vpRef.current.scale);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [redrawStatic]);

  // ── Laser animation loop ──────────────────────────────────────────────────
  const drawLaser = useCallback(() => {
    const canvas = lassoRef.current; // reuse lasso canvas for laser
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    const FADE_MS = 800; // trail fades after 800ms
    laserPtsRef.current = laserPtsRef.current.filter(p => now - p.t < FADE_MS);

    if (laserPtsRef.current.length < 2) {
      if (!isLaserDrawingRef.current) return;
      laserRafRef.current = requestAnimationFrame(drawLaser);
      return;
    }

    const vp = vpRef.current;
    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.scale, vp.scale);

    // Draw trail segments with opacity based on age
    for (let i = 1; i < laserPtsRef.current.length; i++) {
      const p0 = laserPtsRef.current[i - 1];
      const p1 = laserPtsRef.current[i];
      const age = (now - p1.t) / FADE_MS;
      const alpha = Math.max(0, 1 - age);
      const width = (1 - age * 0.7) * (4 / vp.scale);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(232, 60, 60, ${alpha})`;
      ctx.lineWidth   = width;
      ctx.lineCap     = "round";
      ctx.stroke();
    }

    // Glow dot at tip
    const tip = laserPtsRef.current[laserPtsRef.current.length - 1];
    const tipAge = (now - tip.t) / FADE_MS;
    if (tipAge < 0.3) {
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 5 / vp.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 80, 80, ${1 - tipAge / 0.3})`;
      ctx.fill();
      // outer glow
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 10 / vp.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 80, 80, ${(1 - tipAge / 0.3) * 0.15})`;
      ctx.fill();
    }

    ctx.restore();

    laserRafRef.current = requestAnimationFrame(drawLaser);
  }, []);

  // ── Drag-drop circuit from sidebar ────────────────────────────────────────
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("neura/circuit-symbol")) {
        e.preventDefault(); e.dataTransfer.dropEffect = "copy";
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const symbol = e.dataTransfer?.getData("neura/circuit-symbol") as CircuitSymbol | undefined;
      if (!symbol) return;
      const r = canvas.getBoundingClientRect();
      const [wx, wy] = screenToWorld(e.clientX - r.left, e.clientY - r.top, vpRef.current);
      const sw = 80, sh = 50;
      addElement({
        id: crypto.randomUUID(), type: "circuit",
        color: useCanvasStore.getState().color,
        size: 2, alpha: 1, seed: 0,
        symbol, sx: wx - sw / 2, sy: wy - sh / 2, sw, sh,
      });
    };
    canvas.addEventListener("dragover", onDragOver);
    canvas.addEventListener("drop", onDrop);
    return () => { canvas.removeEventListener("dragover", onDragOver); canvas.removeEventListener("drop", onDrop); };
  }, [addElement]);

  // ── Image file input handler ──────────────────────────────────────────────
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const pos = pendingImagePosRef.current ?? { wx: 100, wy: 100 };
        const maxW = 400, maxH = 300;
        const scale = Math.min(1, maxW / img.width, maxH / img.height);
        addElement({
          id: crypto.randomUUID(), type: "image",
          color, size: 1, alpha: 1, seed: 0,
          x: pos.wx, y: pos.wy,
          w: img.width * scale, h: img.height * scale,
          src,
        });
        pendingImagePosRef.current = null;
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [addElement, color]);

  // ── Pointer helpers ───────────────────────────────────────────────────────
  const getScreen = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = previewRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const getWorld = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const [sx, sy] = getScreen(e);
    return screenToWorld(sx, sy, vpRef.current);
  };

  // ── Pointer events ────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const [sx, sy] = getScreen(e);
    const [wx, wy] = screenToWorld(sx, sy, vpRef.current);

    // Lock: block everything
    if (tool === "lock") return;

    // Middle mouse or hand = pan
    if (e.button === 1 || tool === "hand") {
      isPanningRef.current = true;
      startScreenRef.current = [sx, sy];
      startVpRef.current = { ...vpRef.current };
      return;
    }

    // Laser
    if (tool === "laser") {
      isLaserDrawingRef.current = true;
      laserPtsRef.current = [{ x: wx, y: wy, t: Date.now() }];
      cancelAnimationFrame(laserRafRef.current);
      laserRafRef.current = requestAnimationFrame(drawLaser);
      return;
    }

    // Text
    if (tool === "text") return;

    // Image: open file picker at click position
    if (tool === "image") {
      pendingImagePosRef.current = { wx, wy };
      fileInputRef.current?.click();
      return;
    }

    // Frame / embed: just draw a rect
    if (tool === "frame" || tool === "lasso") {
      isDrawingRef.current  = true;
      startWorldRef.current = [wx, wy];
      currentPtsRef.current = [[wx, wy]];
      return;
    }

    // Select
    if (tool === "select") {
      const hit = elementsRef.current
        ? [...elementsRef.current].reverse().find(el => hitTest(el, wx, wy))
        : undefined;
      selectedIdRef.current = hit?.id ?? null;
      selectedIdsRef.current = new Set();
      if (hit) {
        isDraggingRef.current     = true;
        dragStartWorldRef.current = [wx, wy];
      }
      requestAnimationFrame(redrawStatic);
      return;
    }

    isDrawingRef.current  = true;
    startWorldRef.current = [wx, wy];
    currentPtsRef.current = [[wx, wy]];
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [sx, sy] = getScreen(e);
    const [wx, wy] = screenToWorld(sx, sy, vpRef.current);
    updatePresence({ cursor: { x: wx, y: wy } });

    if (tool === "lock") return;

    if (isPanningRef.current) {
      const [ssx, ssy] = startScreenRef.current;
      vpRef.current = { ...startVpRef.current, x: startVpRef.current.x + sx - ssx, y: startVpRef.current.y + sy - ssy };
      redrawStatic(); return;
    }

    if (tool === "laser" && isLaserDrawingRef.current) {
      laserPtsRef.current.push({ x: wx, y: wy, t: Date.now() });
      return;
    }

    if (isDraggingRef.current) {
      const [dwx, dwy] = dragStartWorldRef.current;
      dragStartWorldRef.current = [wx, wy];
      if (selectedIdsRef.current.size > 0) {
        moveElements(Array.from(selectedIdsRef.current), wx - dwx, wy - dwy);
      } else if (selectedIdRef.current) {
        moveElement(selectedIdRef.current, wx - dwx, wy - dwy);
      }
      return;
    }

    if (!isDrawingRef.current) return;

    currentPtsRef.current.push([wx, wy]);
    const [swx, swy] = startWorldRef.current;
    const pts = currentPtsRef.current;
    const pCanvas = previewRef.current;
    const rc = rcPreviewRef.current;
    if (!pCanvas || !rc) return;

    const ctx = pCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    const vp = vpRef.current;
    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.scale, vp.scale);

    const ro = { stroke: color, strokeWidth: strokeSize, roughness: 1.4, seed: 1, fill: "none" as const };
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round";

    switch (tool) {
      case "pen":
        ctx.lineWidth = strokeSize; ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.stroke(); break;
      case "highlighter":
        ctx.lineWidth = strokeSize * 3; ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.stroke(); break;
      case "eraser": {
        // Show erase circle cursor at current position
        const ep = pts[pts.length - 1];
        ctx.save();
        ctx.beginPath();
        ctx.arc(ep[0], ep[1], strokeSize * 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(100,100,100,0.5)";
        ctx.lineWidth = 1 / vp.scale;
        ctx.setLineDash([4 / vp.scale, 3 / vp.scale]);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case "line":      rc.line(swx, swy, wx, wy, ro); break;
      case "connector": rc.line(swx, swy, wx, wy, { ...ro, roughness: 0 }); break;
      case "arrow": {
        rc.line(swx, swy, wx, wy, ro);
        const ang = Math.atan2(wy - swy, wx - swx), hl = Math.max(14, strokeSize * 4);
        ctx.beginPath(); ctx.moveTo(wx, wy);
        ctx.lineTo(wx - hl * Math.cos(ang - Math.PI / 7), wy - hl * Math.sin(ang - Math.PI / 7));
        ctx.lineTo(wx - hl * Math.cos(ang + Math.PI / 7), wy - hl * Math.sin(ang + Math.PI / 7));
        ctx.closePath(); ctx.fill(); break;
      }
      case "rect":    rc.rectangle(swx, swy, wx - swx, wy - swy, ro); break;
      case "diamond": {
        const cxd = swx + (wx - swx) / 2, cyd = swy + (wy - swy) / 2;
        rc.polygon([[cxd, swy], [wx, cyd], [cxd, wy], [swx, cyd]], ro); break;
      }
      case "circle": {
        const rx = Math.abs(wx - swx) / 2, ry = Math.abs(wy - swy) / 2;
        rc.ellipse(swx + (wx - swx) / 2, swy + (wy - swy) / 2, rx * 2, ry * 2, ro); break;
      }
      case "frame": {
        // Dashed preview rect
        ctx.save();
        ctx.strokeStyle = "#6c63ff"; ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]); ctx.globalAlpha = 0.7;
        ctx.strokeRect(swx, swy, wx - swx, wy - swy);
        ctx.font = `bold ${14}px system-ui`; ctx.fillStyle = "#6c63ff"; ctx.globalAlpha = 0.7;
        ctx.fillText("Frame", swx, swy - 6);
        ctx.restore(); break;
      }
      case "lasso": {
        // Freehand lasso outline
        const lassoCanvas = lassoRef.current;
        if (!lassoCanvas) break;
        const lctx = lassoCanvas.getContext("2d")!;
        lctx.clearRect(0, 0, lassoCanvas.width, lassoCanvas.height);
        lctx.save();
        lctx.translate(vp.x, vp.y); lctx.scale(vp.scale, vp.scale);
        lctx.beginPath(); lctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(([px, py]) => lctx.lineTo(px, py));
        lctx.closePath();
        lctx.strokeStyle = "#6c63ff"; lctx.lineWidth = 1.5 / vp.scale;
        lctx.setLineDash([5 / vp.scale, 3 / vp.scale]);
        lctx.globalAlpha = 0.8; lctx.stroke();
        lctx.fillStyle = "rgba(108,99,255,0.06)"; lctx.fill();
        lctx.restore(); break;
      }
    }
    ctx.restore();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) { isPanningRef.current = false; return; }

    if (tool === "laser") {
      isLaserDrawingRef.current = false;
      // Keep fading — RAF loop will stop naturally when pts expire
      return;
    }

    if (isDraggingRef.current) { isDraggingRef.current = false; return; }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const pCanvas = previewRef.current;
    if (pCanvas) pCanvas.getContext("2d")!.clearRect(0, 0, pCanvas.width, pCanvas.height);
    // Clear lasso canvas
    const lassoCanvas = lassoRef.current;
    if (lassoCanvas) lassoCanvas.getContext("2d")!.clearRect(0, 0, lassoCanvas.width, lassoCanvas.height);

    const [wx, wy]   = getWorld(e);
    const [swx, swy] = startWorldRef.current;
    const pts  = [...currentPtsRef.current];
    const seed = Math.floor(Math.random() * 100000);
    const rx   = Math.abs(wx - swx) / 2, ry = Math.abs(wy - swy) / 2;

    // Lasso: select all elements inside the polygon
    if (tool === "lasso") {
      const poly = pts;
      const els  = elementsRef.current;
      if (els) {
        const hits = new Set<string>();
        for (const el of els) {
          const bb = getBBox(el);
          const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
          if (pointInPolygon(cx, cy, poly)) hits.add(el.id);
        }
        selectedIdsRef.current = hits;
        selectedIdRef.current  = null;
        if (hits.size > 0) isDraggingRef.current = false;
        requestAnimationFrame(redrawStatic);
      }
      return;
    }

    let el: StrokeElement | null = null;
    switch (tool) {
      case "pen":         if (pts.length > 1) el = { id: crypto.randomUUID(), type: "path",    color, fillColor, size: strokeSize,     alpha: opacity/100, seed, pts: simplifyPath(pts, 1.0), strokeStyle, roughness, roundEdges: edgeStyle==="round" }; break;
      case "highlighter": if (pts.length > 1) el = { id: crypto.randomUUID(), type: "path",    color, fillColor, size: strokeSize * 3, alpha: 0.35, seed, pts: simplifyPath(pts, 1.0), strokeStyle, roughness }; break;
      case "eraser":
        // Erase = delete all elements touched by the stroke path
        if (pts.length > 1) eraseElements(pts, strokeSize);
        break;
      case "line":        el = { id: crypto.randomUUID(), type: "line",    color, fillColor, size: strokeSize, alpha: opacity/100, seed, x1: swx, y1: swy, x2: wx, y2: wy, strokeStyle, roughness }; break;
      case "connector":   el = { id: crypto.randomUUID(), type: "line",    color, fillColor, size: strokeSize, alpha: opacity/100, seed: 0, x1: swx, y1: swy, x2: wx, y2: wy, strokeStyle, roughness: 0 }; break;
      case "arrow":       el = { id: crypto.randomUUID(), type: "arrow",   color, fillColor, size: strokeSize, alpha: opacity/100, seed, x1: swx, y1: swy, x2: wx, y2: wy, strokeStyle, roughness }; break;
      case "rect":        el = { id: crypto.randomUUID(), type: "rect",    color, fillColor, size: strokeSize, alpha: opacity/100, seed, x: swx, y: swy, w: wx - swx, h: wy - swy, strokeStyle, roughness, roundEdges: edgeStyle==="round" }; break;
      case "diamond":     el = { id: crypto.randomUUID(), type: "diamond", color, fillColor, size: strokeSize, alpha: opacity/100, seed, x: swx, y: swy, w: wx - swx, h: wy - swy, strokeStyle, roughness }; break;
      case "circle":      el = { id: crypto.randomUUID(), type: "circle",  color, fillColor, size: strokeSize, alpha: opacity/100, seed, cx: swx + (wx - swx) / 2, cy: swy + (wy - swy) / 2, rx, ry, strokeStyle, roughness }; break;
      case "frame":       el = { id: crypto.randomUUID(), type: "frame",   color, size: 1.5, alpha: opacity/100, seed: 0, x: swx, y: swy, w: wx - swx, h: wy - swy, label: "Frame" }; break;
    }

    if (el) {
      // Add to optimistic local buffer so the local user sees it instantly.
      // When Liveblocks storage updates (useEffect[elements] → redrawStatic),
      // the element will come back from storage, so we clear the pending buffer.
      pendingElementsRef.current = [...pendingElementsRef.current, el];
      requestAnimationFrame(redrawStatic);
      addElement(el);
    }
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "text") return;
    const r = previewRef.current!.getBoundingClientRect();
    const [wx, wy] = screenToWorld(e.clientX - r.left, e.clientY - r.top, vpRef.current);
    setTextPos({ wx, wy });
    setTimeout(() => textRef.current?.focus(), 10);
  };

  // Delete selected
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedIdsRef.current.size > 0) {
          Array.from(selectedIdsRef.current).forEach(id => deleteElement(id));
          selectedIdsRef.current = new Set();
          requestAnimationFrame(redrawStatic);
        } else if (selectedIdRef.current) {
          deleteElement(selectedIdRef.current);
          selectedIdRef.current = null;
          requestAnimationFrame(redrawStatic);
        }
      }
      // Escape: deselect
      if (e.key === "Escape") {
        selectedIdRef.current = null;
        selectedIdsRef.current = new Set();
        requestAnimationFrame(redrawStatic);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteElement, redrawStatic]);

  // Layer operations from PropertiesPanel
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent<"toBottom"|"down"|"up"|"toTop">).detail;
      const id = selectedIdRef.current ?? Array.from(selectedIdsRef.current)[0];
      if (id) layerElement(id, action);
    };
    window.addEventListener("neura:layer", handler);
    return () => window.removeEventListener("neura:layer", handler);
  }, [layerElement]);

  // Expose globals
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
      updateZoomDisplay(1);
    };
    const onZoom = (e: Event) => {
      const factor = (e as CustomEvent<number>).detail;
      const vp = vpRef.current;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vp.scale * factor));
      const ratio = newScale / vp.scale;
      vpRef.current = { scale: newScale, x: cx - ratio * (cx - vp.x), y: cy - ratio * (cy - vp.y) };
      redrawStatic();
      updateZoomDisplay(newScale);
    };
    window.addEventListener("neura:zoom-reset", onZoomReset);
    window.addEventListener("neura:zoom", onZoom);
    return () => {
      window.removeEventListener("neura:zoom-reset", onZoomReset);
      window.removeEventListener("neura:zoom", onZoom);
    };
  }, [clearAll, redrawStatic]);

  const commitText = () => {
    const ta = textRef.current;
    if (!textPos || !ta || !ta.value.trim()) { setTextPos(null); return; }
    const fs = Math.max(20, strokeSize * 5), lh = Math.max(24, strokeSize * 6);
    addElement({ id: crypto.randomUUID(), type: "text", color, size: strokeSize, alpha: 1, seed: 0, x: textPos.wx, y: textPos.wy, lines: ta.value.split("\n"), fontSize: fs, lineHeight: lh });
    setTextPos(null);
  };

  const textScreenPos = textPos ? worldToScreen(textPos.wx, textPos.wy, vpRef.current) : null;
  const propsPanelWidth = 196;
  const engSidebarWidth = mode === "engineering" && sidebarOpen ? 220 : 0;
  const sidebarWidth = propsPanelWidth;

  const cursorStyle =
    tool === "lock"    ? "cursor-not-allowed" :
    tool === "hand"    ? "cursor-grab" :
    tool === "eraser"  ? "cursor-none" :
    tool === "text"    ? "cursor-text" :
    tool === "laser"   ? "cursor-none" :
    tool === "select"  ? "cursor-default" :
    tool === "lasso"   ? "cursor-crosshair" :
    "cursor-crosshair";

  return (
    <div className="absolute inset-0" style={{ left: propsPanelWidth, right: engSidebarWidth }}>
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
      />

      <canvas ref={staticRef} className="absolute inset-0" />
      {/* Lasso / laser overlay canvas */}
      <canvas ref={lassoRef} className="absolute inset-0 pointer-events-none" />
      <canvas
        ref={previewRef}
        className={`absolute inset-0 touch-none ${cursorStyle}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => updatePresence({ cursor: null })}
        onClick={onCanvasClick}
      />

      {/* Circuit SVG overlays */}
      {circuitOverlays.map(ov => (
        <div
          key={ov.id}
          className="absolute pointer-events-none"
          style={{ left: ov.screenX, top: ov.screenY, width: ov.screenW, height: ov.screenH }}
        >
          <div style={{ transform: `scale(${ov.screenW / 80})`, transformOrigin: "top left" }}>
            <CircuitSVG symbol={ov.symbol} color={ov.color} />
          </div>
        </div>
      ))}

      {/* Image / embed DOM overlays */}
      {domOverlays.map(ov => (
        <div
          key={ov.id}
          className="absolute pointer-events-none overflow-hidden rounded-sm"
          style={{
            left: ov.screenX, top: ov.screenY,
            width: ov.screenW, height: ov.screenH,
            border: `1px solid ${ov.color}33`,
          }}
        >
          {ov.type === "image" && ov.src && (
            <img src={ov.src} alt="" className="w-full h-full object-contain" draggable={false} />
          )}
          {ov.type === "embed" && ov.src && (
            <iframe src={ov.src} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
          )}
        </div>
      ))}

      {/* Frame label prompt — shows when a frame is newly placed and selected */}

      {/* Text textarea */}
      {textPos && textScreenPos && (
        <textarea
          ref={textRef}
          rows={1}
          placeholder="Type here…"
          autoFocus
          className="fixed z-[200] font-caveat border-none outline-none bg-transparent resize-none overflow-hidden leading-[1.3] min-w-[200px]"
          style={{ left: textScreenPos[0], top: textScreenPos[1] - 6, color, caretColor: "#e85d4a", fontSize: Math.max(20, strokeSize * 5) * vpRef.current.scale }}
          onKeyDown={e => {
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
