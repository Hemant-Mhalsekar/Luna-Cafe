import { Suspense, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import * as m from 'motion/react-m';
import { LazyMotion, MotionConfig } from 'motion/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ServerWakeBanner } from './ServerWakeBanner';
import { PageLoader } from './PageLoader';

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
              {/* Gentle fade-up on every page change. */}
              <m.div key={pathname} initial={pathname === landingPath ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}>
                <Outlet />
              </m.div>
            </Suspense>
          </main>
          <Footer />
        </div>
        <ScrollRestoration />
      </MotionConfig>
    </LazyMotion>
  );
}
