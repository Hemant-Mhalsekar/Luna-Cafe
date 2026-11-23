import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { LinkButton } from '../components/ui/Button';
import { Eyebrow, Section } from '../components/ui/Section';
import { Reveal } from '../components/Reveal';
import { cn } from '../lib/cn';
import { MoonPhases } from '../components/illustrations/MoonPhases';

const VALUES = [
  { title: 'Calm first', text: 'Soft light, good chairs, no blaring music. A café you can actually think in.' },
  { title: 'Everyone plays', text: 'Never played a board game? Perfect. We teach every game on the shelf, patiently.' },
  { title: 'Made with care', text: 'Beans roasted in Goa, bakes made each morning, and games kept complete and clean.' },
];

const TEAM = [
  { name: 'Mira D’Souza', role: 'Founder and head barista', tone: 'bg-game-blue-soft text-game-blue', bio: 'Left an office job to make coffee and has never looked back.' },
  { name: 'Arjun Naik', role: 'Game guru', tone: 'bg-game-lavender-soft text-game-lavender', bio: 'Knows the rules to every game on the shelf, and the house rules too.' },
  { name: 'Sana Kamat', role: 'Baker', tone: 'bg-game-mustard-soft text-game-mustard', bio: 'Up at five, so the croissants are warm when you walk in.' },
  { name: 'Leo Fernandes', role: 'Events host', tone: 'bg-game-terracotta-soft text-game-terracotta', bio: 'Runs game nights and keeps tournament trash talk friendly.' },
];

export function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="A café that happens to have a lot of games">
        <p>Luna Café started with one shelf of games and a very good espresso machine. People stayed longer than planned. So we added more shelves.</p>
      </PageHeader>

      <div className="container-page grid gap-10 pb-16 lg:grid-cols-2">
        <Reveal className="space-y-4 text-lg text-forest-dark">
          <p>
            Mira opened Luna in a quiet lane in Panaji in 2021, wanting a place that felt like a friend's living room: sunny in the morning,
            cosy at night. Friends brought their board games along, and the games never went home.
          </p>
          <p>
            Today the shelf holds more than a hundred games, from five-minute card games to all-evening strategy. The coffee is still the
            first thing we care about. The games are what keep you here.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="flex h-full flex-col justify-center bg-forest-dark text-cream">
            <p className="font-display text-3xl leading-snug">“Coffee first. Then game on?”</p>
            <p className="mt-4 text-cream/85">What we ask every table, every day.</p>
            <MoonPhases className="mt-6 text-cream" />
          </Card>
        </Reveal>
      </div>

      <Section tone="sage" wave labelledBy="values-title">
        <Eyebrow>What we care about</Eyebrow>
        <h2 id="values-title" className="text-4xl">
          Our values
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <li key={v.title}>
              <Reveal delay={0.08 * i} className="h-full">
                <Card className="h-full">
                  <h3 className="text-2xl">{v.title}</h3>
                  <p className="mt-2 text-forest">{v.text}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="cream" wave labelledBy="team-title">
        <Eyebrow className="text-forest">The people</Eyebrow>
        <h2 id="team-title" className="text-4xl">
          Meet the team
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((p, i) => (
            <li key={p.name}>
              <Reveal delay={0.06 * i} className="h-full">
                <Card className="h-full text-center">
                  <span className={cn('mx-auto grid size-20 place-items-center rounded-full font-display text-2xl font-semibold', p.tone)} aria-hidden="true">
                    {p.name.split(' ').map((w) => w[0]).join('')}
                  </span>
                  <h3 className="mt-4 text-xl">{p.name}</h3>
                  <p className="text-sm font-semibold text-forest">{p.role}</p>
                  <p className="mt-2 text-forest">{p.bio}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <LinkButton to="/book" size="lg">
            Book a table
          </LinkButton>
          <LinkButton to="/contact" variant="secondary" size="lg">
            Say hello
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
