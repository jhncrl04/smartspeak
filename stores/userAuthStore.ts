import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface AuthState {
  user: null | {
    fname: string;
    lname: string;
    email: string;
    phoneNumber: string;
    profile: string;
    role: string;
    uid: string | undefined;
  };
  login: (user: AuthState["user"]) => void;
  updateUser: (updatedData: Partial<NonNullable<AuthState["user"]>>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        login: (user) => set({ user }),
        logout: () => set({ user: null }),
        updateUser: (updatedData: Partial<AuthState["user"]>) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedData } : null,
          })),
      }),
      {
        name: "auth-storage", // storage key
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
);
