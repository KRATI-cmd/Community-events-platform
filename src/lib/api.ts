// Tiny client for our own JSON API. Every page goes through this.
const TOKEN_KEY = "ceb_token";
const EMAIL_KEY = "ceb_email";

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  email: () => {
    try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
  },
  set: (token: string, email: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  },
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown; cookieAuth?: boolean } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  // Admin pages authenticate with their httpOnly cookie, so they skip the visitor Bearer token
  const token = init.cookieAuth ? null : tokenStore.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(init.json);
  }

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e; // caller cancelled on purpose
    throw new ApiError("Network problem. Check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong", res.status);
  return data as T;
}
