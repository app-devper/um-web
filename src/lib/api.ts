import axios from "axios";

const apiHost = process.env.NEXT_PUBLIC_API_URL;
if (!apiHost) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

const api = axios.create({
  baseURL: `${apiHost.replace(/\/$/, "")}/api/um/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SESSION_SAFE_401_PREFIX = "/auth/passkey/";
const TICKET_EXCHANGE_URL = "/auth/exchange";

// A 401 from these calls is the caller's own failure to show, not an expired session.
export function endsSessionOn401(url: string): boolean {
  return !url.startsWith(SESSION_SAFE_401_PREFIX) && url !== TICKET_EXCHANGE_URL;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && endsSessionOn401(String(error.config?.url ?? ""))) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
