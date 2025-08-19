import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  if (config.method === "get") {
    const separator = config.url?.includes("?") ? "&" : "?";
    config.url = `${config.url}${separator}_t=${Date.now()}`;
  }
  return config;
});

export default api;