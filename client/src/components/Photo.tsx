import { cn } from '../lib/cn';

interface PhotoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Above the fold: load straight away. Everything else loads when scrolled near. */
  priority?: boolean;
}

/** Image with fixed dimensions (no layout shift) and lazy loading by default. */
export function Photo({ src, alt, width, height, className, priority = false }: PhotoProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn('object-cover', className)}
    />
  );
}
