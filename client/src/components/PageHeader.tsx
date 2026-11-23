import type { ReactNode } from 'react';
import { Eyebrow } from './ui/Section';

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="container-page pb-8 pt-14 sm:pt-20">
      <Eyebrow className="text-forest">{eyebrow}</Eyebrow>
      <h1 className="max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-lg text-forest">{children}</div>}
    </div>
  );
}
