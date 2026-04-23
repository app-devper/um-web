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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
