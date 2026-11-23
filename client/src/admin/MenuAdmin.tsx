import { ResourceManager, Availability, Checkbox, CheckboxGroup } from './shared';
import type { AdminMenuItem } from './api';
import { Field, SelectField, TextAreaField } from '../components/ui/Field';
import { Tag } from '../components/ui/Tag';
import { CATEGORY_LABEL, DIETARY_LABEL, type DietaryTag, type MenuCategory } from '../lib/types';

const CATEGORIES = Object.keys(CATEGORY_LABEL) as MenuCategory[];
const DIETARY = Object.keys(DIETARY_LABEL) as DietaryTag[];

interface MenuForm {
  name: string;
  slug: string;
  category: MenuCategory;
  price: string;
  description: string;
  dietaryTags: DietaryTag[];
  isSignature: boolean;
  isAvailable: boolean;
}

const EMPTY: MenuForm = { name: '', slug: '', category: 'coffee', price: '', description: '', dietaryTags: [], isSignature: false, isAvailable: true };

export function MenuAdmin() {
  return (
    <ResourceManager<AdminMenuItem, MenuForm>
      resource="menu"
      title="Menu"
      singular="menu item"
      itemName={(m) => m.name}
      empty={EMPTY}
      toForm={(m) => ({ ...m, price: String(m.price) })}
      toBody={(f) => ({ ...f, price: Number(f.price) })}
      columns={[
        { label: 'Name', render: (m) => <span className="font-semibold">{m.name}</span> },
        { label: 'Category', render: (m) => CATEGORY_LABEL[m.category] },
        { label: 'Price', render: (m) => `₹${m.price}`, className: 'font-mono' },
        {
          label: 'Tags',
          render: (m) => (
            <span className="flex flex-wrap gap-1.5">
              {m.isSignature && <Tag tone="mustard">Signature</Tag>}
              {m.dietaryTags.map((t) => <Tag key={t}>{DIETARY_LABEL[t]}</Tag>)}
            </span>
          ),
        },
        { label: 'Status', render: (m) => <Availability on={m.isAvailable} /> },
      ]}
      renderForm={(f, set, e) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" value={f.name} onChange={(ev) => set({ name: ev.target.value })} error={e.name} required />
            <Field label="Slug (optional)" value={f.slug} onChange={(ev) => set({ slug: ev.target.value })} error={e.slug} hint="Made from the name if left empty." />
            <SelectField label="Category" value={f.category} onChange={(ev) => set({ category: ev.target.value as MenuCategory })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </SelectField>
            <Field label="Price (₹)" type="number" min={0} value={f.price} onChange={(ev) => set({ price: ev.target.value })} error={e.price} required />
          </div>
          <TextAreaField label="Description" value={f.description} onChange={(ev) => set({ description: ev.target.value })} error={e.description} maxLength={300} className="[&_textarea]:min-h-24" />
          <CheckboxGroup legend="Dietary" options={DIETARY} value={f.dietaryTags} onChange={(dietaryTags) => set({ dietaryTags })} />
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Available" checked={f.isAvailable} onChange={(isAvailable) => set({ isAvailable })} />
            <Checkbox label="Signature (shown on the home page)" checked={f.isSignature} onChange={(isSignature) => set({ isSignature })} />
          </div>
        </>
      )}
    />
  );
}
