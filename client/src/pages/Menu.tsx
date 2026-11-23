import { useMemo, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { LoadError, SkeletonGrid } from '../components/QueryState';
import { Chip } from '../components/ui/Chip';
import { Tag } from '../components/ui/Tag';
import { Modal } from '../components/ui/Modal';
import { LinkButton } from '../components/ui/Button';
import { MenuIcon } from '../components/illustrations/MenuIcons';
import { useMenu } from '../lib/queries';
import { cn } from '../lib/cn';
import { CATEGORY_LABEL, DIETARY_LABEL, type DietaryTag, type MenuCategory, type MenuItem } from '../lib/types';

const CATEGORIES = Object.keys(CATEGORY_LABEL) as MenuCategory[];
const DIETARY = Object.keys(DIETARY_LABEL) as DietaryTag[];

export function Menu() {
  const menu = useMenu();
  const [params, setParams] = useSearchParams();
  const category = (CATEGORIES.find((c) => c === params.get('category')) ?? 'coffee') as MenuCategory;
  const [dietary, setDietary] = useState<DietaryTag[]>([]);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const setCategory = (c: MenuCategory) => setParams({ category: c }, { replace: true, preventScrollReset: true });

  const items = useMemo(
    () =>
      (menu.data ?? []).filter((i) => i.category === category && dietary.every((d) => i.dietaryTags.includes(d))),
    [menu.data, category, dietary],
  );

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = CATEGORIES.indexOf(category);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const c = CATEGORIES[(next + CATEGORIES.length) % CATEGORIES.length]!;
    setCategory(c);
    document.getElementById(`tab-${c}`)?.focus();
  };

  return (
    <>
      <PageHeader eyebrow="Menu" title="Coffee, tea and things to share">
        <p>Made for long game nights. Prices include taxes. Vegan and gluten-free options are marked.</p>
      </PageHeader>

      <div className="container-page pb-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Menu categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                id={`tab-${c}`}
                role="tab"
                type="button"
                aria-selected={c === category}
                aria-controls="menu-panel"
                tabIndex={c === category ? 0 : -1}
                onClick={() => setCategory(c)}
                onKeyDown={onTabKey}
                className={cn(
                  'shrink-0 rounded-full px-5 py-2.5 font-semibold transition-colors',
                  c === category ? 'bg-forest-dark text-cream' : 'bg-card text-forest-dark hover:bg-sage-soft',
                )}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Dietary filters">
            <span className="text-sm font-semibold">Only show:</span>
            {DIETARY.map((d) => (
              <Chip
                key={d}
                pressed={dietary.includes(d)}
                onClick={() => setDietary((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))}
              >
                {DIETARY_LABEL[d]}
              </Chip>
            ))}
          </div>
        </div>

        <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${category}`} className="mt-8">
          {menu.isPending && <SkeletonGrid count={4} className="grid gap-5 sm:grid-cols-2" item={<div className="h-36 rounded-card bg-cream-deep" />} />}
          {menu.isError && <LoadError what="menu" onRetry={() => menu.refetch()} />}
          {menu.data && items.length === 0 && (
            <p className="rounded-card bg-card p-6 text-forest">Nothing here matches those filters yet. Try another category.</p>
          )}
          {items.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="group flex h-full w-full gap-5 rounded-card border border-outline/60 bg-card p-5 text-left shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-sage-soft text-forest-dark sm:size-24">
                      <MenuIcon category={item.category} className="size-10 sm:size-12" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-display text-xl font-semibold leading-tight">{item.name}</span>
                        <span className="font-mono text-forest">₹{item.price}</span>
                      </span>
                      <span className="mt-1.5 line-clamp-2 text-forest">{item.description}</span>
                      <span className="mt-auto flex flex-wrap gap-2 pt-3">
                        {item.isSignature && <Tag tone="mustard">Signature</Tag>}
                        {item.dietaryTags.map((t) => (
                          <Tag key={t}>{DIETARY_LABEL[t]}</Tag>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div>
            <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-sage-soft text-forest-dark">
              <MenuIcon category={selected.category} className="size-20" />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="font-mono text-lg text-forest">₹{selected.price}</span>
              <div className="flex flex-wrap gap-2">
                {selected.isSignature && <Tag tone="mustard">Signature</Tag>}
                {selected.dietaryTags.map((t) => (
                  <Tag key={t}>{DIETARY_LABEL[t]}</Tag>
                ))}
              </div>
            </div>
            <p className="mt-4 text-lg">{selected.description}</p>
            <p className="mt-6 text-sm text-forest">Order at the counter, or tell us when you book and we'll have it ready.</p>
            <LinkButton to="/book" className="mt-4">
              Book a table
            </LinkButton>
          </div>
        )}
      </Modal>
    </>
  );
}
