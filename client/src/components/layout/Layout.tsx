import { Outlet, ScrollRestoration } from 'react-router';
import { MotionConfig } from 'motion/react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    // reducedMotion="user" turns off transform animations when the OS asks for less motion.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest-dark focus:px-5 focus:py-3 focus:text-cream"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </MotionConfig>
  );
}
