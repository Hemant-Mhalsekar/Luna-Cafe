import { Link } from 'react-router';
import { CAFE, NAV_LINKS } from '../../lib/cafe';
import { MoonMark } from '../illustrations/Logo';
import { Wave } from '../ui/Wave';

export function Footer() {
  return (
    <footer className="mt-auto">
      <Wave className="-mb-px text-forest-dark" />
      <div className="bg-forest-dark text-cream">
        <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="twinkle-host">
            <div className="flex items-center gap-2.5">
              <MoonMark className="[&_circle:first-child]:text-cream/15" />
              <span className="font-display text-2xl font-semibold">Lunaa Café</span>
            </div>
            <p className="mt-3 max-w-xs text-cream/85">{CAFE.tagline}</p>
          </div>

          <div>
            <h2 className="text-lg">Explore</h2>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-cream/85 underline-offset-4 hover:text-cream hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/book" className="text-cream/85 underline-offset-4 hover:text-cream hover:underline">
                  Book a table
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg">Hours</h2>
            <ul className="mt-3 space-y-2 text-cream/85">
              {CAFE.hours.map((h) => (
                <li key={h.days}>
                  <span className="block font-semibold text-cream">{h.days}</span>
                  {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg">Find us</h2>
            <address className="mt-3 not-italic text-cream/85">
              {CAFE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a href={`mailto:${CAFE.email}`} className="mt-2 block underline-offset-4 hover:text-cream hover:underline">
                {CAFE.email}
              </a>
            </address>
          </div>
        </div>
        <div className="border-t border-cream/15">
          <p className="container-page py-5 text-sm text-cream/75">
            Portfolio project, fictional café. Game names belong to their owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
