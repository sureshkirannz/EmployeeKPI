import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  role: string;
  employeeName: string;
}

export interface LoginResponse {
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  return await response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<LoginResponse | null> {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    return await response.json();
  } catch {
    return null;
  }
}
