import { ResourceManager, Availability, Checkbox, CheckboxGroup } from './shared';
import type { AdminGame } from './api';
import { Field, SelectField, TextAreaField } from '../components/ui/Field';
import { Tag } from '../components/ui/Tag';
import { DIFFICULTY_LABEL, type Accent, type GameMood, type GameType } from '../lib/types';

const TYPES: GameType[] = ['party', 'strategy', 'cooperative', 'word', 'dexterity'];
const MOODS: GameMood[] = ['chill', 'competitive', 'silly', 'brainy'];
const ACCENTS: Accent[] = ['blue', 'terracotta', 'mustard', 'lavender'];

interface GameForm {
  name: string;
  slug: string;
  type: GameType;
  minPlayers: string;
  maxPlayers: string;
  playTimeMinutes: string;
  difficulty: string;
  moods: GameMood[];
  description: string;
  rulesSummary: string;
  accent: Accent;
  isInvented: boolean;
  isAvailable: boolean;
}

const EMPTY: GameForm = {
  name: '', slug: '', type: 'party', minPlayers: '2', maxPlayers: '4', playTimeMinutes: '30', difficulty: '1',
  moods: [], description: '', rulesSummary: '', accent: 'mustard', isInvented: false, isAvailable: true,
};

export function GamesAdmin() {
  return (
    <ResourceManager<AdminGame, GameForm>
      resource="games"
      title="Games"
      singular="game"
      itemName={(g) => g.name}
      empty={EMPTY}
      toForm={(g) => ({
        ...g,
        minPlayers: String(g.minPlayers),
        maxPlayers: String(g.maxPlayers),
        playTimeMinutes: String(g.playTimeMinutes),
        difficulty: String(g.difficulty),
      })}
      toBody={(f) => ({
        ...f,
        minPlayers: Number(f.minPlayers),
        maxPlayers: Number(f.maxPlayers),
        playTimeMinutes: Number(f.playTimeMinutes),
        difficulty: Number(f.difficulty),
      })}
      columns={[
        { label: 'Name', render: (g) => <span className="font-semibold">{g.name}</span> },
        { label: 'Type', render: (g) => <Tag tone={g.accent} className="capitalize">{g.type}</Tag> },
        { label: 'Players', render: (g) => `${g.minPlayers}–${g.maxPlayers}` },
        { label: 'Time', render: (g) => `${g.playTimeMinutes} min` },
        { label: 'Level', render: (g) => DIFFICULTY_LABEL[g.difficulty] },
        { label: 'Status', render: (g) => <Availability on={g.isAvailable} /> },
      ]}
      renderForm={(f, set, e) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" value={f.name} onChange={(ev) => set({ name: ev.target.value })} error={e.name} required />
            <Field label="Slug (optional)" value={f.slug} onChange={(ev) => set({ slug: ev.target.value })} error={e.slug} hint="Made from the name if left empty." />
            <SelectField label="Type" value={f.type} onChange={(ev) => set({ type: ev.target.value as GameType })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </SelectField>
            <SelectField label="Card colour" value={f.accent} onChange={(ev) => set({ accent: ev.target.value as Accent })}>
              {ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </SelectField>
          </div>
          <div className="grid gap-5 sm:grid-cols-4">
            <Field label="Min players" type="number" min={1} max={20} value={f.minPlayers} onChange={(ev) => set({ minPlayers: ev.target.value })} error={e.minPlayers} />
            <Field label="Max players" type="number" min={1} max={20} value={f.maxPlayers} onChange={(ev) => set({ maxPlayers: ev.target.value })} error={e.maxPlayers} />
            <Field label="Minutes" type="number" min={5} max={300} value={f.playTimeMinutes} onChange={(ev) => set({ playTimeMinutes: ev.target.value })} error={e.playTimeMinutes} />
            <SelectField label="Difficulty" value={f.difficulty} onChange={(ev) => set({ difficulty: ev.target.value })}>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Tricky</option>
            </SelectField>
          </div>
          <CheckboxGroup legend="Moods (used by the quiz)" options={MOODS} value={f.moods} onChange={(moods) => set({ moods })} error={e.moods} />
          <TextAreaField label="Short description" value={f.description} onChange={(ev) => set({ description: ev.target.value })} error={e.description} maxLength={400} className="[&_textarea]:min-h-20" />
          <TextAreaField label="Rules summary" value={f.rulesSummary} onChange={(ev) => set({ rulesSummary: ev.target.value })} error={e.rulesSummary} maxLength={1200} />
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Available on the shelf" checked={f.isAvailable} onChange={(isAvailable) => set({ isAvailable })} />
            <Checkbox label="Luna original (invented game)" checked={f.isInvented} onChange={(isInvented) => set({ isInvented })} />
          </div>
        </>
      )}
    />
  );
}
