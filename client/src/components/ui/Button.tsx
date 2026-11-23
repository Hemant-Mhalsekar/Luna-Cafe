import { Link, type LinkProps } from 'react-router';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,transform,box-shadow] duration-200 ease-out-soft active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  // Orange is reserved for actions.
  primary: 'bg-cta text-white shadow-soft hover:bg-cta-hover',
  secondary: 'border-2 border-forest-dark text-forest-dark hover:bg-forest-dark hover:text-cream',
  ghost: 'text-forest-dark hover:bg-forest-dark/8',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-7 py-3.5 text-base',
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

function buttonClass({ variant = 'primary', size = 'md', className }: Omit<Common, 'children'>) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={buttonClass({ variant, size, className })} {...rest} />;
}

export function LinkButton({ variant, size, className, ...rest }: Common & LinkProps) {
  return <Link className={buttonClass({ variant, size, className })} {...rest} />;
}
