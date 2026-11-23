import { LinkButton } from '../components/ui/Button';
import { MoonMark } from '../components/illustrations/Logo';

export function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <div className="twinkle-host">
        <MoonMark className="size-20" />
      </div>
      <h1 className="mt-6 text-4xl">This table doesn't exist</h1>
      <p className="mt-3 max-w-md text-lg text-forest">
        Looks like a wrong turn on the game board. Head back and roll again.
      </p>
      <LinkButton to="/" className="mt-8" size="lg">
        Back to the café
      </LinkButton>
    </div>
  );
}
