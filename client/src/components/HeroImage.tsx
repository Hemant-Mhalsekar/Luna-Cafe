import { HERO_PHOTO } from '../lib/cafe';
import { LatteCup } from './illustrations/LatteCup';

/**
 * Blob-framed hero visual: the photo when HERO_PHOTO is set, otherwise the drawn latte.
 * The photo is anchored to the right so the cup stays visible when the frame is narrow (phones).
 */
export function HeroImage() {
  if (!HERO_PHOTO) {
    return (
      <div className="hero-blob aspect-square bg-sage p-6 sm:p-10">
        <LatteCup />
      </div>
    );
  }
  return (
    <div className="hero-blob aspect-square overflow-hidden bg-sage">
      <img
        src={HERO_PHOTO.src}
        width={HERO_PHOTO.width}
        height={HERO_PHOTO.height}
        alt={HERO_PHOTO.alt}
        fetchPriority="high"
        decoding="async"
        className="size-full object-cover object-right"
      />
    </div>
  );
}
