import { create } from 'zustand';

interface PDFStore {
  currentPage: number;
  numPages: number;
  scale: number;
  setCurrentPage: (page: number) => void;
  setNumPages: (pages: number) => void;
  setScale: (scale: number) => void;
  setCustomScale: () => void;
  nextPage: () => void;
  prevPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}


const calculateScale = () => {
  const screenWidth = window.innerWidth;
  console.log("Screen Width", screenWidth)
  if (screenWidth < 1000) {
    return 1.0; // Small screen (mobile)
  } else if (screenWidth >= 1000 && screenWidth < 1600) {
    return 1.0

  } else if (screenWidth >= 1600 && screenWidth < 2000) {
    return 1.32; // Medium screen (tablet)
  } else {
    return 1.5; // Large screen (desktop)
  }


};



export const usePDFStore = create<PDFStore>((set) => ({
  currentPage: 1,
  numPages: 1,
  scale: calculateScale(),

  setCustomScale: () => set({ scale: calculateScale() }),

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