import { create } from "zustand";

interface TaskModalState {
  editData: any;
  isOpens: boolean;
  openModal: (data: any) => void;
  closeModal: () => void;
}

export const useTaskModalStore = create<TaskModalState>((set) => ({
  editData: null,
  isOpens: false,
  openModal: (data) => set({ isOpens: true, editData: data }),
  closeModal: () => set({ isOpens: false, editData: null }),
}));
