import { defineStore } from 'pinia';
import type { User } from '~/types';

const TOKEN_KEY = 'yaring-token';
const REFRESH_KEY = 'yaring-refresh';
const USER_ID_KEY = 'yaring-uid';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
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
        this.refreshToken = localStorage.getItem(REFRESH_KEY);
      }
    },

    setSession(accessToken: string, user: User, refreshToken?: string) {
      this.token = accessToken;
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_ID_KEY, user.id);
        if (refreshToken) {
          this.refreshToken = refreshToken;
          localStorage.setItem(REFRESH_KEY, refreshToken);
        }
      }
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_ID_KEY);
      }
    },

    async tryRefresh(): Promise<boolean> {
      if (!this.refreshToken) return false;
      const userId = import.meta.client ? localStorage.getItem(USER_ID_KEY) : null;
      if (!userId) return false;

      try {
        const config = useRuntimeConfig();
        const res = await fetch(`${config.public.apiUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, refreshToken: this.refreshToken }),
        });
        if (!res.ok) { this.logout(); return false; }

        const data = await res.json() as { accessToken: string; refreshToken: string; user: User };
        this.setSession(data.accessToken, data.user, data.refreshToken);
        return true;
      } catch {
        this.logout();
        return false;
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
