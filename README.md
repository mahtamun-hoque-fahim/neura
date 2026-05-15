# Neura

Real-time collaborative whiteboard with hand-drawn aesthetic and engineering circuit mode.

## Stack

- **Framework:** Next.js 15 App Router (TypeScript)
- **Drawing:** Canvas 2D + rough.js v4
- **State:** Zustand v5 (local) + Liveblocks v2 (collab)
- **Styling:** Tailwind CSS 3
- **Fonts:** Syne · DM Sans · Caveat
- **Deploy:** Vercel

## Prerequisites

- Node.js 18+
- Liveblocks account → [liveblocks.io](https://liveblocks.io)

## Setup

```bash
git clone https://github.com/mahtamun-hoque-fahim/neura.git
cd neura
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Env Vars

```
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_...
```

See `PLANNER.md → Env Vars` for full details.

## Commands

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Folder Structure

```
app/                  # Next.js App Router pages + globals
components/
  landing/            # Landing page
  whiteboard/         # Canvas, Toolbar, TopBar, PropertiesPanel, EngineeringSidebar, LiveCursors
lib/                  # Liveblocks config, Zustand store
types/                # Window global augmentation
```

## Deploy (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` in Environment Variables
4. Deploy

See `PLANNER.md` for full architecture, feature phases, and next steps.  
See `DESIGN_GUIDE.md` for design tokens, component patterns, and layout spec.
