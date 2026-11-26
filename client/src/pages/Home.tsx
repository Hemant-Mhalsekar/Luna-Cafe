import { useRef } from 'react';
import { Link } from 'react-router';
import * as m from 'motion/react-m';
import { useScroll, useSpring, useTransform } from 'motion/react';
import { SplitText } from '../components/fx/SplitText';
import { Magnetic } from '../components/fx/Magnetic';
import { Tilt } from '../components/fx/Tilt';
import { Marquee } from '../components/fx/Marquee';
import { Parallax } from '../components/fx/Parallax';
import { FloatingPieces, type Piece } from '../components/fx/FloatingPieces';
import { LinkButton } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { Eyebrow, Section } from '../components/ui/Section';
import { Reveal } from '../components/Reveal';
import { GameCard, type GameCardData } from '../components/GameCard';
import { HeroImage } from '../components/HeroImage';
import { ClockIcon, CupIcon, DieIcon, PinIcon } from '../components/illustrations/GameIcons';
import { CAFE, PHOTOS } from '../lib/cafe';
import { Photo } from '../components/Photo';
import { MiniMap } from '../components/MiniMap';
import { LoyaltyCard } from '../components/LoyaltyCard';
import { Overheard } from '../components/Overheard';
import { TodaysSpecial } from '../components/TodaysSpecial';

// Static for now; the Games page loads the full library from the API in phase 3.
const popularGames: GameCardData[] = [
  { name: 'Ticket to Ride', type: 'strategy', minPlayers: 2, maxPlayers: 5, playTimeMinutes: 60, accent: 'blue' },
  { name: 'Codenames', type: 'word', minPlayers: 4, maxPlayers: 8, playTimeMinutes: 20, accent: 'terracotta' },
  { name: 'Moonlight Mischief', type: 'party', minPlayers: 3, maxPlayers: 8, playTimeMinutes: 25, accent: 'lavender', isInvented: true },
  { name: 'UNO', type: 'party', minPlayers: 2, maxPlayers: 10, playTimeMinutes: 30, accent: 'mustard' },
];

const signatureDrinks = [
  { name: 'Moonlight Latte', price: 220, note: 'Vanilla, double shot, a crescent of cinnamon.', tags: ['gluten-free'], image: '/images/menu/moonlight-latte.webp' },
  { name: 'Honey Cinnamon Cappuccino', price: 210, note: 'Wild honey and our house cappuccino.', tags: ['gluten-free'], image: '/images/menu/honey-cinnamon-cappuccino.webp' },
  { name: 'Iced Vanilla Cloud', price: 240, note: 'Cold brew under soft vanilla sweet cream.', tags: ['gluten-free'], image: '/images/menu/iced-vanilla-cloud.webp' },
];

const visitSteps = [
  { title: 'Book a table', text: 'Pick a time online (tables are held for 90 minutes) or just walk in. Big group? Send us a note.', icon: 'calendar' },
  { title: 'Order at the bar', text: 'Coffee, tea, bakes and things to share. Order whenever you like; we bring it to your table.', icon: 'cup' },
  { title: 'Pick a game', text: 'Grab one from the shelf, take the quiz, or ask us. We teach the rules, and the library is free with any order.', icon: 'die' },
] as const;

const HERO_PIECES: Piece[] = [
  { kind: 'die', top: 12, left: 4, size: 46, depth: 1.4, color: '#b4501f', rotate: -12 },
  { kind: 'meeple', top: 72, left: 8, size: 40, depth: 0.9, color: '#456277', rotate: 8 },
  { kind: 'bean', top: 30, left: 46, size: 28, depth: 1.8, color: '#8c4e37', rotate: 40 },
  { kind: 'star', top: 8, left: 56, size: 22, depth: 0.6, color: '#7d5800' },
  { kind: 'card', top: 78, left: 48, size: 42, depth: 1.2, color: '#665979', rotate: -14 },
  { kind: 'moon', top: 6, left: 88, size: 34, depth: 0.7, color: '#e9b949' },
  { kind: 'die', top: 84, left: 92, size: 34, depth: 1.6, color: '#294632', rotate: 22 },
  { kind: 'star', top: 52, left: 96, size: 16, depth: 1, color: '#b4501f' },
];

const RIBBON = ['Specialty coffee', 'Over 100 board games', 'Game nights', 'Moon Club', 'Slow mornings', 'Panaji, Goa'];

/** The hero: letters rise, pieces float, and as you scroll the moon rises behind the cup while the text drifts away. */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  const textY = useTransform(p, [0, 1], [0, 160]);
  const textOpacity = useTransform(p, [0, 0.8], [1, 0]);
  const imgY = useTransform(p, [0, 1], [0, 90]);
  const imgRotate = useTransform(p, [0, 1], [0, 8]);
  const imgScale = useTransform(p, [0, 1], [1, 0.9]);
  const moonY = useTransform(p, [0, 1], ['35%', '-95%']);
  const moonX = useTransform(p, [0, 1], ['-25%', '20%']);
  const moonScale = useTransform(p, [0, 1], [0.8, 1.25]);
  const ribbonX = useTransform(p, [0, 1], ['0%', '-12%']);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      <FloatingPieces pieces={HERO_PIECES} target={ref} className="max-sm:hidden max-lg:opacity-50" />
      <div className="container-page relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <m.div style={{ y: textY, opacity: textOpacity }}>
          {/* CSS animation, not Motion: the headline paints at once, without waiting for any JavaScript. */}
          <div className="hero-rise">
            <Eyebrow className="page-eyebrow text-forest">Specialty coffee · Panaji</Eyebrow>
            <h1 id="hero-title" className="text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl">
              <SplitText text="Coffee first." step={35} />
              <span className="block text-forest">
                <SplitText text="Then game on?" delay={420} step={35} />
              </span>
            </h1>
            <p className="page-intro mt-6 max-w-lg text-lg text-forest">
              A sunny corner for slow mornings, good beans and long conversations. Stay a while, there is more here than
              coffee.
            </p>
            <div className="page-intro mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <LinkButton to="/book" size="lg" className="group">
                  <DieIcon className="transition-transform duration-500 group-hover:rotate-[200deg]" />
                  Book a table
                </LinkButton>
              </Magnetic>
              <Magnetic>
                <LinkButton to="/menu" variant="secondary" size="lg">
                  See the menu
                </LinkButton>
              </Magnetic>
            </div>
          </div>
        </m.div>

        <div className="hero-fade relative mx-auto w-full max-w-md lg:max-w-none">
          {/* The moon rises behind the cup as you scroll. */}
          <m.div
            aria-hidden="true"
            style={{ y: moonY, x: moonX, scale: moonScale }}
            className="moon-glow absolute -left-6 top-0 size-40 rounded-full bg-[#e9b949] sm:size-56"
          >
            <span className="absolute left-[22%] top-[30%] size-[18%] rounded-full bg-black/8" />
            <span className="absolute left-[55%] top-[55%] size-[12%] rounded-full bg-black/8" />
            <span className="absolute left-[60%] top-[22%] size-[8%] rounded-full bg-black/8" />
          </m.div>
          <m.div style={{ y: imgY, rotate: imgRotate, scale: imgScale }} className="relative">
            <Tilt max={8} glare={false}>
              <HeroImage />
            </Tilt>
          </m.div>
        </div>
      </div>

      {/* Two ribbons crossing at the bottom of the hero. */}
      <m.div style={{ x: ribbonX }} className="relative -ml-[5%] mb-8 mt-4 w-[125%]">
        <Marquee items={RIBBON} reverse className="rotate-[2deg] bg-sage text-forest-dark" />
        <Marquee items={RIBBON} className="-mt-16 -rotate-[1.5deg] bg-forest-dark text-cream shadow-lift" />
      </m.div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />

      {/* Quick café intro */}
      <Section tone="sage" wave labelledBy="intro-title">
        <div className="grid gap-8 md:grid-cols-3">
          <Reveal variant="left" className="md:col-span-1">
            <h2 id="intro-title" className="text-3xl sm:text-4xl">
              Slow coffee, warm corners
            </h2>
          </Reveal>
          {[
            { icon: <CupIcon className="size-6" />, title: 'Small-batch beans', text: 'Roasted in Goa and brewed with care, from espresso to cold brew.' },
            { icon: <ClockIcon className="size-6" />, title: 'No rush, ever', text: 'Stay for one cup or the whole afternoon. Nobody will hurry you out.' },
          ].map((item, i) => (
            <Reveal key={item.title} delay={0.12 * (i + 1)} variant="zoom">
              <div className="flex gap-4">
                <m.span
                  className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card text-forest-dark"
                  initial={{ rotate: -90, scale: 0 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 + 0.12 * i }}
                >
                  {item.icon}
                </m.span>
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
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Eyebrow className="text-forest">Psst. Look behind the counter.</Eyebrow>
          <h2 id="reveal-title" className="text-4xl sm:text-5xl">
            There's a whole <span className="wiggle-word inline-block text-cta">shelf of games</span> back here
          </h2>
          <p className="mt-4 text-lg text-forest">
            Over a hundred board games, from quick party rounds to slow strategy evenings. Ask us for a recommendation, or
            let the quiz pick one for you.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularGames.map((g, i) => (
            <Reveal key={g.name} delay={0.1 * i} variant="flip" className="h-full">
              <GameCard game={g} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <LinkButton to="/games#quiz" size="lg">
              Find my game
            </LinkButton>
          </Magnetic>
          <LinkButton to="/games" variant="secondary" size="lg">
            Browse the library
          </LinkButton>
        </Reveal>
      </Section>

      {/* Signature drinks */}
      <Section tone="sage" wave labelledBy="drinks-title">
        <Reveal variant="left" className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>From the bar</Eyebrow>
            <h2 id="drinks-title" className="text-4xl">
              Signature drinks
            </h2>
          </div>
          <Link to="/menu" className="link-draw font-semibold">
            Full menu
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {signatureDrinks.map((d, i) => (
            <Reveal key={d.name} delay={0.12 * i} variant="tilt" className="h-full">
              <Tilt className="h-full rounded-card">
              <Card className="group flex h-full flex-col" data-cursor="Sip">
                <div className="overflow-hidden rounded-2xl">
                  <Photo src={d.image} alt={d.name} width={512} height={384} className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2" />
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
              </Tilt>
            </Reveal>
          ))}
        </div>
        <Reveal variant="zoom">
          <TodaysSpecial />
        </Reveal>
      </Section>

      {/* A peek inside */}
      <Section tone="cream" wave labelledBy="inside-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal variant="left">
            <figure>
              <Parallax speed={0.08} zoom className="aspect-[16/9] w-full rounded-card shadow-soft">
                <Photo {...PHOTOS.interior} className="size-full" />
              </Parallax>
              <figcaption className="mt-3 text-sm text-forest">Long tables for big games, small ones for two, and a sofa corner for the slow afternoons.</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.1} variant="right">
            <Eyebrow className="text-forest">A peek inside</Eyebrow>
            <h2 id="inside-title" className="text-4xl">
              Big windows, green chairs, a lot of games
            </h2>
            <p className="mt-4 text-lg text-forest">
              Sunlight in the morning, warm lamps at night. Plants everywhere, a coffee bar in the middle, and a shelf of more than a hundred games
              along the back wall.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Reveal delay={0.25} variant="zoom">
                <Photo {...PHOTOS.croissant} className="aspect-square w-full -rotate-3 rounded-2xl shadow-soft transition-transform duration-500 hover:rotate-0 hover:scale-105" />
              </Reveal>
              <Reveal delay={0.4} variant="zoom">
                <Photo {...PHOTOS.focaccia} className="aspect-square w-full rotate-3 rounded-2xl shadow-soft transition-transform duration-500 hover:rotate-0 hover:scale-105" />
              </Reveal>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* How a visit works */}
      <Section tone="sage" wave labelledBy="how-title">
        <Reveal className="max-w-2xl">
          <Eyebrow>First time?</Eyebrow>
          <h2 id="how-title" className="text-4xl">
            How a visit works
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {visitSteps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={0.15 * i} variant="flip" className="h-full">
                <Card className="flex h-full flex-col transition-transform duration-300 hover:-translate-y-2">
                  <div className="flex items-center gap-3">
                    <m.span
                      className="grid size-11 place-items-center rounded-full bg-forest-dark font-display text-lg font-semibold text-cream"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 + 0.15 * i }}
                    >
                      {i + 1}
                    </m.span>
                    <span className="text-forest-dark">
                      {step.icon === 'cup' ? <CupIcon className="size-7" /> : step.icon === 'die' ? <DieIcon className="size-7" /> : <ClockIcon className="size-7" />}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl">{step.title}</h3>
                  <p className="mt-2 text-forest">{step.text}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal className="mt-10 flex flex-wrap gap-3">
          <Magnetic>
            <LinkButton to="/book" size="lg">
              Book a table
            </LinkButton>
          </Magnetic>
          <LinkButton to="/about#faq" variant="secondary" size="lg">
            Questions? Read the FAQ
          </LinkButton>
        </Reveal>
      </Section>

      {/* Moon Club loyalty card */}
      <Section tone="cream" wave labelledBy="club-title">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal variant="left">
            <Eyebrow className="text-forest">The Moon Club</Eyebrow>
            <h2 id="club-title" className="text-4xl">
              Eight drinks, one full cycle
            </h2>
            <p className="mt-4 max-w-md text-lg text-forest">
              Every drink fills in the next phase of the moon. Complete the cycle and your next one is on us. No app, no sign-up: just ask
              for a stamp. Try it here, your card is saved on this device.
            </p>
          </Reveal>
          <Reveal delay={0.1} variant="flip">
            <LoyaltyCard />
          </Reveal>
        </div>
      </Section>

      {/* Overheard */}
      <Section tone="sage" wave labelledBy="overheard-title">
        <Reveal variant="blur">
          <Eyebrow>Overheard at Lunaa</Eyebrow>
          <h2 id="overheard-title" className="text-4xl">
            What the tables are saying
          </h2>
        </Reveal>
        <Overheard />
      </Section>

      {/* Hours and location */}
      <Section tone="cream" wave labelledBy="visit-title">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal variant="left">
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
          <Reveal delay={0.1} variant="zoom">
            <MiniMap />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
