import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface AuthState {
  user: null | {
    fname: string;
    lname: string;
    email: string;
    region: string | null;
    province: string | null;
    municipality: string | null;
    barangay: string | null;
    region_name: string | null;
    province_name: string | null;
    municipality_name: string | null;
    barangay_name: string | null;
    phoneNumber: string;
    profile: string;
    role: string;
    uid: string | undefined;
    handledChildren: string[] | undefined;
  };
  login: (user: AuthState["user"]) => void;
  updateUser: (updatedData: Partial<NonNullable<AuthState["user"]>>) => void;
  updatePassword: (newPassword: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        login: (user) => set({ user }),
        logout: () => {
          set({ user: null });
          router.replace("/");
        },
        updateUser: (updatedData: Partial<AuthState["user"]>) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedData } : null,
          })),
        updatePassword: (newPassword: string) =>
          set((state) => ({
            user: state.user ? { ...state.user, password: newPassword } : null,
          })),
      }),
      {
        name: "auth-storage", // storage key
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
);
