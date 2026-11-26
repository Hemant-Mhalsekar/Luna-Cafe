import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import * as m from 'motion/react-m';
import { AnimatePresence, useMotionValueEvent, useScroll } from 'motion/react';
import { ScrollProgress } from '../fx/ScrollProgress';
import { Magnetic } from '../fx/Magnetic';
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

// Desktop nav: the dark pill slides from link to link, and a soft one follows the mouse.
const deskLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('relative isolate rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors duration-300', isActive ? 'text-cream' : 'text-forest-dark');

export function Header() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // Tuck the header away while scrolling down, bring it back as soon as you scroll up.
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 240 && y > prev && !open);
    setScrolled(y > 12);
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <m.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      className={cn(
        'sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 supports-[backdrop-filter]:backdrop-blur-md',
        scrolled ? 'border-outline/50 bg-cream/85 shadow-soft' : 'border-transparent bg-cream/95',
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link to="/" aria-label="Lunaa Café home" className="group rounded-xl">
          <Logo className="[&_svg]:transition-transform [&_svg]:duration-700 group-hover:[&_svg]:rotate-[360deg]" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex" onPointerLeave={() => setHovered(null)}>
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={deskLinkClass} onPointerEnter={() => setHovered(l.to)}>
              {({ isActive }) => (
                <>
                  <AnimatePresence>
                    {hovered === l.to && !isActive && (
                      <m.span
                        layoutId="nav-hover"
                        className="absolute inset-0 -z-10 rounded-full bg-forest-dark/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <m.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-forest-dark" transition={{ type: 'spring', stiffness: 380, damping: 28 }} />
                  )}
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic className="max-sm:hidden">
            <LinkButton to="/book" className="group">
              <DieIcon className="transition-transform duration-500 group-hover:rotate-[200deg]" />
              Book a table
            </LinkButton>
          </Magnetic>
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

      <AnimatePresence>
      {open && (
        <m.nav
          id="mobile-nav"
          aria-label="Main"
          className="overflow-hidden border-t border-outline/50 bg-cream lg:hidden"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        >
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l, i) => (
              <m.li key={l.to} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300, damping: 24 }}>
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(navLinkClass({ isActive }), 'block py-3 text-lg')}
                >
                  {l.label}
                </NavLink>
              </m.li>
            ))}
            <li className="pt-2 sm:hidden">
              <LinkButton to="/book" className="w-full" size="lg" onClick={() => setOpen(false)}>
                <DieIcon /> Book a table
              </LinkButton>
            </li>
          </ul>
        </m.nav>
      )}
      </AnimatePresence>
      <ScrollProgress />
    </m.header>
  );
}
