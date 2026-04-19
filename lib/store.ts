import { create } from "zustand";

export type Tool =
  | "pen"
  | "highlighter"
  | "line"
  | "arrow"
  | "rect"
  | "circle"
  | "text"
  | "eraser"
  | "select";

export const TOOL_COLORS = [
  "#1a1a2e",
  "#e85d4a",
  "#4a90d9",
  "#52b788",
  "#f4a261",
  "#b48fff",
];

export const USER_COLORS = [
  "#e85d4a",
  "#4a90d9",
  "#52b788",
  "#f4a261",
  "#b48fff",
  "#22a86a",
  "#e91e8c",
  "#ff9800",
];

interface CanvasStore {
  tool: Tool;
  color: string;
  strokeSize: number;
  nick: string;
  userColor: string;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeSize: (size: number) => void;
  setNick: (nick: string) => void;
}

export const useCanvasStore = create<CanvasStore>(() => ({
  tool: "pen",
  color: "#1a1a2e",
  strokeSize: 3,
  nick: "",
  userColor: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
  setTool: (tool) => useCanvasStore.setState({ tool }),
  setColor: (color) => useCanvasStore.setState({ color }),
  setStrokeSize: (strokeSize) => useCanvasStore.setState({ strokeSize }),
  setNick: (nick) => useCanvasStore.setState({ nick }),
}));
