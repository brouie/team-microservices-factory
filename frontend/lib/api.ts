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

export async function submitIdea(idea: string): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE}/ideas`, {
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
  const response = await fetch(`${API_BASE}/services`);
  if (!response.ok) {
    throw new Error("Failed to load services");
  }
  return response.json();
}

export async function deployService(serviceId: string): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE}/services/${serviceId}/deploy`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("Failed to deploy service");
  }
  return response.json();
}

export async function createToken(serviceId: string): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE}/services/${serviceId}/token`, {
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
  const response = await fetch(`${API_BASE}/services/${serviceId}/access`, {
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
  const response = await fetch(`${API_BASE}/services/${serviceId}/events`);
  if (!response.ok) {
    throw new Error("Failed to load service events");
  }
  return response.json();
}
