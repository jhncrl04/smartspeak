import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  user: null | {
    fname: string;
    lname: string;
    email: string;
    phoneNumber: string;
  };
  login: (user: AuthState["user"]) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage", // storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
