# Neura v2 — Real-time Collaborative Whiteboard

A clean, distraction-free whiteboard built with Next.js 15, Liveblocks, rough.js, and Zustand.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Drawing | Canvas 2D + rough.js (hand-drawn shapes) |
| State | Zustand (local) + Liveblocks (collaborative) |
| Collab | Liveblocks (WebSocket, presence, storage) |
| Fonts | Syne · DM Sans · Caveat (via next/font) |
| Deploy | Vercel |

## Features

- ✏️ **8 tools** — Pen, Highlighter, Line, Arrow, Rectangle, Circle, Text, Eraser
- 👥 **Real-time multiplayer** — live cursors + shared canvas via Liveblocks
- ↩ **Collaborative undo/redo** — storage-level, synced across all participants
- 🎨 **Hand-drawn aesthetic** — shapes rendered with rough.js
- ⌨️ **Keyboard shortcuts** — P H L A R C T E · Ctrl+Z · Ctrl+Y
- ⬇️ **PNG export** — full canvas with 40px padding
- 📎 **Invite link** — share URL to drop anyone into the same room

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in your Liveblocks key
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Environment Variables

```
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_...
```

Get your public key from [liveblocks.io/dashboard](https://liveblocks.io/dashboard).

## How Rooms Work

- Landing page "Start Drawing" button generates a unique room ID and navigates to `/whiteboard?room=XXXX`
- Without `?room=`, a private solo session is created (same Liveblocks infra, private room ID)
- "Invite" button copies the full URL — anyone with the link joins the same Liveblocks room

## Architecture

```
app/
  layout.tsx            ← fonts, global CSS
  page.tsx              ← landing (server component)
  whiteboard/
    page.tsx            ← reads ?room= param, renders WhiteboardApp
components/
  landing/
    Landing.tsx         ← full landing page (client, animations)
  whiteboard/
    WhiteboardApp.tsx   ← RoomProvider + keyboard shortcuts + toast
    Canvas.tsx          ← two-layer canvas (static + preview), rough.js
    Toolbar.tsx         ← tool/color/size picker
    TopBar.tsx          ← undo/redo/clear/export/invite
    LiveCursors.tsx     ← renders remote cursors from Liveblocks presence
lib/
  liveblocks.config.ts  ← typed client, StrokeElement, Presence, Storage
  store.ts              ← Zustand (tool, color, size, nick)
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on Vercel
3. Add `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` in Vercel environment variables
4. Deploy
