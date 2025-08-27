import { create } from "zustand";

interface ContactModalState {
  editData: any;
  isOpens: boolean;
  openModal: (data: any) => void;
  closeModal: () => void;
}

export const useContactModalStore = create<ContactModalState>((set) => ({
  editData: null,
  isOpens: false,
  openModal: (data) => set({ isOpens: true, editData: data }),
  closeModal: () => set({ isOpens: false, editData: null }),
}));