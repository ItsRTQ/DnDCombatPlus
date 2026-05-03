const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // Use relative paths in production/Docker (when served by Go)
  return "";
};

const getWsBaseUrl = () => {
  const envUrl = import.meta.env.VITE_WS_BASE_URL;
  if (envUrl) return envUrl;

  // Default to same host with ws/wss protocol
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();
