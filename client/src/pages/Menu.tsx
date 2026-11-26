import { useMemo, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { LoadError, SkeletonGrid } from '../components/QueryState';
import { Chip } from '../components/ui/Chip';
import { Tag } from '../components/ui/Tag';
import { Modal } from '../components/ui/Modal';
import { LinkButton } from '../components/ui/Button';
import { MenuIcon } from '../components/illustrations/MenuIcons';
import { Photo } from '../components/Photo';
import * as m from 'motion/react-m';
import { Tilt } from '../components/fx/Tilt';
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
      (menu.data ?? [])
        .filter((i) => i.category === category && dietary.every((d) => i.dietaryTags.includes(d)))
        .sort((a, b) => Number(b.isSignature) - Number(a.isSignature) || a.name.localeCompare(b.name)),
    [menu.data, category, dietary],
  );
  // Photographed items get big cards; the rest a compact list underneath.
  const featured = items.filter((i) => i.image);
  const others = items.filter((i) => !i.image);

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
          {menu.isPending && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" item={<div className="h-80 rounded-card bg-cream-deep" />} />}
          {menu.isError && <LoadError what="menu" onRetry={() => menu.refetch()} />}
          {menu.data && items.length === 0 && (
            <p className="rounded-card bg-card p-6 text-forest">Nothing here matches those filters yet. Try another category.</p>
          )}
          {featured.length > 0 && (
            <ul key={`f-${category}-${dietary.join()}`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, i) => (
                <m.li
                  key={item._id}
                  initial={{ opacity: 0, y: 60, rotate: i % 2 ? 4 : -4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.08 }}
                >
                  <Tilt className="h-full rounded-card">
                  <button
                    data-cursor="Taste"
                    type="button"
                    onClick={() => setSelected(item)}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-outline/60 bg-card text-left shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <Photo
                      src={item.image!}
                      alt=""
                      width={512}
                      height={384}
                      className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="flex flex-1 flex-col p-5">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-display text-xl font-semibold leading-tight">{item.name}</span>
                        <span className="font-mono text-forest">₹{item.price}</span>
                      </span>
                      <span className="mt-1.5 line-clamp-2 text-forest">{item.description}</span>
                      <span className="mt-auto flex flex-wrap gap-2 pt-4">
                        {item.isSignature && <Tag tone="mustard">Signature</Tag>}
                        {item.dietaryTags.map((t) => (
                          <Tag key={t}>{DIETARY_LABEL[t]}</Tag>
                        ))}
                      </span>
                    </span>
                  </button>
                  </Tilt>
                </m.li>
              ))}
            </ul>
          )}

          {/* Items without a photo yet: a compact list, so there are no big empty picture boxes. */}
          {others.length > 0 && (
            <section aria-labelledby="more-title" className={featured.length > 0 ? 'mt-12' : undefined}>
              {featured.length > 0 && (
                <h2 id="more-title" className="mb-4 text-2xl">
                  More {CATEGORY_LABEL[category].toLowerCase()}
                </h2>
              )}
              <ul key={`o-${category}-${dietary.join()}`} className="grid gap-3 md:grid-cols-2">
                {others.map((item, i) => (
                  <m.li
                    key={item._id}
                    initial={{ opacity: 0, x: i % 2 ? 60 : -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.1 + i * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="group flex h-full w-full items-center gap-4 rounded-2xl border border-outline/60 bg-card px-4 py-3.5 text-left transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-forest-dark hover:shadow-lift"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sage-soft text-forest-dark transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:bg-sage">
                        <MenuIcon category={item.category} className="size-7" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-lg font-semibold leading-tight">{item.name}</span>
                          <span className="shrink-0 font-mono text-forest">₹{item.price}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-forest">{item.description}</span>
                        {(item.isSignature || item.dietaryTags.length > 0) && (
                          <span className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.isSignature && <Tag tone="mustard">Signature</Tag>}
                            {item.dietaryTags.map((t) => (
                              <Tag key={t}>{DIETARY_LABEL[t]}</Tag>
                            ))}
                          </span>
                        )}
                      </span>
                    </button>
                  </m.li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div>
            {selected.image ? (
              <Photo src={selected.image} alt={selected.name} width={512} height={288} priority className="aspect-[16/9] w-full rounded-2xl" />
            ) : (
              <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-sage-soft text-forest-dark">
                <MenuIcon category={selected.category} className="size-20" />
              </div>
            )}
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
