import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { NAV_LINKS } from '../../lib/cafe';
import { cn } from '../../lib/cn';
import { Logo } from '../illustrations/Logo';
import { LinkButton } from '../ui/Button';
import { DieIcon } from '../illustrations/GameIcons';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors',
    isActive ? 'bg-forest-dark text-cream' : 'text-forest-dark hover:bg-forest-dark/8',
  );

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-outline/50 bg-cream/95 supports-[backdrop-filter]:bg-cream/90">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link to="/" aria-label="Luna Café home" className="rounded-xl">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LinkButton to="/book" className="group hidden sm:inline-flex">
            <DieIcon className="transition-transform duration-500 group-hover:rotate-[200deg]" />
            Book a table
          </LinkButton>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-forest-dark hover:bg-forest-dark/8 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-outline/50 bg-cream lg:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(navLinkClass({ isActive }), 'block py-3 text-lg')}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <LinkButton to="/book" className="w-full" size="lg" onClick={() => setOpen(false)}>
                <DieIcon /> Book a table
              </LinkButton>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
