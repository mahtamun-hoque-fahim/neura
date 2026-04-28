import { create } from "zustand";

export type Tool =
  | "lock" | "hand" | "select" | "lasso"
  | "rect" | "diamond" | "circle" | "arrow" | "line"
  | "pen" | "text" | "image" | "eraser" | "connector" | "highlighter"
  | "frame" | "laser";

export type Mode = "normal" | "engineering";
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type EdgeStyle = "sharp" | "round";

export const USER_COLORS = [
  "#e85d4a","#4a90d9","#52b788","#f4a261","#b48fff","#22a86a","#e91e8c","#ff9800",
];

interface CanvasStore {
  tool: Tool;
  color: string;
  fillColor: string;         // "" = transparent
  strokeSize: number;        // 1 | 2 | 3
  strokeStyle: StrokeStyle;
  roughness: number;         // 0 | 1 | 2
  edgeStyle: EdgeStyle;
  opacity: number;           // 0–100
  nick: string;
  userColor: string;
  mode: Mode;
  sidebarOpen: boolean;      // engineering sidebar
  setTool: (t: Tool) => void;
  setColor: (c: string) => void;
  setFillColor: (c: string) => void;
  setStrokeSize: (s: number) => void;
  setStrokeStyle: (s: StrokeStyle) => void;
  setRoughness: (r: number) => void;
  setEdgeStyle: (e: EdgeStyle) => void;
  setOpacity: (o: number) => void;
  setNick: (n: string) => void;
  setMode: (m: Mode) => void;
  setSidebarOpen: (o: boolean) => void;
}

export const useCanvasStore = create<CanvasStore>(() => ({
  tool: "select",
  color: "#1e1e1e",
  fillColor: "",
  strokeSize: 2,
  strokeStyle: "solid",
  roughness: 1,
  edgeStyle: "sharp",
  opacity: 100,
  nick: "",
  userColor: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
  mode: "normal",
  sidebarOpen: true,
  setTool:        (tool)        => useCanvasStore.setState({ tool }),
  setColor:       (color)       => useCanvasStore.setState({ color }),
  setFillColor:   (fillColor)   => useCanvasStore.setState({ fillColor }),
  setStrokeSize:  (strokeSize)  => useCanvasStore.setState({ strokeSize }),
  setStrokeStyle: (strokeStyle) => useCanvasStore.setState({ strokeStyle }),
  setRoughness:   (roughness)   => useCanvasStore.setState({ roughness }),
  setEdgeStyle:   (edgeStyle)   => useCanvasStore.setState({ edgeStyle }),
  setOpacity:     (opacity)     => useCanvasStore.setState({ opacity }),
  setNick:        (nick)        => useCanvasStore.setState({ nick }),
  setMode:        (mode)        => useCanvasStore.setState({ mode }),
  setSidebarOpen: (sidebarOpen) => useCanvasStore.setState({ sidebarOpen }),
}));
