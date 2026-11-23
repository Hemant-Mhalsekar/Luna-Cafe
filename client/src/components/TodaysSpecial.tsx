import { Link } from 'react-router';
import { useSpecial } from '../lib/queries';
import { CATEGORY_LABEL } from '../lib/types';
import { MenuIcon } from './illustrations/MenuIcons';

/** Banner with today's special from the API. Renders nothing until it loads, so the page never waits on it. */
export function TodaysSpecial() {
  const special = useSpecial();
  const item = special.data?.item;
  if (!item) return null;
  return (
    <div className="mt-8 flex flex-col gap-5 rounded-card bg-forest-dark p-6 text-cream sm:flex-row sm:items-center">
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-cream/10">
        <MenuIcon category={item.category} className="size-9" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cream/75">Today's special · {CATEGORY_LABEL[item.category]}</p>
        <p className="mt-1 font-display text-2xl font-semibold">
          {item.name} <span className="font-mono text-lg font-normal text-cream/85">₹{item.price}</span>
        </p>
        <p className="mt-1 text-cream/85">{special.data?.note ?? item.description}</p>
      </div>
      <Link to={`/menu?category=${item.category}`} className="self-start rounded-full border-2 border-cream px-5 py-2.5 font-semibold transition-colors hover:bg-cream hover:text-forest-dark sm:self-center">
        See the menu
      </Link>
    </div>
  );
}
