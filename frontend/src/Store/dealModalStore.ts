import { create } from "zustand";

interface DealEditStore {
  id: string | null;
  isOpen: boolean;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useDealEditStore = create<DealEditStore>((set) => ({
  id: null,
  isOpen: false,
  openModal: (id) => set({ id, isOpen: true }),
  closeModal: () => set({ id: null, isOpen: false }),
}));
