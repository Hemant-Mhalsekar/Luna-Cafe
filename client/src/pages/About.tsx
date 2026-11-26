import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { LinkButton } from '../components/ui/Button';
import { Eyebrow, Section } from '../components/ui/Section';
import { Reveal } from '../components/Reveal';
import { Enter } from '../components/fx/Enter';
import { cn } from '../lib/cn';
import { MoonPhases } from '../components/illustrations/MoonPhases';
import { Photo } from '../components/Photo';
import { PHOTOS } from '../lib/cafe';
import { Parallax } from '../components/fx/Parallax';
import { Tilt } from '../components/fx/Tilt';
import { Marquee } from '../components/fx/Marquee';

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
        <p>Lunaa Café started with one shelf of games and a very good espresso machine. People stayed longer than planned. So we added more shelves.</p>
      </PageHeader>

      <div className="container-page grid gap-10 pb-16 lg:grid-cols-2">
        <Enter variant="left" delay={0.3} className="space-y-4 text-lg text-forest-dark">
          <p>
            Mira opened Lunaa in a quiet lane in Panaji in 2021, wanting a place that felt like a friend's living room: sunny in the morning,
            cosy at night. Friends brought their board games along, and the games never went home.
          </p>
          <p>
            Today the shelf holds more than a hundred games, from five-minute card games to all-evening strategy. The coffee is still the
            first thing we care about. The games are what keep you here.
          </p>
        </Enter>
        <Enter delay={0.45} variant="flip">
          <Tilt className="h-full rounded-card">
          <Card className="flex h-full flex-col justify-center bg-forest-dark text-cream">
            <p className="font-display text-3xl leading-snug">“Coffee first. Then game on?”</p>
            <p className="mt-4 text-cream/85">What we ask every table, every day.</p>
            <MoonPhases className="mt-6 text-cream" />
          </Card>
          </Tilt>
        </Enter>
      </div>

      <div className="container-page grid gap-5 pb-16 sm:grid-cols-[2fr_1fr]">
        <Reveal variant="zoom">
          <Parallax speed={0.1} zoom className="aspect-[16/9] h-full w-full rounded-card shadow-soft">
            <Photo {...PHOTOS.interior} className="size-full" />
          </Parallax>
        </Reveal>
        <Reveal delay={0.15} variant="tilt">
          <Parallax speed={0.14} zoom className="aspect-[4/5] h-full w-full rounded-card shadow-soft sm:aspect-auto">
            <Photo {...PHOTOS.storefront} className="size-full" />
          </Parallax>
        </Reveal>
      </div>

      <Marquee items={['Calm first', 'Everyone plays', 'Made with care', 'Coffee first', 'Then game on?']} className="-rotate-1 bg-forest-dark text-cream" />

      <Section tone="sage" wave labelledBy="values-title">
        <Reveal variant="blur">
          <Eyebrow>What we care about</Eyebrow>
          <h2 id="values-title" className="text-4xl">
            Our values
          </h2>
        </Reveal>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <li key={v.title}>
              <Reveal delay={0.15 * i} variant="flip" className="h-full">
                <Card className="group h-full transition-transform duration-300 hover:-translate-y-2 hover:-rotate-1">
                  <span className="mb-4 block font-display text-5xl font-semibold text-sage transition-transform duration-500 group-hover:scale-125 group-hover:text-cta" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <h3 className="text-2xl">{v.title}</h3>
                  <p className="mt-2 text-forest">{v.text}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="cream" wave labelledBy="team-title">
        <Reveal variant="left">
          <Eyebrow className="text-forest">The people</Eyebrow>
          <h2 id="team-title" className="text-4xl">
            Meet the team
          </h2>
        </Reveal>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((p, i) => (
            <li key={p.name}>
              <Reveal delay={0.1 * i} variant="tilt" className="h-full">
                <Tilt className="h-full rounded-card">
                <Card className="group h-full text-center">
                  <span className={cn('mx-auto grid size-20 place-items-center rounded-full font-display text-2xl font-semibold transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110', p.tone)} aria-hidden="true">
                    {p.name.split(' ').map((w) => w[0]).join('')}
                  </span>
                  <h3 className="mt-4 text-xl">{p.name}</h3>
                  <p className="text-sm font-semibold text-forest">{p.role}</p>
                  <p className="mt-2 text-forest">{p.bio}</p>
                </Card>
                </Tilt>
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
      <Section tone="sage" wave labelledBy="faq-title" id="faq">
        <Reveal variant="blur">
          <Eyebrow>Good to know</Eyebrow>
          <h2 id="faq-title" className="text-4xl">
            Questions we get a lot
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={0.05 * i} variant={i % 2 ? 'right' : 'left'}>
            <details className="group rounded-card border border-outline/60 bg-card p-5 shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift open:pb-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-sage-soft text-lg transition-transform duration-300 group-open:rotate-[225deg] group-open:bg-cta group-open:text-white group-hover:scale-110">
                  +
                </span>
              </summary>
              <p className="mt-3 text-forest">{f.a}</p>
            </details>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

const FAQ = [
  { q: 'Do I need to know how to play?', a: 'Not at all. Tell us what you like (quick and silly, or slow and clever) and we will pick a game and teach the rules at your table.' },
  { q: 'Is there a fee for the games?', a: 'The game library is free with any order. Stay as long as your table booking allows, or as long as there is a free table if you walked in.' },
  { q: 'Can I reserve a specific game?', a: 'Yes. Choose it when you book. We have one copy of each, so if someone already reserved it for that time, the booking form shows it as taken.' },
  { q: 'How long is a table booking?', a: 'Ninety minutes. If nobody is waiting, you are welcome to stay longer: just ask at the bar.' },
  { q: 'Can we come as a big group?', a: 'Tables seat up to eight. For bigger groups, birthdays or office game nights, send us a note on the contact page and we will set something up.' },
  { q: 'Are kids welcome?', a: 'Of course. We have plenty of family games, and the hot chocolate is very good.' },
  { q: 'Do you have vegan and gluten-free options?', a: 'Yes, they are marked on the menu. Most drinks can be made with oat milk.' },
  { q: 'Can I bring my own game?', a: 'Sure, as long as it has no glitter. We might ask to play.' },
];
