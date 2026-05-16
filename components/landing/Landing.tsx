"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { nanoid } from "nanoid";

// ── Feature icons (SVG) ───────────────────────────────────────────────────────
function IconZap() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13,2 7,11 10,11 7,18 13,9 10,9" />
    </svg>
  );
}
function IconBrush() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3L7 12" /><path d="M5 14c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
      <path d="M16 3c.6.6.6 1.4 0 2L7 14" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="3" /><path d="M1 18c0-3.3 2.7-6 6-6" />
      <circle cx="14" cy="7" r="3" /><path d="M19 18c0-3.3-2.7-6-6-6" />
    </svg>
  );
}
function IconPen() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3l3 3-9 9H5v-3l9-9z" />
    </svg>
  );
}
function IconUndo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h9a5 5 0 0 1 0 10H7" /><polyline points="3,4 3,8 7,8" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3v10" /><polyline points="6,9 10,13 14,9" /><path d="M3 17h14" />
    </svg>
  );
}

// ── Tool icons for the toolbar preview ───────────────────────────────────────
const TOOL_ICONS = [
  <svg key="pen" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3L11 2z" /></svg>,
  <svg key="line" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="2.5" y1="13.5" x2="13.5" y2="2.5" /></svg>,
  <svg key="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13L13 3M13 3H7M13 3v6" /></svg>,
  <svg key="rect" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="12" height="9" rx="1" /></svg>,
  <svg key="circle" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="8" r="5.5" /></svg>,
  <svg key="diamond" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2L14 8L8 14L2 8L8 2z" /></svg>,
  <svg key="text" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M8 4v9M6 13h4" /></svg>,
  <svg key="eraser" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 5L7 11M11 3L5 9l2 2 6-6-2-2zM3 13h5" /></svg>,
];

export default function Landing() {
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(
              () => (e.target as HTMLElement).classList.add("opacity-100", "translate-y-0"),
              i * 80
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const roomHero = useMemo(() => nanoid(9), []);
  const roomNav  = useMemo(() => nanoid(9), []);
  const roomCta  = useMemo(() => nanoid(9), []);

  const TOOLS = [
    { label: "Pen",         key: "P" },
    { label: "Line",        key: "L" },
    { label: "Arrow",       key: "A" },
    { label: "Rectangle",   key: "R" },
    { label: "Circle",      key: "O" },
    { label: "Diamond",     key: "D" },
    { label: "Text",        key: "T" },
    { label: "Eraser",      key: "E" },
    { label: "Select",      key: "V" },
    { label: "Hand",        key: "H" },
    { label: "Undo",        key: "Ctrl Z" },
    { label: "Redo",        key: "Ctrl Y" },
  ];

  const FEATURES = [
    { Icon: IconZap,      title: "Instant, no signup",        desc: "Open your browser and start drawing immediately. No accounts, no loading screens, no friction."    },
    { Icon: IconBrush,    title: "8 powerful tools",          desc: "Pen, line, arrow, rectangle, circle, diamond, text, eraser — everything in one clean interface."   },
    { Icon: IconUsers,    title: "Real-time collaboration",   desc: "Invite anyone with a link. See each other's cursors and strokes live — powered by Liveblocks."     },
    { Icon: IconPen,      title: "Hand-drawn aesthetic",      desc: "Shapes rendered with rough.js for that natural, sketchy whiteboard feel."                          },
    { Icon: IconUndo,     title: "Collaborative undo",        desc: "60-step undo/redo history, synced across all collaborators in the room."                           },
    { Icon: IconDownload, title: "Export as PNG",             desc: "Save your canvas as a crisp PNG with clean padding — ready to share anywhere."                     },
  ];

  return (
    <div className="bg-white text-[#0d1f16] overflow-x-hidden font-dm">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-[68px] bg-white/90 backdrop-blur-md border-b border-[#1a7a4a]/10 max-sm:px-5">
        <a href="#" className="font-syne font-extrabold text-[22px] text-[#1a7a4a] tracking-tight no-underline flex items-center gap-1">
          neura
          <span className="w-2 h-2 rounded-full bg-[#1a7a4a] inline-block -translate-y-0.5" />
        </a>
        <div className="flex items-center gap-3">
          <a href="#features" className="text-sm font-medium text-[#5a7a68] hover:text-[#1a7a4a] transition-colors">
            Features
          </a>
          <Link
            href={`/whiteboard?room=${roomNav}`}
            className="text-sm font-medium text-white bg-[#1a7a4a] rounded-full px-5 py-2.5 hover:bg-[#2da06a] hover:-translate-y-px transition-all shadow-[0_2px_12px_rgba(26,122,74,.25)]"
          >
            Open Board
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[120px] pb-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(26,122,74,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,74,.04) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)",
          }}
        />
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none animate-drift"
          style={{ background: "radial-gradient(circle,rgba(45,160,106,.12) 0%,transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none animate-drift-2"
          style={{ background: "radial-gradient(circle,rgba(26,122,74,.1) 0%,transparent 70%)", filter: "blur(70px)" }} />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-1.5 bg-[#e8f5ee] border border-[#c2e8d2] rounded-full px-4 py-1.5 text-xs font-medium text-[#1a7a4a] mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a7a4a] animate-pulse-dot" />
          Free &amp; Open — No account needed
        </div>

        <h1 className="relative z-10 font-syne font-extrabold text-[clamp(52px,8vw,96px)] leading-[0.95] tracking-[-3px] text-[#0d1f16] animate-fade-up-1">
          Think<br />
          <em className="font-['Instrument_Serif',serif] italic text-[#1a7a4a] font-normal not-italic" style={{ fontStyle: "italic" }}>
            freely.
          </em>
        </h1>

        <p className="relative z-10 mt-7 text-lg font-light text-[#5a7a68] max-w-[460px] leading-relaxed animate-fade-up-2">
          A clean, distraction-free whiteboard for your ideas. Draw, sketch,
          annotate — right in your browser with your team.
        </p>

        <div className="relative z-10 flex gap-3.5 items-center mt-11 animate-fade-up-3 max-sm:flex-col max-sm:w-full">
          <Link
            href={`/whiteboard?room=${roomHero}`}
            className="flex items-center gap-2.5 text-[15px] font-medium text-white bg-[#1a7a4a] rounded-full px-9 py-4 hover:bg-[#2da06a] hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(26,122,74,.3)] max-sm:w-full max-sm:justify-center"
          >
            Start Drawing
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="#features"
            className="text-[15px] font-medium text-[#1a7a4a] bg-transparent border-[1.5px] border-[#c2e8d2] rounded-full px-7 py-4 hover:bg-[#e8f5ee] hover:border-[#1a7a4a] transition-all max-sm:w-full max-sm:text-center"
          >
            See features
          </a>
        </div>

        {/* Preview mockup */}
        <div className="relative z-10 mt-[72px] w-[min(820px,90vw)] animate-fade-up-4">
          <div className="bg-[#f7faf8] border border-[#1a7a4a]/12 rounded-[18px] overflow-hidden shadow-[0_2px_4px_rgba(26,122,74,.04),0_12px_40px_rgba(26,122,74,.1),0_40px_80px_rgba(0,0,0,.06)]">
            {/* Browser chrome */}
            <div className="h-[42px] bg-white border-b border-[#1a7a4a]/8 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <div className="mx-auto bg-[#1a7a4a]/5 rounded-md px-5 py-1 text-[11px] text-[#5a7a68]">
                neura-whiteboard.vercel.app
              </div>
            </div>
            {/* Canvas area */}
            <div
              className="h-[340px] relative overflow-hidden bg-[#f5f0e8]"
              style={{
                backgroundImage: "linear-gradient(rgba(26,122,74,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,74,.025) 1px,transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            >
              <svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                <path d="M80 200 Q120 120 180 160 Q240 200 280 140" stroke="#1a7a4a" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7" />
                <path d="M80 200 Q100 230 130 220 Q160 210 180 230" stroke="#1a7a4a" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".5" />
                <line x1="340" y1="160" x2="440" y2="110" stroke="#e85d4a" strokeWidth="2" strokeLinecap="round" opacity=".8" />
                <polygon points="440,110 428,118 432,104" fill="#e85d4a" opacity=".8" />
                <rect x="460" y="80" width="140" height="85" rx="8" stroke="#4a90d9" strokeWidth="2" fill="rgba(74,144,217,.06)" opacity=".9" />
                <text x="480" y="126" fontFamily="Caveat,cursive" fontSize="18" fill="#4a90d9" opacity=".85">Ideas here</text>
                <ellipse cx="680" cy="175" rx="65" ry="55" stroke="#52b788" strokeWidth="2" fill="rgba(82,183,136,.06)" opacity=".8" />
                <path d="M150 260 Q200 240 240 265 Q280 290 320 268 Q360 248 400 270" stroke="#f4a261" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7" />
              </svg>
            </div>
            {/* Toolbar preview */}
            <div className="h-[58px] bg-white border-t border-[#1a7a4a]/8 flex items-center justify-center gap-1.5">
              {TOOL_ICONS.map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                  style={{
                    background: i === 0 ? "#1a7a4a" : "rgba(26,122,74,0.07)",
                    color: i === 0 ? "#fff" : "#1a7a4a",
                  }}
                >
                  {Icon}
                </div>
              ))}
              <div className="w-px h-6 bg-[#1a7a4a]/12 mx-1" />
              {["#1a7a4a", "#e85d4a", "#4a90d9", "#52b788", "#f4a261"].map((c, i) => (
                <div
                  key={i}
                  className="w-[18px] h-[18px] rounded-full"
                  style={{
                    background: c,
                    border: i === 0 ? "2.5px solid #fff" : undefined,
                    boxShadow: i === 0 ? "0 0 0 1.5px #1a7a4a" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-[120px] px-6 bg-[#f7faf8] border-t border-[#1a7a4a]/7">
        <div className="max-w-[1100px] mx-auto">
          <div ref={addReveal} className="opacity-0 translate-y-8 transition-all duration-700">
            <div className="text-[11.5px] font-medium tracking-[2.5px] uppercase text-[#1a7a4a] mb-4">Why Neura</div>
            <h2 className="font-syne font-extrabold text-[clamp(32px,4vw,52px)] tracking-[-1.5px] text-[#0d1f16] leading-[1.05] max-w-[520px]">
              Everything you need to{" "}
              <em className="font-['Instrument_Serif',serif] italic font-normal text-[#1a7a4a]">think</em> visually
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 mt-14">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                ref={addReveal}
                className="opacity-0 translate-y-8 transition-all duration-700 bg-white border border-[#1a7a4a]/10 rounded-[18px] p-8 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(26,122,74,.1)] hover:border-[#1a7a4a]/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a7a4a] to-[#2da06a] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 bg-[#e8f5ee] rounded-xl flex items-center justify-center mb-5">
                  <f.Icon />
                </div>
                <div className="font-syne font-bold text-[17px] text-[#0d1f16] mb-2.5 tracking-tight">{f.title}</div>
                <div className="text-sm text-[#5a7a68] leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="py-[120px] px-6 max-w-[1100px] mx-auto text-center">
        <div ref={addReveal} className="opacity-0 translate-y-8 transition-all duration-700">
          <div className="text-[11.5px] font-medium tracking-[2.5px] uppercase text-[#1a7a4a] mb-4">Tools</div>
          <h2 className="font-syne font-extrabold text-[clamp(32px,4vw,52px)] tracking-[-1.5px] text-[#0d1f16] leading-[1.05] mx-auto max-w-[500px]">
            Every tool has a{" "}
            <em className="font-['Instrument_Serif',serif] italic font-normal text-[#1a7a4a]">shortcut</em>
          </h2>
        </div>
        <div ref={addReveal} className="opacity-0 translate-y-8 transition-all duration-700 flex flex-wrap justify-center gap-3 mt-12">
          {TOOLS.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2.5 px-5 py-3 bg-white border-[1.5px] border-[#1a7a4a]/12 rounded-full text-sm font-medium text-[#0d1f16] hover:bg-[#e8f5ee] hover:border-[#1a7a4a] hover:text-[#1a7a4a] transition-all cursor-default"
            >
              {t.label}
              <kbd className="text-[10px] bg-[#1a7a4a]/8 text-[#1a7a4a] rounded px-1.5 py-0.5 font-semibold font-dm">
                {t.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="px-6 pb-20 max-w-[1148px] mx-auto">
        <div
          ref={addReveal}
          className="opacity-0 translate-y-8 transition-all duration-700 bg-[#1a7a4a] rounded-3xl p-20 text-center relative overflow-hidden max-sm:p-14"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <h2 className="relative z-10 font-syne font-extrabold text-[clamp(32px,5vw,58px)] tracking-[-2px] leading-[1] text-white">
            Your canvas<br />
            is <em className="font-['Instrument_Serif',serif] italic font-normal opacity-80">waiting.</em>
          </h2>
          <p className="relative z-10 mt-4 text-base text-white/70 font-light">
            No install. No account. Just open and draw.
          </p>
          <Link
            href={`/whiteboard?room=${roomCta}`}
            className="relative z-10 inline-flex items-center gap-2.5 mt-10 text-[15px] font-medium text-[#1a7a4a] bg-white rounded-full px-9 py-4 hover:-translate-y-0.5 transition-all shadow-[0_4px_24px_rgba(0,0,0,.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,.2)]"
          >
            Open Whiteboard
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-10 px-6 text-sm text-[#5a7a68] border-t border-[#1a7a4a]/8">
        Built with care &middot;{" "}
        <strong className="text-[#1a7a4a] font-medium">Neura</strong> &middot;{" "}
        Open source whiteboard
      </footer>
    </div>
  );
}
