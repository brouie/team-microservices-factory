export type ServiceRecord = {
  id: string;
  idea: string;
  status: string;
  token_address: string | null;
  api_base_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceEvent = {
  service_id: string;
  status: string;
  message: string | null;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function checkApiStatus(): Promise<{ connected: boolean; url: string }> {
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });
    return { connected: response.ok, url: API_BASE };
  } catch {
    return { connected: false, url: API_BASE };
  }
}

async function handleFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000)
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("Request timed out. Backend may be unavailable.");
    }
    throw new Error("Network error. Backend may be unavailable.");
  }
}

export async function submitIdea(idea: string): Promise<ServiceRecord> {
  const response = await handleFetch(`${API_BASE}/ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea })
  });
  if (!response.ok) {
    throw new Error("Failed to submit idea");
  }
  return response.json();
}

export async function fetchServices(): Promise<ServiceRecord[]> {
  const response = await handleFetch(`${API_BASE}/services`);
  if (!response.ok) {
    throw new Error("Failed to load services");
  }
  return response.json();
}

export async function deployService(serviceId: string): Promise<ServiceRecord> {
  const response = await handleFetch(`${API_BASE}/services/${serviceId}/deploy`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("Failed to deploy service");
  }
  return response.json();
}

export async function createToken(serviceId: string): Promise<ServiceRecord> {
  const response = await handleFetch(`${API_BASE}/services/${serviceId}/token`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("Failed to create token");
  }
  return response.json();
}

export async function createAccess(serviceId: string): Promise<{
  api_key: string;
  api_base_url: string;
  token_address: string;
}> {
  const response = await handleFetch(`${API_BASE}/services/${serviceId}/access`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("Failed to create access");
  }
  return response.json();
}

export async function fetchServiceEvents(
  serviceId: string
): Promise<ServiceEvent[]> {
  const response = await handleFetch(`${API_BASE}/services/${serviceId}/events`);
  if (!response.ok) {
    throw new Error("Failed to load service events");
  }
  return response.json();
}

export type Stats = {
  total_services: number;
  status_counts: Record<string, number>;
  deployed_count: number;
  tokenized_count: number;
};

export async function fetchStats(): Promise<Stats> {
  const response = await handleFetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error("Failed to load stats");
  }
  return response.json();
}

const GATEWAY_BASE = process.env.NEXT_PUBLIC_GATEWAY_BASE ?? "http://localhost:9000";

export async function proxyServiceRequest(
  serviceId: string,
  path: string,
  walletAddress: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(`${GATEWAY_BASE}/proxy/${serviceId}/${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      "X-Wallet-Address": walletAddress
    }
  });
  return response;
}