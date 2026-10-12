'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type DiscoverParams } from '../api';

export const qk = {
  me: ['me'] as const,
  overview: ['overview'] as const,
  discover: (p: DiscoverParams) => ['discover', p] as const,
  matches: ['matches'] as const,
  threads: ['threads'] as const,
  messages: (id: string) => ['messages', id] as const,
  notifications: ['notifications'] as const,
};

export const useMe = () => useQuery({ queryKey: qk.me, queryFn: api.me.get, staleTime: 60_000 });
export const useOverview = () => useQuery({ queryKey: qk.overview, queryFn: api.overview });
export const useDiscover = (p: DiscoverParams) =>
  useQuery({ queryKey: qk.discover(p), queryFn: () => api.discover(p), placeholderData: (prev) => prev });
export const useMatches = () => useQuery({ queryKey: qk.matches, queryFn: () => api.matches.list().then((r) => r.data) });
export const useThreads = () => useQuery({ queryKey: qk.threads, queryFn: () => api.threads.list().then((r) => r.data) });
export const useMessages = (threadId: string | null) =>
  useQuery({
    queryKey: qk.messages(threadId ?? 'none'),
    queryFn: () => api.threads.messages(threadId!).then((r) => r.data),
    enabled: !!threadId,
    refetchInterval: 8_000,
  });
export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: () => api.notifications.list().then((r) => r.data), refetchInterval: 20_000 });

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

export function useExpressInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.matches.interest(targetId),
    onSuccess: ({ mutual }) => {
      toast.success(mutual ? "It's a match — messaging is unlocked 🎉" : 'Interest sent');
      void qc.invalidateQueries({ queryKey: ['discover'] });
      void qc.invalidateQueries({ queryKey: qk.matches });
      void qc.invalidateQueries({ queryKey: qk.overview });
      void qc.invalidateQueries({ queryKey: qk.threads });
      void qc.invalidateQueries({ queryKey: qk.notifications });
    },
    onError: (e) => toast.error(errMsg(e)),
  });
}

export function usePassMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.matches.pass(id),
    onSuccess: () => {
      toast.success('Moved to passed');
      void qc.invalidateQueries({ queryKey: qk.matches });
      void qc.invalidateQueries({ queryKey: ['discover'] });
      void qc.invalidateQueries({ queryKey: qk.overview });
    },
    onError: (e) => toast.error(errMsg(e)),
  });
}

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.threads.send(threadId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.messages(threadId) });
      void qc.invalidateQueries({ queryKey: qk.threads });
    },
    onError: (e) => toast.error(errMsg(e)),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.notifications.markAllRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}
