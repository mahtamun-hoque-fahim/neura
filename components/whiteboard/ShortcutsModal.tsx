"use client";

import { useEffect, useState } from "react";

const SHORTCUTS = [
  { group: "Tools",
    items: [
      { key: "V",        label: "Select"       },
      { key: "H",        label: "Hand / Pan"   },
      { key: "P",        label: "Pen"          },
      { key: "R",        label: "Rectangle"    },
      { key: "D",        label: "Diamond"      },
      { key: "O",        label: "Circle"       },
      { key: "A",        label: "Arrow"        },
      { key: "L",        label: "Line"         },
      { key: "T",        label: "Text"         },
      { key: "E",        label: "Eraser"       },
      { key: "F",        label: "Frame"        },
      { key: "K",        label: "Laser pointer"},
    ],
  },
  { group: "Canvas",
    items: [
      { key: "Ctrl + Z",       label: "Undo"         },
      { key: "Ctrl + Y",       label: "Redo"         },
      { key: "Ctrl + A",       label: "Select all"   },
      { key: "Delete",         label: "Delete"       },
      { key: "Escape",         label: "Deselect"     },
      { key: "Scroll",         label: "Zoom"         },
      { key: "Space + Drag",   label: "Pan"          },
      { key: "Ctrl + Shift + E", label: "Export PNG" },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{
        background: "rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.13)",
        color: "#444",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {children}
    </kbd>
  );
}

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "?" || (e.ctrlKey && e.key === "/")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="fixed bottom-5 right-5 z-[200] w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all hover:scale-110"
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          color: "#666",
        }}
      >
        ?
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[299] bg-black/20 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div
        className="fixed z-[300] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
        style={{
          width: 520,
          maxHeight: "80vh",
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <span className="font-semibold text-[15px] text-[#1a1a2e]">Keyboard Shortcuts</span>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#999] hover:bg-black/06 hover:text-[#1a1a2e] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80vh - 64px)" }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            {SHORTCUTS.map((group) => (
              <div key={group.group}>
                <p className="text-[10px] font-semibold text-[#bbb] uppercase tracking-widest mb-3">
                  {group.group}
                </p>
                <div className="flex flex-col gap-1.5 mb-6">
                  {group.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <span className="text-[13px] text-[#444]">{item.label}</span>
                      <Kbd>{item.key}</Kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-[#ccc] mt-2">
            Press <Kbd>?</Kbd> to toggle this panel
          </p>
        </div>
      </div>
    </>
  );
}
