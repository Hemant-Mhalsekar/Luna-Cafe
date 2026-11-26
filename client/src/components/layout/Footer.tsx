import { Link } from 'react-router';
import { CAFE, NAV_LINKS } from '../../lib/cafe';
import { MoonMark } from '../illustrations/Logo';
import { Wave } from '../ui/Wave';
import { Marquee } from '../fx/Marquee';

export function Footer() {
  return (
    <footer className="mt-auto">
      <Wave className="-mb-px text-forest-dark" />
      <div className="overflow-hidden bg-forest-dark text-cream">
        <Marquee items={['Coffee first', 'Then game on?', 'Book a table', 'Lunaa Café']} className="border-b border-cream/15 text-sage" />
        <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="twinkle-host">
            <div className="flex items-center gap-2.5">
              <MoonMark className="transition-transform duration-1000 hover:rotate-[360deg] hover:scale-125 [&_circle:first-child]:text-cream/15" />
              <span className="font-display text-2xl font-semibold">Lunaa Café</span>
            </div>
            <p className="mt-3 max-w-xs text-cream/85">{CAFE.tagline}</p>
          </div>

          <div>
            <h2 className="text-lg">Explore</h2>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="link-draw text-cream/85 transition-[color,padding] duration-300 hover:pl-2 hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/book" className="link-draw text-cream/85 transition-[color,padding] duration-300 hover:pl-2 hover:text-cream">
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
              <a href={`mailto:${CAFE.email}`} className="link-draw mt-2 inline-block hover:text-cream">
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
