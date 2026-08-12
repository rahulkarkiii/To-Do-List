import axios from "axios";

export const API_BASE_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? "http://127.0.0.1:8000/api/";

const ACCESS_KEY = "todo_access_token";
const REFRESH_KEY = "todo_refresh_token";
const USER_KEY = "todo_user";

export type TaskStatus = "pending" | "in_progress" | "complete";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  user?: number;
  created_at?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  id?: number;
  username: string;
  email?: string;
  [key: string]: unknown;
}

/* ---------------- token storage ---------------- */

const storage = {
  get(key: string) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  set(key: string, value: string, persist: boolean) {
    if (typeof window === "undefined") return;
    (persist ? window.localStorage : window.sessionStorage).setItem(key, value);
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const tokenStore = {
  access: () => storage.get(ACCESS_KEY),
  refresh: () => storage.get(REFRESH_KEY),
  user(): AuthUser | null {
    const raw = storage.get(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  save(access: string, refresh: string | null, user: AuthUser | null, persist = true) {
    storage.set(ACCESS_KEY, access, persist);
    if (refresh) storage.set(REFRESH_KEY, refresh, persist);
    if (user) storage.set(USER_KEY, JSON.stringify(user), persist);
  },
  saveUser(user: AuthUser) {
    const persist = typeof window !== "undefined" && !!window.localStorage.getItem(ACCESS_KEY);
    storage.set(USER_KEY, JSON.stringify(user), persist);
  },
  clear() {
    [ACCESS_KEY, REFRESH_KEY, USER_KEY].forEach(storage.remove);
  },
};

/* ---------------- axios instance ---------------- */

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.access();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.request.use((config) => {
  const token = tokenStore.access();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isAuthCall = url.includes("auth/login") || url.includes("auth/register");
    if (status === 401 && !isAuthCall) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/* ---------------- error helper ---------------- */

export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again.") {
  const err = error as {
    response?: { status?: number; data?: unknown };
    code?: string;
    message?: string;
  };

  if (!err?.response) {
    return "Cannot reach the server. Make sure the API is running.";
  }

  const status = err.response.status;
  const data = err.response.data;

  if (typeof data === "string" && data.length < 200 && !data.includes("<")) return data;

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const preferred = obj['detail'] ?? obj['message'] ?? obj['error'] ?? obj['non_field_errors'];
    const first = Array.isArray(preferred) ? preferred[0] : preferred;
    if (typeof first === "string") return first;

    for (const [field, value] of Object.entries(obj)) {
      const msg = Array.isArray(value) ? value[0] : value;
      if (typeof msg === "string") return `${field}: ${msg}`;
    }
  }

  if (status === 401) return "Invalid credentials.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found.";
  if (status && status >= 500) return "Server error. Please try again later.";
  return fallback;
}

/* ---------------- auth services ---------------- */

function extractTokens(data: Record<string, unknown>) {
  const tokens = (data['tokens'] ?? data['token'] ?? data) as Record<string, unknown>;
  const access =
    (tokens?.['access'] as string) ??
    (data['access'] as string) ??
    (data['access_token'] as string) ??
    (typeof data['token'] === "string" ? (data['token'] as string) : undefined) ??
    (data['key'] as string);
  const refresh =
    (tokens?.['refresh'] as string) ?? (data['refresh'] as string) ?? (data['refresh_token'] as string) ?? null;
  return { access: access ?? null, refresh };
}

export async function loginUser(payload: {
  username: string;
  password: string;
}) {
  try {
    const response = await api.post("auth/login/", payload);

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN RESPONSE:", response.data);

    const data = response.data;

    const { access, refresh } = extractTokens(data ?? {});

    console.log("ACCESS TOKEN EXISTS:", !!access);
    console.log("REFRESH TOKEN EXISTS:", !!refresh);

    const user = (data?.user ?? {
      username: payload.username,
    }) as AuthUser;

    return {
      access,
      refresh,
      user,
      raw: data,
    };
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    throw error;
  }
}

export async function registerUser(payload: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) {
  const { data } = await api.post("auth/register/", payload);
  return data;
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await api.get("auth/profile/");
  return (data?.user ?? data) as AuthUser;
}

/* ---------------- task services ---------------- */

function toList(data: unknown): Task[] {
  if (Array.isArray(data)) return data as Task[];
  const obj = data as { results?: Task[]; tasks?: Task[] } | null;
  return obj?.results ?? obj?.tasks ?? [];
}

export async function getTasks(): Promise<Task[]> {
  const { data } = await api.get("tasks/");
  return toList(data);
}

export async function getTask(id: number | string): Promise<Task> {
  const { data } = await api.get(`tasks/${id}/`);
  return data as Task;
}

export async function createTask(payload: { title: string; status: TaskStatus }) {
  const { data } = await api.post("tasks/", payload);
  return data as Task;
}

export async function updateTask(id: number | string, payload: { title: string; status: TaskStatus }) {
  const { data } = await api.put(`tasks/${id}/`, payload);
  return data as Task;
}

export async function deleteTask(id: number | string) {
  await api.delete(`tasks/${id}/`);
}

export default api;
