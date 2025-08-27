import { create } from "zustand";

interface CompaniesModalState {
  editData: any;
  isOpens: boolean;
  openModal: (data: any) => void;
  closeModal: () => void;
}

export const useCompaniesModalStore = create<CompaniesModalState>((set) => ({
  editData: null,
  isOpens: false,
  openModal: (data) => set({ isOpens: true, editData: data }),
  closeModal: () => set({ isOpens: false, editData: null }),
}));