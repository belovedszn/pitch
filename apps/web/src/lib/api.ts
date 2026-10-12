import type {
  DiscoverResult, Me, MatchView, Message, NotificationItem, OverviewStats, Pitch, Role, ThreadView, User, Investor, Startup,
} from './types';
import type { InvestorProfileInput, PitchInput, SignupInput, StartupProfileInput } from './schemas';

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields?: Record<string, string[] | undefined>) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'same-origin',
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fields: Record<string, string[] | undefined> | undefined;
    try {
      const body = (await res.json()) as { error?: string; fields?: Record<string, string[]> };
      message = body.error ?? message;
      fields = body.fields;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status, fields);
  }
  return res.json() as Promise<T>;
}

const send = (method: string, body?: unknown): RequestInit => ({ method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });

export interface DiscoverParams {
  q?: string;
  sector?: string;
  stage?: string;
  region?: string;
  sort?: 'score' | 'recent';
}

export const api = {
  auth: {
    signup: (data: SignupInput) => request<{ user: User }>('/auth/signup', send('POST', data)),
    login: (email: string) => request<{ user: User }>('/auth/login', send('POST', { email })),
    demo: (role: Role) => request<{ user: User }>('/auth/demo', send('POST', { role })),
    logout: () => request<{ ok: true }>('/auth/logout', send('POST')),
  },
  me: {
    get: () => request<Me>('/me'),
    updateStartup: (data: StartupProfileInput) => request<Startup>('/me/startup', send('PUT', data)),
    updateInvestor: (data: InvestorProfileInput) => request<Investor>('/me/investor', send('PUT', data)),
    savePitch: (data: PitchInput) => request<Pitch>('/me/pitch', send('PUT', data)),
  },
  discover: (params: DiscoverParams) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && qs.set(k, v));
    return request<DiscoverResult>(`/discover?${qs.toString()}`);
  },
  recordView: (startupId: string) => request<{ ok: true }>(`/startups/${startupId}/view`, send('POST')),
  matches: {
    list: () => request<{ data: MatchView[] }>('/matches'),
    interest: (targetId: string) => request<{ match: MatchView; mutual: boolean }>('/matches', send('POST', { targetId })),
    pass: (id: string) => request<MatchView>(`/matches/${id}`, send('PATCH', { status: 'passed' })),
  },
  threads: {
    list: () => request<{ data: ThreadView[] }>('/threads'),
    messages: (id: string) => request<{ data: Message[] }>(`/threads/${id}/messages`),
    send: (id: string, body: string) => request<Message>(`/threads/${id}/messages`, send('POST', { body })),
  },
  notifications: {
    list: () => request<{ data: NotificationItem[] }>('/notifications'),
    markAllRead: () => request<{ ok: true }>('/notifications', send('POST')),
  },
  overview: () => request<OverviewStats>('/overview'),
};
