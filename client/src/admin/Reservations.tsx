import { useState } from 'react';
import { useAdminReservations } from './api';
import { AdminHeader, ReservationTable } from './shared';
import { Field, SelectField } from '../components/ui/Field';
import { addDays, cafeToday } from '../lib/cafe';

export function Reservations() {
  const today = cafeToday();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(addDays(today, 14));
  const [status, setStatus] = useState<'all' | 'confirmed' | 'cancelled'>('confirmed');
  const query = useAdminReservations(from, to, status);

  return (
    <>
      <AdminHeader title="Reservations" subtitle={query.data ? `${query.data.length} found` : undefined} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Field label="From" type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} />
        <Field label="To" type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} error={to < from ? 'Must be after "From".' : undefined} />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All</option>
        </SelectField>
      </div>
      <ReservationTable query={query} emptyText="No bookings in this range." />
    </>
  );
}
