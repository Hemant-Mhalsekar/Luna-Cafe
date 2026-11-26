import * as m from 'motion/react-m';
import { LinkButton } from '../components/ui/Button';
import { MoonMark } from '../components/illustrations/Logo';
import { SplitText } from '../components/fx/SplitText';

export function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      {/* The moon tumbles in, then keeps wobbling like a dropped die. */}
      <m.div
        className="twinkle-host"
        initial={{ y: -200, rotate: -360, scale: 0.4 }}
        animate={{ y: 0, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 9 }}
        drag
        dragSnapToOrigin
        whileDrag={{ scale: 1.2, rotate: 20 }}
        data-cursor="Drag"
      >
        <MoonMark className="float-bob size-24" />
      </m.div>
      <h1 className="mt-6 text-4xl">
        <SplitText text="This table doesn't exist" step={25} />
      </h1>
      <p className="page-intro mt-3 max-w-md text-lg text-forest">
        Looks like a wrong turn on the game board. Head back and roll again.
      </p>
      <LinkButton to="/" className="mt-8" size="lg">
        Back to the café
      </LinkButton>
    </div>
  );
}
