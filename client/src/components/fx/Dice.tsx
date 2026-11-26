import type { CSSProperties } from 'react';
import * as m from 'motion/react-m';

// Pip positions in a 3×3 grid (1–9, reading order) for each face.
const FACES: number[][] = [[5], [3, 7], [3, 5, 7], [1, 3, 7, 9], [1, 3, 5, 7, 9], [1, 3, 4, 6, 7, 9]];

/** A real 3D die (six CSS faces) that tumbles to a stop. */
export function Die3D({ size = 72, spins = 3, delay = 0, seed = 0 }: { size?: number; spins?: number; delay?: number; seed?: number }) {
  const end = { rotateX: 360 * spins + 90 * (seed % 4), rotateY: 360 * (spins + 1) + 90 * ((seed + 1) % 4) };
  return (
    <div className="dice-scene" aria-hidden="true">
      <m.div
        className="dice"
        style={{ '--s': `${size}px` } as CSSProperties}
        initial={{ rotateX: 0, rotateY: 0, y: -120, scale: 0.6 }}
        animate={{ ...end, y: [-120, 0, -40, 0, -10, 0], scale: 1 }}
        transition={{ duration: 1.3, delay, ease: [0.2, 0.7, 0.3, 1], y: { duration: 1.3, delay, times: [0, 0.35, 0.55, 0.75, 0.88, 1] } }}
      >
        {FACES.map((pips, f) => (
          <div key={f} className="dice-face">
            {Array.from({ length: 9 }, (_, k) => (
              <span key={k} className="grid">{pips.includes(k + 1) && <i />}</span>
            ))}
          </div>
        ))}
      </m.div>
    </div>
  );
}
