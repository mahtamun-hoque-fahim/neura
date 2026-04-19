// Global window augmentation for the Neura canvas bridge
export {};

declare global {
  interface Window {
    __neura_clear?: () => void;
    __neura_export?: () => void;
  }
}
