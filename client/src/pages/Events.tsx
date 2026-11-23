import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/Reveal';
import { ClockIcon, MeepleIcon } from '../components/illustrations/GameIcons';
import { SAMPLE_EVENTS } from '../lib/events';
import { cafeToday } from '../lib/cafe';

function dateParts(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return {
    day: d.toLocaleDateString('en-GB', { day: 'numeric', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
    weekday: d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }),
  };
}

export function Events() {
  const today = cafeToday();
  const upcoming = SAMPLE_EVENTS.filter((e) => e.date >= today);

  return (
    <>
      <PageHeader eyebrow="Events" title="Game nights and tournaments">
        <p>Join a table of new friends, or bring your crew and compete. Every event includes a drink and someone to teach the rules.</p>
      </PageHeader>

      <div className="container-page pb-20">
        {upcoming.length === 0 && <Card>New events are being planned. Check back soon.</Card>}
        <ul className="grid gap-5 md:grid-cols-2">
          {upcoming.map((e, i) => {
            const p = dateParts(e.date);
            return (
              <li key={e.slug}>
                <Reveal delay={0.06 * i} className="h-full">
                  <Card className="flex h-full gap-5">
                    <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-forest-dark text-cream">
                      <span className="font-display text-3xl font-semibold leading-none">{p.day}</span>
                      <span className="mt-1 text-sm font-semibold uppercase tracking-wider">{p.month}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Tag tone={e.type === 'tournament' ? 'terracotta' : 'lavender'} className="self-start">
                        {e.type === 'tournament' ? 'Tournament' : 'Game night'}
                      </Tag>
                      <h2 className="mt-3 text-2xl">{e.title}</h2>
                      <p className="mt-2 text-forest">{e.description}</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <ClockIcon className="size-4" /> {p.weekday}, {e.startTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MeepleIcon className="size-4" /> {e.capacity} seats
                        </span>
                      </div>
                      <Button variant="secondary" className="mt-5 self-start" disabled>
                        Sign-ups open soon
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
