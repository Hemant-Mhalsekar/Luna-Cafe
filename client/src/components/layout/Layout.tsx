import { Suspense, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import * as m from 'motion/react-m';
import { LazyMotion, MotionConfig } from 'motion/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ServerWakeBanner } from './ServerWakeBanner';
import { PageLoader } from './PageLoader';
import { Cursor } from '../fx/Cursor';
import { RouteSeo } from '../RouteSeo';
import { MoonMark } from '../illustrations/Logo';

const loadMotionFeatures = () => import('../../lib/motionFeatures').then((mod) => mod.default);

export function Layout() {
  const { pathname } = useLocation();
  // The page you land on shows immediately (no fade), so first paint never waits for the animation code.
  const [landingPath] = useState(pathname);
  return (
    // LazyMotion loads the animation engine after first paint; strict makes sure every component uses `m`.
    // reducedMotion="user" turns off transform animations when the OS asks for less motion.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest-dark focus:px-5 focus:py-3 focus:text-cream"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <ServerWakeBanner />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            <Suspense fallback={<PageLoader />}>
              {/* Every page change: the new page slides up out of a soft blur. */}
              <m.div
                key={pathname}
                initial={pathname === landingPath ? false : { opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.2, 0, 0, 1] }}
              >
                <Outlet />
              </m.div>
            </Suspense>
          </main>
          <Footer />
        </div>
        {/* Page change curtain: a forest-green moon iris closes over the old page and opens on the new one. */}
        {pathname !== landingPath && (
          <m.div
            key={`curtain-${pathname}`}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-forest-dark"
            initial={{ clipPath: 'circle(150% at 50% 50%)' }}
            animate={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
          >
            <m.span initial={{ scale: 1.4, rotate: -30 }} animate={{ scale: 0.4, rotate: 40 }} transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}>
              <MoonMark className="size-24 [&_circle:first-child]:text-forest-dark" />
            </m.span>
          </m.div>
        )}
        <RouteSeo />
        <Cursor />
        <ScrollRestoration />
      </MotionConfig>
    </LazyMotion>
  );
}
