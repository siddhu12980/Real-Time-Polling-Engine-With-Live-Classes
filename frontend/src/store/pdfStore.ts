import { create } from 'zustand';

interface PDFStore {
  currentPage: number;
  numPages: number;
  scale: number;
  setCurrentPage: (page: number) => void;
  setNumPages: (pages: number) => void;
  setScale: (scale: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const usePDFStore = create<PDFStore>((set) => ({
  currentPage: 1,
  numPages: 1,
  scale: 1.0,
  setCurrentPage: (page) => set({ currentPage: page }),
  setNumPages: (pages) => set({ numPages: pages }),
  setScale: (scale) => set({ scale }),
  nextPage: () =>
    set((state) => ({
      currentPage: Math.min(state.currentPage + 1, state.numPages),
    })),
  prevPage: () =>
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 1),
    })),
  zoomIn: () =>
    set((state) => ({
      scale: Math.min(state.scale + 0.1, 2.0),
    })),
  zoomOut: () =>
    set((state) => ({
      scale: Math.max(state.scale - 0.1, 0.5),
    })),
}));