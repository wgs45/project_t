const API_BASE_URL = "http://localhost:8000/api";

// Highly resuable, type-safe function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Safe token retrieval
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Flexible header merging
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status == 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(errorData.detail || "Request Failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
