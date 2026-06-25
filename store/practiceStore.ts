import { create } from "zustand";
import { ParsedLine } from "@/types";

interface PracticeState {
  lines: ParsedLine[];
  subtitleFileId: string;
  totalLines: number;
  currentLineIndex: number;
  isComplete: boolean;

  setLines: (lines: ParsedLine[], subtitleFileId: string) => void;
  skipLine: () => void;
  goToLine: (index: number) => void;
  resetProgress: () => void;
  markComplete: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  lines: [],
  subtitleFileId: "",
  totalLines: 0,
  currentLineIndex: 0,
  isComplete: false,

  setLines: (lines, subtitleFileId) => {
    set({ lines, subtitleFileId, totalLines: lines.length, isComplete: false });
  },

  skipLine: () => {
    const { currentLineIndex, lines } = get();
    const next = currentLineIndex + 1;
    if (next >= lines.length) {
      set({ isComplete: true });
      return;
    }
    set({ currentLineIndex: next });
  },

  goToLine: (index) => {
    const { lines } = get();
    if (index < 0 || index >= lines.length) return;
    set({ currentLineIndex: index, isComplete: false });
  },

  resetProgress: () => {
    set({ currentLineIndex: 0, isComplete: false });
  },

  markComplete: () => {
    set({ isComplete: true });
  },
}));
