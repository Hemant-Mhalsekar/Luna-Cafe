import { Link } from 'react-router';
import { useAdminReservations, useRecentReservations, useSummary } from './api';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { formatDate } from '../lib/cafe';
import { cn } from '../lib/cn';
import { AdminHeader, QueryBlock, ReservationTable } from './shared';
import { bookedAt } from './utils';

export function Dashboard() {
  const summary = useSummary();
  const today = summary.data?.today ?? '';
  const todays = useAdminReservations(today, today, 'confirmed');
  const recent = useRecentReservations();

  const stats = [
    { label: 'Bookings today', value: summary.data?.bookingsToday },
    { label: 'Guests today', value: summary.data?.guestsToday },
    { label: 'Bookings, next 7 days', value: summary.data?.bookingsThisWeek },
    { label: 'Unread messages', value: summary.data?.unreadMessages, to: '/admin/messages' },
  ];

  return (
    <>
      <AdminHeader title="Today" subtitle={today ? formatDate(today) : undefined} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Card className="p-5">
              <p className="text-sm font-semibold text-forest">{s.label}</p>
              <p className="mt-1 font-display text-4xl font-semibold">{s.value ?? '–'}</p>
              {s.to && (
                <Link to={s.to} className="mt-1 inline-block text-sm font-semibold underline underline-offset-4">
                  Open
                </Link>
              )}
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-10 text-2xl">Today's tables</h2>
      <ReservationTable query={todays} emptyText="No bookings for today yet." showDate={false} />

      <div className="mb-4 mt-10 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl">Latest bookings</h2>
        <Link to="/admin/reservations" className="text-sm font-semibold underline underline-offset-4">
          All reservations
        </Link>
      </div>
      <QueryBlock query={recent} empty="No bookings yet.">
        {(items) => (
          <ul className="flex flex-col gap-3">
            {items.map((r) => {
              const cancelled = r.status === 'cancelled';
              return (
                <li key={r._id}>
                  <Card className={cn('flex flex-wrap items-center justify-between gap-x-6 gap-y-2 p-4', cancelled && 'opacity-70')}>
                    <div>
                      <p className="font-semibold">
                        {r.name} <span className="font-normal text-forest">booked</span> {formatDate(r.date).split(' ').slice(0, 3).join(' ')},{' '}
                        <span className="font-mono">{`${r.slotId.slice(0, 2)}:${r.slotId.slice(2)}`}</span>
                      </p>
                      <p className="text-sm text-forest">
                        {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'} · Table {r.tableId?.number ?? '–'} · {r.gameId?.name ?? 'No game'} ·{' '}
                        <span className="font-mono">{r.referenceCode}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-forest">
                      {cancelled && <Tag className="bg-cream-deep text-muted">Cancelled</Tag>}
                      <span>Booked {bookedAt(r.createdAt)}</span>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </QueryBlock>
    </>
  );
}
