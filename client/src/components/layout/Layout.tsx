import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { LazyMotion, MotionConfig } from 'motion/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ServerWakeBanner } from './ServerWakeBanner';
import { PageLoader } from './PageLoader';

const loadMotionFeatures = () => import('../../lib/motionFeatures').then((mod) => mod.default);

export function Layout() {
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
              <Outlet />
            </Suspense>
          </main>
          <Footer />
        </div>
        <ScrollRestoration />
      </MotionConfig>
    </LazyMotion>
  );
}
