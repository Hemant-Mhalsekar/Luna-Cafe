import { ResourceManager } from './shared';
import type { AdminEvent } from './api';
import { Field, SelectField, TextAreaField } from '../components/ui/Field';
import { Tag } from '../components/ui/Tag';
import { cafeToday, formatDate } from '../lib/cafe';

interface EventForm {
  title: string;
  slug: string;
  type: AdminEvent['type'];
  date: string;
  startTime: string;
  description: string;
  capacity: string;
}

export function EventsAdmin() {
  const empty: EventForm = { title: '', slug: '', type: 'game-night', date: cafeToday(), startTime: '19:00', description: '', capacity: '24' };
  return (
    <ResourceManager<AdminEvent, EventForm>
      resource="events"
      title="Events"
      singular="event"
      itemName={(ev) => ev.title}
      empty={empty}
      toForm={(ev) => ({ ...ev, capacity: String(ev.capacity) })}
      toBody={(f) => ({ ...f, capacity: Number(f.capacity) })}
      columns={[
        { label: 'Date', render: (ev) => `${formatDate(ev.date).split(' ').slice(0, 3).join(' ')}, ${ev.startTime}` },
        { label: 'Title', render: (ev) => <span className="font-semibold">{ev.title}</span> },
        { label: 'Type', render: (ev) => <Tag tone={ev.type === 'tournament' ? 'terracotta' : 'lavender'}>{ev.type === 'tournament' ? 'Tournament' : 'Game night'}</Tag> },
        { label: 'Sign-ups', render: (ev) => `${ev.signups.length} / ${ev.capacity}` },
      ]}
      renderForm={(f, set, e) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" value={f.title} onChange={(ev) => set({ title: ev.target.value })} error={e.title} required />
            <SelectField label="Type" value={f.type} onChange={(ev) => set({ type: ev.target.value as EventForm['type'] })}>
              <option value="game-night">Game night</option>
              <option value="tournament">Tournament</option>
            </SelectField>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Date" type="date" value={f.date} onChange={(ev) => set({ date: ev.target.value })} error={e.date} />
            <Field label="Start time" type="time" value={f.startTime} onChange={(ev) => set({ startTime: ev.target.value })} error={e.startTime} />
            <Field label="Seats" type="number" min={1} max={200} value={f.capacity} onChange={(ev) => set({ capacity: ev.target.value })} error={e.capacity} />
          </div>
          <TextAreaField label="Description" value={f.description} onChange={(ev) => set({ description: ev.target.value })} error={e.description} maxLength={600} />
        </>
      )}
    />
  );
}
