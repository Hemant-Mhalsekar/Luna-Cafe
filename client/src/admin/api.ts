import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api, retryWhileWaking, wakeRetryDelay } from '../lib/api';
import type { Game, MenuItem } from '../lib/types';

export type AdminGame = Game & { isAvailable: boolean };
export type AdminMenuItem = MenuItem & { isAvailable: boolean };

export interface AdminEvent {
  _id: string;
  title: string;
  slug: string;
  type: 'game-night' | 'tournament';
  date: string;
  startTime: string;
  description: string;
  capacity: number;
  signups: { name: string; email: string; createdAt: string }[];
}

export interface AdminReservation {
  _id: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  slotId: string;
  partySize: number;
  status: 'confirmed' | 'cancelled';
  tableId: { number: number; capacity: number } | null;
  gameId: { name: string } | null;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Summary {
  today: string;
  bookingsToday: number;
  guestsToday: number;
  bookingsThisWeek: number;
  unreadMessages: number;
}

const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

// ---- session ----

export function useMe() {
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => api<{ admin: { email: string } }>('/auth/me').then((r) => r.admin),
    retry: retryWhileWaking, // a 401 just means "not signed in": no retry
    retryDelay: wakeRetryDelay,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => api<{ admin: { email: string } }>('/auth/login', json('POST', body)),
    onSuccess: (r) => qc.setQueryData(['admin', 'me'], r.admin),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<null>('/auth/logout', json('POST', {})),
    onSettled: () => qc.removeQueries({ queryKey: ['admin'] }),
  });
}

// ---- generic collections (games, menu, events) ----

export type Resource = 'games' | 'menu' | 'events';

export function useAdminList<T>(resource: Resource) {
  return useQuery({
    queryKey: ['admin', resource],
    queryFn: () => api<{ items: T[] }>(`/admin/${resource}`).then((r) => r.items),
  });
}

export function useAdminSave<T extends { _id?: string }>(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ _id, ...body }: T) =>
      _id ? api(`/admin/${resource}/${_id}`, json('PATCH', body)) : api(`/admin/${resource}`, json('POST', body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', resource] });
      // The public pages read the same data.
      qc.invalidateQueries({ queryKey: [resource === 'menu' ? 'menu' : resource] });
    },
  });
}

export function useAdminDelete(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/admin/${resource}/${id}`, json('DELETE')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', resource] });
      qc.invalidateQueries({ queryKey: [resource] });
    },
  });
}

// ---- dashboard, reservations, messages ----

export function useSummary() {
  return useQuery({ queryKey: ['admin', 'summary'], queryFn: () => api<Summary>('/admin/summary'), refetchInterval: 60_000 });
}

export function useAdminReservations(from: string, to: string, status: 'all' | 'confirmed' | 'cancelled') {
  return useQuery({
    queryKey: ['admin', 'reservations', from, to, status],
    queryFn: () =>
      api<{ items: AdminReservation[] }>(`/admin/reservations?from=${from}&to=${to}&status=${status}`).then((r) => r.items),
    enabled: Boolean(from && to && from <= to),
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/admin/reservations/${id}/cancel`, json('PATCH', {})),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reservations'] });
      qc.invalidateQueries({ queryKey: ['admin', 'summary'] });
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useMessages() {
  return useQuery({ queryKey: ['admin', 'messages'], queryFn: () => api<{ items: ContactMessage[] }>('/admin/messages').then((r) => r.items) });
}

export function useMarkMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => api(`/admin/messages/${id}`, json('PATCH', { isRead })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
      qc.invalidateQueries({ queryKey: ['admin', 'summary'] });
    },
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/admin/messages/${id}`, json('DELETE')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
      qc.invalidateQueries({ queryKey: ['admin', 'summary'] });
    },
  });
}

/** Signs the admin out of the UI when any admin call says the session has ended. */
export function isSessionExpired(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}
