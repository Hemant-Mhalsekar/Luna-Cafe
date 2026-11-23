import { Link } from 'react-router';
import { useAdminReservations, useSummary } from './api';
import { Card } from '../components/ui/Card';
import { formatDate } from '../lib/cafe';
import { AdminHeader, ReservationTable } from './shared';

export function Dashboard() {
  const summary = useSummary();
  const today = summary.data?.today ?? '';
  const todays = useAdminReservations(today, today, 'confirmed');

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
    </>
  );
}
