import { create } from "zustand";
import { IUser } from "@/interfaces";

export interface UsersState {
  currentUser: IUser | null;
  loading: boolean;
  setCurrentUser: (user: IUser) => void;
  setLoading: (loading: boolean) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  currentUser: null,
  loading: true,
  setCurrentUser: (user: IUser) => set({ currentUser: user }),
  setLoading: (loading: boolean) => set({ loading }),
}));
