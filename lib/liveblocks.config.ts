import { createClient, LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

export type CircuitSymbol =
  | "resistor"
  | "capacitor"
  | "inductor"
  | "voltage_source"
  | "current_source"
  | "ground"
  | "vcc"
  | "diode"
  | "led"
  | "transistor_npn"
  | "transistor_pnp"
  | "op_amp"
  | "and_gate"
  | "or_gate"
  | "not_gate"
  | "nand_gate"
  | "nor_gate"
  | "xor_gate"
  | "switch"
  | "wire_node";

export type StrokeElement = {
  id: string;
  type: "path" | "line" | "arrow" | "rect" | "circle" | "text" | "erase" | "diamond" | "circuit";
  color: string;
  size: number;
  alpha: number;
  seed: number;
  // path / erase
  pts?: Array<[number, number]>;
  // line / arrow / connector
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // rect / diamond
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  // circle
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  // text
  lines?: string[];
  fontSize?: number;
  lineHeight?: number;
  // circuit symbol
  symbol?: CircuitSymbol;
  // symbol position/size (world coords)
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
};

export type Presence = {
  cursor: { x: number; y: number } | null;
  tool: string;
  color: string;
  nick: string;
};

type Storage = {
  elements: LiveList<StrokeElement>;
};

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 16,
});

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useMutation,
  useStorage,
  useHistory,
  useCanUndo,
  useCanRedo,
} = createRoomContext<Presence, Storage>(client);

export { LiveList };
