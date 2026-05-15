# PLANNER.md — Neura

> Living technical document. Updated whenever `update repo` is triggered.
> Last updated: 2026-05-15

---

## Overview

| Field | Value |
|---|---|
| Project | Neura |
| Purpose | Real-time collaborative whiteboard with hand-drawn aesthetic and engineering circuit mode |
| Target User | Designers, engineers, students, remote teams |
| Key Value | rough.js hand-drawn aesthetic + 20 circuit symbols + full properties panel + real-time multiplayer |
| Status | 🔄 In Progress |
| Repo | `github.com/mahtamun-hoque-fahim/neura` |
| Live URL | `neura-ashy.vercel.app` |

---

## Architecture

**Stack:**
- Framework: Next.js 15 App Router (TypeScript)
- Styling: Tailwind CSS 3
- Drawing: Canvas 2D API + rough.js v4 (hand-drawn aesthetic)
- Local State: Zustand v5
- Collab State: Liveblocks v2 (LiveList storage, presence, undo/redo)
- Fonts: Syne (headings), DM Sans (UI), Caveat (canvas text)
- Deployment: Vercel

**Folder Structure:**
```
/
├── app/
│   ├── globals.css                  # Tailwind base + CSS vars + animations
│   ├── layout.tsx                   # Font loading, metadata
│   ├── page.tsx                     # Landing page (server component)
│   └── whiteboard/
│       └── page.tsx                 # Reads ?room= param, mounts WhiteboardApp
├── components/
│   ├── landing/
│   │   └── Landing.tsx              # Full landing page (client, animations)
│   └── whiteboard/
│       ├── WhiteboardApp.tsx        # RoomProvider + keyboard shortcuts + snack toast
│       ├── Canvas.tsx               # Dual-layer canvas, all drawing/select/drag logic
│       ├── Toolbar.tsx              # Bottom pill — 13 tools + overflow (frame/laser/lasso)
│       ├── TopBar.tsx               # Mode switcher, undo/redo, export, invite, nick
│       ├── PropertiesPanel.tsx      # Left 70vh pill — stroke, fill, style, opacity, layers
│       ├── EngineeringSidebar.tsx   # Right panel (engineering mode) — 20 circuit symbols
│       └── LiveCursors.tsx          # Remote cursor rendering from Liveblocks presence
├── lib/
│   ├── liveblocks.config.ts         # Typed Liveblocks client, StrokeElement, Presence, Storage
│   └── store.ts                     # Zustand — all tool + style + mode state
├── types/
│   └── neura.d.ts                   # Window global augmentation (__neura_clear, __neura_export)
├── PLANNER.md
├── DESIGN_GUIDE.md
└── README.md
```

---

## Component Event Bus

Components communicate via `window.dispatchEvent` custom events (no prop drilling):

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `neura:undo` | Any → Canvas | — | Trigger Liveblocks undo |
| `neura:redo` | Any → Canvas | — | Trigger Liveblocks redo |
| `neura:zoom-reset` | TopBar → Canvas | — | Reset viewport to 1:1 |
| `neura:clear` | TopBar → Canvas | — | Clear all elements |
| `neura:export` | TopBar → Canvas | — | Export canvas as PNG |
| `neura:snack` | Any → WhiteboardApp | `string` | Show toast message |
| `neura:layer` | PropertiesPanel → Canvas | `"toBottom"\|"down"\|"up"\|"toTop"` | Reorder selected element |
| `neura:selection` | Canvas → PropertiesPanel | `StrokeElement \| null` | Sync panel to selected element |
| `neura:patch` | PropertiesPanel → Canvas | `Partial<StrokeElement>` | Live-patch selected element props |

---

## User Flows

### Flow 1 — Solo session
1. Visit `/` → click "Start Drawing" → UUID room generated → `/whiteboard?room=UUID`
2. WhiteboardApp mounts with RoomProvider (private room)
3. Draw with tools, adjust properties in left panel, export PNG

### Flow 2 — Multiplayer session
1. Visit `/` → click "Collaborate" → `/whiteboard?room=UUID&mp=1`
2. TopBar "Invite" button copies full URL
3. Second user opens link → joins same Liveblocks room
4. Live cursors, shared canvas, synced undo/redo

### Flow 3 — Engineering mode
1. Toggle Normal → Engineering in TopBar
2. EngineeringSidebar appears on right (220px)
3. Drag circuit symbols onto canvas → placed as DOM SVG overlays
4. Symbols selectable, movable, deletable, z-orderable

### Flow 4 — Element property editing
1. Draw any shape → tool auto-returns to Select
2. Click element → PropertiesPanel reflects its current properties
3. Change any prop in panel → element updates live in real-time
4. Layer buttons reorder element in z-stack

---

## Liveblocks Storage

> No database. All state is ephemeral Liveblocks LiveList.

```ts
type Storage = {
  elements: LiveList<StrokeElement>; // index = z-order
};
```

**StrokeElement:**
```ts
type StrokeElement = {
  id: string;
  type: "path" | "line" | "arrow" | "rect" | "circle" | "text" | "erase"
      | "diamond" | "circuit" | "frame" | "image" | "embed";
  color: string;
  size: number;           // 1–3
  alpha: number;          // 0–1
  seed: number;           // rough.js consistency seed
  fillColor?: string;
  strokeStyle?: "solid" | "dashed" | "dotted";
  roughness?: number;     // 0 | 1 | 2
  roundEdges?: boolean;
  zIndex?: number;
  // Geometry (type-specific)
  pts?: [number, number][];
  x1?: number; y1?: number; x2?: number; y2?: number;
  x?: number; y?: number; w?: number; h?: number;
  cx?: number; cy?: number; rx?: number; ry?: number;
  lines?: string[]; fontSize?: number; lineHeight?: number;
  symbol?: CircuitSymbol;
  sx?: number; sy?: number; sw?: number; sh?: number;
  label?: string;
  src?: string;
};
```

**Presence:**
```ts
type Presence = {
  cursor: { x: number; y: number } | null;
  tool: string;
  color: string;
  nick: string;
};
```

---

## Env Vars

| Name | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` | ✅ | Liveblocks public API key (browser-safe) | `pk_dev_xxxx` |

---

## Tool Reference

| Tool | Key | Type | Notes |
|---|---|---|---|
| Lock | — | UI | Blocks all canvas interaction |
| Hand | H | Pan | Drag to pan viewport |
| Select | V | Select | Click/drag select, Del to delete |
| Rectangle | R | Shape | rough.js rect |
| Diamond | D | Shape | rough.js polygon |
| Circle | O | Shape | rough.js ellipse |
| Arrow | A | Shape | Line + filled arrowhead |
| Line | L | Shape | rough.js line |
| Pen | P | Freehand | Smooth path |
| Text | T | Text | Click to place, Enter to commit |
| Image | I | Overlay | File picker → base64 DOM overlay |
| Eraser | E | Erase | White-over path |
| Connector | C | Line | Straight non-rough line |
| Frame | F | Artboard | Dashed named region |
| Laser | K | Ephemeral | Fading red trail, not stored |
| Lasso | — | Select | Freehand polygon multi-select |

---

## Circuit Symbols (Engineering Mode)

| Category | Symbols |
|---|---|
| Sources | Voltage Source, Current Source, Ground, VCC |
| Passive | Resistor, Capacitor, Inductor, Switch |
| Semiconductors | Diode, LED, NPN Transistor, PNP Transistor, Op-Amp |
| Logic Gates | AND, OR, NOT, NAND, NOR, XOR |
| Wiring | Junction Node |

---

## Timeline / Phases

### Phase 1 — Core Canvas ✅
Dual-layer canvas, viewport pan/zoom, rough.js rendering, pen/line/arrow/rect/circle/text/eraser, colors, undo/redo, PNG export

### Phase 2 — Multiplayer ✅
Liveblocks RoomProvider, LiveList storage, live cursors, collaborative undo/redo, room URL, invite link

### Phase 3 — Toolbar Redesign + New Tools ✅
Excalidraw-style pill toolbar, keyboard shortcut subscripts, diamond/connector/image/frame/laser/lasso, drag-cancel, laser fade animation, lasso multi-select, auto-switch to select after drawing

### Phase 4 — Mode System + Engineering Sidebar ✅
Normal/Engineering toggle, right-side engineering sidebar, 20 circuit symbols (pure SVG), drag-and-drop to canvas, circuit DOM SVG overlays, sidebar minimize

### Phase 5 — Properties Panel + Style System ✅
Left 70vh pill panel, HSV color picker (custom-built, no native input), 8 stroke presets, 8 fill presets, stroke width/style/roughness/edges, opacity slider, layer controls, selection sync via `neura:selection`, live patch via `neura:patch`

### Phase 6 — Wiring + Polish ⏳
- Wire `neura:selection` emit from Canvas on element select
- Wire `neura:patch` mutation in Canvas to update element live
- Web embed tool (URL prompt → iframe overlay)
- Frame naming prompt on creation
- Connector snapping to shape bounding boxes
- Multi-select drag from lasso
- Mobile pinch-zoom / two-finger pan
- Landing page refresh

---

## Next Steps

1. **Canvas: emit `neura:selection`** — on every `selectedIdRef` change, find element and dispatch `neura:selection` with it (or `null` on deselect)
2. **Canvas: `patchElement` mutation** — listen to `neura:patch`, find selected element, merge patch, push to Liveblocks
3. **Web embed tool** — on canvas click prompt for URL, create `embed` element (iframe DOM overlay)
4. **Frame naming** — after frame is drawn, prompt for name and store in `el.label`
5. **Connector snapping** — detect within 20px of element bbox corner/center, snap x1/y1 or x2/y2
6. **Landing page** — update copy + visuals to show both modes, new tool count, circuit mode screenshot
7. **Mobile gestures** — pinch to zoom, two-finger pan on touch devices
