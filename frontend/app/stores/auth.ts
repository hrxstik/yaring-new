import { defineStore } from 'pinia';
import type { User } from '~/types';

const TOKEN_KEY = 'yaring-token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.user),
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    hydrate() {
      if (import.meta.client) {
        this.token = localStorage.getItem(TOKEN_KEY);
      }
    },

    setSession(token: string, user: User) {
      this.token = token;
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem(TOKEN_KEY);
      }
    },

    async fetchMe() {
      if (!this.token) return;
      const { request } = useApi();
      try {
        this.user = await request<User>('/auth/me');
      } catch {
        this.logout();
      }
    },
  },
});
