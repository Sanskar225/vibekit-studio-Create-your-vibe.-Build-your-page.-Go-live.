import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      init: async () => {
        try {
          const res = await authApi.me()
          set({ user: res.data.user, loading: false })
        } catch {
          set({ user: null, loading: false })
        }
      },
      login: async (creds) => {
        const res = await authApi.login(creds)
        set({ user: res.data.user })
        return res.data.user
      },
      signup: async (data) => {
        const res = await authApi.signup(data)
        set({ user: res.data.user })
        return res.data.user
      },
      logout: async () => { await authApi.logout(); set({ user: null }) },
      isAuthenticated: () => !!get().user,
    }),
    { name: 'vk-auth', partialize: (s) => ({ user: s.user }) }
  )
)
