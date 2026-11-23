import { MoonMark } from '../illustrations/Logo';

/** Shown while a page's code is loading. Kept quiet: most loads take a fraction of a second. */
export function PageLoader() {
  return (
    <div className="container-page grid min-h-[50vh] place-items-center" role="status">
      <div className="twinkle-host flex flex-col items-center gap-3 text-forest motion-safe:animate-pulse">
        <MoonMark className="size-12" />
        <span className="text-sm font-medium">Brewing…</span>
      </div>
    </div>
  );
}
