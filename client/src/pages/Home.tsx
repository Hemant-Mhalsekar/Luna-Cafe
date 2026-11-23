import * as m from 'motion/react-m';
import { Link } from 'react-router';
import { LinkButton } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { Eyebrow, Section } from '../components/ui/Section';
import { Reveal } from '../components/Reveal';
import { GameCard, type GameCardData } from '../components/GameCard';
import { HeroImage } from '../components/HeroImage';
import { ClockIcon, CupIcon, DieIcon, PinIcon } from '../components/illustrations/GameIcons';
import { CAFE } from '../lib/cafe';

// Static for now; the Games page loads the full library from the API in phase 3.
const popularGames: GameCardData[] = [
  { name: 'Ticket to Ride', type: 'strategy', minPlayers: 2, maxPlayers: 5, playTimeMinutes: 60, accent: 'blue' },
  { name: 'Codenames', type: 'word', minPlayers: 4, maxPlayers: 8, playTimeMinutes: 20, accent: 'terracotta' },
  { name: 'Moonlight Mischief', type: 'party', minPlayers: 3, maxPlayers: 8, playTimeMinutes: 25, accent: 'lavender', isInvented: true },
  { name: 'UNO', type: 'party', minPlayers: 2, maxPlayers: 10, playTimeMinutes: 30, accent: 'mustard' },
];

const signatureDrinks = [
  { name: 'Moonlight Latte', price: 220, note: 'Vanilla, double shot, a crescent of cinnamon.', tags: ['gluten-free'] },
  { name: 'Honey Cinnamon Cappuccino', price: 210, note: 'Wild honey and our house cappuccino.', tags: ['gluten-free'] },
  { name: 'Iced Vanilla Cloud', price: 240, note: 'Cold brew under soft vanilla sweet cream.', tags: ['gluten-free'] },
];

export function Home() {
  return (
    <>
      {/* Hero: the calm café first */}
      <section aria-labelledby="hero-title" className="overflow-hidden">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          >
            <Eyebrow className="text-forest">Specialty coffee · Panaji</Eyebrow>
            <h1 id="hero-title" className="text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl">
              Coffee first.
              <span className="block text-forest">Then game on?</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-forest">
              A sunny corner for slow mornings, good beans and long conversations. Stay a while, there is more here than
              coffee.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to="/book" size="lg" className="group">
                <DieIcon className="transition-transform duration-500 group-hover:rotate-[200deg]" />
                Book a table
              </LinkButton>
              <LinkButton to="/menu" variant="secondary" size="lg">
                See the menu
              </LinkButton>
            </div>
          </m.div>

          <m.div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            <HeroImage />
          </m.div>
        </div>
      </section>

      {/* Quick café intro */}
      <Section tone="sage" wave labelledBy="intro-title">
        <div className="grid gap-8 md:grid-cols-3">
          <Reveal className="md:col-span-1">
            <h2 id="intro-title" className="text-3xl sm:text-4xl">
              Slow coffee, warm corners
            </h2>
          </Reveal>
          {[
            { icon: <CupIcon className="size-6" />, title: 'Small-batch beans', text: 'Roasted in Goa and brewed with care, from espresso to cold brew.' },
            { icon: <ClockIcon className="size-6" />, title: 'No rush, ever', text: 'Stay for one cup or the whole afternoon. Nobody will hurry you out.' },
          ].map((item, i) => (
            <Reveal key={item.title} delay={0.1 * (i + 1)}>
              <div className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card text-forest-dark">{item.icon}</span>
                <div>
                  <h3 className="text-xl">{item.title}</h3>
                  <p className="mt-1">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The reveal: the board game side */}
      <Section tone="cream" wave labelledBy="reveal-title">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow className="text-forest">Psst. Look behind the counter.</Eyebrow>
          <h2 id="reveal-title" className="text-4xl sm:text-5xl">
            There's a whole shelf of games back here
          </h2>
          <p className="mt-4 text-lg text-forest">
            Over a hundred board games, from quick party rounds to slow strategy evenings. Ask us for a recommendation, or
            let the quiz pick one for you.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularGames.map((g, i) => (
            <Reveal key={g.name} delay={0.08 * i} className="h-full">
              <GameCard game={g} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <LinkButton to="/games#quiz" size="lg">
            Find my game
          </LinkButton>
          <LinkButton to="/games" variant="secondary" size="lg">
            Browse the library
          </LinkButton>
        </Reveal>
      </Section>

      {/* Signature drinks */}
      <Section tone="sage" wave labelledBy="drinks-title">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>From the bar</Eyebrow>
            <h2 id="drinks-title" className="text-4xl">
              Signature drinks
            </h2>
          </div>
          <Link to="/menu" className="font-semibold underline underline-offset-4 hover:no-underline">
            Full menu
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {signatureDrinks.map((d, i) => (
            <Reveal key={d.name} delay={0.08 * i} className="h-full">
              <Card className="flex h-full flex-col">
                <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-sage-soft text-forest-dark">
                  <CupIcon className="size-14" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <h3 className="text-xl">{d.name}</h3>
                  <span className="font-mono text-forest">₹{d.price}</span>
                </div>
                <p className="mt-2 text-forest">{d.note}</p>
                <div className="mt-auto flex gap-2 pt-4">
                  {d.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Hours and location */}
      <Section tone="cream" wave labelledBy="visit-title">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Eyebrow className="text-forest">Visit us</Eyebrow>
            <h2 id="visit-title" className="text-4xl">
              Come in, the kettle's on
            </h2>
            <ul className="mt-6 space-y-4">
              {CAFE.hours.map((h) => (
                <li key={h.days} className="flex gap-3">
                  <ClockIcon className="mt-0.5 size-6 shrink-0 text-forest" />
                  <span>
                    <span className="block font-semibold">{h.days}</span>
                    <span className="text-forest">{h.time}</span>
                  </span>
                </li>
              ))}
              <li className="flex gap-3">
                <PinIcon className="mt-0.5 size-6 shrink-0 text-forest" />
                <address className="not-italic">
                  <span className="block font-semibold">{CAFE.address[0]}</span>
                  <span className="text-forest">{CAFE.address[1]}</span>
                </address>
              </li>
            </ul>
            <LinkButton to="/book" size="lg" className="mt-8">
              Book a table
            </LinkButton>
          </Reveal>
          <Reveal delay={0.1}>
            <MiniMap />
          </Reveal>
        </div>
      </Section>
    </>
  );
}

/** Stylised map of a fictional street. Coded SVG, so no map API key is needed. */
function MiniMap() {
  return (
    <div className="overflow-hidden rounded-card border border-outline/60 bg-sage-soft shadow-soft">
      <svg viewBox="0 0 480 320" role="img" aria-label="Map: Luna Café on Crescent Lane, near the river promenade" className="block h-auto w-full">
        <rect width="480" height="320" fill="#E4ECDC" />
        <path d="M0 250c80-20 160-10 240 10s160 20 240-5v65H0Z" fill="#C9DCE6" />
        <g stroke="#FFFDF8" strokeWidth="18" strokeLinecap="round" fill="none">
          <path d="M-10 120h500" />
          <path d="M150 -10v240" />
          <path d="M330 -10c-10 80 10 160 0 240" />
        </g>
        <g fill="#A9BBA0">
          <rect x="30" y="20" width="90" height="70" rx="14" />
          <rect x="180" y="20" width="120" height="70" rx="14" />
          <rect x="360" y="150" width="100" height="70" rx="14" />
          <rect x="30" y="150" width="90" height="60" rx="14" />
        </g>
        <text x="200" y="112" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill="#4A6B4F">Crescent Lane</text>
        <text x="40" y="290" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill="#456277">Riverside promenade</text>
        <g transform="translate(240 160)">
          <circle r="26" fill="#294632" />
          <path d="M5-13a12 12 0 1 0 6 21A13.5 13.5 0 0 1 5-13Z" fill="#F6EFDF" />
          <path d="M-9 24 0 38 9 24" fill="#294632" />
        </g>
        <text x="274" y="166" fontFamily="Fredoka, sans-serif" fontSize="18" fontWeight="600" fill="#294632">Luna Café</text>
      </svg>
    </div>
  );
}
