import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      set => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        setUser: user =>
          set(
            state => ({
              ...state,
              user,
              isAuthenticated: !!user,
            }),
            false,
            "setUser"
          ),

        setLoading: isLoading =>
          set(state => ({ ...state, isLoading }), false, "setLoading"),

        login: user =>
          set(
            state => ({
              ...state,
              user,
              isAuthenticated: true,
              isLoading: false,
            }),
            false,
            "login"
          ),

        logout: () =>
          set(
            state => ({
              ...state,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            }),
            false,
            "logout"
          ),
      }),
      {
        name: "auth-storage",
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);
