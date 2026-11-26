import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { GameCard } from '../components/GameCard';
import { LoadError, SkeletonGrid } from '../components/QueryState';
import { Chip } from '../components/ui/Chip';
import { Field, SelectField } from '../components/ui/Field';
import { Button, LinkButton } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Tag } from '../components/ui/Tag';
import { Card } from '../components/ui/Card';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useGames } from '../lib/queries';
import { GameQuiz } from '../components/GameQuiz';
import { DIFFICULTY_LABEL, type Game, type GameMood, type GameType } from '../lib/types';

const TYPES: GameType[] = ['party', 'strategy', 'cooperative', 'word', 'dexterity'];
const MOODS: GameMood[] = ['chill', 'competitive', 'silly', 'brainy'];
const TIMES = [
  { id: 'quick', label: 'Under 30 min', test: (m: number) => m < 30 },
  { id: 'medium', label: '30–60 min', test: (m: number) => m >= 30 && m <= 60 },
  { id: 'long', label: 'Over an hour', test: (m: number) => m > 60 },
] as const;

/** Filters live in the URL (?players=4&time=quick), so a filtered list can be shared. */
function useFilters() {
  const [params, setParams] = useSearchParams();
  const get = (key: string) => params.get(key) ?? '';
  const set = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  return {
    q: get('q'),
    players: get('players'),
    time: get('time'),
    type: get('type'),
    mood: get('mood'),
    set,
    clear: () => setParams({}, { replace: true, preventScrollReset: true }),
    active: ['q', 'players', 'time', 'type', 'mood'].some((k) => params.has(k)),
  };
}

export function Games() {
  const games = useGames();
  const f = useFilters();
  const [selected, setSelected] = useState<Game | null>(null);

  const results = useMemo(() => {
    const list = games.data ?? [];
    const q = f.q.trim().toLowerCase();
    const n = Number(f.players);
    const time = TIMES.find((t) => t.id === f.time);
    return list.filter(
      (g) =>
        (!q || g.name.toLowerCase().includes(q)) &&
        (!n || (g.minPlayers <= n && g.maxPlayers >= n)) &&
        (!time || time.test(g.playTimeMinutes)) &&
        (!f.type || g.type === f.type) &&
        (!f.mood || g.moods.includes(f.mood as GameMood)),
    );
  }, [games.data, f.q, f.players, f.time, f.type, f.mood]);

  return (
    <>
      <PageHeader eyebrow="The game shelf" title="Find your next favourite game">
        <p>Filter by players, time and mood, or ask the barista. Every game here can be played at your table.</p>
      </PageHeader>

      <div className="container-page grid gap-8 pb-20 lg:grid-cols-[18rem_1fr]">
        <div className="lg:col-span-2">
          <GameQuiz games={games.data ?? []} onSelect={setSelected} />
        </div>

        <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col gap-6">
            <Field
              label="Search by name"
              type="search"
              placeholder="e.g. Codenames"
              value={f.q}
              onChange={(e) => f.set('q', e.target.value)}
            />
            <SelectField label="How many players?" value={f.players} onChange={(e) => f.set('players', e.target.value)}>
              <option value="">Any number</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'player' : 'players'}
                </option>
              ))}
            </SelectField>
            <FilterGroup label="Play time">
              {TIMES.map((t) => (
                <Chip key={t.id} pressed={f.time === t.id} onClick={() => f.set('time', f.time === t.id ? '' : t.id)}>
                  {t.label}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Type">
              {TYPES.map((t) => (
                <Chip key={t} pressed={f.type === t} onClick={() => f.set('type', f.type === t ? '' : t)} className="capitalize">
                  {t}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Mood">
              {MOODS.map((m) => (
                <Chip key={m} pressed={f.mood === m} onClick={() => f.set('mood', f.mood === m ? '' : m)} className="capitalize">
                  {m}
                </Chip>
              ))}
            </FilterGroup>
            {f.active && (
              <Button variant="ghost" onClick={f.clear} className="self-start">
                Clear filters
              </Button>
            )}
          </Card>
        </aside>

        <section aria-labelledby="results-title">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 id="results-title" className="text-2xl">
              On the shelf
            </h2>
            {games.data && (
              <p className="text-sm text-forest" aria-live="polite">
                {results.length} of {games.data.length} games
              </p>
            )}
          </div>

          {games.isPending && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" />}
          {games.isError && <LoadError what="games" onRetry={() => games.refetch()} />}

          {games.data && results.length === 0 && (
            <Card className="text-center">
              <h3 className="text-xl">No games match those filters</h3>
              <p className="mt-2 text-forest">Try fewer filters, or ask us at the counter. We love a challenge.</p>
              <Button variant="secondary" onClick={f.clear} className="mt-5">
                Clear filters
              </Button>
            </Card>
          )}

          {results.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
              {results.map((g, i) => (
                <m.li
                  key={g._id}
                  layout
                  initial={{ opacity: 0, scale: 0.6, rotate: i % 2 ? 8 : -8, y: 60 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: i % 2 ? -10 : 10 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22, delay: Math.min(i, 12) * 0.04 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(g)}
                    className="block h-full w-full rounded-card text-left"
                    aria-label={`${g.name}: see details`}
                  >
                    <GameCard game={g} />
                  </button>
                </m.li>
              ))}
              </AnimatePresence>
            </ul>
          )}

        </section>
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && <GameDetails game={selected} />}
      </Modal>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-forest-dark">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function GameDetails({ game }: { game: Game }) {
  const players = game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}–${game.maxPlayers}`;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Tag tone={game.accent} className="capitalize">
          {game.type}
        </Tag>
        <Tag>{players} players</Tag>
        <Tag>{game.playTimeMinutes} min</Tag>
        <Tag>{DIFFICULTY_LABEL[game.difficulty]}</Tag>
        {game.isInvented && <Tag tone="lavender">Lunaa original</Tag>}
      </div>
      <p className="mt-5 text-lg text-forest-dark">{game.description}</p>
      <h3 className="mt-6 text-lg">How to play</h3>
      <p className="mt-1 text-forest">{game.rulesSummary}</p>
      <LinkButton to={`/book?game=${game.slug}`} className="mt-7" size="lg">
        Book a table with this game
      </LinkButton>
    </div>
  );
}
