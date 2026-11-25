import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { isSessionExpired, useLogout, useMe } from './api';
import { MoonMark } from '../components/illustrations/Logo';
import { PageLoader } from '../components/layout/PageLoader';
import { cn } from '../lib/cn';

const LINKS = [
  { to: '/admin', label: 'Today', end: true },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/games', label: 'Games' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/account', label: 'Account' },
];

/** Admin shell: checks the session, then shows a sidebar (top bar on phones) and the page. */
export function AdminLayout() {
  const me = useMe();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  // If any admin request comes back 401 (session expired), go to the sign-in page.
  useEffect(() => {
    return qc.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.queryKey[0] === 'admin' && isSessionExpired(event.query.state.error)) {
        qc.setQueryData(['admin', 'me'], null);
      }
    });
  }, [qc]);

  if (me.isPending) return <PageLoader />;
  if (!me.data) {
    if (me.isError && !isSessionExpired(me.error)) {
      return (
        <div className="container-page py-24 text-center">
          <p className="text-lg">The café's server isn't answering yet. It may be waking up.</p>
          <button type="button" className="mt-4 font-semibold underline" onClick={() => me.refetch()}>
            Try again
          </button>
        </div>
      );
    }
    return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const signOut = () => logout.mutate(undefined, { onSettled: () => navigate('/admin/login', { replace: true }) });

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[15rem_1fr]">
      <title>Admin · Luna Café</title>
      <meta name="robots" content="noindex, nofollow" />
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest-dark focus:px-5 focus:py-3 focus:text-cream">
        Skip to content
      </a>

      <aside className="bg-forest-dark text-cream lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Link to="/admin" className="twinkle-host flex items-center gap-2.5 rounded-xl">
            <MoonMark className="[&_circle:first-child]:text-cream/15" />
            <span className="font-display text-xl font-semibold">Luna admin</span>
          </Link>
          <button
            type="button"
            className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-cream/10 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav id="admin-nav" aria-label="Admin" className={cn('px-3 pb-4 lg:block lg:flex-1', menuOpen ? 'block' : 'hidden')}>
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn('block rounded-full px-4 py-2.5 font-medium transition-colors', isActive ? 'bg-cream text-forest-dark' : 'text-cream/90 hover:bg-cream/10')
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={cn('border-t border-cream/15 px-5 py-4 text-sm lg:block', menuOpen ? 'block' : 'hidden')}>
          <p className="truncate text-cream/80">{me.data.email}</p>
          <div className="mt-2 flex gap-4">
            <button type="button" onClick={signOut} className="font-semibold underline-offset-4 hover:underline">
              Sign out
            </button>
            <Link to="/" className="text-cream/80 underline-offset-4 hover:underline">
              View site
            </Link>
          </div>
        </div>
      </aside>

      <main id="admin-main" tabIndex={-1} className="min-w-0 px-5 py-8 focus:outline-none sm:px-8 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
