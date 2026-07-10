// src/api/client.ts
// Real fetch-based client for the nexus-backend API. No mocking.

const DEPLOYED_BACKEND_URL = 'https://nexus-backend-lpt1.onrender.com';

export const API_BASE_URL =
  DEPLOYED_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://10.0.2.2:4000';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthResponse {
  success: boolean;
  user: { id: string; email: string; name?: string };
  token: string;
}

export function register(email: string, password: string, name?: string) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface Post {
  id: string;
  userId: string;
  platform: string;
  content: string;
  hashtags: string[];
  omegaScore: number;
  status: string;
  createdAt: string;
  publishedAt?: string;
}

export function generatePost(
  token: string,
  topic: string,
  mood: string,
  platform: string
) {
  return request<{ success: boolean; post: Post }>('/api/posts/generate', {
    method: 'POST',
    token,
    body: JSON.stringify({ topic, mood, platform }),
  });
}

export function listPosts(token: string) {
  return request<{ success: boolean; posts: Post[] }>('/api/posts/mine', { token });
}

export function publishPost(token: string, postId: string, socialPlatform?: string) {
  return request<{ success: boolean; post: Post; error?: string; note?: string }>(
    `/api/publish/${postId}`,
    { method: 'POST', token, body: JSON.stringify({ socialPlatform }) }
  );
}

export function getConnectUrl(token: string, platform: 'meta' | 'tiktok' | 'youtube') {
  return request<{ success: boolean; authUrl: string }>(
    `/api/social-auth/${platform}/connect`,
    { token }
  );
}

export function getConnectedAccounts(token: string) {
  return request<{ success: boolean; connected: { platform: string; connectedAt: string }[] }>(
    '/api/social-auth/connected',
    { token }
  );
}
