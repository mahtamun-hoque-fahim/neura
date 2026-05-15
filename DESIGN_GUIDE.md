# DESIGN_GUIDE.md — Neura

> Design system specification. Updated whenever UI tokens or components change.
> Last updated: 2026-05-15

---

## Color Tokens

### CSS Variables (`globals.css`)

| Variable | Hex | Usage |
|---|---|---|
| `--canvas-bg` | `#f5f0e8` | Canvas background (warm parchment) |
| `--paper` | `#fdfaf4` | Panel/toolbar backgrounds |
| `--toolbar` | `#1a1a2e` | Dark UI elements, tooltips, active states |
| `--green` | `#1a7a4a` | Multiplayer badge, invite button |
| `--green-light` | `#2da06a` | Hover state for green elements |

### Tailwind Tokens (`tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `canvas` | `#f5f0e8` | Canvas background |
| `paper` | `#fdfaf4` | Panel surfaces |
| `toolbar` | `#1a1a2e` | Dark chrome |
| `ink` | `#0d1f16` | Primary text |
| `muted` | `#5a7a68` | Secondary text, badges |
| `green.DEFAULT` | `#1a7a4a` | Primary action |
| `green.light` | `#2da06a` | Hover/active green |
| `green.pale` | `#e8f5ee` | Green tint backgrounds |
| `green.mid` | `#c2e8d2` | Green tint mid |

### Accent

| Usage | Hex |
|---|---|
| Active tool, selected element ring, panel toggles | `#6c63ff` |
| Active tool background | `rgba(108, 99, 255, 0.10)` |
| Active tool border | `rgba(108, 99, 255, 0.30)` |
| Danger / laser tool | `#e85d4a` |

### Stroke Presets (PropertiesPanel)
`#1e1e1e` · `#c92a2a` · `#2f9e44` · `#1864ab` · `#e67700` · `#7048e8` · `#c2255c` · `#2b8a3e`

### Fill Presets (PropertiesPanel)
Transparent · `#fff5f5` · `#ebfbee` · `#e7f5ff` · `#fff9db` · `#f3f0ff` · `#fff0f6` · `#f8f9fa`

---

## Typography

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| UI headings | Syne | 600–700 | 18–32px | Landing headings, logo |
| UI body | DM Sans | 400–500 | 11–14px | Panel labels, buttons, tooltips |
| Canvas text | Caveat | 400 | 20–80px (user-set) | Text tool elements on canvas |
| Monospace | system mono | 400 | 10–11px | Hex color values, keyboard shortcut subscripts |

**Font loading:** `next/font/google` in `app/layout.tsx`. CSS vars: `--font-syne`, `--font-dm-sans`, `--font-caveat`.

---

## Spacing

| Scale | Value | Usage |
|---|---|---|
| xs | 4px | Inner icon padding |
| sm | 8px | Gap between toolbar buttons |
| md | 12px | Panel section padding |
| lg | 16px | Panel horizontal padding |
| xl | 24px | Bottom toolbar offset from edge |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Color swatches, small buttons |
| `rounded-xl` | 12px | Tool buttons, toggle buttons |
| `rounded-2xl` | 16px | Toolbar pill, overflow popup |
| `20px` (inline) | 20px | PropertiesPanel pill container |

---

## Shadows

| Usage | Value |
|---|---|
| Bottom toolbar pill | `0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)` |
| Overflow popup | `0 8px 32px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)` |
| PropertiesPanel pill | `0 4px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)` |
| Color picker popup | `0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)` |
| Left panel base | `2px 0 12px rgba(0,0,0,0.05)` |
| Engineering sidebar | `-2px 0 16px rgba(0,0,0,0.06)` |

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│                      TopBar (52px)                        │
├─────────────┬────────────────────────────┬───────────────┤
│ Properties  │         Canvas             │  Engineering  │
│ Panel       │   (left: 216px offset)     │  Sidebar      │
│ 216px       │                            │  220px        │
│ 70vh pill   │   (right: 220px offset     │  (engineering │
│ centered    │    in engineering mode)    │  mode only)   │
│             │                            │               │
│             │   Bottom Toolbar           │               │
│             │   (centered, above fold)   │               │
└─────────────┴────────────────────────────┴───────────────┘
```

**Z-index stack:**
| Layer | z-index |
|---|---|
| Canvas static | auto |
| Canvas lasso/laser overlay | auto |
| Canvas preview | auto |
| Circuit/image DOM overlays | auto (pointer-events-none) |
| PropertiesPanel | 89 |
| EngineeringSidebar | 90 |
| TopBar | 99 |
| Bottom Toolbar | 50 |
| Color picker popup | 300 |
| Snack toast | 300 |
| Tooltips | 50 |

---

## Component Patterns

### Tool Button (Toolbar)
- Size: `36×36px` (`w-9 h-9`)
- Resting: `text-[#777]`, `bg-transparent`
- Hover: `bg-black/05`, `text-[#1a1a2e]`
- Active: `bg-[#6c63ff]/12`, `text-[#6c63ff]`
- Keyboard subscript: `8px` monospace, `bottom-[3px] right-[4px]`, `opacity-35`
- Tooltip: dark pill `bg-[#1a1a2e]`, appears above on hover

### Toggle Button (PropertiesPanel)
- Height: `36px`, flex-1 within row
- Resting: `border: 1.5px solid rgba(0,0,0,0.08)`, transparent bg
- Active: `bg-[#6c63ff]/10`, `border: 1.5px solid rgba(108,99,255,0.35)`

### Color Swatch
- Size: `24×24px` (`w-6 h-6`)
- Resting: `box-shadow: 0 0 0 1px rgba(0,0,0,0.1)`
- Active: `box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px #6c63ff`, `scale(1.18)`
- Hover: `scale(1.10)` transition

### Section Label (PropertiesPanel)
- Font: `9.5px`, bold, uppercase, `tracking-widest`, `color: #bbb`
- Margin below: `10px`

### Separator
- `mx-4 border-t border-black/05`

### TopBar Buttons
- Height: `30px`, `px-3`, `rounded-[9px]`
- Default: `bg-[rgba(253,250,244,.88)]`, `border: 1px solid rgba(26,26,46,.15)`
- Hover: `bg-[#1a1a2e]`, `text-[#fdfaf4]`
- Backdrop blur: `backdrop-blur-lg`
- Green variant (Invite): `bg-[#0d5c3a]`, `border-[#0d5c3a]`

### Mode Toggle (TopBar)
- Container: `h-[30px]` pill with `p-0.5`
- Active pill: `bg-[#1a1a2e]`, `text-[#fdfaf4]`, `rounded-[6px]`
- Inactive: transparent, `text-[#5a7a68]`

---

## Canvas Visual Design

| Element | Value |
|---|---|
| Background | `#f5f0e8` (warm parchment) |
| Grid lines | `rgba(26,26,46,0.04)`, 36px spacing |
| Selection ring | `#6c63ff`, `2px` dashed, `6/3` dash pattern |
| Laser trail | `rgba(232,60,60,α)`, fades over 800ms |
| Lasso fill | `rgba(108,99,255,0.06)` |
| Lasso stroke | `#6c63ff`, `1.5px` dashed |
| Frame border | Color @ `0.6α`, dashed, label at top-left |
| Remote cursors | User color, label pill below tip |

---

## Color Picker (Custom HSV)

- **SV gradient box:** 160px tall, `linear-gradient(white → hueColor)` + `transparent → black` overlay
- **Hue slider:** 12px tall pill, full rainbow gradient
- **Cursors:** 16px circle, white border, shadow, draggable
- **Hex input:** 28px height, monospace 11px, focus border `#6c63ff`
- **Preset row:** 20px swatches, 8 colors, `rounded-md`
- **Popup:** `left-[calc(100%+8px)] top-0`, `224px wide`, `border-radius: 16px`

---

## Animations

| Name | Keyframes | Usage |
|---|---|---|
| `fadeUp` | `opacity 0→1, translateY 24→0` | Landing page sections |
| `drift` | `translate + scale` over 12s | Landing blob backgrounds |
| `pulse-dot` | opacity + scale | Live indicator dot |
| `blink` | opacity 1→0.4 | Multiplayer presence dot |
| `snackIn` | `opacity + translateY` 0.2s | Toast notification entry |
| `toolPop` | `scale 0.85→1.08→1` 0.18s | Tool selection feedback |

---

## Fonts Setup

```ts
// app/layout.tsx
import { Syne, DM_Sans, Caveat } from "next/font/google";

const syne   = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400","500","600","700"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
```
