import { Reveal } from './Reveal';
import { Card } from './ui/Card';

// Light-hearted lines from the (fictional) regulars. The footer notes the café is fictional.
const QUOTES = [
  { text: 'Came in for a flat white. Left four hours later as the Codenames champion of table six.', who: 'A regular, probably' },
  { text: "The barista taught us Azul in two minutes and didn't laugh when I lost. Twice.", who: 'Overheard by the window' },
  { text: 'Quiet enough to read in the morning, loud with laughter by night. Somehow both feel right.', who: 'Scribbled in the guest book' },
];

export function Overheard() {
  return (
    <ul className="mt-10 grid gap-5 md:grid-cols-3">
      {QUOTES.map((q, i) => (
        <li key={q.who}>
          <Reveal delay={0.12 * i} variant={(['left', 'up', 'right'] as const)[i % 3]} className="h-full">
            <Card className={`flex h-full flex-col transition-transform duration-500 hover:rotate-0 hover:scale-[1.03] ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
              <svg viewBox="0 0 32 24" className="h-6 w-8 text-sage" aria-hidden="true">
                <path fill="currentColor" d="M0 24V14C0 6 4 1 12 0l1 4c-4 1-6 4-6 8h5v12H0Zm19 0V14c0-8 4-13 12-14l1 4c-4 1-6 4-6 8h5v12H19Z" />
              </svg>
              <blockquote className="mt-4 flex-1 text-lg text-forest-dark">{q.text}</blockquote>
              <p className="mt-4 text-sm font-semibold text-forest">— {q.who}</p>
            </Card>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
