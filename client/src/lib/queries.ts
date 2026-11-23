import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Game, MenuItem, PublicEvent, ReservationConfirmation, ReservationRequest, SlotAvailability } from './types';

// The free API may be waking up, so data queries retry patiently instead of failing fast.
const patient = { retry: 8, retryDelay: 5000 } as const;

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: () => api<{ games: Game[] }>('/games').then((r) => r.games),
    staleTime: 10 * 60_000,
    ...patient,
  });
}

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: () => api<{ items: MenuItem[] }>('/menu').then((r) => r.items),
    staleTime: 10 * 60_000,
    ...patient,
  });
}

export function useAvailability(date: string, partySize: number) {
  return useQuery({
    queryKey: ['availability', date, partySize],
    queryFn: () =>
      api<{ slots: SlotAvailability[] }>(`/reservations/availability?date=${date}&partySize=${partySize}`).then(
        (r) => r.slots,
      ),
    enabled: Boolean(date),
    staleTime: 30_000,
    ...patient,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    // Whether it worked or the time was just taken, the free/full picture has changed.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['availability'] }),
    mutationFn: (body: ReservationRequest) =>
      api<{ reservation: ReservationConfirmation }>('/reservations', { method: 'POST', body: JSON.stringify(body) }).then(
        (r) => r.reservation,
      ),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: (body: { name: string; email: string; message: string; website?: string }) =>
      api<{ ok: true }>('/contact', { method: 'POST', body: JSON.stringify(body) }),
  });
}

export function useSpecial() {
  return useQuery({
    queryKey: ['menu', 'special'],
    queryFn: () => api<{ date: string; item: MenuItem | null; note: string | null }>('/menu/special'),
    staleTime: 10 * 60_000,
    ...patient,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => api<{ events: PublicEvent[] }>('/events').then((r) => r.events),
    staleTime: 60_000,
    ...patient,
  });
}

export function useEventSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, ...body }: { slug: string; name: string; email: string }) =>
      api<{ event: PublicEvent }>(`/events/${slug}/signup`, { method: 'POST', body: JSON.stringify(body) }).then((r) => r.event),
    // Seats left changed either way (signed up, or someone else took the last seat).
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}
